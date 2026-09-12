/**
 * cursor.js — R2S Creative Construction LLP
 * Universal High-Contrast Luxury Cursor System
 * Works seamlessly across all pages: Contact, About, Services, Projects, Biogas, Home
 */

(() => {
  'use strict';

  let initialized = false;

  function setupCursor() {
    if (initialized) return;
    if (!document.body) return;
    if (document.body.classList.contains('contact-page')) return;
    initialized = true;

    const root = document.documentElement;

    // Check if already created or create cleanly
    let dot = document.querySelector('.cursor-dot');
    let ring = document.querySelector('.cursor-ring');

    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'cursor-dot';
      document.body.appendChild(dot);
    }
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'cursor-ring';
      document.body.appendChild(ring);
    }

    root.classList.add('js-cursor');

    const target = { x: -100, y: -100 };
    const ringPosition = { x: -100, y: -100 };
    let isVisible = false;

    function renderRing() {
      ringPosition.x += (target.x - ringPosition.x) * 0.35;
      ringPosition.y += (target.y - ringPosition.y) * 0.35;
      ring.style.transform = `translate3d(${ringPosition.x}px, ${ringPosition.y}px, 0) translate3d(-50%, -50%, 0)`;
      requestAnimationFrame(renderRing);
    }

    function show() {
      if (!isVisible) {
        isVisible = true;
        dot.classList.add('is-visible');
        ring.classList.add('is-visible');
      }
    }

    function hide() {
      isVisible = false;
      target.x = -100;
      target.y = -100;
      ringPosition.x = -100;
      ringPosition.y = -100;
      dot.classList.remove('is-visible');
      ring.classList.remove('is-visible');
    }

    // Direct pointer tracking (0ms lag for the center dot)
    window.addEventListener('mousemove', (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate3d(-50%, -50%, 0)`;
      show();
    }, { passive: true });

    document.addEventListener('mouseleave', hide);

    // If pure touch interaction occurs on mobile, disable custom cursor cleanly
    window.addEventListener('touchstart', () => {
      root.classList.remove('js-cursor');
      hide();
    }, { passive: true, once: true });

    // Interactive Hover States via Event Delegation
    const INTERACTIVE_SELECTOR = [
      'a',
      'button',
      '.button',
      '.gold-button',
      '.journey-link',
      '.gold-pill-button',
      '.directions-pill-btn',
      '.contact-link',
      '.nav-quote',
      '.text-link',
      '.site-nav > a',
      '.feature-item',
      '.detail-card',
      '.value-item',
      '.principles article',
      '.expertise-grid article',
      '.stats-strip article',
      '.cbg-feature li',
      '.social-badge',
      '[role="button"]'
    ].join(',');

    const PRIMARY_LABELED_SELECTOR = '.hero-button, .nav-quote, .biogas-meta > a, .gold-pill-button, .gold-button';

    document.addEventListener('mouseover', (e) => {
      const interactive = e.target.closest(INTERACTIVE_SELECTOR);
      const isInput = e.target.closest('input, textarea, select');

      if (isInput) {
        root.classList.add('cursor-over-input');
        ring.classList.remove('is-hovering', 'is-pressed');
        ring.classList.add('is-returning');
        dot.classList.remove('is-hovering');
        delete ring.dataset.label;
        window.setTimeout(() => ring.classList.remove('is-returning'), 350);
        return;
      } else {
        root.classList.remove('cursor-over-input');
      }

      if (interactive) {
        ring.classList.remove('is-returning');
        ring.classList.add('is-hovering');
        dot.classList.add('is-hovering');

        if (interactive.matches(PRIMARY_LABELED_SELECTOR) && interactive.dataset.label) {
          ring.dataset.label = interactive.dataset.label;
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const interactive = e.target.closest(INTERACTIVE_SELECTOR);
      const isInput = e.target.closest('input, textarea, select');

      if (isInput) {
        root.classList.remove('cursor-over-input');
      }

      if (interactive && !interactive.contains(e.relatedTarget)) {
        ring.classList.remove('is-hovering', 'is-pressed');
        ring.classList.add('is-returning');
        dot.classList.remove('is-hovering');
        delete ring.dataset.label;

        interactive.style.removeProperty('--magnetic-x');
        interactive.style.removeProperty('--magnetic-y');

        setTimeout(() => {
          ring.classList.remove('is-returning');
        }, 350);
      }
    });

    // Magnetic drift for buttons & links
    document.addEventListener('mousemove', (e) => {
      const magneticEl = e.target.closest('.button, .gold-pill-button, .gold-button, .directions-pill-btn, .text-link, .biogas-meta > a, .journey-link, .contact-link');
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        const clamp = (val, limit) => Math.max(-limit, Math.min(limit, val));
        const x = clamp(relX * 0.22, rect.width * 0.18);
        const y = clamp(relY * 0.22, rect.height * 0.18);
        magneticEl.style.setProperty('--magnetic-x', `${x.toFixed(1)}px`);
        magneticEl.style.setProperty('--magnetic-y', `${y.toFixed(1)}px`);
      }
    });

    document.addEventListener('mousedown', () => ring.classList.add('is-pressed'));
    document.addEventListener('mouseup', () => ring.classList.remove('is-pressed'));

    requestAnimationFrame(renderRing);
  }

  // Safe Lifecycle Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }

  window.addEventListener('load', setupCursor);
})();
