document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
      // Optional: Toggle ARIA attributes for accessibility
      const isExpanded = mobileMenu.classList.contains("active");
      mobileMenuButton.setAttribute("aria-expanded", isExpanded);
      if (isExpanded) {
        // Change icon to 'X'
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
      } else {
        // Change icon back to hamburger
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        `;
      }
    });

    // Close menu when a link is clicked (optional, good for SPAs or smooth scrolling)
    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenu.classList.contains("active")) {
          mobileMenu.classList.remove("active");
          mobileMenuButton.setAttribute("aria-expanded", "false");
          mobileMenuButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          `;
        }
      });
    });
  }
});
// Newsletter Subscription and Confetti
const newsletterForm = document.getElementById("newsletter-form");
const subscribeButton = document.getElementById("subscribe-button"); // Though form submission is primary trigger
const subscribeMessage = document.getElementById("subscribe-message");

if (newsletterForm && subscribeMessage) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent actual form submission for this demo

    const emailInput = newsletterForm.querySelector('input[type="email"]');
    if (emailInput && emailInput.value && emailInput.checkValidity()) {
      triggerConfetti();
      subscribeMessage.textContent = "🎉 Thanks for subscribing!";
      subscribeMessage.style.color = "#34d399"; // Tailwind green-400
      emailInput.value = ""; // Clear the input

      setTimeout(() => {
        subscribeMessage.textContent = "";
      }, 5000);
    } else if (emailInput) {
      subscribeMessage.textContent = "Please enter a valid email address.";
      subscribeMessage.style.color = "#f87171"; // Tailwind red-400
      setTimeout(() => {
        subscribeMessage.textContent = "";
        subscribeMessage.style.color = "";
      }, 3000);
    }
  });
}

function triggerConfetti() {
  const confettiCount = 60; // Number of confetti pieces
  const colors = [
    "#8e2de2",
    "#4a00e0",
    "#ff00ff",
    "#00ffff",
    "#facc15",
    "#ffffff",
  ]; // Theme purples, magenta, cyan, yellow, white

  for (let i = 0; i < confettiCount; i++) {
    const confettiPiece = document.createElement("div");
    confettiPiece.classList.add("confetti-piece");

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomShape = Math.random() > 0.6 ? "50%" : "0"; // More squares/rects, some circles
    const size = Math.random() * 8 + 5; // 5px to 13px

    confettiPiece.style.backgroundColor = randomColor;

    if (randomShape === "0" && Math.random() > 0.5) {
      // Make some rectangles
      confettiPiece.style.width = `${size * (Math.random() * 0.5 + 0.8)}px`; // slightly variable width
      confettiPiece.style.height = `${size * (Math.random() * 0.3 + 0.5)}px`; // more rectangular
    } else {
      confettiPiece.style.width = `${size}px`;
      confettiPiece.style.height = `${size}px`;
      confettiPiece.style.borderRadius = randomShape;
    }

    // Position confetti starting from around the center top of the viewport, or near button
    const startX = Math.random() * 100; // Percentage of viewport width
    confettiPiece.style.left = `${startX}vw`;
    confettiPiece.style.top = `${Math.random() * -30 - 5}vh`; // Start above the viewport

    // Randomize animation
    confettiPiece.style.animationDuration = `${Math.random() * 2 + 2.5}s`; // 2.5s to 4.5s
    confettiPiece.style.animationDelay = `${Math.random() * 0.7}s`;

    // For the @keyframes animation variables
    confettiPiece.style.setProperty(
      "--initial-x-offset",
      `${(Math.random() - 0.5) * 10}px`
    ); // Small initial horizontal offset
    confettiPiece.style.setProperty(
      "--drift-x",
      `${(Math.random() - 0.5) * 200}px`
    ); // Horizontal drift during fall

    document.body.appendChild(confettiPiece);

    confettiPiece.addEventListener("animationend", () => {
      confettiPiece.remove();
    });
  }
}
// AI Chatbot Functionality
const aiChatButton = document.getElementById("ai-chat-button");
const aiChatWindow = document.getElementById("ai-chat-window");
const closeAiChatButton = document.getElementById("close-ai-chat");
const aiChatForm = document.getElementById("ai-chat-form");
const aiChatInput = document.getElementById("ai-chat-input");
const aiChatMessages = document.getElementById("ai-chat-messages");

