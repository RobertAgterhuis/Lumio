import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import { BUY_CONSUMER_HREF } from "@/lib/constants";

export default function CtaBanner() {
  return (
    <section className="py-20 bg-primary-700">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start md:divide-x md:divide-white/20">
          {/* Consumer */}
          <div className="text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
              Voor particulieren
            </p>
            <h2 className="font-display text-2xl md:text-3xl mb-3">
              Koop Lumio voor jezelf
            </h2>
            <p className="text-white/75 text-base mb-6 leading-relaxed">
              €125 eenmalig. Alle functies inbegrepen, geen abonnement ooit.
              Je ontvangt de licentie en downloadlink direct per e-mail.
            </p>
            <Button href={BUY_CONSUMER_HREF} size="lg">
              Koop nu &mdash; &euro;125
            </Button>
          </div>

          {/* B2B */}
          <div className="text-white md:pl-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
              Voor werkgevers
            </p>
            <h2 className="font-display text-2xl md:text-3xl mb-3">
              Bied Lumio aan aan uw medewerkers
            </h2>
            <p className="text-white/75 text-base mb-6 leading-relaxed">
              Start met een gratis pilot. Geen verplichtingen, geen
              implementatiekosten. WKR-passend, €125 per medewerker.
            </p>
            <Button href="/contact" variant="ghost" size="lg" className="text-white! hover:bg-white/15!">
              Vraag een gratis pilot aan
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

