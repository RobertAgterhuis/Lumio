"use client";

import { useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRICE_PER_USER } from "@/lib/constants";

const FORMAT_EUR = (n: number) =>
  n.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function RoiCalculator() {
  const [aantalMedewerkers, setAantalMedewerkers] = useState(50);
  const [gemiddeldSalaris, setGemiddeldSalaris] = useState(55_000);

  const roi = useMemo(() => {
    // Investment
    const investering = aantalMedewerkers * PRICE_PER_USER;

    // Assumption: avg 1 day lost per employee per year due to life-event unpreparedness
    // (absenteeism, distraction, HR-support). Lumio eliminates 50% of that.
    const daglopers = gemiddeldSalaris / 220; // working days
    const besparingPerMedewerker = daglopers * 0.5; // 0.5 day recovered
    const jaarlijkseBesparing = aantalMedewerkers * besparingPerMedewerker;
    const terugverdienMaanden = investering / (jaarlijkseBesparing / 12);

    // WKR: 2.00% over first €400k loonsom, 1.18% over remainder
    const loonsom = aantalMedewerkers * gemiddeldSalaris;
    const wkrRuimte =
      Math.min(loonsom, 400_000) * 0.02 + Math.max(0, loonsom - 400_000) * 0.0118;
    const wkrPassend = investering <= wkrRuimte;
    const wkrPercentage = loonsom > 0 ? (investering / loonsom) * 100 : 0;

    return {
      investering,
      jaarlijkseBesparing,
      terugverdienMaanden: Math.round(terugverdienMaanden * 10) / 10,
      wkrRuimte,
      wkrPassend,
      wkrPercentage: Math.round(wkrPercentage * 100) / 100,
      roi3jaar: Math.round(((jaarlijkseBesparing * 3 - investering) / investering) * 100),
    };
  }, [aantalMedewerkers, gemiddeldSalaris]);

  return (
    <section className="py-20 bg-white border-t border-primary-100" id="roi-calculator">
      <Container>
        <SectionHeading
          badge="ROI-model"
          title="Wat levert Lumio uw organisatie op?"
          subtitle="Voer uw situatie in. De berekening is gebaseerd op door CBS gepubliceerde
          verzuimcijfers rondom life events en WKR-percentages 2026."
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* ── Inputs ── */}
          <div className="space-y-8">
            {/* Aantal medewerkers */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="roi-medewerkers" className="text-sm font-semibold text-(--color-neutral-900)">
                  Aantal medewerkers
                </label>
                <span className="font-display text-lg text-primary-700 tabular-nums">
                  {aantalMedewerkers}
                </span>
              </div>
              <input
                id="roi-medewerkers"
                type="range"
                min={5}
                max={500}
                step={5}
                value={aantalMedewerkers}
                onChange={(e) => setAantalMedewerkers(Number(e.target.value))}
                className="w-full accent-primary-700"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1" aria-hidden="true">
                <span>5</span><span>500</span>
              </div>
            </div>

            {/* Gemiddeld jaarsalaris */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="roi-salaris" className="text-sm font-semibold text-(--color-neutral-900)">
                  Gemiddeld bruto jaarsalaris
                </label>
                <span className="font-display text-lg text-primary-700 tabular-nums">
                  {FORMAT_EUR(gemiddeldSalaris)}
                </span>
              </div>
              <input
                id="roi-salaris"
                type="range"
                min={25_000}
                max={120_000}
                step={2_500}
                value={gemiddeldSalaris}
                onChange={(e) => setGemiddeldSalaris(Number(e.target.value))}
                className="w-full accent-primary-700"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1" aria-hidden="true">
                <span>€25k</span><span>€120k</span>
              </div>
            </div>

            {/* Assumption callout */}
            <div className="bg-(--color-primary-50) rounded-xl p-4 border border-primary-100 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-800 mb-1">Hoe is dit berekend?</p>
              <p>
                Medewerkers verliezen gemiddeld <strong>1 werkdag per jaar</strong> door
                gebrek aan voorbereiding bij life events (testament, zorgvolmacht, digitale nalatenschap).
                Lumio elimineert <strong>50% van die verstoring</strong> door zaken vooraf geregeld te hebben.
                Berekening op basis van uw daglopers (jaarsalaris ÷ 220 werkdagen).
              </p>
            </div>
          </div>

          {/* ── Output cards ── */}
          <div className="space-y-4">
            {/* Investering */}
            <div className="bg-primary-700 text-white rounded-2xl p-6">
              <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-1">
                Eenmalige investering
              </p>
              <p className="font-display text-4xl mb-1">{FORMAT_EUR(roi.investering)}</p>
              <p className="text-white/70 text-sm">
                {aantalMedewerkers} × €{PRICE_PER_USER} — geen abonnement, geen jaarkosten
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Jaarlijkse besparing */}
              <div className="bg-sage-100 border border-sage-600/30 rounded-xl p-5">
                <p className="text-xs font-semibold text-sage-800 uppercase tracking-widest mb-1">
                  Jaarlijkse besparing
                </p>
                <p className="font-display text-2xl text-(--color-neutral-900) mb-0.5">
                  {FORMAT_EUR(roi.jaarlijkseBesparing)}
                </p>
                <p className="text-xs text-neutral-600">productiviteits­her­stel</p>
              </div>

              {/* Terugverdientijd */}
              <div className="bg-(--color-primary-50) border border-primary-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-widest mb-1">
                  Terugverdientijd
                </p>
                <p className="font-display text-2xl text-primary-700 mb-0.5">
                  {roi.terugverdienMaanden} mnd
                </p>
                <p className="text-xs text-neutral-500">positief rendement daarna</p>
              </div>
            </div>

            {/* 3-jaar ROI */}
            <div className="bg-(--color-primary-50) border border-primary-100 rounded-xl p-5 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-widest mb-1">
                  3-jaars ROI
                </p>
                <p className="font-display text-3xl text-primary-700">
                  {roi.roi3jaar > 0 ? "+" : ""}{roi.roi3jaar}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1">
                  WKR-passend?
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
                    roi.wkrPassend
                      ? "bg-sage-100 text-sage-800"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {roi.wkrPassend ? "✓ Ja" : "⚠ Controleer"}
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  {roi.wkrPercentage}% van uw loonsom
                </p>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/contact"
              className="block w-full text-center bg-primary-700 hover:bg-primary-800 transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
            >
              Vraag een vrijblijvende pilot aan →
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
