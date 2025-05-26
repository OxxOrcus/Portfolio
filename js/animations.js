// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  // Configure the intersection observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  // Animation for fading elements in on scroll
  const fadeInUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Animation for sliding elements in from the sides
  const slideInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slideIn');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply animations to elements with the appropriate classes
  document.querySelectorAll('.fade-in-up').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    fadeInUpObserver.observe(el);
  });

  document.querySelectorAll('.slide-in-left').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    slideInObserver.observe(el);
  });

  document.querySelectorAll('.slide-in-right').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    slideInObserver.observe(el);
  });

  // Add animation classes when elements come into view
  const animateOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Observe all elements with animation classes
  document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right').forEach(el => {
    animateOnScroll.observe(el);
  });
});

// Add animation classes for the hero section
document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('#hero > div');
  if (heroContent) {
    heroContent.classList.add('animate-fadeInUp');
  }
  
  // Add animation delay to hero buttons
  const heroButtons = document.querySelectorAll('#hero .btn-primary, #hero .btn-secondary');
  heroButtons.forEach((btn, index) => {
    btn.style.animationDelay = `${0.3 + index * 0.1}s`;
    btn.classList.add('animate-fadeInUp');
  });
});

// Add smooth scroll to anchor links with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 80; // Height of your fixed header
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});
