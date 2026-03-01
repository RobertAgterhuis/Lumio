"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const DemoModal = dynamic(() => import("./DemoModal"), { ssr: false });

interface Props {
  /** Visual variant: "nav" for the header link, "hero" for a big CTA button */
  variant?: "nav" | "hero";
  label?: string;
  className?: string;
}

export default function DemoButton({
  variant = "nav",
  label = "Demo bekijken",
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const baseNav =
    "text-sm font-semibold text-primary-700 bg-(--color-primary-50) hover:bg-primary-100 px-3 py-1 rounded-full transition-colors";

  const baseHero =
    "inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-base font-semibold text-white hover:bg-primary-800 transition-colors shadow-lg";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className ?? (variant === "hero" ? baseHero : baseNav)}
      >
        {variant === "hero" && (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        )}
        {label}
      </button>

      {open && <DemoModal onClose={() => setOpen(false)} />}
    </>
  );
}
