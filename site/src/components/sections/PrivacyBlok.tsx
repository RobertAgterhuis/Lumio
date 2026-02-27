import Container from "@/components/layout/Container";
import { WifiOff, EyeOff, KeyRound, ShieldCheck, type LucideIcon } from "lucide-react";

const PRIVACY_POINTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: WifiOff,     title: "100% offline",  text: "Data blijft altijd lokaal op het apparaat. Geen server, geen cloud, geen datalek." },
  { icon: EyeOff,     title: "Geen tracking", text: "Wij verzamelen geen gebruiksdata. Geen analytics, geen cookies, geen profiling." },
  { icon: KeyRound,   title: "Eigen sleutels", text: "Alles is versleuteld met de PIN van de medewerker zelf. Lumio kan er niet bij." },
  { icon: ShieldCheck, title: "AVG-proof",     text: "Omdat er geen persoonsgegevens naar onze servers gaan, is Lumio inherent AVG-compliant." },
];

export default function PrivacyBlok() {
  return (
    <section className="py-20 bg-[var(--color-primary-50)]">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Icon grid */}
          <div className="grid grid-cols-2 gap-5">
            {PRIVACY_POINTS.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 border border-[var(--color-primary-100)]">
                <item.icon className="w-6 h-6 mb-3 text-[var(--color-primary-700)]" strokeWidth={1.5} />
                <h4 className="font-semibold text-[var(--color-neutral-900)] mb-1">{item.title}</h4>
                <p className="text-sm text-[var(--color-neutral-600)] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Text */}
          <div>
            <span className="inline-flex rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] px-3 py-1 text-xs font-semibold tracking-wide mb-4">
              Privacy by design
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-[var(--color-neutral-900)] mb-5 leading-tight">
              Medewerkers' privégegevens blijven van henzelf
            </h2>
            <p className="text-[var(--color-neutral-600)] leading-relaxed mb-6">
              Lumio is bewust offline-first gebouwd. Gevoelige informatie zoals testamenten,
              wachtwoorden en wilsverklaringen hoort niet in de cloud. Lumio slaat alle
              gegevens lokaal op het apparaat op, versleuteld met de eigen PIN van de gebruiker.
            </p>
            <p className="text-[var(--color-neutral-600)] leading-relaxed">
              U hoeft als werkgever geen bewerkersovereenkomst af te sluiten — er gaan simpelweg
              geen persoonsgegevens van uw medewerkers naar Lumio.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
