const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const Module = require("module");

const contactPath = path.resolve(__dirname, "../api/contact.js");

// Helper to reset module cache and get fresh handler
function getHandler() {
  delete require.cache[contactPath];
  return require("../api/contact.js");
}

// Helper to mock req/res
function mockReqRes(overrides = {}) {
  const req = {
    method: "POST",
    headers: { "x-real-ip": "127.0.0.1" },
    body: {},
    connection: { remoteAddress: "127.0.0.1" },
    ...overrides,
  };

  let statusSet = 200;
  let jsonSent = null;

  const res = {
    status: function (s) {
      statusSet = s;
      return this;
    },
    json: function (j) {
      jsonSent = j;
      return this;
    },
  };

  return { req, res, getStatus: () => statusSet, getJson: () => jsonSent };
}

// Mock 'resend' module
const resendMock = {
  Resend: class {
    constructor() {
      this.emails = {
        send: async () => ({ id: "test-id" }),
      };
    }
  },
};

// Override Module._load to intercept 'resend'
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "resend") {
    return resendMock;
  }
  return originalLoad.apply(this, arguments);
};

test("Contact API returns 200 for valid input", async (t) => {
  process.env.RESEND_API_KEY = "test-key";
  process.env.EMAIL_TO = "test@example.com";
  process.env.EMAIL_DOMAIN = "example.com";

  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    body: {
      name: "John Doe",
      email: "john@example.com",
      message: "Hello, this is a test message.",
    },
  });

  await handler(req, res);

  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(getJson().success, true);
});

test("Contact API returns 405 for non-POST methods", async (t) => {
  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    method: "GET",
  });

  await handler(req, res);

  assert.strictEqual(getStatus(), 405);
  assert.strictEqual(getJson().error, "Method not allowed");
});

test("Contact API returns 400 for invalid inputs", async (t) => {
  const handler = getHandler();

  const invalidInputs = [
    { name: "", email: "test@example.com", message: "test" },
    { name: "test", email: "", message: "test" },
    { name: "test", email: "test@example.com", message: "" },
    { name: "test", email: "invalid-email", message: "test" },
    { name: "a".repeat(101), email: "test@example.com", message: "test" },
    { name: "test", email: "a".repeat(255) + "@example.com", message: "test" },
    { name: "test", email: "test@example.com", message: "a".repeat(5001) },
  ];

  let i = 0;
  for (const body of invalidInputs) {
    const { req, res, getStatus, getJson } = mockReqRes({
      headers: { "x-real-ip": `invalid-input-ip-${i++}` },
      body,
    });
    await handler(req, res);
    assert.strictEqual(
      getStatus(),
      400,
      `Expected 400 for input: ${JSON.stringify(body)}`,
    );
    const error = getJson().error;
    assert.ok(
      error ===
        "Invalid form data: maximum length exceeded or incorrect type" ||
        error === "Invalid form data",
      `Unexpected error message: ${error}`,
    );
  }
});

test("Contact API returns 429 for too many requests", async (t) => {
  const handler = getHandler();
  const ip = "1.2.3.4";

  // Make 3 successful requests
  for (let i = 0; i < 3; i++) {
    const { req, res, getStatus } = mockReqRes({
      headers: { "x-real-ip": ip },
      body: { name: "test", email: "test@example.com", message: "test" },
    });
    await handler(req, res);
    assert.strictEqual(getStatus(), 200);
  }

  // The 4th request should be rate limited
  const { req, res, getStatus, getJson } = mockReqRes({
    headers: { "x-real-ip": ip },
    body: { name: "test", email: "test@example.com", message: "test" },
  });
  await handler(req, res);

  assert.strictEqual(getStatus(), 429);
  assert.strictEqual(
    getJson().error,
    "Too many requests. Please try again later.",
  );
});

test("Contact API returns 500 when Resend fails", async (t) => {
  const originalResend = resendMock.Resend;
  resendMock.Resend = class {
    constructor() {
      this.emails = {
        send: async () => {
          throw new Error("Resend API error");
        },
      };
    }
  };

  process.env.RESEND_API_KEY = "test-key";
  const handler = getHandler();
  const { req, res, getStatus, getJson } = mockReqRes({
    body: { name: "test", email: "test@example.com", message: "test" },
  });

  await handler(req, res);

  assert.strictEqual(getStatus(), 500);
  assert.strictEqual(getJson().error, "Erro ao enviar e-mail");

  resendMock.Resend = originalResend;
});
