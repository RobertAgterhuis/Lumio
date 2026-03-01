import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import { EMPLOYER_BENEFITS } from "@/lib/constants";

export default function WerkgeversVoordelen() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <SectionHeading
          badge="Voor u als werkgever"
          title="Zichtbaar modern werkgeverschap"
          subtitle="Lumio positioneert u als een werkgever die verder kijkt dan vandaag.
          Met één eenvoudige aanschaf — fiscaal slim, zonder IT-rompslomp."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {EMPLOYER_BENEFITS.map((benefit) => (
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
