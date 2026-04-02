const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");

// Mocking function to prevent missing module errors
function mockModule(moduleName, exports) {
  const absolutePath = path.resolve(__dirname, "../node_modules", moduleName, "index.js");
  require.cache[absolutePath] = {
    id: absolutePath,
    filename: absolutePath,
    loaded: true,
    exports: exports,
  };
}

test("Newsletter API strictly prefers x-real-ip over x-forwarded-for for rate limiting", async (t) => {
  const newsletterPath = path.resolve(__dirname, "../api/newsletter.js");

  // Mock resend dependency
  mockModule("resend", {
    Resend: class {
      constructor() {
        this.emails = { send: async () => ({}) };
      }
    },
  });

  delete require.cache[newsletterPath];
  const handler = require("../api/newsletter.js");

  // Define two distinct IPs
  const realIp = "1.1.1.1";
  const spoofedIp = "2.2.2.2";

  const createReq = (ip, spoofed) => ({
    method: "POST",
    headers: {
      "x-real-ip": ip,
      "x-forwarded-for": spoofed,
    },
    body: { email: "test@example.com" },
  });

  const res = {
    status: function (s) {
      this.statusCode = s;
      return this;
    },
    json: function (j) {
      this.body = j;
      return this;
    },
  };

  // 1. Exhaust rate limit for realIp (limit = 3)
  for (let i = 0; i < 3; i++) {
    await handler(createReq(realIp, "any-spoofed-ip"), res);
  }

  // 2. A 4th request with realIp should be rate limited, REGARDLESS of the spoofed header
  await handler(createReq(realIp, "different-spoofed-ip"), res);
  assert.strictEqual(res.statusCode, 429, "Should be rate limited on the 4th request for realIp");

  // 3. A request with a DIFFERENT x-real-ip but the SAME x-forwarded-for should NOT be rate limited
  // This proves that x-forwarded-for is NOT being used for tracking.
  const anotherRealIp = "3.3.3.3";
  await handler(createReq(anotherRealIp, "any-spoofed-ip"), res);
  // If the handler correctly uses x-real-ip, this should be successful (or at least not 429)
  assert.notStrictEqual(res.statusCode, 429, "Should NOT be rate limited for a new x-real-ip, even with same spoofed header");

  delete require.cache[newsletterPath];
});

test("Newsletter API handles missing x-real-ip gracefully", async (t) => {
  const newsletterPath = path.resolve(__dirname, "../api/newsletter.js");

  // Mock resend dependency
  mockModule("resend", {
    Resend: class {
      constructor() {
        this.emails = { send: async () => ({}) };
      }
    },
  });

  delete require.cache[newsletterPath];
  const handler = require("../api/newsletter.js");

  const req = {
    method: "POST",
    headers: {},
    connection: { remoteAddress: "127.0.0.1" },
    body: { email: "test2@example.com" },
  };

  const res = {
    status: function (s) {
      this.statusCode = s;
      return this;
    },
    json: function (j) {
      this.body = j;
      return this;
    },
  };

  await handler(req, res);
  // We expect it not to crash and proceed to validation/processing
  assert.ok(res.statusCode === 200 || res.statusCode === undefined);

});

const newsletterPath = path.resolve(__dirname, '../api/newsletter.js');

// Helper to reset module cache and get fresh handler
function getHandler() {
  delete require.cache[newsletterPath];
  return require('../api/newsletter.js');
}

// Helper to mock req/res
function mockReqRes(overrides = {}) {
  const req = {
    method: 'POST',
    headers: { 'x-real-ip': '127.0.0.1' },
    body: {},
    connection: { remoteAddress: "127.0.0.1" },
    ...overrides
  };

  let statusSet = 200;
  let jsonSent = null;

  const res = {
    status: function(s) {
      statusSet = s;
      return this;
    },
    json: function(j) {
      jsonSent = j;
      return this;
    }
  };

  return { req, res, getStatus: () => statusSet, getJson: () => jsonSent };
}

// Mock 'resend' module before requiring the handler
const resendMock = {
  Resend: class {
    constructor() {
      this.emails = {
        send: async () => ({ id: 'test-id' })
      };
    }
  }
};

// Override Module._load to intercept 'resend'
const Module = require('module');
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'resend') {
    return resendMock;
  }
  return originalLoad.apply(this, arguments);
};

