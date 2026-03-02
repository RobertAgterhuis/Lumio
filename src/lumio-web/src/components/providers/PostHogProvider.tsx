"use client";

/**
 * PostHogProvider — SP-6-006 Analytics (COMPLIANCE_RISK-GROWTH-001)
 *
 * GUARD-006 ENFORCEMENT:
 * - Auto-capture is DISABLED — only explicit `posthog.capture(...)` calls are allowed.
 * - Events MUST NOT contain any legacy/health/testament/euthanasie/donor content.
 * - User identification MUST NOT use personal data (no name, email, BSN, health data).
 * - Session recording is DISABLED.
 * - PostHog only initialises when NEXT_PUBLIC_POSTHOG_KEY is set.
 * - Offline-first: if PostHog is unreachable, all calls degrade silently.
 *
 * DPO approval: 2026-03-01 (devdocs/dpia-bijzondere-categorieen.md BrEVR-001 context)
 * See also: docs/guardrails/00-global-guardrails.md GUARD-006
 */

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// SP-11-003: default to EU datacenter — no data leaves EER unless NEXT_PUBLIC_POSTHOG_HOST overrides this.
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

function PostHogInit() {
  useEffect(() => {
    if (!POSTHOG_KEY) return; // Not configured — no analytics

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,

      // ==============================================================
      // GUARD-006: Strict privacy controls
      // ==============================================================

      // Disable autocapture — only explicit events are allowed.
      // This prevents inadvertent capture of form inputs, URLs containing
      // health information (/euthanasie, /donor, /testament), etc.
      autocapture: false,

      // Disable session recording — users have not consented to video recording.
      disable_session_recording: true,

      // Respect Do Not Track browser header.
      respect_dnt: true,

      // Mask all text and inputs in any heatmaps (precautionary; recording is off).
      mask_all_text: true,
      mask_all_element_attributes: true,

      // Disable feature flags polling to reduce network traffic in offline-first app.
      advanced_disable_feature_flags: true,

      // Bootstrap: don't send pageview automatically — we control this explicitly.
      capture_pageview: false,

      // Do not append __ph_ query params to URLs.
      sanitize_properties: (props) => {
        // Strip any URL path components that might contain domain names
        // matching sensitive routes — belt-and-suspenders on top of no autocapture.
        if (props.$current_url) {
          try {
            const url = new URL(props.$current_url as string);
            const sensitive = /\/(euthanasie|donor|testament|boedel|digitaal-bezit|erfgenamen|documenten|noodcontacten|uitvaart)/i;
            if (sensitive.test(url.pathname)) {
              // Replace sensitive path with redacted placeholder
              props.$current_url = url.origin + "/[REDACTED]";
              props.$pathname = "/[REDACTED]";
            }
          } catch {
            // Non-parseable URL — redact entirely
            props.$current_url = "[REDACTED]";
          }
        }
        return props;
      },
    });
  }, []);

  return null;
}

/**
 * Wrap your layout/page tree with this provider.
 * If NEXT_PUBLIC_POSTHOG_KEY is absent, this is a no-op and posthog stays uninitialized.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_KEY) {
    // Analytics not configured — render children without PostHog context.
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      {children}
    </PHProvider>
  );
}
