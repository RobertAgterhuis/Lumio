import HrPitch from "@/components/sections/HrPitch";
import CfoPitch from "@/components/sections/CfoPitch";
import WkrUitleg from "@/components/sections/WkrUitleg";
import EmployerBranding from "@/components/sections/EmployerBranding";
import FaqAccordion from "@/components/sections/FaqAccordion";
import ExperimentCtaBanner from "@/components/sections/ExperimentCtaBanner";
import RoiCalculator from "@/components/sections/RoiCalculator";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voor werkgevers – Lumio als benefit",
  description:
    "Lumio als werkgeversvoordeel: WKR-passend, €125 per medewerker, geen implementatiekosten. " +
    "Lees de businesscase voor HR en finance.",
  // SP-2-001: explicit B2B OG for /werkgevers
  openGraph: {
    title: "Lumio voor werkgevers — WKR-passend benefit €125 p.p.",
    description:
      "Bied medewerkers rust en overzicht bij life events. WKR-passend, geen implementatieproject, €125 per medewerker.",
    url: "https://www.lumio-legacy.nl/werkgevers",
  },
};

// SP-2-002: WebPage JSON-LD for /werkgevers
const werkgeversJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Voor werkgevers – Lumio als benefit",
  url: "https://www.lumio-legacy.nl/werkgevers",
  description:
    "Lumio als WKR-passend werkgeversvoordeel. €125 per medewerker, geen implementatiekosten.",
  inLanguage: "nl-NL",
  isPartOf: { "@type": "WebSite", name: "Lumio", url: "https://www.lumio-legacy.nl" },
};

export default function WerkgeversPage() {
  return (
    <>
      {/* SP-2-002: WebPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(werkgeversJsonLd) }}
      />
      {/* Page hero */}
      <section className="py-16 bg-primary-700 text-white">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              Voor werkgevers
            </span>
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
              Een benefit dat uw medewerkers nooit vergeten
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Lumio helpt medewerkers voorbereid te zijn op de grote momenten in het leven.
              Zinvol, fiscaal slim en eenvoudig te implementeren.
            </p>
          </div>
        </Container>
      </section>

      <HrPitch />
      <EmployerBranding />
      <CfoPitch />
      <RoiCalculator />
      <WkrUitleg />
      <FaqAccordion />

      {/* One-pager download strip */}
      <section className="py-10 bg-(--color-primary-50) border-t border-primary-100">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-semibold text-(--color-neutral-900)">
                Alles op één pagina
              </p>
              <p className="text-sm text-neutral-600">
                Download de Lumio-one-pager voor HR en Finance — printklaar als PDF.
              </p>
            </div>
            <a
              href="/werkgevers/one-pager"
              className="shrink-0 inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 transition-colors text-white font-semibold rounded-lg px-6 py-3 text-sm"
            >
              Bekijk de one-pager →
            </a>
          </div>
        </Container>
      </section>

      {/* EXP-003: A/B CTA — control: pilot aanvragen | variant: demo plannen */}
      <ExperimentCtaBanner />
    </>
  );
}
