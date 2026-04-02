const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

function mockModule(moduleName, exports) {
  const absolutePath = path.resolve(__dirname, "../node_modules", moduleName, "index.js");
  require.cache[absolutePath] = {
    id: absolutePath,
    filename: absolutePath,
    loaded: true,
    exports: exports,
  };
}

test('Chat API returns 500 when GEMINI_API_KEY is missing', async (t) => {
  // Mock @google/generative-ai
  mockModule("@google/generative-ai", {
    GoogleGenerativeAI: class {
        constructor() {}
        getGenerativeModel() { return { startChat: () => ({ sendMessage: async () => ({ response: { text: () => "mock" } }) }) }; }
    }
  });

  // Save original env
  const originalApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  // Clear require cache for the chat module to ensure it re-evaluates genAI
  const chatPath = path.resolve(__dirname, '../api/chat.js');
  delete require.cache[chatPath];

  // Require the handler
  const handler = require('../api/chat.js');

  // Mock Request and Response
  const req = {
    method: 'POST',
    body: { message: 'Hello' }
  };

  let statusSet = null;
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

  // Call the handler
  await handler(req, res);

  // Assertions
  assert.strictEqual(statusSet, 500);
  assert.strictEqual(jsonSent.success, false);
  assert.strictEqual(jsonSent.message, "Server not configured. Missing GEMINI_API_KEY.");

  // Restore environment
  if (originalApiKey) {
    process.env.GEMINI_API_KEY = originalApiKey;
  }
  delete require.cache[chatPath];
});

test('Chat API returns 405 for non-POST methods', async (t) => {
    // Mock @google/generative-ai
    mockModule("@google/generative-ai", {
        GoogleGenerativeAI: class {
            constructor() {}
        }
    });

    const chatPath = path.resolve(__dirname, '../api/chat.js');
    delete require.cache[chatPath];
    const handler = require('../api/chat.js');

    const req = { method: 'GET' };
    let statusSet = null;
    let jsonSent = null;
    const res = {
      status: function(s) { statusSet = s; return this; },
      json: function(j) { jsonSent = j; return this; }
    };

    await handler(req, res);

    assert.strictEqual(statusSet, 405);
    assert.strictEqual(jsonSent.message, "Method Not Allowed");

    delete require.cache[chatPath];
});
