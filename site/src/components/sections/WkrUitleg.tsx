import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export default function WkrUitleg() {
  return (
    <section className="py-20 bg-white">
      <Container narrow>
        <SectionHeading
          badge="WKR uitgelegd"
          title="Hoe past Lumio in de Werkkostenregeling?"
          subtitle="De WKR biedt werkgevers een fiscale vrije ruimte voor onbelaste vergoedingen.
          Lumio past hier netjes in als personeelsvoorziening."
        />

        <div className="space-y-6 text-neutral-600 leading-relaxed">
          <div className="bg-(--color-primary-50) rounded-xl p-6 border-l-4 border-primary-700">
            <h3 className="font-semibold text-(--color-neutral-900) mb-2">
              Vrije ruimte 2026
            </h3>
            <p>
              U heeft als werkgever een vrije ruimte van <strong>2,00%</strong> over de eerste
              €400.000 loonsom en <strong>1,18%</strong> over het meerdere. Bij een loonsom van
              €1 miljoen bedraagt de vrije ruimte circa <strong>€13.060</strong> — ruim voldoende
              voor tientallen Lumio-licenties.
            </p>
          </div>

          <p>
            Lumio wordt aangeschaft als een <strong>personeelsvoorziening</strong>: een benefit dat
            op de werkplek of via het werk beschikbaar wordt gesteld. Denk aan een fitnessabonnement,
            bedrijfskantine of personeelsvereniging — Lumio valt in dezelfde fiscale categorie.
          </p>

          <p>
            Als de kosten van Lumio binnen uw vrije ruimte vallen, zijn er <strong>geen
            loonbelastinggevolgen</strong> voor u of uw medewerkers. De kosten zijn bovendien
            volledig aftrekbaar als bedrijfskosten.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> Bovenstaande is een vereenvoudigde weergave.
              Raadpleeg uw fiscaal adviseur voor de specifieke situatie van uw organisatie.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
