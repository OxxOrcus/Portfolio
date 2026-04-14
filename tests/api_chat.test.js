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
