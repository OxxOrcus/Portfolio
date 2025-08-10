// Newsletter Popup Elements (defined globally or at least outside DOMContentLoaded for broader access by helper functions)
const newsletterPopup = document.getElementById('newsletterPopup');
const popupContent = document.getElementById('popupContent');
const closePopup = document.getElementById('closePopup');
const popupForm = document.getElementById('popupNewsletterForm');
let popupShown = false; // Global state for the newsletter popup

// Check if user has already seen the popup in this session
function hasSeenPopup() {
  return sessionStorage.getItem('newsletterPopupShown') === 'true';
}

// Function to show the newsletter popup
function showPopup() {
  if (hasSeenPopup() || !newsletterPopup) return;

  document.body.classList.add('popup-open');
  newsletterPopup.classList.remove('hidden');
  // Trigger reflow to ensure animation plays
  void newsletterPopup.offsetWidth;
  newsletterPopup.classList.add('show');
  popupShown = true;
  sessionStorage.setItem('newsletterPopupShown', 'true');
}

// Function to hide the newsletter popup
function hidePopup() {
  if (!newsletterPopup) return;

  newsletterPopup.classList.remove('show');
  document.body.classList.remove('popup-open');
  // Wait for animation to complete before hiding with display:none (via 'hidden' class)
  setTimeout(() => {
    if (newsletterPopup && !newsletterPopup.classList.contains('show')) {
      newsletterPopup.classList.add('hidden');
    }
  }, 300); // This timeout should match your CSS transition/animation duration
}

