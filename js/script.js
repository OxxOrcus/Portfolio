// ---------------------------------------------------------------------------
// STAR CONFETTI ON HIRE ME BUTTON
// ---------------------------------------------------------------------------
function triggerStarConfetti() {
  const confettiCount = 36;
  const colors = [
    "#facc15", // yellow
    "#fbbf24", // gold
    "#38bdf8", // blue
    "#0ea5e9", // cyan
    "#fff", // white
  ];
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < confettiCount; i++) {
    const el = document.createElement("div");
    el.className = "star-confetti-piece";
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.innerHTML = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="11,2 13.5,8.5 21,9 15,14 17,21 11,17.5 5,21 7,14 1,9 8.5,8.5" fill="${color}" stroke="#fff" stroke-width="0.7"/></svg>`;
    el.style.position = "fixed";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = `${Math.random() * 10 + 10}vh`;
    el.style.pointerEvents = "none";
    el.style.zIndex = 9999;
    el.style.opacity = 0.95;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    el.style.animation = `star-fall 1.8s cubic-bezier(.6,.2,.4,1) forwards`;
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    fragment.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
  document.body.appendChild(fragment);
}

// Comet animation

function triggerComet() {
  // Get header position and width
  const header = document.querySelector("header");
  if (!header) return;
  const rect = header.getBoundingClientRect();
  // Start: bottom left of viewport
  const startX = 0;
  const startY = window.innerHeight;
  // End: 60% of window width or header width (whichever is greater), at header's vertical center
  const winTarget = window.innerWidth * 0.68; // a bit more to the right than 60%
  const headerTarget = rect.left + rect.width * 0.68;
  const endX = Math.max(winTarget, headerTarget);
  const endY = rect.top + rect.height / 2;

  // Calculate angle for comet body
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Comet SVG: tail points left, head points right
  const comet = document.createElement("div");
  comet.className = "comet-anim";
  comet.innerHTML = `<svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <rect x="0" y="13" width="90" height="6" rx="3" fill="url(#comet-tail)"/>
    <ellipse cx="105" cy="16" rx="13" ry="8" fill="url(#comet-glow)"/>
    <ellipse cx="108" cy="16" rx="7" ry="3.5" fill="#fff" fill-opacity="0.85"/>
    <defs>
      <linearGradient id="comet-tail" x1="0" y1="16" x2="90" y2="16" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fff" stop-opacity="0.0"/>
        <stop offset="0.5" stop-color="#facc15" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#fbbf24" stop-opacity="0.9"/>
      </linearGradient>
      <radialGradient id="comet-glow" cx="0" cy="0" r="1" gradientTransform="translate(105 16) scale(13 8)" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fff" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#facc15" stop-opacity="0.7"/>
      </radialGradient>
    </defs>
  </svg>`;
  comet.style.position = "fixed";
  comet.style.left = `${startX - 60}px`;
  comet.style.top = `${startY - 16}px`;
  comet.style.zIndex = 99999;
  comet.style.pointerEvents = "none";
  comet.style.width = "120px";
  comet.style.height = "32px";
  comet.style.opacity = "1";
  comet.style.transition = "none";
  comet.style.transform = `rotate(${angle}deg)`;
  document.body.appendChild(comet);
  // Animate with CSS
  comet.animate(
    [
      { transform: `rotate(${angle}deg) translate(0,0)`, opacity: 1 },
      {
        transform: `rotate(${angle}deg) translate(${dx}px,${dy}px)`,
        opacity: 0.2,
      },
    ],
    {
      duration: 2000,
      easing: "cubic-bezier(.7,.1,.3,1)",
    },
  );
  setTimeout(() => comet.remove(), 2100);
}

// Attach to Hire Me button
document.querySelectorAll("a,button").forEach((el) => {
  if (el.textContent && el.textContent.match(/Hire Me/i)) {
    el.addEventListener("click", function (e) {
      // If already handled, do nothing
      if (el.dataset.confettiHandled) return;
      e.preventDefault();
      triggerStarConfetti();
      triggerComet();
      el.dataset.confettiHandled = "1";
      setTimeout(() => {
        // Security enhancement: Add noreferrer to prevent tabnabbing vulnerability
        window.open(el.href, "_blank", "noopener,noreferrer");
        el.dataset.confettiHandled = "";
      }, 2000);
    });
  }
});

// Add confetti and comet animation CSS
const style = document.createElement("style");
style.innerHTML = `
    @keyframes star-fall {
      0% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
      80% { opacity: 1; }
      100% { opacity: 0; transform: translateY(60vh) scale(0.7) rotate(180deg); }
    }
    .star-confetti-piece {
      pointer-events: none;
      will-change: transform, opacity;
      transition: opacity 0.2s;
    }
    .comet-anim {
      pointer-events: none;
      will-change: transform, opacity;
      filter: drop-shadow(0 0 16px #fff) drop-shadow(0 0 32px #facc15);
      opacity: 1;
    }
  `;
document.head.appendChild(style);
// js/script.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------------------------------
  // MATRIX RAIN EFFECT
  // ---------------------------------------------------------------------------
  // Create canvas for matrix effect
  const matrixCanvas = document.createElement("canvas");
  matrixCanvas.id = "matrix-canvas";
  matrixCanvas.style.position = "fixed";
  matrixCanvas.style.top = "0";
  matrixCanvas.style.left = "0";
  matrixCanvas.style.width = "100vw";
  matrixCanvas.style.height = "100vh";
  matrixCanvas.style.pointerEvents = "none";
  matrixCanvas.style.zIndex = "100";
  matrixCanvas.style.display = "none";
  document.body.appendChild(matrixCanvas);

  let matrixActive = false;
  let matrixAnimationId = null;

  function startMatrixRain() {
    if (matrixActive) return;
    matrixActive = true;
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    matrixCanvas.style.display = "block";
    runMatrixRain();
  }

  function stopMatrixRain() {
    matrixActive = false;
    matrixCanvas.style.display = "none";
    if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);
  }

  function runMatrixRain() {
    const ctx = matrixCanvas.getContext("2d");
    const w = matrixCanvas.width;
    const h = matrixCanvas.height;
    const fontSize = 18;
    const columns = Math.floor(w / fontSize);
    const drops = Array(columns).fill(1);
    const matrixChars =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    function draw() {
      // Draw a semi-transparent black background (0.25 opacity)
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + "px monospace";
      // Draw more visible green letters (higher opacity)
      ctx.fillStyle = "rgba(0,255,65,0.7)";
      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(
          Math.floor(Math.random() * matrixChars.length),
        );
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      if (matrixActive) {
        matrixAnimationId = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  // Responsive canvas
  // ⚡ Bolt: Debounce canvas resize to prevent main-thread lockups and layout thrashing
  let matrixResizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(matrixResizeTimeout);
    matrixResizeTimeout = setTimeout(() => {
      // Must not skip dimension updates even if not active,
      // to ensure canvas scales properly when made active again
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    }, 150);
  });

  // Trigger matrix rain on Learn More button click
  // Trigger matrix rain automatically on page load
  startMatrixRain();
  // ⚡ Bolt: Fade out matrix effect using CSS transition instead of JS setInterval
  // to offload animation to the GPU and prevent main-thread layout thrashing.
  // Fades out over the last 3 seconds of a 5.2s total duration.
  let fadeTimeout, stopTimeout;

  // Set initial transition state
  matrixCanvas.style.transition = "opacity 3s linear";
  matrixCanvas.style.opacity = "1";

  fadeTimeout = setTimeout(() => {
    // Trigger CSS transition
    matrixCanvas.style.opacity = "0";

    // Stop the actual canvas rendering loop after the transition completes
    stopTimeout = setTimeout(() => {
      stopMatrixRain();
      // Reset styles for potential re-runs
      matrixCanvas.style.transition = "";
      matrixCanvas.style.opacity = "1";
    }, 3000);
  }, 2200);
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
    popupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = popupForm.querySelector("#contact-name");
      const emailInput = popupForm.querySelector("#contact-email");
      const messageInput = popupForm.querySelector("#contact-message");

      if (
        nameInput &&
        nameInput.value.trim() &&
        emailInput &&
        emailInput.value.trim() &&
        emailInput.checkValidity() &&
        messageInput &&
        messageInput.value.trim()
      ) {
        const submitBtn = popupForm.querySelector('button[type="submit"]');
        let originalText = "";
        if (submitBtn) {
          originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<i class="fas fa-circle-notch fa-spin mr-2"></i> Sending...';
          submitBtn.classList.add("opacity-75", "cursor-not-allowed");
        }
        // Send to backend
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              email: emailInput.value.trim(),
              message: messageInput.value.trim(),
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to send message");
          }

          triggerConfetti();
          if (popupContent) {
            popupContent.innerHTML = `
              <div class="text-center py-8">
                <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                <h3 class="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p class="text-gray-300 mb-6">Thank you for reaching out. I'll get back to you soon.</p>
                <button id="closePopupConfirm" class="btn-primary py-2 px-6">Close</button>
              </div>
            `;
            const confirmBtn = document.getElementById("closePopupConfirm");
            if (confirmBtn) confirmBtn.addEventListener("click", hidePopup);
            setTimeout(hidePopup, 3000);
          }
        } catch (err) {
          // Show inline error
          const existingError = popupForm.querySelector(".error-message");
          if (existingError) existingError.remove();

          const errorMsg = document.createElement("p");
          errorMsg.className = "error-message text-red-500 text-sm mt-2";
          errorMsg.textContent =
            "Oops! Something went wrong. Please try again later.";

          popupForm.appendChild(errorMsg);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
          }
        }
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
    pageNewsletterForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const emailInput = pageNewsletterForm.querySelector(
        'input[type="email"]',
      );
      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        const submitBtn = pageNewsletterForm.querySelector(
          'button[type="submit"]',
        );
        let originalText = "";
        if (submitBtn) {
          originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2"></i> Subscribing...';
          submitBtn.classList.add("opacity-75", "cursor-not-allowed");
        }
        try {
          const response = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput.value.trim() }),
          });

          if (!response.ok) {
            throw new Error("Failed to subscribe");
          }

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
        } catch (err) {
          pageSubscribeMessage.textContent =
            "Oops! Something went wrong. Please try again.";
          pageSubscribeMessage.style.color = "#ef4444"; // red-500
          pageSubscribeMessage.style.display = "block";
          setTimeout(() => {
            pageSubscribeMessage.textContent = "";
            pageSubscribeMessage.style.display = "none";
            pageSubscribeMessage.style.color = "";
          }, 5000);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
          }
        }
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
    const fragment = document.createDocumentFragment();
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
      fragment.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
    document.body.appendChild(fragment);
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
            "ai",
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

      const submitBtn = aiChatForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-circle-notch fa-spin"></i><span class="sr-only">Sending</span>';
      submitBtn.classList.add("opacity-75", "cursor-not-allowed");

      const thinking = document.createElement("div");
      thinking.className = "chat-message ai thinking";
      thinking.textContent = "…";
      aiChatMessages.appendChild(thinking);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });
        const data = await res.json();
        thinking.remove();
        if (data.success && data.message) {
          addMessageToChat(data.message, "ai");
        } else {
          addMessageToChat(
            data.message || "Sorry, I couldn't process that. Please try again.",
            "ai",
          );
        }
      } catch (err) {
        console.error(err);
        if (thinking.parentNode) thinking.remove();
        addMessageToChat(
          "Sorry, I couldn't connect to the AI. Please check your connection and try again.",
          "ai",
        );
      } finally {
        aiChatInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
        aiChatInput.focus();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // SUBTITLE TYPING (letter-by-letter) + re-trigger on entering viewport
  // ---------------------------------------------------------------------------
  function initTypingAnimation() {
    const subtitleSpan = document.querySelector(".typing-subtitle");
    const triggerSection = document.getElementById("about");
    if (!subtitleSpan || !triggerSection) return;

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
      { root: null, threshold: 0.4 },
    );

    observer.observe(triggerSection);
    setTimeout(playTyping, 250);
  }

  // Call the typing animation function
  initTypingAnimation();

  // ---------------------------------------------------------------------------
  // CURSOR BALL EFFECT
  // ---------------------------------------------------------------------------
  // ⚡ Bolt: Throttled mousemove with requestAnimationFrame to batch style updates
  // and prevent main-thread layout thrashing on high-frequency events.
  // Using transform: translate3d (via CSS variables) instead of top/left to avoid
  // layout thrashing and utilize the compositor thread for better performance.
  const cursorBall = document.getElementById("cursor-ball");
  if (cursorBall) {
    let cursorRafId = null;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener("mousemove", (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!cursorRafId) {
        cursorRafId = requestAnimationFrame(() => {
          cursorBall.style.setProperty("--cx", cursorX + "px");
          cursorBall.style.setProperty("--cy", cursorY + "px");
          cursorRafId = null;
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // EYES FOLLOW CURSOR EFFECT
  // ---------------------------------------------------------------------------

  function initEyesFollowCursor() {
    const eyes = document.querySelectorAll(".menu-eyes .eye-styled");
    if (!eyes.length) return;

    // Each eye SVG: get the pupil (the large dark circle with class 'eye-pupil')
    const pupils = [];
    const centers = [];

    eyes.forEach((eye) => {
      const svg = eye.querySelector("svg");
      if (!svg) return;
      const pupil = svg.querySelector(".eye-pupil");
      if (pupil) {
        pupils.push(pupil);
        // Get the white eyeball circle (center)
        const main = svg.querySelector(
          "circle:not(.eye-pupil):not(.eye-highlight)",
        );
        if (main) {
          centers.push({
            x: parseFloat(main.getAttribute("cx")),
            y: parseFloat(main.getAttribute("cy")),
            rx: 7.5, // how far pupil can move horizontally
            ry: 5.5, // how far pupil can move vertically
          });
        } else {
          centers.push({ x: 22, y: 14, rx: 7.5, ry: 5.5 });
        }
      }
    });

    // ⚡ Bolt: Throttled mousemove with requestAnimationFrame to prevent
    // style updates from executing on every mouse movement.
    // DOM reads and writes are separated into two loops to avoid layout thrashing.
    // Expected impact: smoother scroll and interaction, reduced CPU usage.
    let eyesRafId = null;
    let mouseX = 0;
    let mouseY = 0;

    function movePupils(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!eyesRafId) {
        eyesRafId = requestAnimationFrame(() => {
          // Loop 1: DOM Reads
          const targetPositions = [];
          eyes.forEach((eye, i) => {
            const rect = eye.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let dx = mouseX - centerX;
            let dy = mouseY - centerY;

            // Normalize and clamp
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.1) {
              dx = (dx / dist) * centers[i].rx;
              dy = (dy / dist) * centers[i].ry;
            }
            targetPositions.push({ dx, dy });
          });

          // Loop 2: DOM Writes
          eyes.forEach((_, i) => {
            if (pupils[i] && targetPositions[i]) {
              const { dx, dy } = targetPositions[i];
              pupils[i].setAttribute("cx", (centers[i].x + dx).toFixed(2));
              pupils[i].setAttribute("cy", (centers[i].y + dy).toFixed(2));
            }
          });

          eyesRafId = null;
        });
      }
    }

    document.addEventListener("mousemove", movePupils, { passive: true });
  }
  initEyesFollowCursor();

  // ---------------------------------------------------------------------------
  // SCROLL PROGRESS BAR, HEADER BACKGROUND, ACTIVE NAV, & BACK TO TOP
  // ---------------------------------------------------------------------------
  const scrollProgress = document.getElementById("scroll-progress");
  const siteHeader = document.getElementById("site-header");
  const backToTop = document.getElementById("back-to-top");
  const navLinks = document.querySelectorAll('header nav a[href^="#"]');
  const sections = [];

  navLinks.forEach((link) => {
    const id = link.getAttribute("href");
    if (id && id !== "#") {
      const sec = document.querySelector(id);
      if (sec) sections.push({ el: sec, link: link, id: id });
    }
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ⚡ Bolt: Consolidated scroll updates into a single function, cleanly separating
  // DOM reads and DOM writes to prevent layout thrashing inside the requestAnimationFrame loop.
  // We use a layout cache updated passively by ResizeObserver to eliminate all synchronous DOM reads
  // from the high-frequency scroll loop, preventing reflows when the DOM is dirtied by other animations.
  const layoutCache = {
    docHeight: document.documentElement.scrollHeight,
    winHeight: window.innerHeight,
    sectionOffsets: sections.map((sec) => ({
      sec,
      offsetTop: sec.el.offsetTop,
    })),
  };

  function updateLayoutCache() {
    layoutCache.docHeight = document.documentElement.scrollHeight;
    layoutCache.winHeight = window.innerHeight;
    layoutCache.sectionOffsets = sections.map((sec) => ({
      sec,
      offsetTop: sec.el.offsetTop,
    }));
  }

  // Update cache on window resize
  window.addEventListener("resize", updateLayoutCache, { passive: true });
  // Update cache on body height changes (e.g. late loaded content)
  new ResizeObserver(updateLayoutCache).observe(document.body);

  function processScrollUpdates() {
    // --- Loop 1: DOM Reads ---
    const scrollTop = window.scrollY;

    // Calculate progress using cached dimensions
    const scrollableHeight = layoutCache.docHeight - layoutCache.winHeight;
    const progress =
      scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

    // Calculate active nav section using cached offsetTops
    const scrollPos = scrollTop + 120;
    let currentSection = null;
    // ⚡ Bolt: Cache array length and elements to reduce property lookups in a high-frequency loop.
    const offsets = layoutCache.sectionOffsets;
    for (let i = offsets.length - 1; i >= 0; i--) {
      const entry = offsets[i];
      if (entry.offsetTop <= scrollPos) {
        currentSection = entry.sec;
        break;
      }
    }

    // --- Loop 2: DOM Writes ---
    if (scrollProgress) {
      scrollProgress.style.width = progress + "%";
    }

    if (siteHeader) {
      if (scrollTop > 50) {
        siteHeader.style.background = "rgba(10,10,10,0.95)";
        siteHeader.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
        siteHeader.style.paddingTop = "0.75rem";
        siteHeader.style.paddingBottom = "0.75rem";
      } else {
        siteHeader.style.background = "rgba(10,10,10,0.8)";
        siteHeader.style.boxShadow = "none";
        siteHeader.style.paddingTop = "";
        siteHeader.style.paddingBottom = "";
      }
    }

    navLinks.forEach((l) => {
      l.classList.remove("text-white", "font-semibold");
      l.style.borderBottom = "";
    });
    if (currentSection) {
      currentSection.link.classList.add("text-white", "font-semibold");
      currentSection.link.style.borderBottom = "2px solid #8e2de2";
    }

    if (backToTop) {
      if (scrollTop > 400) {
        backToTop.style.opacity = "1";
        backToTop.style.pointerEvents = "auto";
        backToTop.style.transform = "translateY(0)";
      } else {
        backToTop.style.opacity = "0";
        backToTop.style.pointerEvents = "none";
        backToTop.style.transform = "translateY(16px)";
      }
    }
  }

  // Unified scroll handler (throttled with rAF)
  let scrollRafId = null;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollRafId) {
        scrollRafId = requestAnimationFrame(() => {
          processScrollUpdates();
          scrollRafId = null;
        });
      }
    },
    { passive: true },
  );

  // Initial call
  processScrollUpdates();

  // ---------------------------------------------------------------------------
  // MAGNETIC BUTTON EFFECT
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".magnetic-btn").forEach((btn) => {
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let cachedRect = null;

    btn.addEventListener("mouseenter", () => {
      const rect = btn.getBoundingClientRect();
      cachedRect = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    });

    btn.addEventListener("mousemove", (e) => {
      // ⚡ Bolt: Cache latest mouse position and throttle DOM reads/writes with requestAnimationFrame
      targetX = e.pageX;
      targetY = e.pageY;

      if (!rafId && cachedRect) {
        rafId = requestAnimationFrame(() => {
          // ⚡ Bolt: Use cached, document-relative untransformed rect to avoid
          // transform-induced jitter and forced synchronous layouts.
          const x = targetX - cachedRect.left - cachedRect.width / 2;
          const y = targetY - cachedRect.top - cachedRect.height / 2;
          btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.05)`;
          rafId = null;
        });
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      btn.style.transform = "";
      cachedRect = null;
    });
  });

  // ---------------------------------------------------------------------------
  // COUNTER ANIMATION (Stats Row)
  // ---------------------------------------------------------------------------
  function animateCounters() {
    const counters = document.querySelectorAll(".stat-number[data-target]");
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        counter.textContent = Math.round(target * ease) + "+";
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const statsRow = document.getElementById("stats-row");
  if (statsRow) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    statsObserver.observe(statsRow);
  }

  // ---------------------------------------------------------------------------
  // SECTION REVEAL ON SCROLL
  // ---------------------------------------------------------------------------
  const revealSections = document.querySelectorAll(".section-reveal");
  if (revealSections.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    revealSections.forEach((s) => revealObserver.observe(s));
  }

  // ---------------------------------------------------------------------------
  // SKILL BAR ANIMATION ON SCROLL
  // ---------------------------------------------------------------------------
  const skillBars = document.querySelectorAll(".skill-bar");
  if (skillBars.length) {
    const skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll(".skill-bar");
            bars.forEach((bar, i) => {
              setTimeout(() => {
                bar.style.width = bar.dataset.width + "%";
              }, i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    const skillsSection = document.getElementById("skills");
    if (skillsSection) skillObserver.observe(skillsSection);
  }

  // ---------------------------------------------------------------------------
  // TILT EFFECT ON PROJECT CARDS
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".project-card").forEach((card) => {
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let cachedRect = null;

    card.addEventListener("mouseenter", () => {
      const rect = card.getBoundingClientRect();
      cachedRect = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    });

    card.addEventListener("mousemove", (e) => {
      // ⚡ Bolt: Cache latest mouse position and throttle DOM reads/writes with requestAnimationFrame
      targetX = e.pageX;
      targetY = e.pageY;

      if (!rafId && cachedRect) {
        rafId = requestAnimationFrame(() => {
          // ⚡ Bolt: Use cached, document-relative untransformed rect to avoid
          // transform-induced jitter and forced synchronous layouts.
          const x = targetX - cachedRect.left;
          const y = targetY - cachedRect.top;
          const centerX = cachedRect.width / 2;
          const centerY = cachedRect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -6;
          const rotateY = ((x - centerX) / centerX) * 6;
          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
          rafId = null;
        });
      }
    });
    card.addEventListener("mouseleave", () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      card.style.transform = "";
      cachedRect = null;
    });
  });
});
