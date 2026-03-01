"use client";

/**
 * EXP-003 — CTA-variant experiment (werkgevers-pagina)
 *
 * Variant CONTROL: huidige call-to-action — "Vraag een gratis pilot aan" → /contact
 * Variant VARIANT: alternatief — "Plan een demo van 30 minuten" → /demo
 *
 * De variant wordt door `getVariant()` uit localStorage gelezen (of eenmalig gerandomiseerd)
 * zodat een terugkerende bezoeker altijd hetzelfde ziet. Beide varianten meten
 * impressions en klikken via `lumio:experiment_impression` / `lumio:experiment_conversion`
 * DOM-events, die door PostHog of een analytics-snippet kunnen worden onderschept.
 *
 * Meetdoel (EXP-003): Verbetert "Plan een demo"-CTA de demo-conversieratio t.o.v.
 * de baseline "Vraag een gratis pilot aan"-CTA?
 *
 * Null hypothesis: beide varianten hebben dezelfde demo-aanvraagrate per unieke bezoeker.
 * Succescriterium: variant-conversieratio ≥ 1,25× control bij n ≥ 100 unieke bezoekers.
 */

import { useEffect, useState } from "react";
import {
  getVariant,
  trackExperimentImpression,
  trackExperimentConversion,
  type ExperimentVariant,
} from "@/lib/experiment";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

const EXP_ID = "EXP-003";

/* ── Variant configuratie ───────────────────────────────────────────────── */

interface CtaConfig {
  badge?: string;
  heading: string;
  sub: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  conversionGoal: string;
}

const CONTROL: CtaConfig = {
  heading: "Klaar om Lumio aan te bieden aan uw medewerkers?",
  sub: "Start met een gratis pilot voor uw team. Geen verplichtingen, geen implementatiekosten. We begeleiden u van aanvraag tot eerste gebruik.",
  primaryLabel: "Vraag een gratis pilot aan",
  primaryHref: "/contact",
  secondaryLabel: "Bekijk de prijzen",
  secondaryHref: "/prijzen",
  conversionGoal: "pilot_click",
};

const VARIANT: CtaConfig = {
  badge: "30 minuten",
  heading: "Zie Lumio live — vraag een persoonlijke demo aan",
  sub: "In 30 minuten ziet u hoe uw medewerkers hun nalatenschap regelen. Geen installatie, geen commitments, wel direct antwoord op uw vragen.",
  primaryLabel: "Plan een gratis demo",
  primaryHref: "/demo",
  secondaryLabel: "Of vraag direct een pilot aan",
  secondaryHref: "/contact",
  conversionGoal: "demo_click",
};

/* ── Component ──────────────────────────────────────────────────────────── */

export default function ExperimentCtaBanner() {
  // Initialiseer op SSR-veilige "control" standaard; hydrateer op client
  const [variant, setVariant] = useState<ExperimentVariant>("control");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const v = getVariant(EXP_ID);
    setVariant(v);
    setMounted(true);
    trackExperimentImpression(EXP_ID, v);
  }, []);

  const config = variant === "variant" ? VARIANT : CONTROL;

  const handlePrimaryClick = () => {
    trackExperimentConversion(EXP_ID, variant, config.conversionGoal);
  };

  // Render niks zichtbaar zolang variant nog niet bepaald is om hydration-mismatch te vermijden
  if (!mounted) return <CtaBannerSkeleton />;

  return (
    <section className="py-20 bg-primary-700">
      <Container>
        <div className="text-center text-white max-w-2xl mx-auto">
          {config.badge && (
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              {config.badge}
            </span>
          )}

          <h2 className="font-display text-3xl md:text-4xl mb-4">
            {config.heading}
          </h2>

          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            {config.sub}
          </p>

          {/* Experiment-label voor A/B-debugging (verborgen in productie) */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-white/40 text-xs mb-4 font-mono">
              {EXP_ID} · {variant}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Wrapper intercepts click so we can fire analytics before navigation */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
            <div onClick={handlePrimaryClick} role="none">
              <Button href={config.primaryHref} size="lg">
                {config.primaryLabel}
              </Button>
            </div>
            <Button
              href={config.secondaryHref}
              variant="ghost"
              size="lg"
              className="text-white! hover:bg-white/15!"
            >
              {config.secondaryLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Skeleton (SSR placeholder — identiek aan control layout) ───────────── */
function CtaBannerSkeleton() {
  return (
    <section className="py-20 bg-primary-700">
      <Container>
        <div className="text-center text-white max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            {CONTROL.heading}
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            {CONTROL.sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={CONTROL.primaryHref} size="lg">
              {CONTROL.primaryLabel}
            </Button>
            <Button
              href={CONTROL.secondaryHref}
              variant="ghost"
              size="lg"
              className="text-white! hover:bg-white/15!"
            >
              {CONTROL.secondaryLabel}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
