/**
 * biogas.js — R2S Compressed Biogas Page Interactive & Motion System
 * Page-specific interactions: circular split-image reveal, process grid arrow draw,
 * and impact quote sequence stagger.
 * Note: Core reveals, parallax, magnetic effects and headers are handled by site.js.
 */
(function () {
  'use strict';

  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function makeAllVisible() {
    document.querySelectorAll('.bio-reveal, .bio-circle, .process-grid, .bio-impact').forEach(function (el) {
      el.classList.add('is-visible', 'is-drawn');
    });
  }

  if (reducedMotionQuery.matches) {
    makeAllVisible();
    return;
  }

  reducedMotionQuery.addEventListener('change', function (e) {
    if (e.matches) makeAllVisible();
  });

  // 1. Group Sibling Stagger Setup for .bio-reveal via CSS variable --reveal-delay
  var staggerContainers = document.querySelectorAll(
    '.bio-icon-row, .feature-grid, .process-grid, .impact-grid, .benefit-grid, .bio-cap-copy ol'
  );

  staggerContainers.forEach(function (container) {
    var children = container.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.classList.contains('bio-reveal') || child.tagName === 'LI' || child.tagName === 'ARTICLE' || child.tagName === 'SPAN') {
        child.style.setProperty('--reveal-delay', (i * 90) + 'ms');
      }
    }
  });

  // 2. Circular Split-Image Reveal (.bio-circle)
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

  // 3. Process Grid Arrow Draw-in (.process-grid)
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

  // 4. Impact Quote 3-Line Sequence Stagger (.bio-impact)
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
})();
