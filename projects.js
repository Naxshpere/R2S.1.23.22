/**
 * projects.js — R2S Projects page motion
 * Hero load, sliding filter pills, cached SVG timeline draw, card expand with a11y, slideshow.
 * Reveal, tilt, magnetic, and header are handled by site.js.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof gsap !== 'undefined') {
      if (typeof Flip !== 'undefined') gsap.registerPlugin(Flip);
      if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    }

    initHeroLoad();
    initFilterPills();
    initSearchAndFilter();
    initTimeline();
    initCardExpand();
    initCardScrollReveals();
    initScrollProgress();
  });

  /* ── 1. Hero page-load sequence ─────────────────────────────────── */
  function initHeroLoad() {
    var eyebrow = document.querySelector('[data-hero="eyebrow"]');
    var title = document.querySelector('[data-hero="title"]');
    var copy = document.querySelector('[data-hero="copy"]');
    var bg = document.querySelector('[data-hero="bg"]');
    var stats = document.querySelectorAll('[data-hero="stat"]');
    var filter = document.querySelector('[data-hero="filter"]');

    function show(el) {
      if (el) el.classList.add('is-visible');
    }

    function animateCounter(el) {
      if (!el || reduced || !window.gsap) return;
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(proxy.val) + suffix;
        },
        onComplete: function () {
          el.textContent = target + suffix;
          gsap.set(el, { clearProps: 'all' });
        }
      });
    }

    if (reduced) {
      show(eyebrow);
      show(title);
      show(copy);
      show(bg);
      stats.forEach(show);
      show(filter);
      return;
    }

    show(bg);
    show(eyebrow);
    window.setTimeout(function () { show(title); }, 100);
    window.setTimeout(function () { show(copy); }, 200);
    stats.forEach(function (el, i) {
      window.setTimeout(function () {
        show(el);
        var targetEl = el.querySelector('.count-target');
        if (targetEl) animateCounter(targetEl);
      }, 300 + i * 90);
    });
    window.setTimeout(function () { show(filter); }, 500);
  }

  /* ── 1.2 Sliding pill background ────────────────────────────────── */
  function initFilterPills() {
    var track = document.querySelector('.proj-filter-pills');
    var bg = document.querySelector('.filter-pill-bg');
    if (!track || !bg) return;

    function moveTo(btn) {
      var trackRect = track.getBoundingClientRect();
      var rect = btn.getBoundingClientRect();
      bg.style.left = (rect.left - trackRect.left + track.scrollLeft) + 'px';
      bg.style.top = (rect.top - trackRect.top + track.scrollTop) + 'px';
      bg.style.width = rect.width + 'px';
      bg.style.height = rect.height + 'px';
    }

    var active = track.querySelector('.filter-btn.is-active') || track.querySelector('.filter-btn');
    if (active) moveTo(active);

    track.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      track.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      moveTo(btn);
    });

    window.addEventListener('resize', function () {
      var current = track.querySelector('.filter-btn.is-active');
      if (current) moveTo(current);
    });
  }

  /* ── Filter + search ────────────────────────────────────────────── */
  function initSearchAndFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    var input = document.getElementById('proj-search');
    var cards = document.querySelectorAll('.proj-card');
    var empty = document.querySelector('.proj-empty');
    var category = 'all';

    function apply() {
      var useFlip = !reduced && typeof Flip !== 'undefined';
      var state = useFlip
        ? Flip.getState('.proj-card, .project-row:not(.project-row--founding)')
        : null;

      var q = (input ? input.value : '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category') || '';
        var text = card.textContent.toLowerCase();
        var catOk = category === 'all' || cat === category;
        var qOk = !q || text.indexOf(q) !== -1;
        var show = catOk && qOk;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });
      document.querySelectorAll('.project-row').forEach(function (row) {
        if (row.classList.contains('project-row--founding')) {
          row.classList.remove('is-filtered-out', 'is-solo');
          return;
        }
        var visibleCards = row.querySelectorAll('.proj-card:not(.is-hidden)');
        var hiddenCards = row.querySelectorAll('.proj-card.is-hidden');
        row.classList.toggle('is-filtered-out', visibleCards.length === 0);
        row.classList.toggle('is-solo', visibleCards.length === 1 && hiddenCards.length > 0);
      });
      if (empty) empty.hidden = visible !== 0;

      if (useFlip && state) {
        Flip.from(state, {
          duration: 0.48,
          ease: 'power2.inOut',
          stagger: 0.02,
          fade: true,
          scale: true,
          onComplete: function () {
            if (window.gsap) gsap.set('.proj-card', { clearProps: 'transform,opacity' });
            window.dispatchEvent(new Event('proj-layout'));
            if (window.ScrollTrigger) ScrollTrigger.refresh();
          }
        });
      } else {
        window.dispatchEvent(new Event('proj-layout'));
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        category = btn.getAttribute('data-filter') || 'all';
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
  }

  /* ── 2. SVG timeline scroll-draw ────────────────────────────────── */
  function initTimeline() {
    var grid = document.querySelector('.projects-grid');
    var svg = document.querySelector('.timeline-svg');
    var path = document.getElementById('timeline-path');
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.timeline-node'));
    if (!grid || !svg || !path) return;

    var pathLength = 0;

    function sizeSvg() {
      var h = grid.offsetHeight || 1400;
      svg.setAttribute('viewBox', '0 0 4 ' + h);
      path.setAttribute('d', 'M2,0 L2,' + h);
      pathLength = path.getTotalLength();
      path.style.setProperty('--path-length', String(pathLength));
      path.style.strokeDasharray = String(pathLength);

      // Cache node ratio relative to grid height to prevent layout thrashing on scroll
      var gridRect = grid.getBoundingClientRect();
      var gridH = grid.offsetHeight || 1;
      nodes.forEach(function (node) {
        var nodeRect = node.getBoundingClientRect();
        node._timelineRatio = (nodeRect.top - gridRect.top + nodeRect.height / 2) / gridH;
      });

      if (reduced) {
        path.style.strokeDashoffset = '0';
        nodes.forEach(function (node) {
          node.classList.add('is-visible', 'is-filled', 'is-drawn');
        });
        return;
      }
      path.style.strokeDashoffset = String(pathLength);
    }

    nodes.forEach(function (node) {
      node.querySelectorAll('.icon-stroke').forEach(function (stroke) {
        var len = 0;
        try { len = stroke.getTotalLength(); } catch (err) { len = 80; }
        stroke.style.setProperty('--icon-length', String(len));
        stroke.style.strokeDasharray = String(len);
        stroke.style.strokeDashoffset = '0';
      });
    });

    sizeSvg();

    if (reduced) return;

    var ticking = false;

    function updateTimelineDraw() {
      var rect = svg.getBoundingClientRect();
      var viewH = window.innerHeight;
      var progress = Math.min(1, Math.max(0, (viewH - rect.top) / (rect.height + viewH * 0.5)));
      var offset = pathLength * (1 - progress);
      path.style.strokeDashoffset = offset;

      nodes.forEach(function (node) {
        var row = node.closest('.project-row');
        if (row && row.classList.contains('is-filtered-out')) return;
        var ratio = typeof node._timelineRatio === 'number' ? node._timelineRatio : 0;
        var reached = progress >= ratio;
        node.classList.toggle('is-visible', reached);
        node.classList.toggle('is-drawn', reached);
        node.classList.toggle('is-filled', reached);
      });
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateTimelineDraw();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      sizeSvg();
      onScroll();
    });
    window.addEventListener('proj-layout', function () {
      sizeSvg();
      onScroll();
    });
    onScroll();
  }

  /* ── 4. Card expand (FLIP) + slideshow ──────────────────────────── */
  function initCardExpand() {
    var overlay = document.getElementById('proj-overlay');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.proj-card'));
    var openCard = null;
    var spacer = null;
    var slideTimer = null;
    var slidePaused = false;
    var triggerBtn = null;

    cards.forEach(function (card) {
      var slides = card.querySelectorAll('.proj-slideshow img');
      if (slides[0]) slides[0].classList.add('is-active');

      card.querySelectorAll('.proj-slideshow img').forEach(function (img) {
        img.addEventListener('error', function () {
          img.remove();
          var remaining = card.querySelectorAll('.proj-slideshow img');
          if (remaining[0] && !card.querySelector('.proj-slideshow img.is-active')) {
            remaining[0].classList.add('is-active');
          }
        });
      });

      card.addEventListener('click', function (e) {
        if (card.classList.contains('is-expanded')) return;
        if (e.target.closest('.proj-close')) return;
        expand(card, e.target.closest('.proj-view') || card);
      });
      var closeBtn = card.querySelector('.proj-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          collapse();
        });
      }
      var prev = card.querySelector('.slide-prev');
      var next = card.querySelector('.slide-next');
      if (prev) prev.addEventListener('click', function (e) {
        e.stopPropagation();
        stepSlide(card, -1);
        pauseAuto();
      });
      if (next) next.addEventListener('click', function (e) {
        e.stopPropagation();
        stepSlide(card, 1);
        pauseAuto();
      });
    });

    if (overlay) overlay.addEventListener('click', collapse);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openCard) {
        collapse();
      } else if (e.key === 'Tab' && openCard) {
        var focusables = openCard.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        var focusArr = Array.prototype.slice.call(focusables).filter(function (el) {
          return el.offsetParent !== null;
        });
        if (!focusArr.length) return;
        var first = focusArr[0];
        var last = focusArr[focusArr.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    function pauseAuto() {
      slidePaused = true;
      clearInterval(slideTimer);
      slideTimer = null;
    }

    function startAuto(card) {
      pauseAuto();
      slidePaused = false;
      if (reduced) return;
      slideTimer = window.setInterval(function () {
        if (!slidePaused && openCard === card) stepSlide(card, 1);
      }, 3750);
    }

    function stepSlide(card, dir) {
      var slides = Array.prototype.slice.call(card.querySelectorAll('.proj-slideshow img'));
      if (slides.length < 2) return;
      var i = slides.findIndex(function (img) { return img.classList.contains('is-active'); });
      if (i < 0) i = 0;
      slides[i].classList.remove('is-active');
      var next = (i + dir + slides.length) % slides.length;
      slides[next].classList.add('is-active');
    }

    function expand(card, sourceEl) {
      if (openCard) return;
      openCard = card;
      triggerBtn = sourceEl || card.querySelector('.proj-view') || null;

      var first = card.getBoundingClientRect();
      var cs = window.getComputedStyle(card);
      spacer = document.createElement('div');
      spacer.className = 'proj-card-spacer';
      spacer.style.width = first.width + 'px';
      spacer.style.height = first.height + 'px';
      spacer.style.gridColumn = cs.gridColumn;
      spacer.style.gridRow = cs.gridRow;
      spacer.style.margin = cs.margin;
      card.parentNode.insertBefore(spacer, card);

      if (overlay) {
        overlay.hidden = false;
        requestAnimationFrame(function () {
          overlay.classList.add('is-on');
        });
      }
      document.body.classList.add('proj-expanded');

      cards.forEach(function (other) {
        if (other !== card) other.classList.add('is-dimmed');
      });

      card.classList.add('is-expanded');
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      var heading = card.querySelector('h3');
      if (heading) card.setAttribute('aria-label', heading.textContent.trim());

      var closeBtn = card.querySelector('.proj-close');
      if (closeBtn) closeBtn.focus();

      if (reduced) {
        card.classList.add('is-show-slides', 'is-show-close');
        card.querySelectorAll('.proj-details li').forEach(function (li) {
          li.classList.add('is-in');
        });
        return;
      }

      card.style.setProperty('--expand-scale', '0.92');

      requestAnimationFrame(function () {
        card.style.setProperty('--expand-scale', '1');
      });

      window.setTimeout(function () {
        card.classList.add('is-show-slides');
        startAuto(card);
      }, 250);

      card.querySelectorAll('.proj-details li').forEach(function (li, i) {
        window.setTimeout(function () { li.classList.add('is-in'); }, 350 + i * 60);
      });

      card.classList.add('is-show-close');
    }

    function collapse() {
      if (!openCard) return;
      var card = openCard;
      pauseAuto();

      function finish() {
        card.classList.remove('is-expanded', 'is-show-slides', 'is-show-close');
        card.removeAttribute('role');
        card.removeAttribute('aria-modal');
        card.removeAttribute('aria-label');
        card.style.removeProperty('--expand-scale');
        card.querySelectorAll('.proj-details li').forEach(function (li) {
          li.classList.remove('is-in');
        });
        if (spacer) {
          spacer.parentNode.removeChild(spacer);
          spacer = null;
        }
        cards.forEach(function (other) { other.classList.remove('is-dimmed'); });
        if (overlay) overlay.classList.remove('is-on');
        document.body.classList.remove('proj-expanded');
        if (overlay) window.setTimeout(function () { overlay.hidden = true; }, 250);
        if (triggerBtn && typeof triggerBtn.focus === 'function') {
          triggerBtn.focus();
        }
        openCard = null;
      }

      if (reduced) {
        finish();
        return;
      }

      card.classList.remove('is-show-close');
      card.querySelectorAll('.proj-details li').forEach(function (li) {
        li.classList.remove('is-in');
      });
      card.classList.remove('is-show-slides');

      window.setTimeout(function () {
        if (!spacer) {
          finish();
          return;
        }
        card.style.setProperty('--expand-scale', '0.92');

        window.setTimeout(function () {
          finish();
        }, 400);
      }, 150);
    }
  }

  /* ── 5. Card scroll image uncover & text stagger ────────────────── */
  function initCardScrollReveals() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;

    var cards = document.querySelectorAll('.proj-card');
    cards.forEach(function (card) {
      var photo = card.querySelector('.proj-card-photo');
      var firstImg = photo ? photo.querySelector('.proj-slideshow img:first-child') : null;
      var bodyItems = card.querySelectorAll(
        '.proj-cat, h3, .proj-loc, .proj-metrics li, .proj-view'
      );

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true,
        },
        onComplete: function () {
          // CRITICAL: clearProps prevents conflicts with CSS tilt and modal expand
          if (firstImg) gsap.set(firstImg, { clearProps: 'transform,clipPath' });
          if (bodyItems.length) gsap.set(bodyItems, { clearProps: 'transform,opacity' });
        }
      });

      if (firstImg) {
        tl.fromTo(
          firstImg,
          { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.12 },
          { clipPath: 'inset(0% 0% 0% 0%)', scale: 1.0, duration: 0.75, ease: 'power3.out' }
        );
      }

      if (bodyItems.length) {
        tl.from(
          bodyItems,
          {
            y: 14,
            opacity: 0,
            stagger: 0.045,
            duration: 0.45,
            ease: 'power2.out'
          },
          firstImg ? '-=0.45' : 0
        );
      }
    });
  }

  /* ── 6. Viewport scroll progress line ───────────────────────────── */
  function initScrollProgress() {
    var bar = document.querySelector('.proj-scroll-progress');
    if (!bar || reduced || !window.gsap || !window.ScrollTrigger) return;

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        gsap.set(bar, { scaleX: self.progress });
      }
    });
  }

})();
