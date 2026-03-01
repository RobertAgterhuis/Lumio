import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import { EMPLOYEE_BENEFITS } from "@/lib/constants";

export default function FeatureCards() {
  return (
    <section className="py-20 bg-(--color-primary-50)">
      <Container>
        <SectionHeading
          badge="Voor uw medewerkers"
          title="Wat uw medewerkers eraan hebben"
          subtitle="Een benefit dat verder gaat dan geld. Lumio geeft medewerkers grip op de dingen
          die echt belangrijk zijn — zodat ze met minder zorgen kunnen werken."
          centered
        />

        <div className="grid md:grid-cols-3 gap-6">
          {EMPLOYEE_BENEFITS.map((benefit) => (
            <Card key={benefit.title}>
              <benefit.icon className="w-8 h-8 mb-4 text-primary-700" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-(--color-neutral-900) mb-2">
                {benefit.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
