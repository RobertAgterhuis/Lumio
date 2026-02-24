"use client";

import { useEffect } from "react";

/**
 * AxeDevTools - Runs axe-core accessibility checks in development mode.
 *
 * This component integrates @axe-core/react to automatically report
 * WCAG violations to the browser console during development.
 *
 * Features:
 * - Only runs in development mode (NODE_ENV === 'development')
 * - Reports violations to console with detailed information
 * - Delays initial scan to allow page to fully render
 * - Does not affect production builds
 *
 * Usage: Add as a child of your root provider in development.
 */
export function AxeDevTools() {
  useEffect(() => {
    // Only run in development mode and in browser
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      // Dynamically import to avoid including in production bundle
      const loadAxe = async () => {
        try {
          const React = await import("react");
          const ReactDOM = await import("react-dom");
          const axe = await import("@axe-core/react");

          // Run axe with a delay to ensure page is rendered
          axe.default(React.default, ReactDOM.default, 1000, {
            // Configure axe-core options
            rules: [
              // Ensure all WCAG A violations are reported
              { id: "color-contrast", enabled: true },
              { id: "label", enabled: true },
              { id: "image-alt", enabled: true },
              { id: "button-name", enabled: true },
              { id: "link-name", enabled: true },
              { id: "aria-allowed-attr", enabled: true },
              { id: "aria-hidden-focus", enabled: true },
              { id: "aria-required-attr", enabled: true },
              { id: "aria-roles", enabled: true },
              { id: "aria-valid-attr", enabled: true },
              { id: "aria-valid-attr-value", enabled: true },
              { id: "duplicate-id", enabled: true },
              { id: "form-field-multiple-labels", enabled: true },
              { id: "html-has-lang", enabled: true },
              { id: "valid-lang", enabled: true },
              { id: "video-caption", enabled: true },
              { id: "audio-caption", enabled: true },
            ],
          });

          console.log(
            "%c🔍 Axe DevTools enabled - accessibility violations will be reported in console",
            "background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;"
          );
        } catch (error) {
          console.warn("Failed to load axe-core:", error);
        }
      };

      loadAxe();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
