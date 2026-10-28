// Applies the saved theme before first paint (dark by default), so there is no flash.
// Loaded as a blocking script in <head>; kept tiny and external so the CSP can forbid inline scripts.
(function () {
  var root = document.documentElement;
  var theme = 'dark';
  try { theme = localStorage.getItem('au_theme') || 'dark'; } catch (e) { /* storage blocked: keep dark */ }
  root.setAttribute('data-theme', theme);
  root.classList.add('js');
})();
