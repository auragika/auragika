/* Auragika: theme toggle, scroll reveal, card spotlight, install strip, service worker. */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'au_theme'; // also read by theme-init.js before first paint
  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function initTheme() {
    var btn = document.getElementById('theme-btn');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!btn) return;

    function paint() {
      var light = root.getAttribute('data-theme') === 'light';
      btn.innerHTML = light ? MOON : SUN;
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      if (meta) meta.setAttribute('content', light ? '#f4f6fb' : '#0a0b10');
    }

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { console.error('[Auragika] theme', e); }
      paint();
    });
    paint();
  }

  // Reveal sections as they scroll in; show everything at once without IntersectionObserver or with reduced motion.
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || still) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
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
  function initSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.app-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // Add to home screen. Chrome, Edge and Android fire beforeinstallprompt: offer one-tap Install in place of
  // the browser's mini-infobar. iPhone/iPad Safari has no prompt, so show Share → Add to Home Screen.
  // Hidden when already installed, and for 30 days after it's dismissed or the prompt is declined.
  var INSTALL_KEY = 'au_install_hint';
  var INSTALL_SNOOZE_MS = 30 * 24 * 3600 * 1000;
  var installEvt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  }

  function isIosSafari() {
    var ua = navigator.userAgent;
    var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    // iPadOS reports as a Mac with touch; Safari's UA never names Chrome, so touch-emulating Chrome doesn't match.
    return ios && /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edgios|opios/i.test(ua);
  }

  function installSnoozed() {
    try { return Date.now() - Number(localStorage.getItem(INSTALL_KEY) || 0) < INSTALL_SNOOZE_MS; }
    catch (e) { return false; }
  }

  function snoozeInstall() {
    try { localStorage.setItem(INSTALL_KEY, String(Date.now())); } catch (e) { console.error('[Auragika] install', e); }
  }

  function initInstall() {
    var strip = document.getElementById('install');
    if (!strip) return;
    var btn = document.getElementById('install-btn');
    var ios = document.getElementById('install-ios');

    function paint() {
      var mode = isStandalone() || installSnoozed() ? null : installEvt ? 'prompt' : isIosSafari() ? 'ios' : null;
      strip.hidden = !mode;
      btn.hidden = mode !== 'prompt';
      ios.hidden = mode !== 'ios';
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      installEvt = e;
      paint();
    });
    window.addEventListener('appinstalled', function () {
      installEvt = null;
      paint();
    });
    btn.addEventListener('click', function () {
      var e = installEvt;
      if (!e) return;
      installEvt = null;
      e.prompt();
      Promise.resolve(e.userChoice).then(function (choice) {
        if (!choice || choice.outcome !== 'accepted') snoozeInstall();
      }).catch(function (err) { console.error('[Auragika] install', err); }).then(paint);
      paint();
    });
    document.getElementById('install-x').addEventListener('click', function () {
      snoozeInstall();
      paint();
    });
    paint();
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (e) { console.error('[Auragika] sw', e); });
    });
  }

  initTheme();
  initReveal();
  initSpotlight();
  initInstall();
  registerServiceWorker();
})();
