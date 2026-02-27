import Link from "next/link";
import Container from "@/components/layout/Container";
import { Users, User } from "lucide-react";

export default function AudienceSplit() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[var(--color-primary-600)] uppercase tracking-widest mb-3">
            Voor wie is Lumio?
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-[var(--color-neutral-900)]">
            Kies jouw situatie
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* B2C card */}
          <Link
            href="/voor-jezelf"
            className="group relative flex flex-col gap-5 rounded-2xl border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-8 hover:border-[var(--color-primary-400)] hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-700)] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-primary-600)] uppercase tracking-widest mb-0.5">Particulier</p>
                <h3 className="text-xl font-semibold text-[var(--color-neutral-900)]">Ik koop het voor mezelf</h3>
              </div>
            </div>

            <p className="text-[var(--color-neutral-600)] leading-relaxed">
              Zorg dat testament, wilsverklaring, wachtwoorden en noodcontacten geregeld zijn
              — veilig opgeslagen op jouw eigen apparaat, voor de mensen die jij vertrouwt.
            </p>

            <div className="flex flex-wrap gap-2">
              {["€125 eenmalig", "Geen abonnement", "100% offline"].map((tag) => (
                <span key={tag} className="text-xs font-medium bg-white border border-[var(--color-primary-200)] text-[var(--color-primary-700)] rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>

            <span className="text-sm font-semibold text-[var(--color-primary-700)] group-hover:underline mt-auto">
              Meer over Lumio voor particulieren →
            </span>
          </Link>

          {/* B2B card */}
          <Link
            href="/werkgevers"
            className="group relative flex flex-col gap-5 rounded-2xl border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-8 hover:border-[var(--color-primary-400)] hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-700)] flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-primary-600)] uppercase tracking-widest mb-0.5">Werkgever</p>
                <h3 className="text-xl font-semibold text-[var(--color-neutral-900)]">Ik bied het aan aan mijn medewerkers</h3>
              </div>
            </div>

            <p className="text-[var(--color-neutral-600)] leading-relaxed">
              Geef uw medewerkers een betekenisvol benefit. WKR-passend, geen implementatieproject,
              geen IT-afdeling nodig — en zichtbaar modern werkgeverschap.
            </p>

            <div className="flex flex-wrap gap-2">
              {["WKR-passend", "€125 per medewerker", "Geen implementatie"].map((tag) => (
                <span key={tag} className="text-xs font-medium bg-white border border-[var(--color-primary-200)] text-[var(--color-primary-700)] rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>

            <span className="text-sm font-semibold text-[var(--color-primary-700)] group-hover:underline mt-auto">
              Meer over Lumio als werkgeversvoordeel →
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
