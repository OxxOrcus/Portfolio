// js/script.js

// -----------------------------------------------------------------------------
// NEWSLETTER POPUP
// -----------------------------------------------------------------------------

// Elements for the newsletter popup functionality.
// Defined globally for broader access by helper functions.
const newsletterPopup = document.getElementById('newsletterPopup');
const popupContent = document.getElementById('popupContent');
const closePopup = document.getElementById('closePopup');
const popupForm = document.getElementById('popupNewsletterForm');
let popupShown = false; // Tracks if the popup has been shown in the current session.

/**
 * Checks if the user has already seen the popup in the current session.
 * @returns {boolean} True if the popup has been shown, false otherwise.
 */
function hasSeenPopup() {
  return sessionStorage.getItem('newsletterPopupShown') === 'true';
}

/**
 * Displays the newsletter popup with a fade-in animation.
 * It also sets a session storage item to prevent it from showing again.
 */
function showPopup() {
  if (hasSeenPopup() || !newsletterPopup) return;

  document.body.classList.add('popup-open'); // Prevents background scroll.
  newsletterPopup.classList.remove('hidden');

  // Trigger a reflow to ensure the browser applies the 'hidden' removal before adding 'show'.
  void newsletterPopup.offsetWidth;

  newsletterPopup.classList.add('show');
  popupShown = true;
  sessionStorage.setItem('newsletterPopupShown', 'true');
}

/**
 * Hides the newsletter popup with a fade-out animation.
 */
function hidePopup() {
  if (!newsletterPopup) return;

  newsletterPopup.classList.remove('show');
  document.body.classList.remove('popup-open');

  // Waits for the CSS animation to finish before setting display to 'none'.
  // The timeout duration should match the CSS transition duration.
  setTimeout(() => {
    if (newsletterPopup && !newsletterPopup.classList.contains('show')) {
      newsletterPopup.classList.add('hidden');
    }
  }, 300);
}


