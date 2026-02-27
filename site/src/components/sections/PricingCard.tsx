import Button from "@/components/ui/Button";
import { PRICE_PER_USER } from "@/lib/constants";

interface PricingCardProps {
  users: number;
  highlighted?: boolean;
}

export default function PricingCard({ users, highlighted = false }: PricingCardProps) {
  const total = users * PRICE_PER_USER;

  return (
    <div
      className={`rounded-2xl p-8 flex flex-col h-full border transition-shadow hover:shadow-lg ${
        highlighted
          ? "bg-[var(--color-primary-700)] text-white border-[var(--color-primary-600)]"
          : "bg-white border-[var(--color-primary-100)] text-[var(--color-neutral-900)]"
      }`}
    >
      {highlighted && (
        <span className="inline-flex self-start text-xs font-semibold bg-white/20 text-white rounded-full px-3 py-1 mb-4">
          Meest gekozen
        </span>
      )}

      <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${highlighted ? "text-white/70" : "text-[var(--color-neutral-600)]"}`}>
        {users} medewerkers
      </p>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-display text-4xl">€{total.toLocaleString("nl-NL")}</span>
        <span className={`text-sm ${highlighted ? "text-white/60" : "text-[var(--color-neutral-600)]"}`}>eenmalig</span>
      </div>

      <p className={`text-sm mb-6 ${highlighted ? "text-white/70" : "text-[var(--color-neutral-600)]"}`}>
        €{PRICE_PER_USER} per medewerker · geen jaarkosten
      </p>

      <ul className={`space-y-2 text-sm mb-8 flex-1 ${highlighted ? "text-white/80" : "text-[var(--color-neutral-600)]"}`}>
        {["Alle functies inbegrepen", "Levenslange licentie", "Geen abonnement", "Gratis updates", "Onboarding handleiding"].map((f) => (
          <li key={f} className="flex gap-2">
            <span className={highlighted ? "text-[var(--color-primary-100)]" : "text-[var(--color-sage-600)]"}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Button href="/contact" variant={highlighted ? "secondary" : "primary"} size="md">
        Vraag een pilot aan
      </Button>
    </div>
  );
}
