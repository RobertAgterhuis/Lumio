import Container from "@/components/layout/Container";
import type { Metadata } from "next";
import { PRICE_PER_USER, SCALE_TIERS } from "@/lib/constants";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Lumio voor werkgevers – One-pager",
  description:
    "Eén pagina met alles wat HR en Finance nodig heeft: wat is Lumio, wat kost het, " +
    "hoe past het in de WKR en waarom willen uw medewerkers het.",
};

const DIFFERENTIATORS = [
  {
    icon: "🔒",
    title: "100% offline & versleuteld",
    body: "Alle data blijft op het apparaat van de medewerker. Geen cloud, geen server, geen inzage voor de werkgever. AVG-compliant by design.",
  },
  {
    icon: "🧩",
    title: "Shamir nabestaanden-modus",
    body: "Noodcodes worden wiskundig opgesplitst over erfgenamen. Pas wanneer de drempel bereikt is, kunnen naasten toegang krijgen — niet eerder.",
  },
  {
    icon: "💼",
    title: "WKR-passend",
    body: "Lumio kwalificeert als personeelsvoorziening onder de WKR. Eenmalige aanschaf van €125 per medewerker — geen abonnement, geen jaarkosten.",
  },
  {
    icon: "⚙️",
    title: "Geen implementatietraject",
    body: "Medewerkers installeren de app zelf. Geen IT-afdeling nodig, geen beheerinterface, geen helpdesk-tickets.",
  },
];

const HR_USE_CASES = [
  "Medewerker krijgt diagnosed met ernstige ziekte: Lumio is al ingevuld.",
  "Overlijden van ouder of partner: erfgenamen hebben directe toegang tot wat er geregeld is.",
  "Scheiding of opname in zorginstelling: digitale bezittingen en wachtwoorden zijn veilig overdraagbaar.",
  "Medewerker met verzuim door 'administratieve chaos' na overlijden in gezin: Lumio had dit voorkomen.",
];

export default function OnePagerPage() {
  return (
    <div className="bg-white print:bg-white">
      {/* Print button — hidden in print */}
      <div className="print:hidden bg-(--color-primary-50) border-b border-primary-100 py-3">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">
              <strong>One-pager</strong> — Sla op als PDF via <em>Bestand → Afdrukken → Sla op als PDF</em>
            </p>
            <PrintButton />
          </div>
        </Container>
      </div>

      <div className="py-12 print:py-8">
        <Container>
          {/* Header */}
          <div className="flex items-start justify-between gap-8 mb-10 pb-8 border-b border-primary-100">
            <div className="flex-1">
              <div className="inline-flex rounded-full bg-primary-100 text-primary-700 px-3 py-1 text-xs font-semibold tracking-wide mb-4">
                Voor werkgevers — Lumio
              </div>
              <h1 className="font-display text-4xl print:text-3xl text-(--color-neutral-900) leading-tight mb-3">
                Geef uw medewerkers de rust<br />die ze verdienen.
              </h1>
              <p className="text-lg text-neutral-600 max-w-xl leading-relaxed">
                Lumio helpt medewerkers hun testament, digitale bezittingen en noodcontacten veilig
                te regelen — offline, versleuteld en volledig privé. Eenmalig €{PRICE_PER_USER} per
                medewerker, WKR-passend.
              </p>
            </div>
            <div className="shrink-0 text-right hidden md:block print:block">
              <div className="inline-block bg-primary-700 text-white rounded-2xl px-8 py-6 text-center">
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Prijs per medewerker</p>
                <p className="font-display text-5xl print:text-4xl mb-1">€{PRICE_PER_USER}</p>
                <p className="text-white/70 text-sm">eenmalig, geen abonnement</p>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-10 mb-10">
            {/* Left: differentiators */}
            <div>
              <h2 className="font-display text-xl text-(--color-neutral-900) mb-5">
                Vier redenen waarom Lumio anders is
              </h2>
              <div className="space-y-5">
                {DIFFERENTIATORS.map((d) => (
                  <div key={d.title} className="flex gap-4">
                    <span className="text-2xl shrink-0 mt-0.5">{d.icon}</span>
                    <div>
                      <p className="font-semibold text-(--color-neutral-900) mb-0.5">{d.title}</p>
                      <p className="text-sm text-neutral-600 leading-relaxed">{d.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: use cases + pricing */}
            <div>
              <h2 className="font-display text-xl text-(--color-neutral-900) mb-5">
                Wanneer is Lumio het verschil?
              </h2>
              <ul className="space-y-3 mb-8">
                {HR_USE_CASES.map((uc) => (
                  <li key={uc} className="flex gap-3 text-sm text-neutral-600">
                    <span className="text-sage-600 font-bold shrink-0">→</span>
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing table */}
              <h2 className="font-display text-xl text-(--color-neutral-900) mb-4">
                Schaalvoordelen
              </h2>
              <table className="w-full text-sm border border-primary-100 rounded-xl overflow-hidden">
                <thead className="bg-primary-700 text-white">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">Medewerkers</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Totaal</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Per licentie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {SCALE_TIERS.map((tier) => (
                    <tr key={tier.users}>
                      <td className="px-4 py-2.5 font-medium text-(--color-neutral-900)">
                        {tier.users} medewerkers
                      </td>
                      <td className="px-4 py-2.5 text-right text-(--color-neutral-900)">
                        €{tier.total.toLocaleString("nl-NL")}
                      </td>
                      <td className="px-4 py-2.5 text-right text-neutral-600">
                        €{PRICE_PER_USER}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WKR callout */}
          <div className="bg-(--color-primary-50) border border-primary-100 rounded-2xl p-6 mb-10">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                {
                  label: "WKR-categorie",
                  value: "Personeels­voorziening",
                  note: "geen loonheffing voor medewerker",
                },
                { label: "Fiscale behandeling", value: "100% aftrekbaar", note: "als bedrijfskosten" },
                {
                  label: "Implementatie­kosten",
                  value: "€0",
                  note: "geen IT, geen beheer, geen helpdesk",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-semibold text-(--color-primary-600) uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="font-display text-xl text-primary-700 mb-0.5">{item.value}</p>
                  <p className="text-xs text-neutral-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer / CTA */}
          <div className="flex items-center justify-between gap-6 pt-6 border-t border-primary-100">
            <div>
              <p className="font-semibold text-(--color-neutral-900) mb-0.5">Interesse? Vraag een gratis pilot aan.</p>
              <p className="text-sm text-neutral-600">
                Tot 10 licenties, 30 dagen, inclusief persoonlijke begeleiding bij de introductie.
              </p>
            </div>
            <div className="shrink-0 text-right print:block">
              <p className="text-sm font-semibold text-primary-700">lumio-legacy.nl/contact</p>
              <p className="text-sm text-neutral-500">info@lumio.app</p>
            </div>
          </div>

          {/* Legal footer */}
          <p className="text-xs text-neutral-400 mt-6 print:mt-4">
            WKR-percentages gebaseerd op wetgeving 2026 (2,00% over eerste €400.000 loonsom, 1,18% daarboven).
            Lumio BV geeft geen fiscaal- of juridisch advies. Raadpleeg uw belastingadviseur voor uw specifieke situatie.
            Een notarieel testament blijft vereist voor juridische geldigheid conform BW Boek 4.
          </p>
        </Container>
      </div>
    </div>
  );
}
