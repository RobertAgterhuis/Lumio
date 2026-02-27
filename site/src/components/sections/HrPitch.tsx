import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HrPitch() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <SectionHeading
              badge="Voor HR & People"
              title="Ondersteuning bij de momenten die er écht toe doen"
              subtitle="Medewerkers die te maken krijgen met overlijden, ziekte of een
              familiecrisis hebben vaak geen idee waar ze moeten beginnen.
              Lumio helpt hen voorbereid te zijn."
            />

            <p className="text-[var(--color-neutral-600)] leading-relaxed mb-6">
              U hoeft geen nieuw programma op te tuigen. Lumio is een eenmalige aanschaf —
              geen beheersysteem, geen helpdesk-tickets, geen jaargesprekrekken over het gebruik.
              Medewerkers installeren de app zelf en bepalen zelf wat ze erin zetten.
            </p>

            <ul className="space-y-3">
              {[
                "Past naast bestaande vita- en gezondheidsvoordelen",
                "Geen implementatietraject of IT-afdeling nodig",
                "Eenvoudig te communiceren als betekenisvol benefit",
                "Versterkt employer branding richting nieuwe medewerkers",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[var(--color-neutral-600)]">
                  <span className="text-[var(--color-sage-600)] font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--color-primary-50)] rounded-2xl p-8 border border-[var(--color-primary-100)]">
            <p className="text-sm font-semibold text-[var(--color-primary-600)] uppercase tracking-widest mb-4">
              Wat uw medewerkers typerend vinden
            </p>
            <blockquote className="font-display text-xl text-[var(--color-neutral-900)] mb-6 leading-relaxed">
              "Ik had nooit nagedacht over mijn digitale wachtwoorden.
              Lumio hielp me in één middag alles te regelen."
            </blockquote>
            <cite className="text-sm text-[var(--color-neutral-600)] not-italic">
              — Oud-medewerker na gebruik van Lumio tijdens pilot
            </cite>
          </div>
        </div>
      </Container>
    </section>
  );
}
