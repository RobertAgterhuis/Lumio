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
};

export default function HomePage() {
  return (
    <>
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