// Initialize functionalities when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

  // ---- NEWSLETTER POPUP INITIALIZATION ----
  if (newsletterPopup) { // Ensure popup element exists before adding listeners
    // Close popup when clicking outside its main content area
    document.addEventListener('click', (e) => {
      if (popupShown && popupContent && !popupContent.contains(e.target) && e.target !== newsletterPopup) {
        // Note: `e.target !== newsletterPopup` might be too restrictive if newsletterPopup itself is a backdrop.
        // Consider checking if `e.target === newsletterPopup` if it's an overlay.
        hidePopup();
      }
    });

    // Close popup with escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupShown) {
        hidePopup();
      }
    });
  }

  // Close button for the newsletter popup
  if (closePopup) {
    closePopup.addEventListener('click', hidePopup);
  }

  // Form submission for the POPUP newsletter
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = popupForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) { // Basic check for value
        const email = emailInput.value;
        console.log('Popup subscribed with email:', email);

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
        // Hide popup after 3 seconds
        setTimeout(hidePopup, 3000);
      }
    });
  }

  // Track mouse movement for exit intent to show popup
  function handleMouseLeave(e) {
    if (e.clientY < 50 && !popupShown && !hasSeenPopup()) {
      showPopup();
    }
  }
  document.addEventListener('mouseleave', handleMouseLeave);

  // Show popup after 30 seconds if not shown by exit intent or already seen
  setTimeout(() => {
    if (!hasSeenPopup() && !popupShown) {
      showPopup();
    }
  }, 30000); // 30 seconds delay

  // ---- NEWSLETTER SUBSCRIPTION AND CONFETTI (for a separate page form, e.g., in footer) ----
  const pageNewsletterForm = document.getElementById("newsletter-form"); // Specific ID for this form
  const pageSubscribeMessage = document.getElementById("subscribe-message");

  if (pageNewsletterForm && pageSubscribeMessage) {
    pageNewsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = pageNewsletterForm.querySelector('input[type="email"]');

      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        triggerConfetti(); // Defined later in this DOMContentLoaded scope
        pageSubscribeMessage.textContent = "Thanks for subscribing! 🎉";
        pageSubscribeMessage.style.color = "#34d399"; // Tailwind green-400
        pageSubscribeMessage.style.display = "block";
        pageNewsletterForm.reset(); // Reset the form fields

        setTimeout(() => {
          pageSubscribeMessage.textContent = "";
          pageSubscribeMessage.style.display = "none";
          pageSubscribeMessage.style.color = ""; // Reset color
        }, 5000);
      } else if (emailInput) {
        pageSubscribeMessage.textContent = "Please enter a valid email address.";
        pageSubscribeMessage.style.color = "#f87171"; // Tailwind red-400
        pageSubscribeMessage.style.display = "block";
        setTimeout(() => {
          pageSubscribeMessage.textContent = "";
          pageSubscribeMessage.style.display = "none";
          pageSubscribeMessage.style.color = "";
        }, 3000);
      }
    });
  }

  // ---- MOBILE MENU FUNCTIONALITY ----
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');

  if (mobileMenu && mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded = mobileMenu.classList.contains("active");
      mobileMenuButton.setAttribute("aria-expanded", String(!isExpanded));

      if (isExpanded) {
        mobileMenu.classList.remove("active");
        setTimeout(() => {
          mobileMenu.style.display = 'none';
        }, 300); // Match CSS animation/transition duration
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        `;
      } else {
        mobileMenu.style.display = 'block';
        setTimeout(() => { // Allow display:block to apply before adding class for transition
          mobileMenu.classList.add("active");
        }, 10);
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
      }
    });

    // Close menu when a link inside it is clicked (for same-page navigation)
    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (mobileMenu.classList.contains("active")) {
          const targetId = link.getAttribute('href');
          let isSamePageLink = targetId && targetId.startsWith('#') && targetId.length > 1;

          // Close menu
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

          // Handle smooth scroll for same-page links
          if (isSamePageLink) {
            // e.preventDefault(); // Consider if you want to prevent default hash jump
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              const headerOffset = 80; // Adjust as needed
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

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!mobileMenu || !mobileMenuButton) return; // Defensive check

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

  // ---- CONFETTI TRIGGER FUNCTION ----
  // This function should be defined here, within DOMContentLoaded, or globally if needed elsewhere.
  // Ensure your CSS has a @keyframes animation named 'confetti' and a .confetti-piece class.
  function triggerConfetti() {
    const confettiCount = 60;
    const colors = ["#8e2de2", "#4a00e0", "#ff00ff", "#00ffff", "#facc15", "#ffffff"];

    for (let i = 0; i < confettiCount; i++) {
      const confettiPiece = document.createElement("div");
      confettiPiece.classList.add("confetti-piece"); // Base styles (position, z-index, animation-name) in CSS

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomShape = Math.random() > 0.6 ? "50%" : "0"; // border-radius
      const size = Math.random() * 8 + 5; // px

      confettiPiece.style.backgroundColor = randomColor;

      if (randomShape === "0" && Math.random() > 0.5) { // Make some non-squares
        confettiPiece.style.width = `${size * (Math.random() * 0.5 + 0.8)}px`;
        confettiPiece.style.height = `${size * (Math.random() * 0.3 + 0.5)}px`;
      } else {
        confettiPiece.style.width = `${size}px`;
        confettiPiece.style.height = `${size}px`;
        confettiPiece.style.borderRadius = randomShape;
      }

      // Positioning - starts above viewport and spreads across width
      confettiPiece.style.left = `${Math.random() * 100}vw`;
      confettiPiece.style.top = `${Math.random() * -30 - 5}vh`; // Start off-screen top

      // Animation properties - relies on '.confetti-piece' having 'animation-name: confetti;' etc. in CSS
      confettiPiece.style.animationDuration = `${Math.random() * 2 + 2.5}s`; // 2.5s to 4.5s
      confettiPiece.style.animationDelay = `${Math.random() * 0.7}s`;
      confettiPiece.style.animationTimingFunction = 'ease-in-out'; // Can be in CSS too
      confettiPiece.style.animationFillMode = 'forwards';      // Can be in CSS too


      // CSS Variables for dynamic animation paths (ensure your @keyframes confetti uses these)
      confettiPiece.style.setProperty("--initial-x-offset", `${(Math.random() - 0.5) * 10}px`);
      confettiPiece.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 200}px`);
      // Example @keyframes might look like:
      // @keyframes confetti {
      //   0% { transform: translateY(0) translateX(var(--initial-x-offset)); opacity: 1; }
      //   100% { transform: translateY(120vh) translateX(var(--drift-x)); opacity: 0; }
      // }

      document.body.appendChild(confettiPiece);

      // Remove confetti piece after animation ends to prevent DOM clutter
      confettiPiece.addEventListener("animationend", () => {
        confettiPiece.remove();
      });
    }
  }

  // ---- AI CHATBOT FUNCTIONALITY ----
  const aiChatButton = document.getElementById("ai-chat-button");
  const aiChatWindow = document.getElementById("ai-chat-window");
  const closeAiChatButton = document.getElementById("close-ai-chat");
  const aiChatForm = document.getElementById("ai-chat-form");
  const aiChatInput = document.getElementById("ai-chat-input");
  const aiChatMessages = document.getElementById("ai-chat-messages");

  if (aiChatButton && aiChatWindow && closeAiChatButton && aiChatForm && aiChatInput && aiChatMessages) {
    const toggleAiChatWindow = () => {
      aiChatWindow.classList.toggle("active");
      if (aiChatWindow.classList.contains("active")) {
        aiChatInput.focus();
        if (aiChatMessages.children.length === 0) { // Add initial greeting only if chat is empty
          addMessageToChat("Hello! I'm your AI assistant. How can I help you today?", "ai");
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
      aiChatInput.disabled = true;

      // Add a "thinking" message while waiting for the response
      addMessageToChat("Thinking...", "ai", true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();

        // Remove the "thinking" message
        const thinkingMessageElement = aiChatMessages.querySelector(".thinking");
        if (thinkingMessageElement) {
          thinkingMessageElement.remove();
        }

        if (data.success) {
          addMessageToChat(data.message, "ai");
        } else {
          addMessageToChat(data.message || "Sorry, something went wrong.", "ai");
        }

      } catch (error) {
        console.error("Error communicating with AI:", error);

        // Remove the "thinking" message on error as well
        const thinkingMessageElement = aiChatMessages.querySelector(".thinking");
        if (thinkingMessageElement) {
          thinkingMessageElement.remove();
        }

        addMessageToChat("Sorry, I couldn't connect to the AI. Please check your connection and try again.", "ai");
      } finally {
        aiChatInput.disabled = false;
        aiChatInput.focus();
      }
    });

    function addMessageToChat(text, sender, isThinking = false) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("chat-message", sender);
      if (isThinking) {
        messageElement.classList.add("thinking");
      }
      messageElement.textContent = text;
      aiChatMessages.appendChild(messageElement);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
  }

}); // End of DOMContentLoaded