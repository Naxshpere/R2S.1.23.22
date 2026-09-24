/**
 * leadership.js — R2S Creative Construction LLP
 * Robust, high-performance GSAP scroll interaction engine.
 * Zero layout-pinning bugs, zero character-splitting bugs.
 */

(function () {
  'use strict';

  // 00. Check GSAP availability
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.ls-reveal, .hero-fade-in').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Register ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(0);
    return;
  }

  // ── 01. HERO REVEAL ────────────────────────────────────────────────────────
  function initHero() {
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Headline smooth masked baseline slide-up
    const titleLines = document.querySelectorAll('.hero-line-inner');
    if (titleLines.length) {
      heroTl.from(titleLines, {
        yPercent: 105,
        opacity: 0,
        duration: 0.95,
        stagger: 0.18,
        delay: 0.1,
        clearProps: 'all'
      });
    }

    // Portrait fade & float up
    const portraitWrap = document.querySelector('.ls-portrait-wrap');
    if (portraitWrap) {
      heroTl.from(portraitWrap, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'all'
      }, '-=0.6');
    }

    // Eyebrow, subline, nameblock, and core values mantra
    const metaElements = [
      '.ls-hero-eyebrow-row',
      '.ls-hero-subline',
      '.ls-hero-nameblock',
      '.ls-hero-mantra'
    ].filter(sel => document.querySelector(sel));

    if (metaElements.length) {
      heroTl.from(metaElements, {
        opacity: 0,
        y: 20,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      }, '-=0.7');
    }

    // Right Rail subtle drift (desktop only)
    const rail = document.querySelector('.js-parallax-rail');
    if (rail && window.innerWidth >= 1025) {
      gsap.to(rail, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ls-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  // ── 02. SECTION 01: THE STORY ──────────────────────────────────────────────
  function initStory() {
    const storyCols = document.querySelectorAll('.ls-story-layout > *');
    if (storyCols.length) {
      gsap.from(storyCols, {
        opacity: 0,
        y: 35,
        duration: 0.8,
        stagger: 0.14,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.ls-story',
          start: 'top 75%',
          once: true
        }
      });
    }

    const storyPhoto = document.querySelector('.ls-story-photo');
    if (storyPhoto) {
      gsap.to(storyPhoto, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ls-story-photo-wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  // ── 03. SECTION 02: KEY NUMBERS ────────────────────────────────────────────
  function initNumbers() {
    const counters = document.querySelectorAll('.js-counter');
    if (!counters.length) return;

    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const prefix = counter.dataset.prefix || '';
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: '.ls-numbers',
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: 'power3.out',
            onUpdate: () => {
              const current = Math.floor(obj.val);
              counter.textContent = prefix && current < 10 ? prefix + current : current;
            },
            onComplete: () => {
              counter.textContent = prefix && target < 10 ? prefix + target : target;
            }
          });
        }
      });
    });

    const dividers = document.querySelectorAll('.ls-stat-separator');
    if (dividers.length) {
      gsap.from(dividers, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.ls-numbers',
          start: 'top 75%',
          once: true
        }
      });
    }
  }

  // ── 04. SECTION 03: CAREER JOURNEY (NATURAL SCROLL DRAWING) ────────────────
  function initCareerJourney() {
    const journey = document.querySelector('.ls-journey');
    const track = document.querySelector('.js-timeline-track');
    const nodes = document.querySelectorAll('.ls-tl-node');

    if (!journey) return;

    // Set initial stroke state for drawing animation
    if (track) {
      gsap.set(track, { strokeDasharray: 1000, strokeDashoffset: 1000 });
    }

    if (track) {
      gsap.to(track, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: journey,
          start: 'top 72%',
          end: 'bottom 62%',
          scrub: 0.8
        }
      });
    }

    if (nodes.length) {
      gsap.from(nodes, {
        opacity: 0,
        y: 34,
        rotateX: -8,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'all'
        , scrollTrigger: {
          trigger: journey,
          start: 'top 70%',
          once: true
        }
      });

      nodes.forEach(node => {
        node.addEventListener('mouseenter', () => node.classList.add('is-active'));
        node.addEventListener('mouseleave', () => node.classList.remove('is-active'));
      });
    }
  }

  // ── 05. SECTION 04: EXPERTISE ──────────────────────────────────────────────
  function initExpertise() {
    const cards = document.querySelectorAll('.ls-exp-card');
    if (!cards.length) return;

    gsap.from(cards, {
      opacity: 0,
      y: 35,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
      clearProps: 'all',
      scrollTrigger: {
        trigger: '.ls-expertise',
        start: 'top 70%',
        once: true
      }
    });

    // Spotlight cursor track
    if (!window.matchMedia('(pointer: coarse)').matches) {
      cards.forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });

        card.addEventListener('mouseleave', () => {
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        });
      });
    }
  }

  // ── 06. SECTION 05: PROJECTS I'VE WORKED ON ───────────────────────────────
  function initProjects() {
    const projCards = document.querySelectorAll('.ls-proj-card');
    const projImgs  = document.querySelectorAll('.ls-proj-img');
    const grid      = document.querySelector('.ls-projects-grid');
    const section   = document.querySelector('.ls-projects');
    if (!projCards.length || !grid || !section) return;

    // ── Reduced-motion: show everything flat, no scroll magic
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      projCards.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
      return;
    }

    // ── matchMedia: desktop horizontal scroll + parallax
    const mm = gsap.matchMedia();

    // DESKTOP (≥ 1025px): pinned horizontal scroll + stagger reveal + image parallax
    mm.add('(min-width: 1025px)', () => {
      const container   = grid.parentElement;
      const getDistance = () => Math.max(0, grid.scrollWidth - container.clientWidth);

      // ① Card staggered reveal — one-time fade-up as section enters
      gsap.from(projCards, {
        opacity: 0,
        y: 40,
        duration: 0.75,
        stagger: { each: 0.09, from: 'start' },
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true
        }
      });

      // ② Horizontal-scroll pin — distance calculated from actual scrollWidth
      const hScroll = gsap.to(grid, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // ③ Per-image parallax: scale 1.08 → 1.0 as card crosses viewport center
      projImgs.forEach(img => {
        const card = img.closest('.ls-proj-card');
        gsap.fromTo(img,
          { scale: 1.08 },
          {
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: hScroll,  // ties to the horizontal scrub
              start: 'left right',
              end:   'center center',
              scrub: true
            }
          }
        );
      });

      // Cleanup on breakpoint exit
      return () => {
        projCards.forEach(c => { c.style.opacity = ''; c.style.transform = ''; });
        projImgs.forEach(img => { img.style.transform = ''; });
      };
    });

    // MOBILE (< 1025px): simple fade-up, no pin, no horizontal scroll
    mm.add('(max-width: 1024px)', () => {
      gsap.from(projCards, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true
        }
      });
    });
  }

  // ── 07. SECTION 06: LEADERSHIP MESSAGE ─────────────────────────────────────
  function initMessage() {
    const bgImg = document.querySelector('.ls-message-bg-img');
    if (bgImg) {
      gsap.to(bgImg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ls-message',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    const glyph = document.querySelector('.ls-message-glyph');
    if (glyph) {
      gsap.from(glyph, {
        scale: 0.8,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.ls-message',
          start: 'top 70%',
          once: true
        }
      });
    }

    const quoteParts = document.querySelectorAll('.ls-message-quote, .ls-message-attribution');
    if (quoteParts.length) {
      gsap.from(quoteParts, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.ls-message',
          start: 'top 65%',
          once: true
        }
      });
    }
  }

  // ── 08. OUR PEOPLE & MAGNETIC BUTTON ───────────────────────────────────────
  function initPeople() {
    const peopleBg = document.querySelector('.ls-people-bg-img');
    if (peopleBg) {
      gsap.to(peopleBg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ls-people',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // Magnetic Button with spring physics
    const btn = document.querySelector('.ls-btn-magnetic');
    if (btn && !window.matchMedia('(pointer: coarse)').matches) {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3' });

      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.3;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
        xTo(Math.max(-12, Math.min(12, dx)));
        yTo(Math.max(-12, Math.min(12, dy)));
      });

      btn.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    }
  }

  // ── 09. FOOTER ─────────────────────────────────────────────────────────────
  function initFooter() {
    const footerBlocks = document.querySelectorAll('.ls-footer-main, .ls-footer-bottom');
    if (footerBlocks.length) {
      gsap.from(footerBlocks, {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.ls-footer',
          start: 'top 85%',
          once: true
        }
      });
    }
  }

  // ── 10. RUN & REFRESH ──────────────────────────────────────────────────────
  function init() {
    initHero();
    initStory();
    initNumbers();
    initCareerJourney();
    initExpertise();
    initProjects();
    initMessage();
    initPeople();
    initFooter();

    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => ScrollTrigger.refresh());
        img.addEventListener('error', () => ScrollTrigger.refresh());
      }
    });

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
