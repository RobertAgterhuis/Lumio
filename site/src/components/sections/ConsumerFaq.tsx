"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { CONSUMER_FAQ_ITEMS } from "@/lib/constants";

export default function ConsumerFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <Container narrow>
        <SectionHeading
          badge="Veelgestelde vragen"
          title="Alles wat je wil weten"
          subtitle="Staat je vraag er niet tussen? Stuur een mail naar info@lumio.app."
          centered
        />

        <div className="space-y-3">
          {CONSUMER_FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-[var(--color-primary-50)] rounded-xl border border-[var(--color-primary-100)] overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
                onClick={() => setOpen(open === index ? null : index)}
                aria-expanded={open === index}
              >
                <span className="font-semibold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors">
                  {item.question}
                </span>
                <span className={`text-[var(--color-primary-600)] text-xl transition-transform duration-200 ${open === index ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>

              {open === index && (
                <div className="px-6 pb-6 text-[var(--color-neutral-600)] leading-relaxed border-t border-[var(--color-primary-100)] pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