if (
  aiChatButton &&
  aiChatWindow &&
  closeAiChatButton &&
  aiChatForm &&
  aiChatInput &&
  aiChatMessages
) {
  const toggleAiChatWindow = () => {
    aiChatWindow.classList.toggle("active");
    if (aiChatWindow.classList.contains("active")) {
      aiChatInput.focus();
      // Add initial greeting if chat is empty
      if (aiChatMessages.children.length === 0) {
        addMessageToChat(
          "Hello! I'm your AI assistant. How can I help you today?",
          "ai"
        );
      }
    }
  };

  aiChatButton.addEventListener("click", toggleAiChatWindow);
  closeAiChatButton.addEventListener("click", toggleAiChatWindow);

  aiChatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userMessage = aiChatInput.value.trim();
    if (!userMessage) return;

    addMessageToChat(userMessage, "user");
    aiChatInput.value = "";
    aiChatInput.disabled = true; // Disable input while AI is "thinking"

    // Simulate AI response (placeholder for actual Gemini API call)
    addMessageToChat("Thinking...", "ai", true); // Temporary thinking message

    try {
      // ** SIMULATED GEMINI API CALL **
      // In a real application, you would make a fetch request here to your backend,
      // which then securely calls the Gemini API.
      // Example:
      // const response = await fetch('/api/gemini-chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: userMessage })
      // });
      // const data = await response.json();
      // const aiResponse = data.reply;

      // Simulated delay and response
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1000)
      );
      const aiResponse = generateSimulatedResponse(userMessage);

      // Remove "Thinking..." message
      const thinkingMessageElement = aiChatMessages.querySelector(".thinking");
      if (thinkingMessageElement) {
        thinkingMessageElement.remove();
      }
      addMessageToChat(aiResponse, "ai");
    } catch (error) {
      console.error("Error communicating with AI:", error);
      const thinkingMessageElement = aiChatMessages.querySelector(".thinking");
      if (thinkingMessageElement) {
        thinkingMessageElement.remove();
      }
      addMessageToChat(
        "Sorry, I couldn't connect to the AI. Please try again later.",
        "ai"
      );
    } finally {
      aiChatInput.disabled = false;
      aiChatInput.focus();
    }
  });

  function addMessageToChat(text, sender, isThinking = false) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);
    if (isThinking) {
      messageElement.classList.add("thinking"); // For easy removal
    }
    messageElement.textContent = text;
    aiChatMessages.appendChild(messageElement);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // Scroll to bottom
  }

  function generateSimulatedResponse(userInput) {
    userInput = userInput.toLowerCase();
    if (userInput.includes("hello") || userInput.includes("hi"))
      return "Hello there! How can I assist you with AI or space tech today?";
    if (userInput.includes("project"))
      return "You can find my projects under the 'Projects' section. I've worked on image recognition and NLP!";
    if (userInput.includes("space"))
      return "Space is fascinating! I'm particularly interested in exoplanet discoveries and AI's role in space exploration.";
    if (
      userInput.includes("ai") ||
      userInput.includes("artificial intelligence")
    )
      return "AI is a powerful tool with applications across many fields. What aspect of AI are you curious about?";
    if (userInput.includes("help"))
      return "I can tell you about my projects, interests in AI and space, or you can ask me general tech questions!";
    return "That's an interesting question! As a simulated AI, I'm still learning. Try asking about my projects or tech interests.";
  }
}
// End of DOMContentLoaded
