/**
 * projects.js — R2S Projects page motion
 * Hero load, sliding filter pills, SVG timeline draw, card FLIP expand, slideshow.
 * card-tilt / base reveal / icon-lift remain in shared.js.
 */
(function () {
  'use strict';

  var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initHeroLoad();
    initFilterPills();
    initSearchAndFilter();
    initCardReveal();
    initTimeline();
    initCardExpand();
  });

  /* ── 1.3 Independent card reveal (same observer as biogas.js) ───── */
  function initCardReveal() {
    var cards = document.querySelectorAll('.proj-card.reveal-left, .proj-card.reveal-right');
    if (reduced) {
      cards.forEach(function (el) { el.classList.add('is-visible'); });
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
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach(function (el) { observer.observe(el); });
  }

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
      window.setTimeout(function () { show(el); }, 300 + i * 90);
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
      });
      btn.classList.add('is-active');
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
      window.dispatchEvent(new Event('proj-layout'));
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        category = btn.getAttribute('data-filter') || 'all';
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

      var gridRect = grid.getBoundingClientRect();
      var gridH = grid.offsetHeight || 1;
      nodes.forEach(function (node) {
        var row = node.closest('.project-row');
        if (row && row.classList.contains('is-filtered-out')) return;
        var nodeRect = node.getBoundingClientRect();
        var ratio = (nodeRect.top - gridRect.top + nodeRect.height / 2) / gridH;
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
        expand(card);
      });
      card.querySelector('.proj-close').addEventListener('click', function (e) {
        e.stopPropagation();
        collapse();
      });
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
      if (e.key === 'Escape') collapse();
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

    function expand(card) {
      if (openCard) return;
      openCard = card;

      var first = card.getBoundingClientRect();
      spacer = document.createElement('div');
      spacer.className = 'proj-card-spacer';
      spacer.style.width = first.width + 'px';
      spacer.style.height = first.height + 'px';
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

      if (reduced) {
        card.classList.add('is-show-slides', 'is-show-close');
        card.querySelectorAll('.proj-details li').forEach(function (li) {
          li.classList.add('is-in');
        });
        return;
      }

      card.style.transform = 'translate(-50%, -50%) scale(0.92)';
      card.style.transition = 'transform 0ms';

      requestAnimationFrame(function () {
        card.style.transition = 'transform 0.45s ' + EASE;
        card.style.transform = 'translate(-50%, -50%) scale(1)';
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
        card.querySelectorAll('.proj-details li').forEach(function (li) {
          li.classList.remove('is-in');
        });
        card.style.transition = '';
        card.style.transform = '';
        if (spacer) {
          spacer.parentNode.removeChild(spacer);
          spacer = null;
        }
        cards.forEach(function (other) { other.classList.remove('is-dimmed'); });
        overlay.classList.remove('is-on');
        document.body.classList.remove('proj-expanded');
        window.setTimeout(function () { overlay.hidden = true; }, 250);
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
        card.style.transition = 'transform 0.4s ' + EASE;
        card.style.transform = 'translate(-50%, -50%) scale(0.92)';

        window.setTimeout(function () {
          finish();
        }, 400);
      }, 150);
    }
  }

})();
