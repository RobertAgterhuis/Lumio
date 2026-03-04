/**
 * T-007 (GAP-SEC-04): Theme initialisation script — loaded synchronously to prevent FOUC.
 *
 * Reads `lumio-theme` and `lumio-grote-tekst` from localStorage and applies the
 * corresponding CSS classes to <html> *before* first paint.
 *
 * Default is always LIGHT. Dark mode is only applied when the user has
 * explicitly chosen it via settings (no OS/system preference fallback).
 *
 * SECURITY: This file replaces the former inline `dangerouslySetInnerHTML` script,
 * allowing `'unsafe-inline'` to be removed from the `script-src` CSP directive.
 *
 * Load via: <script src="/theme-init.js" />  (no async/defer — blocking keeps FOUC absent)
 */
(function () {
  try {
    var t = localStorage.getItem("lumio-theme");
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    }
    if (localStorage.getItem("lumio-grote-tekst") === "true") {
      document.documentElement.classList.add("grote-tekst");
    }
  } catch (e) {
    // localStorage may be unavailable in private browsing — fail silently
  }
})();
