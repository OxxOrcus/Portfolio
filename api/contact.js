const { Resend } = require("resend");

let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  } else {
    // Log during startup; handler will log a warning when called.
    console.warn(
      "RESEND_API_KEY is not set during initialization. The Contact endpoint will skip sending emails.",
    );
  }
} catch (err) {
  console.error(
    "Failed to initialize Resend client:",
    err && err.message ? err.message : err,
  );
}

// Simple in-memory rate limiting to prevent email spam/abuse
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Extracts the client's IP address from the request.
 */
function getClientIp(req) {
  return (
    (req.headers && req.headers["x-real-ip"]) ||
    req.connection?.remoteAddress ||
    "unknown"
  );
}

/**
 * Checks if the request should be rate-limited based on the IP.
 */
function isRateLimited(ip) {
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, firstRequest: now };

  if (now - userRate.firstRequest > RATE_LIMIT_WINDOW_MS) {
    userRate.count = 1;
    userRate.firstRequest = now;
  } else {
    userRate.count += 1;
  }

  rateLimitMap.set(ip, userRate);

  // Cleanup map to prevent memory leaks over time
  if (rateLimitMap.size > 1000) rateLimitMap.clear();

  return userRate.count > MAX_REQUESTS_PER_WINDOW;
}

/**
 * Validates and sanitizes the contact form input.
 */
function validateAndSanitize(body) {
  let { name, email, message } = body || {};

  // Type and length validation
  if (
    typeof name !== "string" ||
    name.length > 100 ||
    typeof email !== "string" ||
    email.length > 254 ||
    typeof message !== "string" ||
    message.length > 5000
  ) {
    return {
      error: "Invalid form data: maximum length exceeded or incorrect type",
    };
  }

  // Sanitization: Prevent Email Header Injection (CRLF) and trim
  name = name.replace(/[\r\n]/g, " ").trim();
  email = email.replace(/[\r\n]/g, "").trim();
  message = message.trim();

  // Basic presence and format validation
  if (!name || !email || !message || !EMAIL_REGEX.test(email)) {
    return { error: "Invalid form data" };
  }

  return { name, email, message };
}

/**
 * Sends the contact email using Resend.
 */
async function sendContactEmail(name, email, message) {
  if (!resend) {
    console.warn("Resend client not initialized; skipping send.");
    return;
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email API request timed out")), 10000),
  );

  await Promise.race([
    resend.emails.send({
      from: `No Reply <no-reply@${process.env.EMAIL_DOMAIN || "example.com"}>`,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    }),
    timeoutPromise,
  ]);
}

module.exports = async function handler(req, res) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const validationResult = validateAndSanitize(req.body);
  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error });
  }

  const { name, email, message } = validationResult;

  try {
    await sendContactEmail(name, email, message);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(
      "Error sending contact email:",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
};
