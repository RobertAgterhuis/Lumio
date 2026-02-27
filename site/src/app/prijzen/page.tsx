import PricingCard from "@/components/sections/PricingCard";
import SchaalTabel from "@/components/sections/SchaalTabel";
import CtaBanner from "@/components/sections/CtaBanner";
import FaqAccordion from "@/components/sections/FaqAccordion";
import ConsumerPricing from "@/components/sections/ConsumerPricing";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijzen – Lumio voor particulieren & werkgevers",
  description:
    "Lumio kost €125 eenmalig — voor jezelf of voor je medewerkers. Geen abonnement, geen verborgen kosten.",
};

const FEATURED_TIERS = [10, 25, 50, 100];

export default function PrijzenPage() {
  return (
    <>
      {/* Page hero */}
      <section className="py-16 bg-[var(--color-primary-700)] text-white">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              Transparante prijzen
            </span>
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
              €125. Alle functies. Geen verrassingen.
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Of je nu Lumio voor jezelf koopt of als benefit voor je medewerkers —
              de prijs is €125 per licentie, eenmalig. Geen abonnement, geen jaarkosten.
            </p>
            <div className="flex gap-4 mt-6 flex-wrap">
              <a
                href="#particulier"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold"
              >
                Voor mezelf
              </a>
              <a
                href="#werkgevers"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold"
              >
                Voor mijn organisatie
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Consumer pricing (id="particulier" is set inside the component) */}
      <ConsumerPricing />

      {/* B2B pricing */}
      <section id="werkgevers" className="py-20 bg-white">
        <Container>
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[var(--color-primary-600)] uppercase tracking-widest mb-2">
              Voor werkgevers
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-[var(--color-neutral-900)] mb-3">
              Licenties voor uw organisatie
            </h2>
            <p className="text-[var(--color-neutral-600)] max-w-xl mx-auto">
              €125 per medewerker, eenmalig. WKR-passend als personeelsvoorziening.
              Kies het pakket dat bij uw organisatie past.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_TIERS.map((users, i) => (
              <PricingCard key={users} users={users} highlighted={i === 1} />
            ))}
          </div>
          <p className="text-center text-sm text-[var(--color-neutral-600)] mt-8">
            Meer dan 100 medewerkers?{" "}
            <a href="/contact" className="text-[var(--color-primary-700)] font-semibold hover:underline">
              Neem contact op voor een maatwerkofferte
            </a>
          </p>
        </Container>
      </section>

      <SchaalTabel />
      <FaqAccordion />
      <CtaBanner />
    </>
  );
}
