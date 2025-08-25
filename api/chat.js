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

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  // Ensure the API client is configured
  if (!genAI) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server not configured. Missing GEMINI_API_KEY.",
      });
  }

  try {
    let { message } = req.body || {};

    // Basic validation and protection against malicious payloads
    if (typeof message !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "User message must be a string." });
    }

    message = message.trim();
    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "User message is required." });
    }

    // Limit message length to prevent abuse / large payloads
    const MAX_MESSAGE_LEN = 2000; // characters
    if (message.length > MAX_MESSAGE_LEN) {
      return res
        .status(400)
        .json({ success: false, message: "Message too long." });
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
    const text = response.text();

    // Note: avoid logging user messages or AI outputs in production logs.
    res.status(200).json({ success: true, message: text });
  } catch (error) {
    console.error(
      "Error in Gemini API call:",
      error && error.message ? error.message : error
    );
    res
      .status(500)
      .json({
        success: false,
        message:
          "An error occurred while communicating with the AI. Please try again later.",
      });
  }
};
