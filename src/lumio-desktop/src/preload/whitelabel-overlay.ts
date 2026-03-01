/// <reference lib="dom" />
/**
 * whitelabel-overlay.ts — Preload-side overlay for WL-3
 *
 * Runs in the Electron preload isolated world (contextIsolation: true).
 * Shares the DOM with the renderer page but has its own JS context.
 *
 * Responsibilities:
 *  1. Fetch logo/message data from the main process via synchronous IPC
 *     (executes before any page JS runs — data is available immediately).
 *  2. Inject a company logo <img> pinned to the bottom-center of every page.
 *  3. Inject a dashboard message bar pinned to the bottom edge, shown only
 *     on the Dashboard route.
 *  4. Keep both overlays alive through SPA navigation via MutationObserver
 *     and the Navigation / popstate APIs.
 *
 * This module has no effect when no whitelabel config is deployed (all IPC
 * channels return null → early exit).
 *
 * Constraint: No Node.js APIs (fs, path, etc.) — only Electron IPC and Web APIs.
 */

import { ipcRenderer } from "electron";

// ── IPC payload type (mirrors main/whitelabel.ts LogoIpcPayload) ──────────────

interface LogoData {
  /** base64 data URI, e.g. "data:image/svg+xml;base64,..." */
  dataUrl: string;
  /** Rendered height in pixels. */
  height: number;
  /** CSS opacity (0.1–1.0). */
  opacity: number;
}

// ── Retrieve whitelabel data synchronously before page JS runs ────────────────
// sendSync is intentional: we need the data available the moment the
// MutationObserver and init() run (synchronously at module load time).

const logo    = ipcRenderer.sendSync("whitelabel:get-logo")    as LogoData | null;
const message = ipcRenderer.sendSync("whitelabel:get-message") as string   | null;
const company = ipcRenderer.sendSync("whitelabel:get-name")    as string   | null;

console.log("[wl-overlay] IPC data received:", {
  hasLogo:    !!logo,
  hasMessage: !!message,
  company,
});

// ── Layout constants ──────────────────────────────────────────────────────────

/** Z-index shared by both overlay elements (above app content, below dialogs). */
const Z = 9998;
/** Bottom offset for the logo when the message bar is visible. */
const LOGO_BOTTOM_WITH_MSG = 44; // 36 px bar + 8 px gap
/** Bottom offset for the logo when there is no message bar. */
const LOGO_BOTTOM_NO_MSG   = 16;
/** Height of the message bar in px. */
const MSG_BAR_HEIGHT = 36;

// ── Element IDs ───────────────────────────────────────────────────────────────

const LOGO_ID = "__wl_logo__";
const MSG_ID  = "__wl_msg__";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when the current URL path is a Dashboard page. */
function isDashboardRoute(): boolean {
  const p = window.location.pathname;
  return p === "/" || p.startsWith("/dashboard");
}

/** Inject the logo overlay if it is not already in the DOM. */
function injectLogo(): void {
  if (!logo) return;
  if (document.getElementById(LOGO_ID)) return;

  const bottomPx = message ? LOGO_BOTTOM_WITH_MSG : LOGO_BOTTOM_NO_MSG;

  const wrapper = document.createElement("div");
  wrapper.id = LOGO_ID;
  Object.assign(wrapper.style, {
    position:  "fixed",
    bottom:    `${bottomPx}px`,
    left:      "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex:    String(Z),
    lineHeight: "0",
  });

  const img = document.createElement("img");
  img.src = logo.dataUrl;
  img.alt = company ?? "";
  Object.assign(img.style, {
    height:          `${logo.height}px`,
    width:           "auto",
    opacity:         String(logo.opacity),
    display:         "block",
    userSelect:      "none",
    WebkitUserDrag:  "none",
  } as Partial<CSSStyleDeclaration>);

  // Hide broken-image icon if the src can't be decoded
  img.onerror = (): void => { wrapper.style.display = "none"; };

  wrapper.appendChild(img);
  document.body.appendChild(wrapper);
}

/** Remove the message bar from the DOM. */
function removeMessage(): void {
  document.getElementById(MSG_ID)?.remove();
}

