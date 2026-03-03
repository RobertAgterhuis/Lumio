import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacyverklaring – Lumio",
  description:
    "Lees hoe Lumio uw persoonsgegevens verwerkt, welke rechtsgronden van toepassing zijn " +
    "en welke rechten u heeft op grond van de AVG.",
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-10">
    <h2 className="font-display text-2xl text-(--color-neutral-900) mb-4">{title}</h2>
    <div className="space-y-3 text-neutral-700 leading-relaxed">{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <>
      {/* Page hero */}
      <section className="py-16 bg-primary-700 text-white">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              Juridisch
            </span>
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
              Privacyverklaring
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Lumio verwerkt uitsluitend de persoonsgegevens die noodzakelijk zijn om u en uw
              nabestaanden te ondersteunen bij de afwikkeling van uw nalatenschap.
            </p>
            <p className="text-white/60 text-sm mt-4">
              Versie 1.1 — Ingangsdatum: 1 januari 2025 — Laatste update: 1 maart 2026
            </p>
          </div>
        </Container>
      </section>

      <div className="py-16">
        <Container narrow>
          {/* 1. Verwerkingsverantwoordelijke */}
          <Section title="1. Verwerkingsverantwoordelijke">
            <p>
              De verwerkingsverantwoordelijke in de zin van artikel 4 lid 7 AVG is:
            </p>
            <address className="not-italic bg-(--color-primary-50) border border-primary-100 rounded-lg p-4 text-sm">
              <strong>Lumio B.V.</strong> (in oprichting)<br />
              KvK-nummer: [in te vullen na inschrijving]<br />
              E-mail: <a href="mailto:privacy@lumio.app" className="text-primary-700 underline">privacy@lumio.app</a>
            </address>
            <p>
              Voor vragen of verzoeken over de verwerking van uw persoonsgegevens kunt u contact
              opnemen via bovenstaand e-mailadres.
            </p>
          </Section>

          {/* 2. Welke gegevens verwerken wij? */}
          <Section title="2. Welke persoonsgegevens verwerken wij?">
            <p>
              Lumio verwerkt de volgende categorieën persoonsgegevens:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Identificatiegegevens:</strong> naam, geboortedatum, adres, telefoonnummer,
                e-mailadres en burgerservicenummer (BSN).*
              </li>
              <li>
                <strong>Financiële gegevens:</strong> IBAN-nummers, polisgegevens, assetinventaris
                (bankrekeningen, onroerend goed, beleggingen).
              </li>
              <li>
                <strong>Gezondheidsgegevens (artikel 9 AVG):</strong> donorregistratiewensen,
                euthanasie-wensen en medische wensen die u zelf invoert ten behoeve van uw wilsbeschikking.*
              </li>
              <li>
                <strong>Accountgegevens:</strong> e-mailadres, wachtwoord-hash (versleuteld
                opgeslagen via SQLCipher AES-256).
              </li>
              <li>
                <strong>Gebruiksgegevens:</strong> anonieme telemetrie voor foutopsporing
                (geen persoonsgegevens).
              </li>
            </ul>
            <p className="text-sm text-neutral-500 bg-(--color-primary-50) border border-primary-100 rounded-lg p-4">
              * BSN-verwerking vindt uitsluitend lokaal (on-device) plaats t.b.v. validatie conform
              de Wet BSN. Gezondheidsgegevens worden verwerkt op grond van uw <strong>uitdrukkelijke
              toestemming</strong> (art. 9 lid 2 sub a AVG), die u intrekt door de betreffende
              gegevens te verwijderen of uw account op te heffen.
            </p>
          </Section>

          {/* 3. Rechtsgronden */}
          <Section title="3. Rechtsgronden voor verwerking">
            <p>
              Wij baseren de verwerking van uw persoonsgegevens op de volgende rechtsgronden
              (artikel 6 AVG):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-100 text-neutral-800">
                    <th className="text-left p-3 font-semibold">Verwerkingsdoel</th>
                    <th className="text-left p-3 font-semibold">Rechtsgrond</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  <tr>
                    <td className="p-3">Uitvoering van de overeenkomst (gebruik van de app)</td>
                    <td className="p-3">Art. 6 lid 1 sub b AVG — uitvoering overeenkomst</td>
                  </tr>
                  <tr>
                    <td className="p-3">Opslag van gezondheidsgegevens en wilsbeschikkingen</td>
                    <td className="p-3">Art. 9 lid 2 sub a AVG — uitdrukkelijke toestemming</td>
                  </tr>
                  <tr>
                    <td className="p-3">BSN-validatie (mod-11, lokaal)</td>
                    <td className="p-3">Art. 6 lid 1 sub c AVG — wettelijke verplichting</td>
                  </tr>
                  <tr>
                    <td className="p-3">Beveiliging en fraudepreventie</td>
                    <td className="p-3">Art. 6 lid 1 sub f AVG — gerechtvaardigd belang</td>
                  </tr>
                  <tr>
                    <td className="p-3">Naleving fiscale en wettelijke bewaarplichten</td>
                    <td className="p-3">Art. 6 lid 1 sub c AVG — wettelijke verplichting</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* 4. Bewaartermijnen */}
          <Section title="4. Bewaartermijnen">
            <p>
              Lumio bewaart persoonsgegevens niet langer dan noodzakelijk voor het doel waarvoor
              ze zijn verzameld:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Accountgegevens:</strong> voor de duur van het actieve account. Na
                opzegging worden gegevens binnen 30 dagen verwijderd.
              </li>
              <li>
                <strong>Nalatenschapsgegevens:</strong> uitsluitend zolang u deze actief
                in de applicatie bewaart. Lumio heeft géén kopie op centrale servers.
              </li>
              <li>
                <strong>Gezondheidsgegevens:</strong> worden verwerkt en opgeslagen op uw
                eigen apparaat (on-device); Lumio heeft er geen toegang toe.
              </li>
              <li>
                <strong>Wettelijke bewaarplicht:</strong> factuur- en abonnementsgegevens
                worden 7 jaar bewaard conform artikel 52 AWR.
              </li>
            </ul>
          </Section>

          {/* 5. Gegevensdeling */}
          <Section title="5. Doorgeven van gegevens aan derden">
            <p>
              Lumio verkoopt uw persoonsgegevens niet en deelt ze uitsluitend met derden wanneer
              dit noodzakelijk is:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Verwerkers:</strong> hosting- en infrastructuurpartners (EU-gebaseerd)
                die handelen op grond van een verwerkersovereenkomst conform artikel 28 AVG.
              </li>
              <li>
                <strong>Wettelijke verplichtingen:</strong> indien een bevoegde autoriteit Lumio
                verplicht tot het verstrekken van gegevens.
              </li>
              <li>
                <strong>Notarissen / uitvoerders (optioneel):</strong> uitsluitend na uw
                uitdrukkelijke, specifieke toestemming en op uw initiatief via de deelfunctie.
              </li>
            </ul>
            <p>
              Nalatenschaps- en gezondheidsgegevens worden opgeslagen in een versleutelde
              lokale database (SQLCipher AES-256) op uw apparaat. Lumio heeft hier geen toegang
              toe en kan deze gegevens niet inzien of herstellen als u uw wachtwoord verliest.
            </p>
          </Section>

          {/* 6. Beveiliging */}
          <Section title="6. Beveiliging van uw gegevens">
            <p>
              Lumio treft passende technische en organisatorische maatregelen conform artikel 32
              AVG:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>End-to-end encryptie:</strong> uw database is versleuteld met SQLCipher
                AES-256; de sleutel wordt afgeleid van uw wachtwoord via PBKDF2-SHA512 (600.000
                iteraties).
              </li>
              <li>
                <strong>Wachtwoordbeveiliging:</strong> uw master-wachtwoord wordt nooit in
                plaintext opgeslagen. Het wordt tijdelijk in geheugen gehouden als byte-array en
                direct gewist na gebruik.
              </li>
              <li>
                <strong>Transport:</strong> alle communicatie verloopt via TLS 1.3.
              </li>
              <li>
                <strong>Toegangsbeheer:</strong> productiesystemen zijn uitsluitend bereikbaar
                via multi-factor authenticatie.
              </li>
            </ul>
          </Section>

          {/* 7. Uw rechten */}
          <Section title="7. Uw rechten als betrokkene">
            <p>
              Op grond van de AVG heeft u de volgende rechten. U kunt ze uitoefenen via{" "}
              <a href="mailto:privacy@lumio.app" className="text-primary-700 underline font-semibold">
                privacy@lumio.app
              </a>
              . Wij reageren binnen 4 weken (art. 12 lid 3 AVG).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-100 text-neutral-800">
                    <th className="text-left p-3 font-semibold">Recht</th>
                    <th className="text-left p-3 font-semibold">Artikel AVG</th>
                    <th className="text-left p-3 font-semibold">Toelichting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  <tr>
                    <td className="p-3 font-medium">Inzage</td>
                    <td className="p-3">Art. 15</td>
                    <td className="p-3">Overzicht van uw verwerkte gegevens opvragen</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Rectificatie</td>
                    <td className="p-3">Art. 16</td>
                    <td className="p-3">Onjuiste gegevens laten corrigeren</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Verwijdering</td>
                    <td className="p-3">Art. 17</td>
                    <td className="p-3">Recht op vergetelheid — gegevens laten wissen</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Beperking</td>
                    <td className="p-3">Art. 18</td>
                    <td className="p-3">Verwerking tijdelijk laten beperken</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Overdraagbaarheid</td>
                    <td className="p-3">Art. 20</td>
                    <td className="p-3">Uw gegevens in machineleesbaar formaat ontvangen</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Bezwaar</td>
                    <td className="p-3">Art. 21</td>
                    <td className="p-3">Bezwaar maken tegen verwerking op grond van gerechtvaardigd belang</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Toestemming intrekken</td>
                    <td className="p-3">Art. 7 lid 3</td>
                    <td className="p-3">Gegeven toestemming (incl. art. 9) te allen tijde intrekken</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              U kunt tevens een klacht indienen bij de{" "}
              <strong>Autoriteit Persoonsgegevens</strong> (AP) via{" "}
              <a
                href="https://www.autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 underline"
              >
                autoriteitpersoonsgegevens.nl
              </a>
              .
            </p>
          </Section>

          {/* 8. Cookies */}
          <Section title="8. Cookies en tracking">
            <p>
              De marketingwebsite (lumio-legacy.nl) gebruikt <strong>geen analytics-,
              advertising- of profilerende cookies</strong>. Er worden uitsluitend technisch
              noodzakelijke cookies geplaatst (sessie- en taalvoorkeur).
              Lumio gebruikt geen externe trackingdiensten op de marketingwebsite.
            </p>
            <p>
              De Lumio-applicatie (desktop/web-app) maakt gebruik van{" "}
              <strong>PostHog Analytics</strong> (EU-regio, eu.i.posthog.com) voor minimale,
              geanonimiseerde gebruikstelemetrie. Dit betreft uitsluitend gedragspatronen — geen
              persoonsgegevens, geen gezondheidsgegevens, geen sessie-opnames. De volgende
              maatregelen zijn van kracht:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Alleen één expliciet event (<code>lumio_activated</code>) — geen automatische paginaregistratie</li>
              <li>Gevoelige URL-paden (<code>/euthanasie</code>, <code>/testament</code>, etc.) worden geredigeerd vóór verzending</li>
              <li>Geen koppeling aan persoonlijke identificatoren (naam, e-mail, BSN)</li>
              <li>Auto-capture en session recording zijn uitgeschakeld</li>
              <li>Browser <strong>Do Not Track (DNT)</strong> wordt gerespecteerd — analytics worden overgeslagen als DNT actief is</li>
            </ul>
            <p>
              U kunt app-analytics uitschakelen door <strong>Do Not Track</strong> in uw browser
              in te schakelen.
            </p>
          </Section>

          {/* 9. Minderjarigen */}
          <Section title="9. Minderjarigen">
            <p>
              Lumio is niet bestemd voor personen jonger dan 18 jaar. Wij verzamelen niet
              bewust persoonsgegevens van minderjarigen. Als u vermoedt dat een minderjarige
              een account heeft aangemaakt, neem dan contact op via privacy@lumio.app.
            </p>
          </Section>

          {/* 10. Wijzigingen */}
          <Section title="10. Wijzigingen in deze verklaring">
            <p>
              Lumio behoudt zich het recht voor deze privacyverklaring te wijzigen. Bij
              wezenlijke wijzigingen informeert Lumio u via het e-mailadres dat u heeft
              opgegeven. De actuele versie is altijd beschikbaar op deze pagina.
            </p>
          </Section>

          {/* Footer nav */}
          <div className="pt-8 border-t border-primary-100 text-sm text-neutral-500">
            <p>
              Vragen over dit beleid?{" "}
              <a href="mailto:privacy@lumio.app" className="text-primary-700 underline">
                privacy@lumio.app
              </a>
              {" "}·{" "}
              <a href="/contact" className="text-primary-700 underline">
                Pilot aanvragen
              </a>
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
