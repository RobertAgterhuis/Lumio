import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

const STATS = [
  { value: "78%", label: "van werknemers overweegt te vertrekken bij een werkgever die geen aandacht heeft voor hun welzijn" },
  { value: "3×", label: "meer impact op retentie dan een salarisverhoging volgens Gallup onderzoek" },
  { value: "€0", label: "implementatiekosten — geen IT, geen training, geen helpdesk" },
];

export default function EmployerBranding() {
  return (
    <section className="py-20 bg-primary-700 text-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeading
              badge="Employer branding"
              title="Laat zien dat u om uw mensen geeft"
              titleClassName="text-white"
            />
            <p className="text-white/80 leading-relaxed mb-6">
              De arbeidsmarkt is krap. Medewerkers kiezen steeds meer voor werkgevers
              die investeren in hun welzijn — ook buiten kantooruren. Lumio is een
              tastbaar signaal: <em>wij denken aan u, ook als het moeilijk wordt.</em>
            </p>
            <p className="text-white/80 leading-relaxed mb-8">
              Op het moment dat een medewerker te maken krijgt met een overlijden,
              ernstige ziekte of een andere levensgebeurtenis, is het te laat om te
              beginnen met plannen. Lumio zet die stap al vooruit.
            </p>
            <Button href="/contact" size="lg">
              Vraag een pilot aan
            </Button>
          </div>

          <div className="grid gap-5">
            {STATS.map((stat) => (
              <div key={stat.value} className="flex gap-5 bg-white/10 backdrop-blur rounded-xl p-5">
                <div className="font-display text-3xl text-primary-100 shrink-0 w-16 text-center">
                  {stat.value}
                </div>
                <p className="text-white/80 text-sm leading-relaxed self-center">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
