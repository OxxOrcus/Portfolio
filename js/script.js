// ---------------------------------------------------------------------------
// STAR CONFETTI ON CONTRACT ME BUTTON
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
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
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
    }
  );
  setTimeout(() => comet.remove(), 2100);
}

// Attach to Contract Me button
document.querySelectorAll("a,button").forEach((el) => {
  if (el.textContent && el.textContent.match(/Contract Me/i)) {
    el.addEventListener("click", function (e) {
      // If already handled, do nothing
      if (el.dataset.confettiHandled) return;
      e.preventDefault();
      triggerStarConfetti();
      triggerComet();
      el.dataset.confettiHandled = "1";
      setTimeout(() => {
        window.open(el.href, "_blank", "noopener");
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
          Math.floor(Math.random() * matrixChars.length)
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
  window.addEventListener("resize", () => {
    if (matrixActive) {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    }
  });

  // Trigger matrix rain on Learn More button click
  // Trigger matrix rain automatically on page load
  startMatrixRain();
  // Fade out matrix effect over the last 3 seconds of a 5.2s total duration
  let fadeTimeout, fadeInterval;
  fadeTimeout = setTimeout(() => {
    let fadeDuration = 3000; // ms
    let fadeStart = Date.now();
    fadeInterval = setInterval(() => {
      let elapsed = Date.now() - fadeStart;
      let progress = Math.min(elapsed / fadeDuration, 1);
      matrixCanvas.style.opacity = 1 - progress;
      if (progress >= 1) {
        clearInterval(fadeInterval);
        stopMatrixRain();
        matrixCanvas.style.opacity = 1;
      }
    }, 30);
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
      const emailInput = popupForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        // Send to backend
        try {
          await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput.value.trim() }),
          });
        } catch (err) {
          // Optionally show error
        }
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
        'input[type="email"]'
      );
      if (emailInput && emailInput.value.trim() && emailInput.checkValidity()) {
        try {
          await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput.value.trim() }),
          });
        } catch (err) {
          // Optionally show error
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
      { root: null, threshold: 0.4 }
    );

    observer.observe(triggerSection);
    setTimeout(playTyping, 250);
  }

  // Call the typing animation function
  initTypingAnimation();

  // ---------------------------------------------------------------------------
  // CURSOR BALL EFFECT
  // ---------------------------------------------------------------------------
  const cursorBall = document.getElementById("cursor-ball");
  if (cursorBall) {
    document.addEventListener("mousemove", (e) => {
      cursorBall.style.left = e.clientX + "px";
      cursorBall.style.top = e.clientY + "px";
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
          "circle:not(.eye-pupil):not(.eye-highlight)"
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

    function movePupils(event) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
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
        // Animate pupil movement for smoothness
        if (pupils[i]) {
          pupils[i].setAttribute("cx", (centers[i].x + dx).toFixed(2));
          pupils[i].setAttribute("cy", (centers[i].y + dy).toFixed(2));
        }
      });
    }

    document.addEventListener("mousemove", movePupils);
  }
  initEyesFollowCursor();
});
