(() => {
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 861) return;

  const root = document.documentElement;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  const hoverTargets = document.querySelectorAll('a, button, .button, .text-link, .site-nav > a');
  const magneticTargets = document.querySelectorAll('.button, .text-link, .biogas-meta > a');
  const primaryTargetSelector = '.hero-button, .nav-quote, .biogas-meta > a';
  const target = { x: -100, y: -100 };
  const ringPosition = { x: -100, y: -100 };

  root.classList.add('js-cursor');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

  function animateRing() {
    ringPosition.x += (target.x - ringPosition.x) * 0.16;
    ringPosition.y += (target.y - ringPosition.y) * 0.16;
    ring.style.transform = `translate3d(${ringPosition.x}px, ${ringPosition.y}px, 0) translate3d(-50%, -50%, 0)`;
    requestAnimationFrame(animateRing);
  }

  function showCursor() {
    dot.classList.add('is-visible');
    ring.classList.add('is-visible');
  }

  function handlePointerMove(event) {
    target.x = event.clientX;
    target.y = event.clientY;
    dot.style.transform = `translate3d(${event.clientX - 3}px, ${event.clientY - 3}px, 0)`;
    showCursor();
  }

  function setHoverState(event) {
    ring.classList.remove('is-returning');
    ring.classList.add('is-hovering');
    dot.classList.add('is-hidden');
    if (event.currentTarget.matches(primaryTargetSelector)) {
      event.currentTarget.dataset.label = 'View';
      ring.dataset.label = event.currentTarget.dataset.label;
    }
  }

  function clearHoverState(event) {
    ring.classList.remove('is-hovering', 'is-pressed');
    ring.classList.add('is-returning');
    dot.classList.remove('is-hidden');
    delete ring.dataset.label;
    if (event.currentTarget.matches(primaryTargetSelector)) {
      delete event.currentTarget.dataset.label;
    }
    event.currentTarget.style.removeProperty('--magnetic-x');
    event.currentTarget.style.removeProperty('--magnetic-y');
    window.setTimeout(() => ring.classList.remove('is-returning'), 350);
  }

  hoverTargets.forEach((element) => {
    element.addEventListener('mouseenter', setHoverState);
    element.addEventListener('mouseleave', clearHoverState);
  });

  magneticTargets.forEach((element) => {
    element.addEventListener('mousemove', (event) => {
      const rect = element.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      const x = clamp(relX * 0.25, rect.width * 0.2);
      const y = clamp(relY * 0.25, rect.height * 0.2);
      element.style.setProperty('--magnetic-x', `${x}px`);
      element.style.setProperty('--magnetic-y', `${y}px`);
    });
  });

  document.addEventListener('mousemove', handlePointerMove);
  document.addEventListener('mouseleave', () => {
    dot.classList.remove('is-visible');
    ring.classList.remove('is-visible');
  });
  document.addEventListener('mouseenter', showCursor);
  document.addEventListener('mousedown', () => ring.classList.add('is-pressed'));
  document.addEventListener('mouseup', () => ring.classList.remove('is-pressed'));
  window.addEventListener('blur', () => {
    dot.classList.remove('is-visible');
    ring.classList.remove('is-visible');
  });

  requestAnimationFrame(animateRing);
})();