"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { FAQ_ITEMS } from "@/lib/constants";

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-(--color-primary-50)">
      <Container narrow>
        <SectionHeading
          badge="FAQ"
          title="Veelgestelde vragen"
          subtitle="Heeft u een vraag die hier niet tussen staat? Neem gerust contact met ons op."
          centered
        />

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-primary-100 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
                onClick={() => setOpen(open === index ? null : index)}
                aria-expanded={open === index}
              >
                <span className="font-semibold text-(--color-neutral-900) group-hover:text-primary-700 transition-colors">
                  {item.question}
                </span>
                <span
                  className={`text-(--color-primary-600) text-xl transition-transform duration-200 ${
                    open === index ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              {open === index && (
                <div className="px-6 pb-6 text-neutral-600 leading-relaxed border-t border-primary-100 pt-4">
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
