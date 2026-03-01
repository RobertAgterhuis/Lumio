import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { PRICE_PER_USER } from "@/lib/constants";
import { Check } from "lucide-react";

const FEATURES = [
  "Alle functies inbegrepen",
  "Levenslange licentie",
  "Geen abonnement ooit",
  "Gratis updates",
  "100% offline — geen account",
  "Windows & macOS",
];

export default function ConsumerPricing() {
  return (
    <section id="particulier" className="py-20 bg-(--color-primary-50)">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-primary-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-primary-700 text-white p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-2">
                Particulier
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl">€{PRICE_PER_USER}</span>
              </div>
              <p className="text-white/60 text-sm mt-1">eenmalig · geen abonnement</p>
            </div>

            {/* Features */}
            <div className="p-8">
              <ul className="space-y-3 mb-8">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-neutral-700">
                    <Check className="w-4 h-4 shrink-0 text-sage-600" strokeWidth={2.5} />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <Button href="mailto:info@lumio.app?subject=Lumio kopen&body=Ik wil graag een licentie aanschaffen." size="lg">
                Koop Lumio nu — €{PRICE_PER_USER}
              </Button>

              <p className="text-center text-xs text-neutral-400 mt-4">
                Je ontvangt de licentie en downloadlink per e-mail.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
