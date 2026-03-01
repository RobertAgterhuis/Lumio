import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRODUCT_FEATURES } from "@/lib/constants";

export default function ProductFeatureGrid() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <SectionHeading
          badge="Alle functies"
          title="Alles wat uw medewerkers nodig hebben"
          subtitle="Lumio dekt de volledige levensplanning — van juridische documenten tot
          persoonlijke toegangscodes en videoboodschappen voor nabestaanden."
          centered
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-5 rounded-xl border border-primary-100 hover:bg-(--color-primary-50) transition-colors"
            >
              <feature.icon className="w-5 h-5 shrink-0 mt-0.5 text-primary-600" strokeWidth={1.5} />
              <div>
                <h3 className="font-semibold text-(--color-neutral-900) mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
