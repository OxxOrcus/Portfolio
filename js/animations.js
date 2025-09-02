// Typing effect for About Me section (only starts on scroll to #about or Learn More click)
function startAboutTypingEffect() {
  const aboutTyping = document.getElementById("about-typing");
  if (!aboutTyping || aboutTyping._started) return;
  aboutTyping._started = true;
  const lines = [
    "I'm a 32-year-old developer from São Paulo, Brazil, currently based in Cork, Ireland.",
    "Focused on building reliable and scalable systems that reach thousands of users.",
    "Experienced in web and backend development, with a passion for solving complex problems using modern technology.",
    "Over the past ~5 years I've focused on building systems and automation that reach and help thousands of users.",
  ];
  let line = 0,
    char = 0;
  let html = "";
  function typeLine() {
    if (line >= lines.length) return;
    if (char < lines[line].length) {
      aboutTyping.innerHTML =
        html +
        lines[line].slice(0, char + 1) +
        '<span class="typing-cursor">█</span>';
      char++;
      setTimeout(typeLine, 28 + Math.random() * 40);
    } else {
      html += lines[line] + "<br>";
      char = 0;
      line++;
      setTimeout(typeLine, 400);
    }
  }
  typeLine();
}

document.addEventListener("DOMContentLoaded", () => {
  // Start on Learn More click
  const learnMore = document.querySelector('a[href="#about"]');
  if (learnMore) {
    learnMore.addEventListener("click", () => {
      setTimeout(startAboutTypingEffect, 400); // allow scroll
    });
  }
  // Start on scroll to #about (IntersectionObserver)
  const aboutSection = document.getElementById("about");
  if (aboutSection) {
    const obs = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting) {
          startAboutTypingEffect();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(aboutSection);
  }
});
// js/animations.js

// -----------------------------------------------------------------------------
// SCROLL-TRIGGERED ANIMATIONS
// -----------------------------------------------------------------------------

// This script handles animations that are triggered as the user scrolls down the page.
// It uses the Intersection Observer API for performance, only animating elements
// as they enter the viewport.

document.addEventListener("DOMContentLoaded", () => {
  // --- INTERSECTION OBSERVER CONFIGURATION ---

  // Common options for the observers.
  // The animation will trigger when 10% of the element is visible.
  // The rootMargin offsets the intersection area, making animations trigger a bit earlier.
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  // --- OBSERVER FOR FADE-IN-UP ANIMATIONS ---

  // Creates an observer that adds the 'animate-fadeInUp' class to elements when they become visible.
  // Once an element has been animated, the observer stops watching it to save resources.
  const fadeInUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fadeInUp");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // --- OBSERVER FOR SLIDE-IN ANIMATIONS ---

  // Creates an observer for elements that slide in from the sides.
  const slideInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-slideIn");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // --- APPLYING OBSERVERS TO ELEMENTS ---

  // Find all elements with the '.fade-in-up' class, set their initial state
  // for the animation, and start observing them.
  document.querySelectorAll(".fade-in-up").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    fadeInUpObserver.observe(el);
  });

  // Find all elements with the '.slide-in-left' class and prepare them for animation.
  document.querySelectorAll(".slide-in-left").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-30px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    slideInObserver.observe(el);
  });

  // Find all elements with the '.slide-in-right' class and prepare them for animation.
  document.querySelectorAll(".slide-in-right").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(30px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    slideInObserver.observe(el);
  });

  // --- GENERAL ANIMATION OBSERVER ---

  // This observer adds a 'animate-visible' class, which can be used for more generic
  // animations or for CSS to handle the transition.
  const animateOnScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  // Observe all elements that have animation classes.
  document
    .querySelectorAll(".fade-in-up, .slide-in-left, .slide-in-right")
    .forEach((el) => {
      animateOnScroll.observe(el);
    });
});

// -----------------------------------------------------------------------------
// HERO SECTION ANIMATIONS
// -----------------------------------------------------------------------------

// This section ensures the hero content animates on page load.
document.addEventListener("DOMContentLoaded", () => {
  const heroContent = document.querySelector("#hero > div");
  if (heroContent) {
    heroContent.classList.add("animate-fadeInUp");
  }

  // Adds a staggered animation delay to the hero section buttons for a nice effect.
  const heroButtons = document.querySelectorAll(
    "#hero .btn-primary, #hero .btn-secondary"
  );
  heroButtons.forEach((btn, index) => {
    btn.style.animationDelay = `${0.3 + index * 0.1}s`;
    btn.classList.add("animate-fadeInUp");
  });
});

// -----------------------------------------------------------------------------
// SMOOTH SCROLLING FOR ANCHOR LINKS
// -----------------------------------------------------------------------------

// This script provides a smooth scrolling behavior for all anchor links (e.g., '#about').
// It also accounts for the height of the fixed header.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent the default instant jump.

    const targetId = this.getAttribute("href");
    if (targetId === "#") return; // Ignore empty hashes.

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 80; // Height of the fixed header in pixels.
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      // Smoothly scroll to the calculated position.
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});
