import ContactForm from "@/components/sections/ContactForm";
import Container from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Pilot aanvragen",
  description:
    "Vraag een gratis Lumio pilot aan voor uw organisatie. Tot 10 licenties, 30 dagen, " +
    "inclusief persoonlijke begeleiding.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page hero */}
      <section className="py-16 bg-primary-700 text-white">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              Contact
            </span>
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">
              Vraag een gratis pilot aan
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Start vandaag met een vrijblijvende pilot voor uw team. Geen implementatiekosten,
              geen contracten — gewoon uitproberen.
            </p>
          </div>
        </Container>
      </section>

      <ContactForm />

      {/* Direct contact */}
      <section className="py-16 bg-(--color-primary-50) border-t border-primary-100">
        <Container narrow>
          <div className="text-center">
            <h2 className="font-display text-2xl text-(--color-neutral-900) mb-3">
              Liever direct contact?
            </h2>
            <p className="text-neutral-600 mb-6">
              Stuur een e-mail naar{" "}
              <a href="mailto:info@lumio.app" className="text-primary-700 font-semibold hover:underline">
                info@lumio.app
              </a>{" "}
              — we reageren binnen één werkdag.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
