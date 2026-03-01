import ConsumerHero from "@/components/sections/ConsumerHero";
import ConsumerBenefits from "@/components/sections/ConsumerBenefits";
import ConsumerHoeWerktHet from "@/components/sections/ConsumerHoeWerktHet";
import NabestaandenSection from "@/components/sections/NabestaandenSection";
import WatIsLumio from "@/components/sections/WatIsLumio";
import ProductFeatureGrid from "@/components/sections/ProductFeatureGrid";
import PrivacyBlok from "@/components/sections/PrivacyBlok";
import ConsumerPricing from "@/components/sections/ConsumerPricing";
import ConsumerFaq from "@/components/sections/ConsumerFaq";
import CtaBanner from "@/components/sections/CtaBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voor jezelf — Lumio persoonlijke licentie",
  description:
    "Koop Lumio voor jezelf. Regel je testament, wilsverklaring, wachtwoorden en noodcontacten " +
    "op één veilige, offline plek. €125 eenmalig, geen abonnement.",
};

export default function VoorJezelfPage() {
  return (
    <>
      <ConsumerHero />
      <ConsumerBenefits />
      <ConsumerHoeWerktHet />
      <WatIsLumio />
      <ProductFeatureGrid />
      <NabestaandenSection />
      <PrivacyBlok />
      <ConsumerPricing />
      <ConsumerFaq />
      <CtaBanner />
    </>
  );
}
