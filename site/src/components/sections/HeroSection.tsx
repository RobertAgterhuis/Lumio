"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { BUY_CONSUMER_HREF, BUY_EMPLOYER_HREF } from "@/lib/constants";
import { User, Users } from "lucide-react";

type Audience = "b2c" | "b2b";

const VARIANTS = {
  b2c: {
    badge: "Voor particulieren · €125 eenmalig · Offline & privé",
    headline: "Alles geregeld als het er echt toe doet",
    sub: (
      <>
        Lumio helpt je testament, wilsverklaring, digitale bezittingen en
        noodcontacten op één veilige plek te zetten — offline, privé, en klaar
        voor de mensen die jij vertrouwt.
      </>
    ),
    primaryLabel: "Koop nu — €125",
    primaryHref: BUY_CONSUMER_HREF,
    secondaryLabel: "Bekijk het product",
    secondaryHref: "/product",
    trust: "Eenmalig · geen abonnement · 100% offline · Windows & macOS",
  },
  b2b: {
    badge: "Voor werkgevers · WKR-passend · €125 per medewerker",
    headline: "Een benefit die echt iets betekent",
    sub: (
      <>
        Geef uw medewerkers rust en overzicht bij life events. WKR-passend,
        geen implementatieproject, geen IT-afdeling nodig — en zichtbaar modern
        werkgeverschap.
      </>
    ),
    primaryLabel: "Bekijk de businesscase",
    primaryHref: BUY_EMPLOYER_HREF,
    secondaryLabel: "Bereken uw ROI",
    secondaryHref: "/werkgevers#roi",
    trust: "WKR vrije ruimte · geen implementatiekosten · jaarlijks opzegbaar",
  },
} as const;

const TABS: { key: Audience; label: string; Icon: typeof User }[] = [
  { key: "b2c", label: "Voor mezelf", Icon: User },
  { key: "b2b", label: "Voor werkgevers", Icon: Users },
];

export default function HeroSection() {
  const [audience, setAudience] = useState<Audience>("b2c");

  // Auto-select B2B when navigating from /werkgevers context
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#werkgevers") {
      setAudience("b2b");
    }
  }, []);

  const v = VARIANTS[audience];

  return (
    <section className="relative overflow-hidden bg-primary-700 text-white">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-900 via-primary-700 to-primary-500 opacity-80" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">

          {/* Audience toggle tabs */}
          <div className="inline-flex rounded-full bg-white/10 p-1 mb-8">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setAudience(key)}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all",
                  audience === key
                    ? "bg-white text-primary-800 shadow"
                    : "text-white/80 hover:text-white",
                ].join(" ")}
                aria-pressed={audience === key}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {/* Badge */}
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-6 block">
            {v.badge}
          </span>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            {v.headline}
          </h1>

          {/* Sub-copy */}
          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-2xl">
            {v.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href={v.primaryHref} size="lg">
              {v.primaryLabel}
            </Button>
            <Button href={v.secondaryHref} variant="secondary" size="lg">
              {v.secondaryLabel}
            </Button>
          </div>

          {/* Trust strip */}
          <p className="mt-6 text-sm text-white/60">{v.trust}</p>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 0C480 0 240 60 0 30L0 60Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

