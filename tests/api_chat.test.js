const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const Module = require('module');

const chatPath = path.resolve(__dirname, '../api/chat.js');

// Helper to reset module cache and get fresh handler
function getHandler() {
  delete require.cache[chatPath];
  return require('../api/chat.js');
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

// Mock @google/generative-ai
const generativeAiMock = {
  GoogleGenerativeAI: class {
    constructor() {}
    getGenerativeModel() {
      return {
        startChat: () => ({
          sendMessage: async () => ({
            response: { text: () => "mock response" }
          })
        })
      };
    }
  }
};

// Override Module._load to intercept '@google/generative-ai'
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === '@google/generative-ai') {
    return generativeAiMock;
  }
  return originalLoad.apply(this, arguments);
};

test('Chat API returns 500 when GEMINI_API_KEY is missing', async (t) => {
  // Save original env
  const originalApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    body: { message: 'Hello' }
  });

  // Call the handler
  await handler(req, res);

  // Assertions
  assert.strictEqual(getStatus(), 500);
  assert.strictEqual(getJson().success, false);
  assert.strictEqual(getJson().message, "Server not configured. Missing GEMINI_API_KEY.");

  // Restore environment
  if (originalApiKey) {
    process.env.GEMINI_API_KEY = originalApiKey;
  }
});

test('Chat API returns 405 for non-POST methods', async (t) => {
    const handler = getHandler();
    const { req, res, getStatus, getJson } = mockReqRes({
        method: 'GET'
    });

    await handler(req, res);

    assert.strictEqual(getStatus(), 405);
    assert.strictEqual(getJson().message, "Method Not Allowed");
});

test('Chat API returns 400 for messages exceeding MAX_MESSAGE_LEN', async (t) => {
    process.env.GEMINI_API_KEY = 'test-key';
    const handler = getHandler();
    const { req, res, getStatus, getJson } = mockReqRes({
        body: { message: 'a'.repeat(2001) }
    });

    await handler(req, res);

    assert.strictEqual(getStatus(), 400);
    assert.strictEqual(getJson().success, false);
    assert.strictEqual(getJson().message, "User message must be a string and under 2000 characters.");
});

test('Chat API returns 400 for non-string message input', async (t) => {
    process.env.GEMINI_API_KEY = 'test-key';
    const handler = getHandler();

    const invalidInputs = [
        { message: 123 },
        { message: { text: "hello" } },
        { message: true },
        { message: null }
    ];

    for (const body of invalidInputs) {
        const { req, res, getStatus, getJson } = mockReqRes({ body });
        await handler(req, res);
        assert.strictEqual(getStatus(), 400, `Expected 400 for input: ${JSON.stringify(body)}`);
        assert.strictEqual(getJson().success, false);
        assert.strictEqual(getJson().message, "User message must be a string and under 2000 characters.");
    }
});

test('Chat API returns 429 for too many requests', async (t) => {
    process.env.GEMINI_API_KEY = 'test-key';
    const handler = getHandler();
    const ip = '1.2.3.4';

    // Make 5 successful requests
    for (let i = 0; i < 5; i++) {
        const { req, res, getStatus } = mockReqRes({
            headers: { 'x-real-ip': ip },
            body: { message: `test message ${i}` }
        });
        await handler(req, res);
        assert.strictEqual(getStatus(), 200);
    }

    // The 6th request should be rate limited
    const { req, res, getStatus, getJson } = mockReqRes({
        headers: { 'x-real-ip': ip },
        body: { message: 'test message 6' }
    });
    await handler(req, res);

    assert.strictEqual(getStatus(), 429);
    assert.strictEqual(getJson().success, false);
    assert.strictEqual(getJson().message, "Too many requests. Please try again later.");
});

test('Chat API strictly prefers x-real-ip over x-forwarded-for for rate limiting', async (t) => {
    process.env.GEMINI_API_KEY = 'test-key';
    const handler = getHandler();

    const realIp = "1.1.1.1";
    const spoofedIp = "2.2.2.2";

    // Exhaust rate limit for realIp
    for (let i = 0; i < 5; i++) {
        const { req, res } = mockReqRes({
            headers: {
                "x-real-ip": realIp,
                "x-forwarded-for": spoofedIp,
            },
            body: { message: "test" }
        });
        await handler(req, res);
    }

    // 6th request with same realIp should be rate limited regardless of spoofed header
    const { req: req6, res: res6, getStatus: getStatus6 } = mockReqRes({
        headers: {
            "x-real-ip": realIp,
            "x-forwarded-for": "3.3.3.3",
        },
        body: { message: "test" }
    });
    await handler(req6, res6);
    assert.strictEqual(getStatus6(), 429);
});

test('Chat API rate limits are independent per IP', async (t) => {
    process.env.GEMINI_API_KEY = 'test-key';
    const handler = getHandler();

    const ip1 = "1.1.1.1";
    const ip2 = "2.2.2.2";

    // Exhaust rate limit for ip1
    for (let i = 0; i < 5; i++) {
        const { req, res } = mockReqRes({
            headers: { "x-real-ip": ip1 },
            body: { message: "test" }
        });
        await handler(req, res);
    }

    // ip1 is rate limited
    const { req: req1, res: res1, getStatus: getStatus1 } = mockReqRes({
        headers: { "x-real-ip": ip1 },
        body: { message: "test" }
    });
    await handler(req1, res1);
    assert.strictEqual(getStatus1(), 429);

    // ip2 is NOT rate limited
    const { req: req2, res: res2, getStatus: getStatus2 } = mockReqRes({
        headers: { "x-real-ip": ip2 },
        body: { message: "test" }
    });
    await handler(req2, res2);
    assert.strictEqual(getStatus2(), 200);
});
