import HrPitch from "@/components/sections/HrPitch";
import CfoPitch from "@/components/sections/CfoPitch";
import WkrUitleg from "@/components/sections/WkrUitleg";
import EmployerBranding from "@/components/sections/EmployerBranding";
import FaqAccordion from "@/components/sections/FaqAccordion";
import CtaBanner from "@/components/sections/CtaBanner";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voor werkgevers – Lumio als benefit",
  description:
    "Lumio als werkgeversvoordeel: WKR-passend, €125 per medewerker, geen implementatiekosten. " +
    "Lees de businesscase voor HR en finance.",
};

export default function WerkgeversPage() {
  return (
    <>
      {/* Page hero */}
      <section className="py-16 bg-[var(--color-primary-700)] text-white">
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
      <WkrUitleg />
      <FaqAccordion />
      <CtaBanner />
    </>
  );
}