test('Newsletter API strictly prefers x-real-ip over x-forwarded-for for rate limiting', async (t) => {
  const handler = getHandler();

  // Define two distinct IPs
  const realIp = "1.1.1.1";
  const spoofedIp = "2.2.2.2";

  // 1. Exhaust rate limit for realIp (limit = 3)
  for (let i = 0; i < 3; i++) {
    const { req, res } = mockReqRes({
      headers: {
        "x-real-ip": realIp,
        "x-forwarded-for": "any-spoofed-ip",
      },
      body: { email: "test@example.com" }
    });
    await handler(req, res);
  }

  // 2. A 4th request with realIp should be rate limited, REGARDLESS of the spoofed header
  const { req: req4, res: res4, getStatus: getStatus4 } = mockReqRes({
    headers: {
      "x-real-ip": realIp,
      "x-forwarded-for": "different-spoofed-ip",
    },
    body: { email: "test@example.com" }
  });
  await handler(req4, res4);
  assert.strictEqual(getStatus4(), 429, "Should be rate limited on the 4th request for realIp");

  // 3. A request with a DIFFERENT x-real-ip but the SAME x-forwarded-for should NOT be rate limited
  // This proves that x-forwarded-for is NOT being used for tracking.
  const anotherRealIp = "3.3.3.3";
  const { req: req5, res: res5, getStatus: getStatus5 } = mockReqRes({
    headers: {
      "x-real-ip": anotherRealIp,
      "x-forwarded-for": "any-spoofed-ip",
    },
    body: { email: "test@example.com" }
  });
  await handler(req5, res5);
  assert.notStrictEqual(getStatus5(), 429, "Should NOT be rate limited for a new x-real-ip, even with same spoofed header");
});

test('Newsletter API handles missing x-real-ip gracefully', async (t) => {
  const handler = getHandler();

  const { req, res, getStatus } = mockReqRes({
    headers: {},
    connection: { remoteAddress: "127.0.0.1" },
    body: { email: "test2@example.com" }
  });

  await handler(req, res);
  const status = getStatus();
  // We expect it not to crash and proceed to validation/processing
  assert.ok(status === 200 || status === undefined);
});


test('Newsletter API returns 200 for valid email', async (t) => {
  process.env.RESEND_API_KEY = 'test-key';
  process.env.EMAIL_TO = 'test@example.com';
  process.env.EMAIL_DOMAIN = 'example.com';

  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    headers: { 'x-real-ip': 'valid-email-ip' },
    body: { email: 'user@example.com' }
  });

  await handler(req, res);

  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(getJson().success, true);
});

test('Newsletter API returns 405 for non-POST methods', async (t) => {
  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    headers: { 'x-real-ip': 'method-not-allowed-ip' },
    method: 'GET'
  });

  await handler(req, res);

  assert.strictEqual(getStatus(), 405);
  assert.strictEqual(getJson().error, 'Method not allowed');
});

test('Newsletter API returns 400 for invalid emails', async (t) => {
  const handler = getHandler();

  const invalidEmails = [
    '',
    'plainaddress',
    '#@%^%#$@#$@#.com',
    '@example.com',
    'Joe Smith <email@example.com>',
    'email.example.com',
    'email@example@example.com',
    'email@example.com' + 'a'.repeat(250) // too long
  ];

  let i = 0;
  for (const email of invalidEmails) {
    const { req, res, getStatus, getJson } = mockReqRes({
      headers: { 'x-real-ip': `invalid-email-ip-${i++}` },
      body: { email }
    });
    await handler(req, res);
    assert.strictEqual(getStatus(), 400, `Expected 400 for email: ${email}`);
    assert.strictEqual(getJson().error, 'Invalid email address');
  }
});

test('Newsletter API returns 429 for too many requests', async (t) => {
  const handler = getHandler();
  const ip = '1.2.3.4';

  // Make 3 successful requests (MAX_REQUESTS_PER_WINDOW is 3)
  for (let i = 0; i < 3; i++) {
    const { req, res, getStatus } = mockReqRes({
      headers: { 'x-real-ip': ip },
      body: { email: `test${i}@example.com` }
    });
    await handler(req, res);
    assert.strictEqual(getStatus(), 200);
  }

  // The 4th request should be rate limited
  const { req, res, getStatus, getJson } = mockReqRes({
    headers: { 'x-real-ip': ip },
    body: { email: 'test4@example.com' }
  });
  await handler(req, res);

  assert.strictEqual(getStatus(), 429);
  assert.strictEqual(getJson().error, 'Too many requests. Please try again later.');
});

test('Newsletter API returns 500 when Resend fails', async (t) => {
  // Overwrite the mock to fail
  const originalResend = resendMock.Resend;
  resendMock.Resend = class {
    constructor() {
      this.emails = {
        send: async () => { throw new Error('Resend API error'); }
      };
    }
  };

  process.env.RESEND_API_KEY = 'test-key';
  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    headers: { 'x-real-ip': 'resend-fail-ip' },
    body: { email: 'fail@example.com' }
  });

  await handler(req, res);

  assert.strictEqual(getStatus(), 500);
  assert.strictEqual(getJson().error, 'Failed to subscribe');

  // Restore mock
  resendMock.Resend = originalResend;
});