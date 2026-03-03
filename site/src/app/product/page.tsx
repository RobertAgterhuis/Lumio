import NabestaandenSection from "@/components/sections/NabestaandenSection";
import ProductFeatureGrid from "@/components/sections/ProductFeatureGrid";
import PrivacyBlok from "@/components/sections/PrivacyBlok";
import WatIsLumio from "@/components/sections/WatIsLumio";
import CtaBanner from "@/components/sections/CtaBanner";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product – Alle functies van Lumio",
  description:
    "Ontdek alle functies van Lumio: testament, wilsverklaring, donorregistratie, digitale bezittingen, " +
    "videoboodschappen en meer. 100% offline, privacyveilig.",
  // SP-2-001: explicit OG for /product
  openGraph: {
    title: "Alle functies van Lumio — 100% offline en privacyveilig",
    description:
      "Testament, wilsverklaring, donorregistratie, digitale bezittingen en videoboodschappen op één veilige plek.",
    url: "https://www.lumio-legacy.nl/product",
  },
};

// SP-04-007: SoftwareApplication JSON-LD — enables Google rich results for the product
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lumio",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Windows, macOS",
  url: "https://www.lumio-legacy.nl/product",
  description:
    "Lumio helpt je testament, wilsverklaring, digitale bezittingen en noodcontacten veilig offline bijhouden. " +
    "€125 eenmalig, geen abonnement, geen cloud.",
  inLanguage: "nl-NL",
  offers: {
    "@type": "Offer",
    price: "125",
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "125",
      priceCurrency: "EUR",
      unitText: "eenmalig",
    },
    seller: { "@type": "Organization", name: "Lumio" },
    availability: "https://schema.org/InStock",
  },
};

export default function ProductPage() {
  return (
    <>
      {/* SP-04-007: SoftwareApplication JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      {/* Page hero */}
      <section className="py-16 bg-primary-700 text-white">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              Het product
            </span>
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
              Alles in één app — voor altijd beschikbaar
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Lumio biedt een compleet pakket aan functies voor persoonlijke levensplanning.
              Één aankoop, alle functies, geen abonnement, geen cloud.
            </p>
          </div>
        </Container>
      </section>

      <WatIsLumio />
      <ProductFeatureGrid />
      <NabestaandenSection />
      <PrivacyBlok />
      <CtaBanner />
    </>
  );
}
