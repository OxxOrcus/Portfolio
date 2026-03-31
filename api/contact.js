const { Resend } = require("resend");

let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  } else {
    // Log during startup; handler will log a warning when called.
    console.warn(
      "RESEND_API_KEY is not set during initialization. The Contact endpoint will skip sending emails."
    );
  }
} catch (err) {
  console.error(
    "Failed to initialize Resend client:",
    err && err.message ? err.message : err
  );
}

// Simple in-memory rate limiting to prevent email spam/abuse
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

module.exports = async function handler(req, res) {
  // Rate limiting check
  // Security fix: Use x-real-ip instead of spoofable x-forwarded-for to prevent IP spoofing
  const ip = (req.headers && req.headers["x-real-ip"]) || req.connection?.remoteAddress || "unknown";
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

  if (userRate.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body || {};
  // Security enhancement: Add input type and length validation to prevent ReDoS and memory exhaustion attacks (DoS risk)
  if (
    !name ||
    typeof name !== "string" ||
    name.length > 100 ||
    !email ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    !message ||
    typeof message !== "string" ||
    message.length > 5000
  ) {
    return res.status(400).json({ error: "Invalid form data" });
  }

  try {
    if (!resend) {
      console.warn("Resend client not initialized; skipping send.");
      return res.status(200).json({ success: true });
    }

    await resend.emails.send({
      from: `No Reply <no-reply@${process.env.EMAIL_DOMAIN || "example.com"}>`,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(
      "Error sending contact email:",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ error: "Erro ao enviar e-mail" });
  }
};
