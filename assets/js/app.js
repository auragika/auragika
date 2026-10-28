/* Auragika — theme toggle, scroll reveal, card spotlight, service worker. */
(function () {
  'use strict';

  var root = document.documentElement;
  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var themeBtn = document.getElementById('theme-btn');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function paintTheme() {
    var light = root.getAttribute('data-theme') === 'light';
    themeBtn.innerHTML = light ? MOON : SUN;
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeMeta.setAttribute('content', light ? '#f4f6fb' : '#0a0b10');
  }

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('au_theme', next); } catch (e) { console.error('[Auragika] theme', e); }
    paintTheme();
  });
  paintTheme();

  // Reveal sections as they scroll in; show everything at once without IntersectionObserver or with reduced motion.
  var items = document.querySelectorAll('.reveal');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || still) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Spotlight that follows the pointer on app cards (mouse and pen only).
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.app-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (e) { console.error('[Auragika] sw', e); });
    });
  }
})();
