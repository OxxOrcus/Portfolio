const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

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
