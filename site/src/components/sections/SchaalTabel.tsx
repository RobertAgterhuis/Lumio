"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { calcWkrRuimte, PRICE_PER_USER } from "@/lib/constants";

export default function SchaalTabel() {
  const [loonsom, setLoonsom] = useState(500000);

  const wkrRuimte = calcWkrRuimte(loonsom);
  const maxUsers = Math.floor(wkrRuimte / PRICE_PER_USER);

  return (
    <section className="py-20 bg-white">
      <Container>
        <SectionHeading
          badge="WKR calculator"
          title="Hoeveel medewerkers past binnen uw vrije ruimte?"
          subtitle="Bereken snel hoeveel Lumio-licenties u kunt aanbieden binnen uw WKR-vrije ruimte."
        />

        {/* Calculator */}
        <div className="bg-(--color-primary-50) rounded-2xl p-8 border border-primary-100 mb-12 max-w-2xl">
          <label className="block text-sm font-semibold text-(--color-neutral-900) mb-2">
            Totale loonsom (exclusief btw)
          </label>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={50000}
            value={loonsom}
            onChange={(e) => setLoonsom(Number(e.target.value))}
            className="w-full accent-primary-700 mb-3"
          />
          <div className="flex justify-between text-sm text-neutral-600 mb-6">
            <span>€100.000</span>
            <span className="font-semibold text-(--color-neutral-900)">
              €{loonsom.toLocaleString("nl-NL")}
            </span>
            <span>€5.000.000</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-primary-100 text-center">
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">WKR vrije ruimte</p>
              <p className="font-display text-2xl text-primary-700">
                €{Math.round(wkrRuimte).toLocaleString("nl-NL")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-primary-100 text-center">
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">Max. Lumio licenties</p>
              <p className="font-display text-2xl text-primary-700">
                {maxUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Static table explanation */}
        <p className="text-sm text-neutral-600">
          * Berekening op basis van WKR 2026: 2,00% over eerste €400.000 + 1,18% over het meerdere.
          Raadpleeg uw fiscaal adviseur voor uw specifieke situatie.
        </p>
      </Container>
    </section>
  );
}
