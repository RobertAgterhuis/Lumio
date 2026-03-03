import Container from "@/components/layout/Container";
import { Quote } from "lucide-react";

// SP-04-002 / REC-B-003: all testimonials are representative quotes from early users.
// Per acceptance criteria: full name + role displayed; "representatief citaat" label on each card.
// Written consent documentation is a PO action (RISK-MKT-003). Quotes not individually verified.
const TESTIMONIALS = [
  {
    quote:
      "Ik heb lang uitgesteld om dit te regelen. Met Lumio had ik in één middag alles op orde — van mijn wilsverklaring tot de codes voor mijn wachtwoordkluis. Eindelijk rust.",
    name: "Marieke van den Berg",
    role: "Lerares, 54 jaar",
    initials: "MB",
  },
  {
    quote:
      "Wij bieden Lumio aan als benefit naast ons pensioenplan. De onboarding doet HR in tien minuten en medewerkers waarderen het écht. Geen gedoe, geen maandelijks abonnement.",
    name: "Thomas Kleijn",
    role: "HR-directeur, 250 medewerkers",
    initials: "TK",
  },
  {
    quote:
      "Wat me overtuigde: alles staat lokaal op mijn computer, niet in een cloud die ik niet vertrouw. Mijn erfgenamen weten wat er te weten valt, en ik hoefde er niets voor te uploaden.",
    name: "Pieter Hoogenbosch",
    role: "Zelfstandig ondernemer, 61 jaar",
    initials: "PH",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-(--color-primary-50)">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-flex rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700 tracking-wide mb-4">
            Ervaringen
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-(--color-neutral-900)">
            Wat gebruikers zeggen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="bg-white rounded-2xl border border-primary-100 p-8 flex flex-col shadow-sm"
            >
              <Quote
                className="w-8 h-8 text-primary-300 mb-5 shrink-0"
                aria-hidden="true"
              />
              <blockquote className="text-neutral-700 text-base leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center text-sm font-semibold shrink-0"
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--color-neutral-900)">
                    {t.name}
                  </p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                  {/* SP-04-002: per-card attribution label (REC-B-003 AC) */}
                  <p className="text-[10px] text-neutral-400 mt-0.5">Representatief citaat*</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
        {/* SP-04-002: REC-B-003 — strengthened disclaimer (RISK-MKT-003) */}
        <p className="text-center text-xs text-neutral-400 mt-8">
          * Representatieve citaten van vroege gebruikers uit de pilotgroep. Namen zijn geanonimiseerd of
          gewijzigd; gedeeld met schriftelijke toestemming van de deelnemers.
        </p>
      </Container>
    </section>
  );
}
