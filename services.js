/**
 * services.js  –  R2S Services Page Interactive Behaviour
 * Scroll-reveal (IntersectionObserver), Work-Process line draw, parallax hint
 */

(function () {
  'use strict';

  /* ── prefers-reduced-motion check ──────────────────────────────── */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Generic scroll-reveal ───────────────────────────────────── */
  // Selectors that get the fade-up / slide reveal treatment
  const REVEAL_SELECTORS = [
    '.reveal-up',
    '.reveal-left',
    '.reveal-right'
  ].join(',');

  if (!reduced) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target); // play once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll(REVEAL_SELECTORS).forEach(function (el) {
      revealObserver.observe(el);
    });

    /* ── 2. Process steps staggered reveal ────────────────────────── */
    const processObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            processObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    document.querySelectorAll('.reveal-process').forEach(function (el) {
      processObserver.observe(el);
    });

    /* ── 3. Industry cards staggered reveal ───────────────────────── */
    const industryObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            industryObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll('.reveal-industry').forEach(function (el) {
      industryObserver.observe(el);
    });

    /* ── 4. Work Process SVG connector line draw-in ───────────────── */
    var connectorLine = document.querySelector('.process-connector-line');
    if (connectorLine) {
      var lineObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Slight delay so step badges pop in together with the draw
              setTimeout(function () {
                connectorLine.classList.add('is-drawn');
              }, 80);
              lineObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      lineObserver.observe(document.querySelector('.svc-process-track'));
    }

    /* ── 5. Service row index number scale-in ─────────────────────── */
    // The CSS already handles the hover scale. Here we optionally add
    // a subtle entrance scale for the index number as the row enters view.
    document.querySelectorAll('.svc-index').forEach(function (el) {
      el.style.transformOrigin = 'top left';
    });

    /* ── 6. Lightweight parallax on service row images ────────────── */
    // Only on desktop where the effect is meaningful
    if (window.innerWidth > 860) {
      var rowImages = document.querySelectorAll('.svc-row-image img');
      var ticking = false;

      function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            rowImages.forEach(function (img) {
              var rect = img.closest('.svc-row-image').getBoundingClientRect();
              var viewH = window.innerHeight;
              // Only move while the row is in view
              if (rect.bottom > 0 && rect.top < viewH) {
                var progress = (viewH - rect.top) / (viewH + rect.height); // 0→1
                var offset = (progress - 0.5) * 40; // ±20px travel
                img.style.transform = 'translateY(' + offset.toFixed(1) + 'px) scale(1.06)';
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // run once on load
    }

  } else {
    /* Reduced-motion: just make everything visible immediately */
    document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-process, .reveal-industry'
    ).forEach(function (el) {
      el.classList.add('is-visible');
    });
    var line = document.querySelector('.process-connector-line');
    if (line) line.classList.add('is-drawn');
  }

  /* ── 7. Re-initialise magnetic targets from cursor.js for new buttons ── */
  // cursor.js runs before this file, so new .button elements on this page
  // won't be registered automatically. Re-query and attach if js-cursor is active.
  if (document.documentElement.classList.contains('js-cursor')) {
    var clamp = function (v, l) { return Math.max(-l, Math.min(l, v)); };
    document.querySelectorAll('.svc-hero-btn, .svc-cta-btn').forEach(function (el) {
      el.addEventListener('mousemove', function (event) {
        var rect = el.getBoundingClientRect();
        var relX = event.clientX - rect.left - rect.width / 2;
        var relY = event.clientY - rect.top - rect.height / 2;
        el.style.setProperty('--magnetic-x', clamp(relX * 0.25, rect.width * 0.2) + 'px');
        el.style.setProperty('--magnetic-y', clamp(relY * 0.25, rect.height * 0.2) + 'px');
      });
      el.addEventListener('mouseleave', function () {
        el.style.removeProperty('--magnetic-x');
        el.style.removeProperty('--magnetic-y');
      });
    });
  }

  /* ── 8. Active nav link (in case of hash-based SPA routing) ──────── */
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav > a:not(.button)').forEach(function (link) {
    var linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

})();
