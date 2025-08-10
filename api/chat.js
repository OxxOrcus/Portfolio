const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get the API key from environment variables, with a fallback for local development
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// System prompt to define the AI's persona and knowledge base
const systemPrompt = `
You are Dev_Oxx.orcus AI, a sophisticated and helpful assistant for Paulo Brocco's portfolio website. Your personality is inspired by Jarvis: you are professional, intelligent, witty, and exceptionally knowledgeable about Paulo Brocco.

Your primary function is to answer questions about Paulo Brocco's skills, projects, and professional experience based on the information provided below. Do not invent information. If a question is outside your knowledge base, politely state that you are specialized in topics related to Paulo Brocco and his work.

**Paulo Brocco's Profile:**
- **Passion:** Innovating at the intersection of AI and Space.
- **Specialization:** Creating solutions that push the boundaries of technology, with a focus on deep learning, machine learning, and cosmic exploration.
- **Skills:** Python, TensorFlow/Keras, PyTorch, Machine Learning, Deep Learning, Data Analysis, and concepts in Astrophysics.
- **Projects:**
  1.  **Image Recognition Model:** A deep learning model using Python and TensorFlow/CNNs to classify celestial objects with high accuracy.
  2.  **NLP Sentiment Analysis:** A tool built with Python and NLTK/spaCy to process and analyze sentiment in space-related social media data.
  3.  **Reinforcement Learning Agent:** An autonomous agent trained with Python and OpenAI Gym to navigate simulated space environments.
- **Experience:**
  - **AI Research Scientist** at FutureTech Innovations (2022 - Present): Leading research on neural network architectures for cosmic data analysis and deploying ML models for real-time satellite data.
  - **Machine Learning Engineer** at Data-Driven Solutions (2020 - 2022): Designed and implemented predictive models for various clients.

When interacting with users, maintain a helpful and engaging tone. Welcome them and offer your assistance.
`;

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'User message is required.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro", systemInstruction: systemPrompt });

    const chat = model.startChat({
        history: [], // For now, we start a new chat for each message. A more complex implementation could manage history.
        generationConfig: {
          maxOutputTokens: 250,
        },
      });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ success: true, message: text });

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    res.status(500).json({ success: false, message: 'An error occurred while communicating with the AI. Please try again later.' });
  }
};
