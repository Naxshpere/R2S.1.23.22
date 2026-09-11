/**
 * shared.js — R2S Creative Construction LLP
 * Unified motion & interaction system — used on every page.
 *
 * Systems exposed on window.R2S:
 *  1. initScrollReveal()    — IntersectionObserver fade/slide-in
 *  2. initCardTilt()        — 3-D perspective tilt on .card-tilt elements
 *  3. initParallax()        — multi-layer scroll parallax
 *  4. initMagneticButtons() — magnetic cursor drift on .button elements
 *  5. initStickyNav()       — glass header scroll-state management
 *
 * All systems gate behind prefers-reduced-motion.
 * Auto-initialises on DOMContentLoaded.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
   * Motion preference gate
   * ───────────────────────────────────────────────────────────── */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────────
   * 1. SCROLL REVEAL
   *
   * Watches any element with:
   *   .reveal-up   .reveal-left  .reveal-right
   *   .reveal-up-stagger (children stagger automatically)
   *   .reveal-fade
   *
   * CSS must define the hidden / visible states.
   * ───────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    var SELECTORS = [
      '.reveal-up',
      '.reveal-left',
      '.reveal-right',
      '.reveal-fade',
      '.reveal-process',
      '.reveal-industry',
    ].join(',');

    if (reduced) {
      /* Skip animation; just make everything visible immediately */
      document.querySelectorAll(SELECTORS).forEach(function (el) {
        el.classList.add('is-visible');
      });
      /* Stagger children */
      document.querySelectorAll('.reveal-up-stagger').forEach(function (parent) {
        Array.from(parent.children).forEach(function (child) {
          child.classList.add('is-visible');
        });
      });
      var line = document.querySelector('.process-connector-line');
      if (line) line.classList.add('is-drawn');
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -36px 0px' }
    );

    document.querySelectorAll(SELECTORS).forEach(function (el) {
      observer.observe(el);
    });

    /* Auto-stagger children inside .reveal-up-stagger containers */
    document.querySelectorAll('.reveal-up-stagger').forEach(function (parent) {
      Array.from(parent.children).forEach(function (child, i) {
        child.style.transitionDelay = (i * 90) + 'ms';
        observer.observe(child);
      });
    });

    /* SVG line draw-in for work-process connector */
    var connectorLine = document.querySelector('.process-connector-line');
    var processTrack  = document.querySelector('.svc-process-track, .process-grid');
    if (connectorLine && processTrack) {
      var lineObs = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                connectorLine.classList.add('is-drawn');
              }, 120);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      lineObs.observe(processTrack);
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * 2. CARD TILT
   *
   * Any element with class .card-tilt gets:
   * — perspective + rotateX/Y following cursor, capped ±7°
   * — smooth spring return on mouseleave
   * — translateZ(10px) lift while hovered
   * ───────────────────────────────────────────────────────────── */
  function initCardTilt() {
    if (reduced || window.innerWidth <= 860) return;

    document.querySelectorAll('.card-tilt').forEach(function (el) {
      el.style.transition = 'transform 0ms';

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width  - 0.5;
        var y = (e.clientY - rect.top)  / rect.height - 0.5;
        var rx = (-y * 7).toFixed(2);
        var ry = ( x * 7).toFixed(2);
        el.style.transition = 'transform 80ms linear';
        el.style.transform  =
          'perspective(640px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(10px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 500ms cubic-bezier(0.16,1,0.3,1)';
        el.style.transform  = 'perspective(640px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });

      el.addEventListener('mouseenter', function () {
        el.style.transition = 'transform 80ms linear';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 3. LAYERED PARALLAX
   *
   * Classes (attach to child elements of a parallax container):
   *   .parallax-bg   — moves 0.3× scroll speed (background)
   *   .parallax-mid  — moves 0.15× scroll speed (mid layer)
   *   .parallax-fg   — moves -0.05× scroll speed (slight counter, foreground)
   *
   * Container must be position:relative; children position:absolute or fixed.
   * ───────────────────────────────────────────────────────────── */
  function initParallax() {
    if (reduced || window.innerWidth <= 860) return;

    var layers = [
      { selector: '.parallax-bg',  speed: 0.30  },
      { selector: '.parallax-mid', speed: 0.15  },
      { selector: '.parallax-fg',  speed: -0.05 },
    ];

    var items = [];
    layers.forEach(function (layer) {
      document.querySelectorAll(layer.selector).forEach(function (el) {
        items.push({ el: el, speed: layer.speed });
      });
    });

    if (items.length === 0) return;

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var sy = window.pageYOffset;
          items.forEach(function (item) {
            var offset = (sy * item.speed).toFixed(2);
            item.el.style.transform = 'translate3d(0,' + offset + 'px,0)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────────────────────────────────
   * 4. MAGNETIC BUTTONS
   *
   * Any .button or .text-link gets a subtle cursor-magnetic drift.
   * Drift magnitude: ±20% of element size, strength 0.30.
   * ───────────────────────────────────────────────────────────── */
  function initMagneticButtons() {
    if (reduced || window.innerWidth <= 860) return;

    var clamp = function (v, limit) {
      return Math.max(-limit, Math.min(limit, v));
    };

    document.querySelectorAll('.button, .text-link').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left  - rect.width  / 2;
        var relY = e.clientY - rect.top   - rect.height / 2;
        var mx = clamp(relX * 0.28, rect.width  * 0.20);
        var my = clamp(relY * 0.28, rect.height * 0.20);
        el.style.setProperty('--magnetic-x', mx.toFixed(1) + 'px');
        el.style.setProperty('--magnetic-y', my.toFixed(1) + 'px');
      });

      el.addEventListener('mouseleave', function () {
        el.style.removeProperty('--magnetic-x');
        el.style.removeProperty('--magnetic-y');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 5. STICKY GLASSMORPHISM NAV
   *
   * Adds .is-scrolled to .site-header after 40px scroll.
   * CSS handles the backdrop-filter and opacity shift.
   * ───────────────────────────────────────────────────────────── */
  function initStickyNav() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    function update() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.pageYOffset > 40) {
            header.classList.add('is-scrolled');
          } else {
            header.classList.remove('is-scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ─────────────────────────────────────────────────────────────
   * 6. SERVICE ROW IMAGE PARALLAX (for services page rows)
   * ───────────────────────────────────────────────────────────── */
  function initServiceRowParallax() {
    if (reduced || window.innerWidth <= 860) return;

    var rowImages = document.querySelectorAll('.svc-row-image img');
    if (rowImages.length === 0) return;

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          rowImages.forEach(function (img) {
            var rect = img.closest('.svc-row-image').getBoundingClientRect();
            var viewH = window.innerHeight;
            if (rect.bottom > 0 && rect.top < viewH) {
              var progress = (viewH - rect.top) / (viewH + rect.height);
              var offset   = (progress - 0.5) * 36;
              img.style.transform = 'translateY(' + offset.toFixed(1) + 'px) scale(1.06)';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────────────────────────────────
   * 7. ICON 3-D LIFT (stat icons, process icons)
   *
   * Any .icon-lift gets translateY + shadow growth on hover.
   * ───────────────────────────────────────────────────────────── */
  function initIconLift() {
    if (reduced) return;
    document.querySelectorAll('.icon-lift').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        el.style.transform = 'translateY(-4px)';
        el.style.filter    = 'drop-shadow(0 8px 12px rgba(212,172,90,.3))';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
        el.style.filter    = '';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * PUBLIC NAMESPACE
   * ───────────────────────────────────────────────────────────── */
  window.R2S = {
    initScrollReveal:        initScrollReveal,
    initCardTilt:            initCardTilt,
    initParallax:            initParallax,
    initMagneticButtons:     initMagneticButtons,
    initStickyNav:           initStickyNav,
    initServiceRowParallax:  initServiceRowParallax,
    initIconLift:            initIconLift,
  };

  /* ─────────────────────────────────────────────────────────────
   * AUTO-INIT on DOMContentLoaded
   * ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initCardTilt();
    initParallax();
    initMagneticButtons();
    initStickyNav();
    initServiceRowParallax();
    initIconLift();
  });

})();
