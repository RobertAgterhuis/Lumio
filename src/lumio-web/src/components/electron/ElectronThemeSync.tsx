"use client";

import { useEffect } from "react";

/** localStorage key used by the Lumio theme toggle. */
const THEME_KEY = "lumio-theme";

/**
 * Invisible client component that wires up OS dark/light-mode synchronisation
 * when the app runs inside the Electron shell.
 *
 * Behaviour:
 * - If the user has saved a theme preference (`localStorage["lumio-theme"]`),
 *   the OS signal is **ignored** — the user's choice always wins.
 * - If no preference is stored (i.e., "follow OS" mode), the `dark` class on
 *   `<html>` is toggled in real-time whenever the OS theme changes.
 *
 * The initial theme is already applied by the inline script in `layout.tsx`
 * (no flash-of-wrong-theme), but we re-query on mount to close any timing gap
 * that could occur on slow hardware before the inline script ran.
 *
 * Mount this once at the root of the app — inside <body> in `layout.tsx`.
 */
export function ElectronThemeSync() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.lumio) return;

    // ── Platform attribute ──────────────────────────────────────────────────
    // Set data-platform on <html> so CSS can apply platform-specific styles,
    // e.g. `[data-platform="darwin"] .app-header { padding-left: 80px }` to
    // leave room for macOS traffic-light buttons (EL-5-02).
    document.documentElement.dataset.platform = window.lumio.platform;

    // ── OS theme sync ───────────────────────────────────────────────────────
    /**
     * Apply the OS theme preference — only when the user has not set
     * an explicit preference in the Lumio settings.
     */
    const applyOsTheme = (isDark: boolean): void => {
      // A stored value of "dark" or "light" means the user has chosen
      // explicitly — do not override it with the OS signal.
      if (localStorage.getItem(THEME_KEY) !== null) return;
      document.documentElement.classList.toggle("dark", isDark);
    };

    // Subscribe to future OS theme changes (fires for the lifetime of the page)
    window.lumio.onThemeChange(applyOsTheme);

    // Re-apply initial theme from the Electron main process.
    // Handles the edge-case where the inline IIFE in layout.tsx ran before
    // nativeTheme was fully initialised on the main process side.
    window.lumio.getInitialThemeIsDark().then(applyOsTheme).catch(() => {
      // Silently ignore — the inline script already provided a best-effort value
    });
  }, []);

  // Renders nothing — side-effects only
  return null;
}
