/* ============================================
   main.js — Immersive Site Logic
   ============================================ */

(function () {
  'use strict';

  /* --- Skeleton loader --- */
  var skeleton = document.getElementById('skeleton');
  function dismissSkeleton() {
    if (!skeleton) return;
    skeleton.classList.add('hidden');
    setTimeout(function () {
      if (skeleton.parentNode) skeleton.parentNode.removeChild(skeleton);
    }, 700);
  }

  if (skeleton) {
    var dismissed = false;
    function safeDismiss() {
      if (dismissed) return;
      dismissed = true;
      dismissSkeleton();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(safeDismiss);
    }
    setTimeout(safeDismiss, 1800);
    window.addEventListener('load', safeDismiss);
  }

  /* --- Navbar scroll transition --- */
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    var onScroll = function () {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile menu toggle --- */
  var toggle = document.querySelector('.mobile-toggle');
  var navLinks = document.querySelector('.navbar-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    var closeMenu = function () {
      navLinks.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    };
    var closeBtn = document.querySelector('.mobile-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* --- Active page indicator --- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage && !currentPage.includes('.')) {
    currentPage = currentPage + '.html';
  }
  var currentDir = window.location.pathname.includes('/insights/') ? 'insights/' : '';
  document.querySelectorAll('.navbar-links a').forEach(function (link) {
    var href = link.getAttribute('href').replace(/^\.\.\//, '');
    if (href === currentPage || (currentDir && href === currentDir + currentPage)) {
      link.classList.add('active');
    }
  });

  /* ============================================
     IMMERSIVE — Enhanced Scroll Reveal
     ============================================ */
  var allReveals = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, .stagger-children'
  );

  if (allReveals.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    allReveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    allReveals.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================
     IMMERSIVE — Custom Cursor
     ============================================ */
  if (window.matchMedia('(pointer: fine)').matches) {
    var cursor = document.createElement('div');
    cursor.className = 'immersive-cursor';
    document.body.appendChild(cursor);

    var cursorGlow = document.createElement('div');
    cursorGlow.className = 'immersive-cursor-glow';
    document.body.appendChild(cursorGlow);

    var mouseX = 0, mouseY = 0;
    var cursorX = 0, cursorY = 0;
    var glowX = 0, glowY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorGlow.classList.add('active');
    });

    document.addEventListener('mouseleave', function () {
      cursorGlow.classList.remove('active');
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      glowX += (mouseX - glowX) * 0.06;
      glowY += (mouseY - glowY) * 0.06;

      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    /* Cursor hover state on interactive elements */
    var hoverTargets = 'a, button, .service-card, .insight-card, .team-card, .bento-card, .testimonial-card, .resource-card, .job-card, .faq-question, input, textarea, select, .client-logo';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('hovering');
      }
    });
  }

  /* ============================================
     IMMERSIVE — Card 3D Tilt
     ============================================ */
  if (window.matchMedia('(pointer: fine)').matches) {
    var tiltCards = document.querySelectorAll('.service-card, .insight-card, .team-card, .resource-card');
    tiltCards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.style.perspective = '1000px';

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / centerY * -3;
        var rotateY = (x - centerX) / centerX * 3;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.15s ease-out';
      });
    });
  }

  /* ============================================
     IMMERSIVE — Service Card Mouse Glow
     ============================================ */
  var serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* ============================================
     IMMERSIVE — Hero Content Animate In
     ============================================ */
  var heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(function () {
      heroContent.classList.add('animate-in');
    }, 300);
  }

  /* ============================================
     IMMERSIVE — Parallax on Scroll
     ============================================ */
  var parallaxElements = document.querySelectorAll('.parallax-bg');
  if (parallaxElements.length) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      parallaxElements.forEach(function (el) {
        var speed = parseFloat(el.dataset.speed) || 0.3;
        var rect = el.parentElement.getBoundingClientRect();
        var offset = (rect.top + scrollY) * speed - scrollY * speed;
        el.style.transform = 'translateY(' + offset + 'px)';
      });
    }, { passive: true });
  }

  /* ============================================
     IMMERSIVE — Stat Counter Animation
     ============================================ */
  var statValues = document.querySelectorAll('.result-value');
  if (statValues.length && 'IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var text = el.textContent.trim();
            var num = parseInt(text, 10);
            if (!isNaN(num) && num > 0) {
              var suffix = text.replace(/[0-9]/g, '');
              var duration = 1200;
              var start = performance.now();
              function tick(now) {
                var progress = Math.min((now - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(num * eased) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
              }
              requestAnimationFrame(tick);
            }
            statObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    statValues.forEach(function (el) { statObserver.observe(el); });
  }

  /* ============================================
     IMMERSIVE — Booking Form Sequence
     ============================================ */
  var bookingForm = document.querySelector('.booking-form');
  if (bookingForm && 'IntersectionObserver' in window) {
    var formObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            formObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    formObserver.observe(bookingForm);
  }

  /* ============================================
     IMMERSIVE — Footer Reveal
     ============================================ */
  var footer = document.querySelector('.footer');
  if (footer && 'IntersectionObserver' in window) {
    footer.classList.add('reveal-fade');
    var footerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            footerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    footerObserver.observe(footer);
  }

  /* --- Back to top --- */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
