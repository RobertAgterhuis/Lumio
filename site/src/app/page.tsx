import HeroSection from "@/components/sections/HeroSection";
import AudienceSplit from "@/components/sections/AudienceSplit";
import WatIsLumio from "@/components/sections/WatIsLumio";
import ProductFeatureGrid from "@/components/sections/ProductFeatureGrid";
import PrivacyBlok from "@/components/sections/PrivacyBlok";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CtaBanner from "@/components/sections/CtaBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumio — Alles geregeld als het er echt toe doet",
  description:
    "Lumio helpt je testament, wilsverklaring, digitale bezittingen en noodcontacten veilig offline bijhouden. " +
    "Voor particulieren en als werkgeversvoordeel. €125 eenmalig, geen abonnement.",
  // SP-2-001: explicit OG title/description for homepage (overrides B2B layout default)
  openGraph: {
    title: "Lumio — Alles geregeld als het er echt toe doet",
    description:
      "Veilig en offline: testament, wilsverklaring, digitale bezittingen en noodcontacten op één plek. " +
      "€125 eenmalig, geen cloud, geen abonnement.",
    url: "https://www.lumio-legacy.nl",
  },
};

// SP-2-002: WebPage JSON-LD for the homepage
const homepageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Lumio — Alles geregeld als het er echt toe doet",
  url: "https://www.lumio-legacy.nl",
  description:
    "Lumio helpt je testament, wilsverklaring, digitale bezittingen en noodcontacten veilig offline bijhouden. €125 eenmalig.",
  inLanguage: "nl-NL",
  isPartOf: { "@type": "WebSite", name: "Lumio", url: "https://www.lumio-legacy.nl" },
};

export default function HomePage() {
  return (
    <>
      {/* SP-2-002: WebPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <HeroSection />
      <div id="voor-wie">
        <AudienceSplit />
      </div>
      <WatIsLumio />
      <ProductFeatureGrid />
      <PrivacyBlok />
      <TestimonialsSection />
      <CtaBanner />
    </>
  );
}
