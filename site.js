/**
 * site.js — R2S Creative Construction LLP
 * Unified interaction + motion system.
 *
 * Rules:
 *  - Never writes style.transform or style.transition.
 *  - Uses individual transform properties (translate, scale) via CSS variables.
 *  - Tilt:     --tilt-x, --tilt-y  (CSS reads them in transform)
 *  - Parallax: --py                (CSS reads them in translate)
 *  - Magnetic: --mx, --my          (CSS reads them in translate)
 *  - Stagger:  --reveal-delay      (CSS reads in transition)
 *
 *  Guard prevents double-init when multiple scripts call it.
 */
(() => {
  'use strict';
  if (window.__r2sInit) return;
  window.__r2sInit = true;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isWide = () => innerWidth > 860;

  /* ── Header + Mobile Menu ─────────────────────────────────────────── */
  function initHeader() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');

    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 40);
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-locked', open);
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));

    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    addEventListener('resize', () => { if (isWide()) setOpen(false); });
  }

  /* ── Scroll Reveal ────────────────────────────────────────────────── */
  function initReveal() {
    const items = [
      ...document.querySelectorAll(
        '.reveal-up,.reveal-left,.reveal-right,.reveal-fade,.reveal-process,.reveal-industry,.bio-reveal'
      ),
    ];

    document.querySelectorAll('.reveal-up-stagger').forEach((parent) => {
      [...parent.children].forEach((child, i) => {
        child.style.setProperty('--reveal-delay', i * 90 + 'ms');
        items.push(child);
      });
    });

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ── Card Tilt (CSS variables only, no style.transform) ───────────── */
  function initTilt() {
    if (reduced || !finePointer) return;

    document.querySelectorAll('.card-tilt').forEach((el) => {
      let raf = 0;

      el.addEventListener('pointermove', (e) => {
        if (
          el.classList.contains('is-expanded') ||
          document.body.classList.contains('proj-expanded')
        ) return;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.classList.add('is-tilting');
          el.style.setProperty('--tilt-x', (-y * 6).toFixed(2) + 'deg');
          el.style.setProperty('--tilt-y', (x * 6).toFixed(2) + 'deg');
        });
      });

      el.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        el.classList.remove('is-tilting');
        el.style.removeProperty('--tilt-x');
        el.style.removeProperty('--tilt-y');
      });
    });
  }

  /* ── Parallax (data-parallax="0.2", no transition, no style.transform) */
  function initParallax() {
    if (reduced || !isWide()) return;

    const items = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
      el,
      host: el.parentElement,
      speed: parseFloat(el.dataset.parallax) || 0.2,
      visible: false,
    }));

    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const it = items.find((i) => i.host === e.target);
          if (it) it.visible = e.isIntersecting;
        });
      },
      { rootMargin: '20% 0px' }
    );
    items.forEach((i) => io.observe(i.host));

    let ticking = false;
    const update = () => {
      ticking = false;
      items.forEach((i) => {
        if (!i.visible) return;
        const r = i.host.getBoundingClientRect();
        const offset = ((r.top + r.height / 2 - innerHeight / 2) * -i.speed).toFixed(1);
        i.el.style.setProperty('--py', offset + 'px');
      });
    };

    addEventListener(
      'scroll',
      () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } },
      { passive: true }
    );
    update();
  }

  /* ── Process Track Line Draw (services page) ──────────────────────── */
  function initProcessLine() {
    const track = document.querySelector('.svc-process-track');
    if (!track || reduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => track.classList.add('is-drawn'), 120);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(track);
  }

  /* ── Magnetic Buttons ─────────────────────────────────────────────── */
  function initMagnetic() {
    if (reduced || !finePointer) return;

    document.querySelectorAll(
      '.button, .gold-button, .gold-pill-button, .text-link, .journey-link'
    ).forEach((el) => {
      el.classList.add('js-magnetic');

      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const clamp = (v, l) => Math.max(-l, Math.min(l, v));
        el.style.setProperty(
          '--mx',
          clamp((e.clientX - r.left - r.width / 2) * 0.22, r.width * 0.15).toFixed(1) + 'px'
        );
        el.style.setProperty(
          '--my',
          clamp((e.clientY - r.top - r.height / 2) * 0.22, r.height * 0.15).toFixed(1) + 'px'
        );
      });

      el.addEventListener('pointerleave', () => {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });
  }

  const start = () => {
    initHeader();
    initReveal();
    initTilt();
    initParallax();
    initProcessLine();
    initMagnetic();
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start)
    : start();
})();
