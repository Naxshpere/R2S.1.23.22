/**
 * script.js — legacy stub
 *
 * Menu, reveal, parallax and tilt are now handled by site.js.
 * This file is kept so existing <script src="script.js"> tags do not 404.
 * It intentionally does nothing if site.js has already initialised.
 */
if (!window.__r2sInit) {
  // Fallback menu toggle for pages that somehow load only this file
  var _mt = document.querySelector('.menu-toggle');
  var _sn = document.querySelector('.site-nav');
  if (_mt && _sn) {
    _mt.addEventListener('click', function () {
      var open = _sn.classList.toggle('is-open');
      _mt.classList.toggle('is-open', open);
      _mt.setAttribute('aria-expanded', String(open));
      _mt.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-locked', open);
    });
  }
}
