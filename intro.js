/**
 * intro.js — GSAP Opening Animation for R2S Creative Construction LLP
 *
 * Characteristics:
 *  - 60 FPS compositor-only: transforms & opacity only.
 *  - Mobile-ready: handles responsive elements and SVH viewports cleanly.
 *  - Zero conflict with CSS translate: uses reveal wrappers and calls clearProps on completion.
 *  - Non-blocking: pointer-events passed through as curtain opens; hard fallback timeout.
 *  - Accessible: skips immediately on prefers-reduced-motion.
 */

(() => {
  'use strict';

  // Config: Set ONCE_PER_SESSION to true for production if desired.
  // URL override: appending ?intro=1 always forces intro playback.
  const ONCE_PER_SESSION = false;
  const SESSION_KEY = 'r2s_intro_played';

  const urlParams = new URLSearchParams(window.location.search);
  const forceIntro = urlParams.has('intro');

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyPlayed = ONCE_PER_SESSION && sessionStorage.getItem(SESSION_KEY);

  const curtain = document.getElementById('introCurtain');
  const skipBtn = document.querySelector('.intro-skip');

  let isCleanedUp = false;
  let masterTl = null;

  /* ── Full Cleanup & Conflict Prevention ────────────────────────────── */
  function cleanup() {
    if (isCleanedUp) return;
    isCleanedUp = true;
    clearTimeout(fallbackTimer);

    if (curtain) {
      curtain.classList.add('is-done');
      curtain.remove();
    }

    document.documentElement.classList.add('intro-done');
    document.body.classList.add('intro-done');

    // Remove any temporary hiding classes
    document.querySelectorAll('.hero-anim-hidden').forEach((el) => {
      el.classList.remove('hero-anim-hidden');
    });

    // Clear GSAP inline styles so CSS variables (--mx, --my) and native media queries function untouched
    if (window.gsap) {
      gsap.set(
        [
          '.site-header',
          '.hero-watermark',
          '.hero-content .eyebrow',
          '.hero-anim-mask > *',
          '.hero-subline',
          '.hero-btn-wrap',
          '.button',
          '.hero-button',
          '.stat-row .stat',
          '.hero-badge',
          '.hero-footer-line',
        ],
        { clearProps: 'transform,opacity,visibility,scale' }
      );
    }

    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {
      /* ignore storage quota/security errors */
    }
  }

  /* ── Hard Fail-Safe Guard (Non-blocking guarantee) ─────────────────── */
  // Guarantees curtain is removed even if network drops CDN or script crashes
  const fallbackTimer = setTimeout(() => {
    cleanup();
  }, 2800);

  /* ── Reduced Motion or Repeat Session Bypass ──────────────────────── */
  if (prefersReduced || (alreadyPlayed && !forceIntro)) {
    document.documentElement.classList.add('intro-skipped');
    cleanup();
    return;
  }

  /* ── Initialize Animation ─────────────────────────────────────────── */
  function initIntro() {
    if (!window.gsap) {
      // GSAP CDN failed to load — fallback gracefully
      cleanup();
      return;
    }

    const panelTop = document.querySelector('.panel-top');
    const panelBottom = document.querySelector('.panel-bottom');
    const curtainLine = document.querySelector('.curtain-line');
    const brand = document.querySelector('.intro-brand');

    if (!panelTop || !panelBottom) {
      cleanup();
      return;
    }

    // Skip button click handler
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (masterTl) {
          masterTl.progress(1);
        } else {
          cleanup();
        }
      });
    }

    // Initial state setup (hardware accelerated)
    gsap.set(curtain, { visibility: 'visible' });
    gsap.set(panelTop, { yPercent: 0, force3D: true });
    gsap.set(panelBottom, { yPercent: 0, force3D: true });
    gsap.set(curtainLine, { scaleX: 0, opacity: 0.9, transformOrigin: 'center center', force3D: true });
    gsap.set(brand, { opacity: 0, scale: 0.92, force3D: true });
    if (skipBtn) gsap.set(skipBtn, { opacity: 0 });

    // Hero elements initial hidden offsets
    gsap.set('.site-header', { y: -70, opacity: 0, force3D: true });
    gsap.set('.hero-anim-mask > *', { yPercent: 110, force3D: true });
    gsap.set(['.hero-content .eyebrow', '.hero-subline', '.hero-btn-wrap'], {
      y: 20,
      opacity: 0,
      force3D: true,
    });
    gsap.set('.stat-row .stat', { y: 20, opacity: 0, force3D: true });
    gsap.set('.hero-badge', { opacity: 0, force3D: true });
    gsap.set('.hero-footer-line', { opacity: 0, force3D: true });
    // Watermark: only scale and opacity, keeping CSS translate(0, -50%) untouched!
    gsap.set('.hero-watermark', { opacity: 0, scale: 0.94, force3D: true });

    // Master Timeline (~2.3s total)
    masterTl = gsap.timeline({
      onComplete: () => {
        cleanup();
      },
    });

    masterTl
      // 1. Center gold dividing line sweeps outward
      .to(curtainLine, {
        scaleX: 1,
        duration: 0.42,
        ease: 'power2.out',
      })
      // 2. Center brand logo & typography fade in and scale smoothly
      .to(
        brand,
        {
          opacity: 1,
          scale: 1,
          duration: 0.52,
          ease: 'power2.out',
        },
        '-=0.22'
      )
      // Subtle reveal of skip button
      .to(
        skipBtn,
        {
          opacity: 0.75,
          duration: 0.3,
          ease: 'power1.out',
        },
        '-=0.3'
      )
      // 3. Logo and line dissolve
      .to(
        [brand, curtainLine, skipBtn],
        {
          opacity: 0,
          duration: 0.28,
          ease: 'power2.in',
        },
        '+=0.15'
      )
      // 4. Curtain splits open (immediately release pointer events)
      .add(() => {
        if (curtain) curtain.classList.add('pointer-pass');
      })
      .to(
        panelTop,
        {
          yPercent: -100,
          duration: 0.82,
          ease: 'power4.inOut',
        },
        'curtainOpen'
      )
      .to(
        panelBottom,
        {
          yPercent: 100,
          duration: 0.82,
          ease: 'power4.inOut',
        },
        'curtainOpen'
      )
      // 5. Cascade hero elements seamlessly as curtain splits
      .to(
        '.site-header',
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
        },
        'curtainOpen+=0.38'
      )
      .to(
        '.hero-watermark',
        {
          opacity: 0.1,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
        },
        'curtainOpen+=0.4'
      )
      .to(
        '.hero-content .eyebrow',
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        },
        'curtainOpen+=0.42'
      )
      .to(
        '.hero-anim-mask > *',
        {
          yPercent: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
        },
        'curtainOpen+=0.46'
      )
      .to(
        '.hero-subline',
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        },
        'curtainOpen+=0.56'
      )
      .to(
        '.hero-btn-wrap',
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        },
        'curtainOpen+=0.62'
      )
      .to(
        '.stat-row .stat',
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          stagger: 0.07,
          ease: 'power3.out',
        },
        'curtainOpen+=0.66'
      )
      .to(
        ['.hero-badge', '.hero-footer-line'],
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        'curtainOpen+=0.7'
      );
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
