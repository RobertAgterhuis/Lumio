import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

export default function CtaBanner() {
  return (
    <section className="py-20 bg-[var(--color-primary-700)]">
      <Container>
        <div className="text-center text-white max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Klaar om Lumio aan te bieden aan uw medewerkers?
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Start met een gratis pilot voor uw team. Geen verplichtingen,
            geen implementatiekosten. We begeleiden u van aanvraag tot eerste gebruik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" size="lg">
              Vraag een gratis pilot aan
            </Button>
            <Button href="/prijzen" variant="ghost" size="lg" className="!text-white hover:!bg-white/15">
              Bekijk de prijzen
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
