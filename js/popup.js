document.addEventListener("DOMContentLoaded", () => {
  // Newsletter Popup Elements
  const newsletterPopup = document.getElementById('newsletterPopup');
  const popupContent = document.getElementById('popupContent');
  const closePopup = document.getElementById('closePopup');
  const popupForm = document.getElementById('popupNewsletterForm');
  let popupShown = false;

  // Helper: Check if user has already seen the popup in this session
  function hasSeenPopup() {
    return sessionStorage.getItem('newsletterPopupShown') === 'true';
  }

  function showPopup() {
    if (hasSeenPopup() || !newsletterPopup) return;
    document.body.classList.add('popup-open');
    newsletterPopup.classList.remove('hidden');
    // Trigger reflow
    void newsletterPopup.offsetWidth;
    newsletterPopup.classList.add('show');
    popupShown = true;
    sessionStorage.setItem('newsletterPopupShown', 'true');
  }

  function hidePopup() {
    if (!newsletterPopup) return;
    newsletterPopup.classList.remove('show');
    document.body.classList.remove('popup-open');
    // Wait for animation to complete before hiding
    setTimeout(() => {
      if (newsletterPopup && !newsletterPopup.classList.contains('show')) {
        newsletterPopup.classList.add('hidden');
      }
    }, 300);
  }

  // Close popup when clicking outside content
  document.addEventListener('click', (e) => {
    if (popupShown && popupContent && !popupContent.contains(e.target) && e.target !== newsletterPopup) {
      hidePopup();
    }
  });

  // Close popup with escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupShown) {
      hidePopup();
    }
  });

  // Close button
  if (closePopup) {
    closePopup.addEventListener('click', hidePopup);
  }

  // Form submission for popup
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = popupForm.querySelector('input[type="email"]');
      if (emailInput) {
        const email = emailInput.value;
        // Here you would typically send the email to your server
        console.log('Subscribed with email:', email);
        // Show success message
        popupContent.innerHTML = `
          <div class="text-center py-8">
            <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
            <h3 class="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p class="text-gray-300 mb-6">You've been successfully subscribed to our newsletter.</p>
            <button id="popup-success-close" class="btn-primary py-2 px-6">Close</button>
          </div>
        `;
        // Attach close handler to new button
        const successCloseBtn = document.getElementById('popup-success-close');
        if (successCloseBtn) {
          successCloseBtn.addEventListener('click', hidePopup);
        }
        // Hide popup after 3 seconds
        setTimeout(hidePopup, 3000);
      }
    });
  }

  // Track mouse movement for exit intent
  function handleMouseLeave(e) {
    if (e.clientY < 50 && !popupShown && !hasSeenPopup()) {
      showPopup();
    }
  }
  // Exit intent detection
  document.addEventListener('mouseleave', handleMouseLeave);

  // Show popup after 30 seconds if not shown by exit intent
  setTimeout(() => {
    if (!hasSeenPopup() && !popupShown) {
      showPopup();
    }
  }, 30000); // 30 seconds delay

  // Newsletter Subscription and Confetti (main form, not popup)
  const newsletterForm = document.getElementById("newsletter-form");
  const subscribeMessage = document.getElementById("subscribe-message");
  if (newsletterForm && subscribeMessage) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value && emailInput.checkValidity()) {
        triggerConfetti();
        subscribeMessage.textContent = "Thanks for subscribing! 🎉";
        subscribeMessage.style.color = "#34d399";
        subscribeMessage.style.display = "block";
        emailInput.value = "";
        setTimeout(() => {
          subscribeMessage.textContent = "";
          subscribeMessage.style.display = "none";
        }, 5000);
      } else if (emailInput) {
        subscribeMessage.textContent = "Please enter a valid email address.";
        subscribeMessage.style.color = "#f87171";
        subscribeMessage.style.display = "block";
        setTimeout(() => {
          subscribeMessage.textContent = "";
          subscribeMessage.style.display = "none";
          subscribeMessage.style.color = "";
        }, 3000);
      }
    });
  }

  // Confetti animation function (single definition)
  function triggerConfetti() {
    const confettiCount = 60;
    const colors = [
      "#8e2de2",
      "#4a00e0",
      "#ff00ff",
      "#00ffff",
      "#facc15",
      "#ffffff",
    ];
    for (let i = 0; i < confettiCount; i++) {
      const confettiPiece = document.createElement("div");
      confettiPiece.classList.add("confetti-piece");
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomShape = Math.random() > 0.6 ? "50%" : "0";
      const size = Math.random() * 8 + 5;
      confettiPiece.style.backgroundColor = randomColor;
      if (randomShape === "0" && Math.random() > 0.5) {
        confettiPiece.style.width = `${size * (Math.random() * 0.5 + 0.8)}px`;
        confettiPiece.style.height = `${size * (Math.random() * 0.3 + 0.5)}px`;
      } else {
        confettiPiece.style.width = `${size}px`;
        confettiPiece.style.height = `${size}px`;
        confettiPiece.style.borderRadius = randomShape;
      }
      const startX = Math.random() * 100;
      confettiPiece.style.left = `${startX}vw`;
      confettiPiece.style.top = `${Math.random() * -30 - 5}vh`;
      confettiPiece.style.position = 'fixed';
      confettiPiece.style.zIndex = '1000';
      confettiPiece.style.animation = `confetti ${Math.random() * 2 + 2.5}s ease-in-out forwards`;
      confettiPiece.style.animationDelay = `${Math.random() * 0.7}s`;
      confettiPiece.style.setProperty("--initial-x-offset", `${(Math.random() - 0.5) * 10}px`);
      confettiPiece.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 200}px`);
      document.body.appendChild(confettiPiece);
      confettiPiece.addEventListener("animationend", () => {
        confettiPiece.remove();
      });
    }
  }

  // Mobile Menu Functionality
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (mobileMenu && mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded = mobileMenu.classList.contains("active");
      mobileMenuButton.setAttribute("aria-expanded", (!isExpanded).toString());
      if (isExpanded) {
        mobileMenu.classList.remove("active");
        setTimeout(() => {
          mobileMenu.style.display = 'none';
        }, 300);
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        `;
      } else {
        mobileMenu.style.display = 'block';
        setTimeout(() => {
          mobileMenu.classList.add("active");
        }, 10);
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
      }
    });
    // Close menu when a link is clicked
    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenu.classList.contains("active")) {
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
          const targetId = link.getAttribute('href');
          if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              const headerOffset = 80;
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
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const isClickInside = mobileMenu.contains(e.target) || mobileMenuButton.contains(e.target);
      if (!isClickInside && mobileMenu.classList.contains('active')) {
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
      aiChatInput.disabled = true;
      addMessageToChat("Thinking...", "ai", true);
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 1500 + Math.random() * 1000)
        );
        const aiResponse = generateSimulatedResponse(userMessage);
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
        messageElement.classList.add("thinking");
      }
      messageElement.textContent = text;
      aiChatMessages.appendChild(messageElement);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
  }

  // AI Chatbot Response Generator
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

}); // End DOMContentLoaded

  // Close popup when clicking outside content
  document.addEventListener('click', (e) => {
    if (popupShown && popupContent && !popupContent.contains(e.target) && e.target !== newsletterPopup) {
      hidePopup();
    }
  });

  // Close popup with escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupShown) {
      hidePopup();
    }
  });

  // Close button
  if (closePopup) {
    closePopup.addEventListener('click', hidePopup);
  }

  // Form submission
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = popupForm.querySelector('input[type="email"]');
      if (emailInput) {
        const email = emailInput.value;
        // Here you would typically send the email to your server
        console.log('Subscribed with email:', email);
        // Show success message
        popupContent.innerHTML = `
          <div class="text-center py-8">
            <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
            <h3 class="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p class="text-gray-300 mb-6">You've been successfully subscribed to our newsletter.</p>
            <button onclick="hidePopup()" class="btn-primary py-2 px-6">Close</button>
          </div>
        `;
        // Hide popup after 3 seconds
        setTimeout(hidePopup, 3000);
      }
    });
  }

  // Track mouse movement for exit intent
  function handleMouseLeave(e) {
    if (e.clientY < 50 && !popupShown && !hasSeenPopup()) {
      showPopup();
    }
  }

  // Exit intent detection
  document.addEventListener('mouseleave', handleMouseLeave);
  
  // Show popup after 30 seconds if not shown by exit intent
  setTimeout(() => {
    if (!hasSeenPopup() && !popupShown) {
      showPopup();
    }
  }, 10000); // 30 seconds delay

  // Mobile menu toggle
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
        subscribeMessage.textContent = "Thanks for subscribing!";
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
    confettiPiece.style.borderRadius = randomShape;
    confettiPiece.style.width = `${size}px`;
    confettiPiece.style.height = `${size}px`;
    confettiPiece.style.position = 'fixed';
    confettiPiece.style.left = `${Math.random() * 100}%`;
    confettiPiece.style.top = `${Math.random() * 100}%`;
    confettiPiece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiPiece.style.zIndex = '1000';

    document.body.appendChild(confettiPiece);

    // Animate confetti
    confettiPiece.style.animation = `confetti ${Math.random() * 2 + 3}s ease-in-out forwards`;
  }
}

// Mobile Menu Functionality
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuButton = document.getElementById('mobile-menu-button');
if (mobileMenu && mobileMenuButton) {
if (mobileMenu && mobileMenuButton) {
  let popupShown = false;
  mobileMenuButton.addEventListener('click', () => {
    const isExpanded = mobileMenu.classList.contains("active");
    mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
    
    if (isExpanded) {
      // Close the menu
      mobileMenu.classList.remove("active");
      setTimeout(() => {
        mobileMenu.style.display = 'none';
      }, 300);
      mobileMenuButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      `;
    } else {
      // Open the menu
      mobileMenu.style.display = 'block';
      setTimeout(() => {
        mobileMenu.classList.add("active");
      }, 10);
      mobileMenuButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
    }
  });

  // Close menu when a link is clicked
  const menuLinks = mobileMenu.querySelectorAll("a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenu.classList.contains("active")) {
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
        
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            const headerOffset = 80;
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
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInside = mobileMenu.contains(e.target) || mobileMenuButton.contains(e.target);
    if (!isClickInside && mobileMenu.classList.contains('active')) {
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
// Newsletter Subscription and Confetti
}); // End of DOMContentLoaded for mobile menu
