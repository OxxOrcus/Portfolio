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

  delete require.cache[newsletterPath];
});
