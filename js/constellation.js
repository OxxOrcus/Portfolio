// ---------------------------------------------------------------------------
// CONSTELLATION BACKGROUND EFFECT
// ---------------------------------------------------------------------------
function initConstellation() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // We actually want a transparent background to blend with the hero section's gradients
  const heroSection = document.getElementById("hero");
  if (!heroSection) return;

  let width, height;
  let particles = [];
  const particleCount = 100; // Adjust for density
  const maxDistance = 150; // Distance to draw lines between particles

  // Initialize canvas size
  function resize() {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Re-initialize particles on resize to spread them evenly
    initParticles();
  }

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          // Opacity based on distance
          const opacity = 1 - distance / maxDistance;
          ctx.strokeStyle = `rgba(138, 43, 226, ${opacity * 0.5})`; // Purple tint
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  // Set initial size and start animation
  const observer = new ResizeObserver(() => {
    resize();
  });
  observer.observe(heroSection);

  window.addEventListener("resize", resize);
  resize();
  animate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initConstellation);
} else {
  initConstellation();
}
