import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import { CONSUMER_BENEFITS } from "@/lib/constants";

export default function ConsumerBenefits() {
  return (
    <section className="py-20 bg-[var(--color-primary-50)]">
      <Container>
        <SectionHeading
          badge="Waarom Lumio?"
          title="Jij regelt het. Je naasten hoeven het niet uit te zoeken."
          subtitle="Lumio is voor iedereen die ooit heeft gedacht: 'ik moet dat eigenlijk eens regelen.' Geen abonnement, geen cloud — gewoon een app die doet wat nodig is."
          centered
        />

        <div className="grid md:grid-cols-3 gap-6">
          {CONSUMER_BENEFITS.map((benefit) => (
            <Card key={benefit.title}>
              <benefit.icon className="w-8 h-8 mb-4 text-[var(--color-primary-700)]" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[var(--color-neutral-900)] mb-2">
                {benefit.title}
              </h3>
              <p className="text-[var(--color-neutral-600)] leading-relaxed">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
