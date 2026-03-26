const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

// The tests/setup.js or similar could be used for global mocks if needed.
// For now, we assume @google/generative-ai is available or mocked in node_modules for the test environment.

test('Chat API returns 500 when GEMINI_API_KEY is missing', async (t) => {
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
