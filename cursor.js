/**
 * cursor.js — R2S Creative Construction LLP
 * Custom cursor system.
 *
 * Changes from original:
 *  - Enabled ONLY on true pointer devices (hover:hover + pointer:fine)
 *  - Ring RAF loop stops when ring has caught up (idle-aware)
 *  - Magnetic effect removed — now handled entirely by site.js (--mx/--my)
 *  - INTERACTIVE_SELECTOR trimmed to real interactive elements only
 *  - backdrop-filter removed from ring (plain fill instead)
 *  - Touch disable replaced with per-event pointerType check
 */

(() => {
  'use strict';

  // Only run on real pointer devices; skip touch-only and reduced-motion
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let initialized = false;

  function setupCursor() {
    if (initialized) return;
    if (!document.body) return;
    if (document.body.classList.contains('contact-page')) return;
    initialized = true;

    const root = document.documentElement;

    let dot  = document.querySelector('.cursor-dot');
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

    const target       = { x: -200, y: -200 };
    const ringPosition = { x: -200, y: -200 };
    let isVisible = false;
    let raf = 0;

    /* Ring loop — only runs while the ring is moving */
    function loop() {
      ringPosition.x += (target.x - ringPosition.x) * 0.35;
      ringPosition.y += (target.y - ringPosition.y) * 0.35;
      ring.style.transform =
        `translate3d(${ringPosition.x}px,${ringPosition.y}px,0) translate3d(-50%,-50%,0)`;
      const dx = Math.abs(target.x - ringPosition.x);
      const dy = Math.abs(target.y - ringPosition.y);
      raf = (dx > 0.1 || dy > 0.1) ? requestAnimationFrame(loop) : 0;
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
      target.x = -200; target.y = -200;
      dot.classList.remove('is-visible');
      ring.classList.remove('is-visible');
    }

    /* Track pointer — skip touch events */
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') {
        root.classList.remove('js-cursor');
        hide();
        return;
      }
      if (!root.classList.contains('js-cursor')) root.classList.add('js-cursor');
      target.x = e.clientX;
      target.y = e.clientY;
      dot.style.transform =
        `translate3d(${e.clientX}px,${e.clientY}px,0) translate3d(-50%,-50%,0)`;
      show();
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener('mouseleave', hide);

    /* Interactive states — real links and buttons only */
    const INTERACTIVE_SELECTOR = [
      'a', 'button', '.button', '.gold-button', '.gold-pill-button',
      '.journey-link', '.text-link', '[role="button"]', '.proj-view',
    ].join(',');

    document.addEventListener('mouseover', (e) => {
      const isInput = e.target.closest('input, textarea, select');
      if (isInput) {
        root.classList.add('cursor-over-input');
        ring.classList.remove('is-hovering', 'is-pressed');
        ring.classList.add('is-returning');
        dot.classList.remove('is-hovering');
        delete ring.dataset.label;
        setTimeout(() => ring.classList.remove('is-returning'), 350);
        return;
      }
      root.classList.remove('cursor-over-input');

      const interactive = e.target.closest(INTERACTIVE_SELECTOR);
      if (interactive) {
        ring.classList.remove('is-returning');
        ring.classList.add('is-hovering');
        dot.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const isInput = e.target.closest('input, textarea, select');
      if (isInput) root.classList.remove('cursor-over-input');

      const interactive = e.target.closest(INTERACTIVE_SELECTOR);
      if (interactive && !interactive.contains(e.relatedTarget)) {
        ring.classList.remove('is-hovering', 'is-pressed');
        ring.classList.add('is-returning');
        dot.classList.remove('is-hovering');
        delete ring.dataset.label;
        setTimeout(() => ring.classList.remove('is-returning'), 350);
      }
    });

    document.addEventListener('mousedown', () => ring.classList.add('is-pressed'));
    document.addEventListener('mouseup',   () => ring.classList.remove('is-pressed'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }
})();
