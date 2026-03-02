import Container from "@/components/layout/Container";
import { KeyRound, Users, Lock, type LucideIcon } from "lucide-react";

const HOW_IT_WORKS: { step: string; title: string; body: string; icon: LucideIcon }[] = [
  {
    step: "01",
    icon: KeyRound,
    title: "Noodcodes verdelen",
    body: "De gebruiker verdeelt zijn toegangscodes wiskundig over zijn erfgenamen. Elke erfgenaam ontvangt één unieke noodcode — onbruikbaar zonder de anderen.",
  },
  {
    step: "02",
    icon: Users,
    title: "Drempel bereiken",
    body: "Pas als een vooraf bepaald minimaal aantal naasten hun code invoert, wordt toegang verleend. Eén code alleen opent nooit het profiel.",
  },
  {
    step: "03",
    icon: Lock,
    title: "Alleen-lezen toegang",
    body: "Nabestaanden zien alles wat er geregeld is: documenten, wensen, videoboodschappen. Niets kan worden gewijzigd of verwijderd.",
  },
];

export default function NabestaandenSection() {
  return (
    <section className="py-20 bg-primary-700 text-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Left — text */}
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-5">
              Nabestaanden-modus
            </span>
            <h2 className="font-display text-3xl md:text-4xl mb-5 leading-tight">
              Toegang voor naasten — op het juiste moment, op de juiste manier
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Wanneer iemand overlijdt, regelt Lumio de toegang voor nabestaanden via{" "}
              <strong className="text-white">Shamir noodcodes</strong> — een wiskundige methode
              waarbij de toegangssleutel wiskundig wordt opgesplitst over meerdere erfgenamen.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Geen enkel familielid kan ongeautoriseerd toegang krijgen. Pas als de afgesproken
              drempel — bijvoorbeeld drie van de vijf erfgenamen — hun code invoert, wordt het
              profiel ontgrendeld. Dit geeft zowel de gebruiker als de nabestaanden zekerheid.
            </p>

            {/* Trust signals */}
            <div className="space-y-3">
              {[
                "Mathematisch bewezen: geen enkele combinatie onder de drempel werkt",
                "Alle data blijft lokaal — ook de noodcodes worden nooit naar een server gestuurd",
                "Begeleide wizard helpt nabestaanden stap voor stap door het proces",
              ].map((point) => (
                <div key={point} className="flex gap-3 items-start">
                  <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 3L5 9 2 6" />
                    </svg>
                  </span>
                  <span className="text-white/85 text-sm leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — how it works */}
          <div className="space-y-5">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">
              Hoe het werkt
            </p>
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }) => (
              <div
                key={step}
                className="flex gap-4 p-5 rounded-xl bg-white/10 border border-white/10"
              >
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-white/80 tabular-nums">{step}</span>
                  <Icon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-white/85 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
