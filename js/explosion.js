// js/explosion.js
// Creates an explosion effect around a target element

function createExplosion(x, y, parent, particleCount = 40) {
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span");
    particle.className = "explosion-particle explosion-dollar";
    particle.textContent = "$";
    // Distribute all around the button, with some randomness
    const angle =
      (2 * Math.PI * i) / particleCount + (Math.random() - 0.5) * 0.15;
    const distance = 70 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty("--dx", dx + "px");
    particle.style.setProperty("--dy", dy + "px");
    // Randomize size and rotation
    const scale = 0.8 + Math.random() * 0.7;
    const rot = Math.floor(Math.random() * 360);
    particle.style.fontSize = `${18 + Math.random() * 10}px`;
    particle.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
    parent.appendChild(particle);
    setTimeout(() => {
      particle.remove();
    }, 1400);
  }
}

// Attach explosion to Buy Me a Coffee widget and inline button, even if loaded late
function attachExplosionToBMC() {
  // Inline button
  const inlineBtn = document.querySelector('img[alt="Buy Me A Coffee"]');
  if (inlineBtn && !inlineBtn._explosionAttached) {
    const parent = inlineBtn.parentElement;
    if (parent && getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
    inlineBtn.addEventListener("mouseenter", (e) => {
      const rect = inlineBtn.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      createExplosion(x, y, parent);
    });
    inlineBtn._explosionAttached = true;
  }

  // Floating widget button (injected by BMC script)
  const widgetBtn = document.getElementById("bmc-wbtn");
  if (widgetBtn && !widgetBtn._explosionAttached) {
    const parent = widgetBtn.parentElement;
    if (parent && getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
    widgetBtn.addEventListener("mouseenter", (e) => {
      const rect = widgetBtn.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      createExplosion(x, y, parent);
    });
    widgetBtn._explosionAttached = true;
  }
}

// Observe DOM for late-injected BMC widget
const observer = new MutationObserver(() => {
  attachExplosionToBMC();
});
observer.observe(document.body, { childList: true, subtree: true });

// Also try on DOMContentLoaded
window.addEventListener("DOMContentLoaded", attachExplosionToBMC);
