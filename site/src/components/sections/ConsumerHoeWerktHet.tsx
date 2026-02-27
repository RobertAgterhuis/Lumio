import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { CONSUMER_HOW_IT_WORKS } from "@/lib/constants";

export default function ConsumerHoeWerktHet() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <SectionHeading
          badge="Zo werkt het"
          title="Drie stappen, dan is alles geregeld"
          subtitle="Lumio is gebouwd om snel en zonder instructie in gebruik te nemen."
          centered
        />

        <div className="grid md:grid-cols-3 gap-8 mt-4">
          {CONSUMER_HOW_IT_WORKS.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-700)] text-white flex items-center justify-center text-xl font-bold font-display mb-5">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-neutral-900)] mb-2">
                {step.title}
              </h3>
              <p className="text-[var(--color-neutral-600)] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
