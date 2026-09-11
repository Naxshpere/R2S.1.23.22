/**
 * biogas.js — R2S Compressed Biogas Page Interactive & Motion System
 * 
 * Features:
 * 1. prefers-reduced-motion check & graceful fallback
 * 2. Standard scroll-reveal with sibling stagger via IntersectionObserver
 * 3. Smooth hero background parallax
 * 4. Circular split-image reveal (.bio-circle)
 * 5. Process arrow progressive draw-in (.process-grid)
 * 6. Quote lines sequence stagger (.bio-impact h2)
 */

(function () {
  'use strict';

  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isReduced = reducedMotionQuery.matches;

  // If user prefers reduced motion, reveal everything immediately and exit
  if (isReduced) {
    document.querySelectorAll('.bio-reveal, .bio-circle, .process-grid, .bio-impact').forEach(function (el) {
      el.classList.add('is-visible', 'is-drawn');
    });
    return;
  }

  // 1. Group Sibling Stagger Setup for .bio-reveal
  var staggerContainers = document.querySelectorAll(
    '.bio-icon-row, .feature-grid, .process-grid, .impact-grid, .benefit-grid, .bio-cap-copy ol'
  );

  staggerContainers.forEach(function (container) {
    var children = container.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.classList.contains('bio-reveal') || child.tagName === 'LI' || child.tagName === 'ARTICLE' || child.tagName === 'SPAN') {
        child.style.transitionDelay = (i * 90) + 'ms';
      }
    }
  });

  // 2. Standard Scroll Reveal via IntersectionObserver
  var revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.bio-reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  // 3. Circular Split-Image Reveal (.bio-circle)
  var circleEl = document.querySelector('.bio-circle');
  if (circleEl) {
    var circleObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            circleEl.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    circleObserver.observe(circleEl);
  }

  // 4. Process Grid Arrow Draw-in (.process-grid)
  var processGrid = document.querySelector('.process-grid');
  if (processGrid) {
    var processObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            processGrid.classList.add('is-drawn');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    processObserver.observe(processGrid);
  }

  // 5. Impact Quote 3-Line Sequence Stagger (.bio-impact)
  var impactSec = document.querySelector('.bio-impact');
  if (impactSec) {
    var impactObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            impactSec.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    impactObserver.observe(impactSec);
  }

  // 6. Smooth hero background parallax on pointer-driven desktop layouts only.
  var heroSection = document.querySelector('.bio-hero');
  var heroBg = document.querySelector('.bio-hero-bg');
  var desktopMotionQuery = window.matchMedia('(min-width: 861px)');
  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (heroSection && heroBg && desktopMotionQuery.matches && !isTouchDevice) {
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var scrolled = window.pageYOffset || document.documentElement.scrollTop;
          var heroHeight = heroSection.offsetHeight;

          if (scrolled <= heroHeight) {
            var offset = scrolled * 0.35;
            heroBg.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();
