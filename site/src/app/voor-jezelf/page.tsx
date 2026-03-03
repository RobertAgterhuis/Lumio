import ConsumerHero from "@/components/sections/ConsumerHero";
import ConsumerBenefits from "@/components/sections/ConsumerBenefits";
import ConsumerHoeWerktHet from "@/components/sections/ConsumerHoeWerktHet";
import NabestaandenSection from "@/components/sections/NabestaandenSection";
import WatIsLumio from "@/components/sections/WatIsLumio";
import ProductFeatureGrid from "@/components/sections/ProductFeatureGrid";
import PrivacyBlok from "@/components/sections/PrivacyBlok";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ConsumerPricing from "@/components/sections/ConsumerPricing";
import ConsumerFaq from "@/components/sections/ConsumerFaq";
import CtaBanner from "@/components/sections/CtaBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voor jezelf — Lumio persoonlijke licentie",
  description:
    "Koop Lumio voor jezelf. Regel je testament, wilsverklaring, wachtwoorden en noodcontacten " +
    "op één veilige, offline plek. €125 eenmalig, geen abonnement.",
  // SP-2-001: explicit B2C OG for /voor-jezelf
  openGraph: {
    title: "Lumio voor jezelf — €125 eenmalig, alles geregeld",
    description:
      "Testament, wilsverklaring, noodcontacten en digitale bezittingen veilig offline bijhouden. " +
      "Eenmalig €125, geen abonnement, geen cloud.",
    url: "https://www.lumio-legacy.nl/voor-jezelf",
  },
};

// SP-2-002: WebPage JSON-LD for /voor-jezelf
const voorJezelfJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Voor jezelf — Lumio persoonlijke licentie",
  url: "https://www.lumio-legacy.nl/voor-jezelf",
  description:
    "Koop Lumio voor jezelf. €125 eenmalig. Veilige offline opslag van testament, wilsverklaring en noodgegevens.",
  inLanguage: "nl-NL",
  isPartOf: { "@type": "WebSite", name: "Lumio", url: "https://www.lumio-legacy.nl" },
};

export default function VoorJezelfPage() {
  return (
    <>
      {/* SP-2-002: WebPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(voorJezelfJsonLd) }}
      />
      <ConsumerHero />
      <ConsumerBenefits />
      <ConsumerHoeWerktHet />
      <WatIsLumio />
      <ProductFeatureGrid />
      <NabestaandenSection />
      <PrivacyBlok />
      <TestimonialsSection />
      <ConsumerPricing />
      <ConsumerFaq />
      <CtaBanner />
    </>
  );
}
