/**
 * EXP-003 — Lichtgewicht A/B experiment utility voor de statische marketingsite.
 *
 * Verantwoordelijkheden:
 * - Persisteer variant-toewijzing in localStorage zodat een gebruiker altijd
 *   dezelfde variant ziet binnen een sessie/browser.
 * - Stuur custom DOM-events die PostHog (of elk ander analytics script) kan
 *   oppikken zonder directe koppeling aan een analyticsprovider.
 * - Werk server-side veilig: alle localStorage-aanroepen zijn afgeschermd met
 *   `typeof window !== 'undefined'`.
 *
 * Gebruik:
 * ```tsx
 * "use client";
 * import { getVariant, trackExperimentImpression, trackExperimentConversion } from "@/lib/experiment";
 *
 * const variant = getVariant("EXP-003"); // "control" | "variant"
 * trackExperimentImpression("EXP-003", variant);
 * ```
 */

export type ExperimentVariant = "control" | "variant";

const STORAGE_PREFIX = "lumio_exp_";

/**
 * Wijs een gebruiker deterministisch toe aan "control" of "variant".
 * Bij het eerste bezoek wordt via Math.random() een fair 50/50-split gemaakt
 * en opgeslagen in localStorage.
 *
 * @param experimentId  Unieke experimentssleutel, bv. "EXP-003"
 * @param ratio         Fractie bezoekers die "variant" krijgt (default: 0.5)
 */
export function getVariant(
  experimentId: string,
  ratio = 0.5
): ExperimentVariant {
  if (typeof window === "undefined") return "control";

  const key = `${STORAGE_PREFIX}${experimentId}`;

  const stored = localStorage.getItem(key);
  if (stored === "control" || stored === "variant") return stored;

  const assigned: ExperimentVariant = Math.random() < ratio ? "variant" : "control";
  try {
    localStorage.setItem(key, assigned);
  } catch {
    // localStorage kan geblokkeerd zijn (private mode, quota); stille fallback.
  }
  return assigned;
}

/**
 * Stuur een "impression" event naar de analytics-laag.
 * PostHog's `posthog.capture` of `window.dataLayer.push` kan dit oppikken
 * vanuit een apart script zonder directe import-koppeling.
 */
export function trackExperimentImpression(
  experimentId: string,
  variant: ExperimentVariant
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("lumio:experiment_impression", {
      detail: { experimentId, variant, timestamp: Date.now() },
    })
  );
}

/**
 * Stuur een "conversion" event (bv. CTA-klik naar /demo of /contact).
 *
 * @param experimentId  Dezelfde sleutel als bij `getVariant`
 * @param variant       Variant die de conversie heeft getriggerd
 * @param goal          Leesbaar doel, bv. "demo_click" of "contact_click"
 */
export function trackExperimentConversion(
  experimentId: string,
  variant: ExperimentVariant,
  goal: string
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("lumio:experiment_conversion", {
      detail: { experimentId, variant, goal, timestamp: Date.now() },
    })
  );
}

/**
 * Reset een experiment (handig voor ontwikkeling).
 * Verwijdert de opgeslagen variant uit localStorage.
 */
export function resetExperiment(experimentId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${STORAGE_PREFIX}${experimentId}`);
}