/** Inject the dashboard message bar if we're on the right route. */
function injectMessage(): void {
  if (!message) return;
  if (document.getElementById(MSG_ID)) return;
  if (!isDashboardRoute()) {
    console.log("[wl-overlay] injectMessage: not on dashboard, pathname:", window.location.pathname);
    return;
  }
  console.log("[wl-overlay] injecting message bar");

  const bar = document.createElement("div");
  bar.id = MSG_ID;
  Object.assign(bar.style, {
    position:   "fixed",
    bottom:     "0",
    left:       "0",
    right:      "0",
    height:     `${MSG_BAR_HEIGHT}px`,
    display:    "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.04)",
    borderTop:  "1px solid rgba(0, 0, 0, 0.06)",
    fontSize:   "12px",
    color:      "rgba(0, 0, 0, 0.45)",
    pointerEvents: "none",
    zIndex:     String(Z),
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    overflow:   "hidden",
    textOverflow: "ellipsis",
    padding:    "0 16px",
    boxSizing:  "border-box",
    letterSpacing: "0.01em",
  } as Partial<CSSStyleDeclaration>);

  bar.textContent = message;
  document.body.appendChild(bar);
}

/** Re-evaluate and synchronize both overlay elements with the current route. */
function syncOverlays(): void {
  injectLogo();
  // Message: show on dashboard, hide elsewhere
  if (isDashboardRoute()) {
    injectMessage();
  } else {
    removeMessage();
  }
}

// ── Navigation listener ───────────────────────────────────────────────────────

/**
 * Called after a SPA route change has committed.
 * We wait one frame to let React flush the new route's DOM before injecting.
 */
function onNavigated(): void {
  console.log("[wl-overlay] navigation detected, pathname:", window.location.pathname);
  window.setTimeout(syncOverlays, 80);
}

// ── MutationObserver ──────────────────────────────────────────────────────────

/**
 * Watch direct children of <body>.  If React (or anything else) removes one
 * of our overlay elements, the observer re-injects it on the next tick.
 *
 * We only observe `childList` at body level (no subtree) to keep overhead
 * minimal — our elements are direct body children.
 */
function createBodyObserver(): MutationObserver {
  const observer = new MutationObserver(() => {
    const logoMissing = logo    && !document.getElementById(LOGO_ID);
    const msgMissing  = message && !document.getElementById(MSG_ID) && isDashboardRoute();
    if (logoMissing || msgMissing) {
      syncOverlays();
    }
  });
  observer.observe(document.body, { childList: true });
  return observer;
}

// ── Initialization ────────────────────────────────────────────────────────────

function init(): void {
  if (!logo && !message) return;

  console.log("[wl-overlay] init() called, pathname:", window.location.pathname);

  // Initial inject (page may already have content when preload runs)
  syncOverlays();

  // Keep overlays alive through React re-renders
  createBodyObserver();

  // ── Navigation detection ─────────────────────────────────────────────────
  // Strategy: ALWAYS monkey-patch history.pushState/replaceState so we
  // intercept all Next.js client-side navigations.  The Chromium Navigation
  // API may not propagate events to the isolated preload world reliably, so
  // we never rely on it exclusively.

  const origPush    = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history.pushState = (data: any, unused: string, url?: string | URL | null): void => {
    origPush(data, unused, url);
    onNavigated();
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history.replaceState = (data: any, unused: string, url?: string | URL | null): void => {
    origReplace(data, unused, url);
    onNavigated();
  };

  // Also listen for popstate (browser back/forward)
  window.addEventListener("popstate", onNavigated);

  // Supplement with the Chromium Navigation API when available — belt AND
  // braces.  If it fires, onNavigated() is safe to call multiple times
  // (syncOverlays is idempotent when elements are already in the DOM).
  const nav = (window as Window & { navigation?: EventTarget & {
    addEventListener(type: string, cb: EventListenerOrEventListenerObject): void;
  } }).navigation;

  if (nav) {
    nav.addEventListener("navigatesuccess", onNavigated);
  }

  console.log("[wl-overlay] navigation hooks installed, nav API available:", !!nav);
}

// Run as soon as <body> is available.
if (document.body) {
  init();
} else {
  window.addEventListener("DOMContentLoaded", init, { once: true });
}
