// js/script.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------------------------------
  // ELEMENT REFERENCES
  // ---------------------------------------------------------------------------
  const newsletterPopup = document.getElementById("newsletterPopup");
  const popupContent = document.getElementById("popupContent");
  const closePopup = document.getElementById("closePopup");
  const popupForm = document.getElementById("popupNewsletterForm");
  const pageNewsletterForm = document.getElementById("newsletter-form");
  const pageSubscribeMessage = document.getElementById("subscribe-message");

  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuButton = document.getElementById("mobile-menu-button");

  const aiChatButton = document.getElementById("ai-chat-button");
  const aiChatWindow = document.getElementById("ai-chat-window");
  const closeAiChatButton = document.getElementById("close-ai-chat");
  const aiChatForm = document.getElementById("ai-chat-form");
  const aiChatInput = document.getElementById("ai-chat-input");
  const aiChatMessages = document.getElementById("ai-chat-messages");

  let popupShown = false;

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------
  function hasSeenPopup() {
    try {
      return sessionStorage.getItem("newsletterSeen") === "1";
    } catch (e) {
      return false;
    }
  }

  function markPopupSeen() {
    try {
      sessionStorage.setItem("newsletterSeen", "1");
    } catch (e) {
      // ignore
    }
  }

  function addMessageToChat(text, sender, isThinking = false) {
    if (!aiChatMessages) return;
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);
    if (isThinking) messageElement.classList.add("thinking");
    messageElement.textContent = text;
    aiChatMessages.appendChild(messageElement);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  // ---------------------------------------------------------------------------
  // NEWSLETTER POPUP
  // ---------------------------------------------------------------------------
  function showPopup() {
    if (!newsletterPopup) return;
    if (popupShown) return;
    // Remove Tailwind 'hidden' so the element can be visible, then add the
    // CSS-controlled 'show' class to trigger transitions defined in
    // `css/style.css` (#newsletterPopup.show).
    newsletterPopup.classList.remove("hidden");
    // small delay to ensure browser registers the removal before adding show
    setTimeout(() => newsletterPopup.classList.add("show"), 10);
    // prevent page scrolling while popup is open
    document.body.classList.add("popup-open");
    popupShown = true;
    markPopupSeen();
  }

  function hidePopup() {
    if (!newsletterPopup) return;
    // Remove the 'show' class so CSS transitions run, then re-add Tailwind
    // 'hidden' after the transition completes to fully hide the element.
    newsletterPopup.classList.remove("show");
    document.body.classList.remove("popup-open");
    setTimeout(() => {
      newsletterPopup.classList.add("hidden");
    }, 300);
  }

  if (closePopup) closePopup.addEventListener("click", hidePopup);

  if (popupForm) {
    popupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Simple success UI in the popup + confetti
      triggerConfetti();
      if (popupContent) {
        popupContent.innerHTML = `
          <div class="text-center py-8">
            <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
            <h3 class="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p class="text-gray-300 mb-6">You've been successfully subscribed to our newsletter.</p>
            <button id="closePopupConfirm" class="btn-primary py-2 px-6">Close</button>
          </div>
        `;
        const confirmBtn = document.getElementById("closePopupConfirm");
        if (confirmBtn) confirmBtn.addEventListener("click", hidePopup);
        setTimeout(hidePopup, 3000);
      }
    });
  }

  function handleMouseLeave(e) {
    if (e.clientY < 50 && !popupShown && !hasSeenPopup()) showPopup();
  }
  document.addEventListener("mouseleave", handleMouseLeave);

  setTimeout(() => {
    if (!hasSeenPopup() && !popupShown) showPopup();
  }, 30000);

  // In-page newsletter form (footer)
  if (pageNewsletterForm && pageSubscribeMessage) {
    pageNewsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = pageNewsletterForm.querySelector(
        'input[type="email"]'
      );
      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        triggerConfetti();
        pageSubscribeMessage.textContent = "Thanks for subscribing! 🎉";
        pageSubscribeMessage.style.color = "#34d399";
        pageSubscribeMessage.style.display = "block";
        pageNewsletterForm.reset();
        setTimeout(() => {
          pageSubscribeMessage.textContent = "";
          pageSubscribeMessage.style.display = "none";
          pageSubscribeMessage.style.color = "";
        }, 5000);
      } else if (emailInput) {
        pageSubscribeMessage.textContent =
          "Please enter a valid email address.";
        pageSubscribeMessage.style.color = "#f87171";
        pageSubscribeMessage.style.display = "block";
        setTimeout(() => {
          pageSubscribeMessage.textContent = "";
          pageSubscribeMessage.style.display = "none";
          pageSubscribeMessage.style.color = "";
        }, 3000);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // MOBILE MENU
  // ---------------------------------------------------------------------------
  if (mobileMenu && mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
      const isExpanded = mobileMenu.classList.contains("active");
      mobileMenuButton.setAttribute("aria-expanded", String(!isExpanded));
      if (isExpanded) {
        mobileMenu.classList.remove("active");
        setTimeout(() => {
          mobileMenu.style.display = "none";
        }, 300);
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>`;
      } else {
        mobileMenu.style.display = "block";
        setTimeout(() => {
          mobileMenu.classList.add("active");
        }, 10);
        mobileMenuButton.innerHTML = `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>`;
      }
    });

    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenu.classList.contains("active")) {
          mobileMenu.classList.remove("active");
          setTimeout(() => {
            mobileMenu.style.display = "none";
          }, 300);
          mobileMenuButton.setAttribute("aria-expanded", "false");
          mobileMenuButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>`;
        }
      });
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (
        !mobileMenu.contains(target) &&
        !mobileMenuButton.contains(target) &&
        mobileMenu.classList.contains("active")
      ) {
        mobileMenu.classList.remove("active");
        setTimeout(() => {
          mobileMenu.style.display = "none";
        }, 300);
        mobileMenuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------------------------------------------------------------------------
  // DESKTOP 'SKILLS' DROPDOWN: click toggle + hover delay + outside click to close
  // ---------------------------------------------------------------------------
  (function initSkillsDropdown() {
    const skillsGroup = document.querySelector("nav .relative.group");
    if (!skillsGroup) return;
    const btn = skillsGroup.querySelector("button");
    const menu = skillsGroup.querySelector("div");
    if (!btn || !menu) return;

    let closeTimeout = null;

    function openMenu() {
      menu.classList.remove("opacity-0", "pointer-events-none");
      menu.classList.add("opacity-100", "pointer-events-auto");
      btn.setAttribute("aria-expanded", "true");
      skillsGroup.classList.add("open");
    }

    function closeMenu() {
      menu.classList.remove("opacity-100", "pointer-events-auto");
      menu.classList.add("opacity-0", "pointer-events-none");
      btn.setAttribute("aria-expanded", "false");
      skillsGroup.classList.remove("open");
    }

    // Toggle on click (helps when hover is unreliable)
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (skillsGroup.classList.contains("open")) closeMenu();
      else openMenu();
    });

    // Keep open while hovering, with a short delay to avoid flicker
    skillsGroup.addEventListener("mouseenter", () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      openMenu();
    });

    skillsGroup.addEventListener("mouseleave", () => {
      closeTimeout = setTimeout(() => {
        closeMenu();
      }, 220);
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!skillsGroup.contains(e.target)) closeMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  })();

  // ---------------------------------------------------------------------------
  // CONFETTI
  // ---------------------------------------------------------------------------
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
      const el = document.createElement("div");
      el.className = "confetti-piece";
      const color = colors[Math.floor(Math.random() * colors.length)];
      el.style.backgroundColor = color;
      const size = Math.random() * 8 + 5;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = `${Math.random() * -30 - 5}vh`;
      el.style.animationDuration = `${Math.random() * 2 + 2.5}s`;
      el.style.animationDelay = `${Math.random() * 0.7}s`;
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  // ---------------------------------------------------------------------------
  // AI CHAT
  // ---------------------------------------------------------------------------
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
        if (aiChatMessages.children.length === 0)
          addMessageToChat(
            "Hello! I'm your AI assistant. How can I help you today?",
            "ai"
          );
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

      const thinking = document.createElement("div");
      thinking.className = "chat-message ai thinking";
      thinking.textContent = "…";
      aiChatMessages.appendChild(thinking);

      try {
        await new Promise((r) => setTimeout(r, 800));
        const responseText = `Got it — "${userMessage}". I can help with that.`;
        thinking.remove();
        addMessageToChat(responseText, "ai");
      } catch (err) {
        console.error(err);
        if (thinking.parentNode) thinking.remove();
        addMessageToChat(
          "Sorry, I couldn't connect to the AI. Please check your connection and try again.",
          "ai"
        );
      } finally {
        aiChatInput.disabled = false;
        aiChatInput.focus();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // HERO SUBTITLE TYPING (letter-by-letter) + re-trigger on entering viewport
  // ---------------------------------------------------------------------------
  function initHeroTyping() {
    const subtitleSpan = document.querySelector(".hero-subtitle");
    const heroSection = document.getElementById("hero");
    if (!subtitleSpan || !heroSection) return;

    const fullText = subtitleSpan.textContent.trim();
    subtitleSpan.textContent = "";

    function typeText(el, text, delay = 70) {
      return new Promise((resolve) => {
        el.classList.remove("caret-blink");
        el.textContent = "";
        let i = 0;
        const interval = setInterval(() => {
          el.textContent += text.charAt(i);
          i += 1;
          if (i >= text.length) {
            clearInterval(interval);
            el.classList.add("caret-blink");
            resolve();
          }
        }, delay);
      });
    }

    function playTyping() {
      subtitleSpan.textContent = "";
      subtitleSpan.classList.remove("caret-blink");
      setTimeout(() => {
        typeText(subtitleSpan, fullText, 70);
      }, 200);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playTyping();
        });
      },
      { root: null, threshold: 0.4 }
    );

    observer.observe(heroSection);
    setTimeout(playTyping, 250);
  }

  initHeroTyping();

  // ---------------------------------------------------------------------------
  // CURSOR FOLLOWER
  // ---------------------------------------------------------------------------
  function initCursorFollower() {
    const cursorBall = document.getElementById("cursor-ball");
    if (!cursorBall) return;

    let mouseX = 0;
    let mouseY = 0;
    let ballX = 0;
    let ballY = 0;
    const speed = 0.1; // Lower value = smoother, more delayed effect

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      // Calculate the distance between the ball and the mouse
      const dx = mouseX - ballX;
      const dy = mouseY - ballY;

      // Move the ball towards the mouse
      ballX += dx * speed;
      ballY += dy * speed;

      // Apply the new position to the ball
      cursorBall.style.transform = `translate(${ballX}px, ${ballY}px) translate(-50%, -50%)`;

      requestAnimationFrame(animate);
    }

    animate();
  }

  initCursorFollower();
});
