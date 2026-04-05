const { GoogleGenerativeAI } = require("@google/generative-ai");

// Require a GEMINI_API_KEY environment variable. Do NOT fall back to a hardcoded key.
const API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  // Log during startup; handler will return a 500 if called without a key.
  console.error(
    "GEMINI_API_KEY is not set. The AI endpoint will be unavailable."
  );
}

// System prompt to define the AI's persona and knowledge base
const systemPrompt = `
You are Dev_Oxx.orcus AI, a sophisticated and helpful assistant for Paulo Brocco's portfolio website. Your personality is professional, helpful, and factual. Do not invent personal details beyond what's provided.

Use the provided information about Paulo Brocco to answer user questions. If a question is outside the dataset, reply that you don't have that information.
`;

// Simple in-memory rate limiting to prevent abuse
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

module.exports = async (req, res) => {
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

  // Cleanup to prevent memory leaks in long-running instances
  if (rateLimitMap.size > 1000) rateLimitMap.clear();

  if (userRate.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  // Ensure the API client is configured
  if (!genAI) {
    return res.status(500).json({
      success: false,
      message: "Server not configured. Missing GEMINI_API_KEY.",
    });
  }

  try {
    let { message } = req.body || {};

    const MAX_MESSAGE_LEN = 2000; // characters

    // Security enhancement: Add input type and length validation BEFORE processing to prevent ReDoS and memory exhaustion attacks (DoS risk)
    if (typeof message !== "string" || message.length > MAX_MESSAGE_LEN) {
      return res
        .status(400)
        .json({ success: false, message: "User message must be a string and under 2000 characters." });
    }

    message = message.trim();
    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "User message is required." });
    }

    // Lightweight sanitization: remove control characters
    message = message.replace(/[\x00-\x1F\x7F]+/g, " ");

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: [], // Consider persisting per-session history server-side in future
      generationConfig: {
        maxOutputTokens: 250,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    // response.text may be async; await if it's a Promise or function
    let text = "";
    try {
      if (typeof response.text === "function") {
        text = await response.text();
      } else if (typeof response === "string") {
        text = response;
      } else if (response && response.outputText) {
        text = response.outputText;
      }
    } catch (e) {
      console.error(
        "Error extracting text from Gemini response:",
        e && e.message ? e.message : e
      );
      text = "";
    }

    // Note: avoid logging user messages or AI outputs in production logs.
    res.status(200).json({ success: true, message: text });
  } catch (error) {
    console.error(
      "Error in Gemini API call:",
      error && error.message ? error.message : error
    );
    res.status(500).json({
      success: false,
      message:
        "An error occurred while communicating with the AI. Please try again later.",
    });
  }
};