// Initialize all functionalities when the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => {

  // ---- NEWSLETTER POPUP INITIALIZATION ----
  if (newsletterPopup) {
    // Add listener to close the popup when clicking outside of its content area.
    document.addEventListener('click', (e) => {
      if (popupShown && popupContent && !popupContent.contains(e.target) && e.target !== newsletterPopup) {
        hidePopup();
      }
    });

    // Add listener to close the popup with the 'Escape' key.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupShown) {
        hidePopup();
      }
    });
  }

  // Add click listener to the popup's close button.
  if (closePopup) {
    closePopup.addEventListener('click', hidePopup);
  }

  // Handle the submission of the newsletter form within the popup.
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = popupForm.querySelector('input[type="email"]');

      // Basic validation for email input.
      if (emailInput && emailInput.value) {
        const email = emailInput.value;
        console.log('Popup subscribed with email:', email);

        // Display a success message inside the popup.
        if (popupContent) {
          popupContent.innerHTML = `
            <div class="text-center py-8">
              <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
              <h3 class="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p class="text-gray-300 mb-6">You've been successfully subscribed to our newsletter.</p>
              <button onclick="hidePopup()" class="btn-primary py-2 px-6">Close</button>
            </div>
          `;
        }
        // Automatically hide the popup after 3 seconds.
        setTimeout(hidePopup, 3000);
      }
    });
  }

  /**
   * Handles the mouse leave event to detect exit intent.
   * Shows the popup if the cursor moves towards the top of the viewport.
   * @param {MouseEvent} e The mouse event object.
   */
  function handleMouseLeave(e) {
    if (e.clientY < 50 && !popupShown && !hasSeenPopup()) {
      showPopup();
    }
  }
  document.addEventListener('mouseleave', handleMouseLeave);

  // Fallback to show the popup after 30 seconds if it hasn't been triggered by other means.
  setTimeout(() => {
    if (!hasSeenPopup() && !popupShown) {
      showPopup();
    }
  }, 30000);

  // -----------------------------------------------------------------------------
  // IN-PAGE NEWSLETTER FORM (e.g., in the footer)
  // -----------------------------------------------------------------------------
  const pageNewsletterForm = document.getElementById("newsletter-form");
  const pageSubscribeMessage = document.getElementById("subscribe-message");

  if (pageNewsletterForm && pageSubscribeMessage) {
    pageNewsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = pageNewsletterForm.querySelector('input[type="email"]');

      // Check if the email is valid before proceeding.
      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        triggerConfetti(); // Trigger a celebratory confetti effect.
        pageSubscribeMessage.textContent = "Thanks for subscribing! 🎉";
        pageSubscribeMessage.style.color = "#34d399"; // Green color for success.
        pageSubscribeMessage.style.display = "block";
        pageNewsletterForm.reset();

        // Clear the message after 5 seconds.
        setTimeout(() => {
          pageSubscribeMessage.textContent = "";
          pageSubscribeMessage.style.display = "none";
          pageSubscribeMessage.style.color = "";
        }, 5000);
      } else if (emailInput) {
        // Display an error message for invalid email.
        pageSubscribeMessage.textContent = "Please enter a valid email address.";
        pageSubscribeMessage.style.color = "#f87171"; // Red color for error.
        pageSubscribeMessage.style.display = "block";

        // Clear the error message after 3 seconds.
        setTimeout(() => {
          pageSubscribeMessage.textContent = "";
          pageSubscribeMessage.style.display = "none";
          pageSubscribeMessage.style.color = "";
        }, 3000);
      }
    });
  }

  // -----------------------------------------------------------------------------
  // MOBILE MENU
  // -----------------------------------------------------------------------------
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');

  if (mobileMenu && mobileMenuButton) {
    // Toggle the mobile menu on button click.
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded = mobileMenu.classList.contains("active");
      mobileMenuButton.setAttribute("aria-expanded", String(!isExpanded));

      if (isExpanded) {
        // Close the menu.
        mobileMenu.classList.remove("active");
        setTimeout(() => {
          mobileMenu.style.display = 'none';
        }, 300); // Wait for transition to finish.
        // Change icon back to hamburger.
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        `;
      } else {
        // Open the menu.
        mobileMenu.style.display = 'block';
        setTimeout(() => {
          mobileMenu.classList.add("active");
        }, 10); // Short delay to allow display property to apply.
        // Change icon to 'X'.
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
      }
    });

    // Add listeners to each link within the mobile menu.
    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (mobileMenu.classList.contains("active")) {
          const targetId = link.getAttribute('href');
          const isSamePageLink = targetId && targetId.startsWith('#') && targetId.length > 1;

          // Close the menu.
          mobileMenu.classList.remove("active");
          setTimeout(() => {
            mobileMenu.style.display = 'none';
          }, 300);
          mobileMenuButton.setAttribute("aria-expanded", "false");
          mobileMenuButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          `;

          // If it's a same-page link, handle smooth scrolling.
          if (isSamePageLink) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              const headerOffset = 80; // Adjust for fixed header height.
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        }
      });
    });

    // Close the menu if a click is detected outside of it.
    document.addEventListener('click', (e) => {
      if (!mobileMenu || !mobileMenuButton) return;

      const isClickInsideMenu = mobileMenu.contains(e.target);
      const isClickOnButton = mobileMenuButton.contains(e.target);

      if (!isClickInsideMenu && !isClickOnButton && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        setTimeout(() => {
          mobileMenu.style.display = 'none';
        }, 300);
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        `;
      }
    });
  }

  // -----------------------------------------------------------------------------
  // CONFETTI EFFECT
  // -----------------------------------------------------------------------------
  /**
   * Triggers a confetti animation for celebrations (e.g., newsletter subscription).
   * Dynamically creates and animates confetti pieces.
   */
  function triggerConfetti() {
    const confettiCount = 60;
    const colors = ["#8e2de2", "#4a00e0", "#ff00ff", "#00ffff", "#facc15", "#ffffff"];

    for (let i = 0; i < confettiCount; i++) {
      const confettiPiece = document.createElement("div");
      confettiPiece.classList.add("confetti-piece");

      // Randomize confetti properties.
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomShape = Math.random() > 0.6 ? "50%" : "0"; // Circle or square.
      const size = Math.random() * 8 + 5;

      confettiPiece.style.backgroundColor = randomColor;

      // Create varied shapes (rectangles).
      if (randomShape === "0" && Math.random() > 0.5) {
        confettiPiece.style.width = `${size * (Math.random() * 0.5 + 0.8)}px`;
        confettiPiece.style.height = `${size * (Math.random() * 0.3 + 0.5)}px`;
      } else {
        confettiPiece.style.width = `${size}px`;
        confettiPiece.style.height = `${size}px`;
        confettiPiece.style.borderRadius = randomShape;
      }

      // Position confetti to start from the top and spread across the viewport.
      confettiPiece.style.left = `${Math.random() * 100}vw`;
      confettiPiece.style.top = `${Math.random() * -30 - 5}vh`;

      // Randomize animation properties for a natural look.
      confettiPiece.style.animationDuration = `${Math.random() * 2 + 2.5}s`;
      confettiPiece.style.animationDelay = `${Math.random() * 0.7}s`;
      confettiPiece.style.animationTimingFunction = 'ease-in-out';
      confettiPiece.style.animationFillMode = 'forwards';

      // Use CSS variables for dynamic animation paths in the keyframes.
      confettiPiece.style.setProperty("--initial-x-offset", `${(Math.random() - 0.5) * 10}px`);
      confettiPiece.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 200}px`);

      document.body.appendChild(confettiPiece);

      // Remove the confetti piece from the DOM after its animation completes.
      confettiPiece.addEventListener("animationend", () => {
        confettiPiece.remove();
      });
    }
  }

  // -----------------------------------------------------------------------------
  // AI CHATBOT
  // -----------------------------------------------------------------------------
  const aiChatButton = document.getElementById("ai-chat-button");
  const aiChatWindow = document.getElementById("ai-chat-window");
  const closeAiChatButton = document.getElementById("close-ai-chat");
  const aiChatForm = document.getElementById("ai-chat-form");
  const aiChatInput = document.getElementById("ai-chat-input");
  const aiChatMessages = document.getElementById("ai-chat-messages");

  if (aiChatButton && aiChatWindow && closeAiChatButton && aiChatForm && aiChatInput && aiChatMessages) {
    /**
     * Toggles the visibility of the AI chat window.
     * Adds a greeting message on first open.
     */
    const toggleAiChatWindow = () => {
      aiChatWindow.classList.toggle("active");
      if (aiChatWindow.classList.contains("active")) {
        aiChatInput.focus();
        // Add a greeting message if the chat is empty.
        if (aiChatMessages.children.length === 0) {
          addMessageToChat("Hello! I'm your AI assistant. How can I help you today?", "ai");
        }
      }
    };

    aiChatButton.addEventListener("click", toggleAiChatWindow);
    closeAiChatButton.addEventListener("click", toggleAiChatWindow);

    // Handle chat form submission.
    aiChatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const userMessage = aiChatInput.value.trim();
      if (!userMessage) return;

      addMessageToChat(userMessage, "user");
      aiChatInput.value = "";
      aiChatInput.disabled = true; // Prevent multiple submissions.

      addMessageToChat("Thinking...", "ai", true); // Show a temporary "thinking" message.

      try {
        // Simulate a call to a Gemini-like API.
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
        const aiResponse = generateSimulatedResponse(userMessage);

        // Remove the "thinking" message and display the actual response.
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
        addMessageToChat("Sorry, I couldn't connect to the AI. Please try again later.", "ai");
      } finally {
        aiChatInput.disabled = false; // Re-enable input.
        aiChatInput.focus();
      }
    });

    /**
     * Adds a message to the chat interface.
     * @param {string} text The message content.
     * @param {string} sender 'user' or 'ai'.
     * @param {boolean} isThinking If true, adds a class for styling the "thinking" message.
     */
    function addMessageToChat(text, sender, isThinking = false) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("chat-message", sender);
      if (isThinking) {
        messageElement.classList.add("thinking");
      }
      messageElement.textContent = text;
      aiChatMessages.appendChild(messageElement);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // Auto-scroll to the bottom.
    }
  }

  /**
   * Generates a simulated response from the AI based on user input.
   * This is a simplified placeholder for a real API integration.
   * @param {string} userInput The user's message.
   * @returns {string} A simulated AI response.
   */
  function generateSimulatedResponse(userInput) {
    userInput = userInput.toLowerCase();
    if (userInput.includes("hello") || userInput.includes("hi"))
      return "Hello there! How can I assist you with AI or space tech today?";
    if (userInput.includes("project"))
      return "You can find my projects under the 'Projects' section. I've worked on image recognition and NLP!";
    if (userInput.includes("space"))
      return "Space is fascinating! I'm particularly interested in exoplanet discoveries and AI's role in space exploration.";
    if (userInput.includes("ai") || userInput.includes("artificial intelligence"))
      return "AI is a powerful tool with applications across many fields. What aspect of AI are you curious about?";
    if (userInput.includes("help"))
      return "I can tell you about my projects, interests in AI and space, or you can ask me general tech questions!";
    return "That's an interesting question! As a simulated AI, I'm still learning. Try asking about my projects or tech interests.";
  }

}); // End of DOMContentLoaded