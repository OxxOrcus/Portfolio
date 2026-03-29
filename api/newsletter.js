const { Resend } = require("resend");

let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  } else {
    console.warn(
      "RESEND_API_KEY is not set. Newsletter endpoint will skip sending emails."
    );
  }
} catch (err) {
  console.error(
    "Failed to initialize Resend client:",
    err && err.message ? err.message : err
  );
}

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

module.exports = async function handler(req, res) {
  const ip =
    (req.headers && req.headers["x-forwarded-for"]) ||
    req.connection?.remoteAddress ||
    "unknown";
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, firstRequest: now };

  if (now - userRate.firstRequest > RATE_LIMIT_WINDOW_MS) {
    userRate.count = 1;
    userRate.firstRequest = now;
  } else {
    userRate.count += 1;
  }

  rateLimitMap.set(ip, userRate);
  if (rateLimitMap.size > 1000) rateLimitMap.clear();

  if (userRate.count > MAX_REQUESTS_PER_WINDOW) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body || {};

  if (
    !email ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    if (!resend) {
      console.warn("Resend client not initialized; skipping send.");
      return res.status(200).json({ success: true });
    }

    await resend.emails.send({
      from: `No Reply <no-reply@${process.env.EMAIL_DOMAIN || "example.com"}>`,
      to: process.env.EMAIL_TO,
      subject: "New Newsletter Subscriber",
      text: `New subscriber: ${email}`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(
      "Error sending newsletter notification:",
      err && err.message ? err.message : err
    );
    return res.status(500).json({ error: "Failed to subscribe" });
  }
};
