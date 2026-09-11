const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

function closeMenu() {
  menuToggle.classList.remove('is-open');
  siteNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  document.body.classList.remove('menu-locked');
}

menuToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuToggle.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-locked', isOpen);
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

siteNav.addEventListener('click', (event) => {
  if (event.target === siteNav) closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeMenu();
});

if (document.body.classList.contains('about-page')) {
  const hero = document.querySelector('.about-hero');
  if (hero) {
    const heroBackground = document.createElement('div');
    heroBackground.className = 'about-hero-bg parallax-bg';
    hero.prepend(heroBackground);
    document.querySelector('.hero-shade')?.classList.add('parallax-mid');
    document.querySelector('.hero-copy')?.classList.add('parallax-fg');
  }
  const addMotionClass = (selector, className) => document.querySelectorAll(selector).forEach((el) => el.classList.add(className));

  addMotionClass('.hero-copy, .intro-copy, .values-heading, .expertise-copy, .cbg-copy', 'reveal-left');
  addMotionClass('.hero-mantra, .intro-mosaic, .cbg-feature figure', 'reveal-right');
  addMotionClass('.stats-strip, .principles, .expertise-grid', 'reveal-up-stagger');
  addMotionClass('.cbg-feature aside, .closing-cta > div, .closing-cta > a', 'reveal-up');
  addMotionClass('.principles article, .expertise-grid article', 'card-tilt');
  addMotionClass('.stats-strip img, .principles article > img, .expertise-icon, .cbg-feature li img', 'icon-lift');

  let domContentLoaded = false;
  document.addEventListener('DOMContentLoaded', () => { domContentLoaded = true; }, { once: true });
  const sharedMotion = document.createElement('script');
  sharedMotion.src = 'shared.js';
  sharedMotion.onload = () => {
    if (domContentLoaded && window.R2S) {
      window.R2S.initScrollReveal();
      window.R2S.initCardTilt();
      window.R2S.initParallax();
      window.R2S.initMagneticButtons();
      window.R2S.initStickyNav();
      window.R2S.initIconLift();
    }
  };
  document.head.appendChild(sharedMotion);
}
