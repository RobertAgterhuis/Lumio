import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRICE_PER_USER, SCALE_TIERS } from "@/lib/constants";

export default function CfoPitch() {
  return (
    <section className="py-20 bg-[var(--color-primary-50)]">
      <Container>
        <SectionHeading
          badge="Voor Finance & Control"
          title="De businesscase in één oogopslag"
          subtitle={`Lumio kost €${PRICE_PER_USER} per medewerker — eenmalig, geen abonnement.
          Fiscaal passend als personeelsvoorziening binnen de WKR-vrije ruimte.`}
        />

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Kosten per medewerker",
              value: `€${PRICE_PER_USER}`,
              sub: "eenmalig, geen jaarlijkse kosten",
            },
            {
              label: "WKR-categorie",
              value: "Personeels­voorziening",
              sub: "geen loonheffing, telt mee vrije ruimte",
            },
            {
              label: "Fiscale behandeling",
              value: "100% aftrekbaar",
              sub: "als gerichte vrijstelling of vrije ruimte",
            },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-6 border border-[var(--color-primary-100)] text-center">
              <p className="text-xs font-semibold text-[var(--color-neutral-600)] uppercase tracking-widest mb-2">
                {item.label}
              </p>
              <p className="font-display text-2xl text-[var(--color-primary-700)] mb-1">{item.value}</p>
              <p className="text-sm text-[var(--color-neutral-600)]">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Scale table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[var(--color-primary-100)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-primary-700)] text-white">
              <tr>
                <th className="text-left px-6 py-4 font-semibold">Medewerkers</th>
                <th className="text-right px-6 py-4 font-semibold">Totaalprijs</th>
                <th className="text-right px-6 py-4 font-semibold">Prijs per licentie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-primary-100)]">
              {SCALE_TIERS.map((tier) => (
                <tr key={tier.users} className="hover:bg-[var(--color-primary-50)] transition-colors">
                  <td className="px-6 py-4 text-[var(--color-neutral-900)] font-medium">{tier.users} medewerkers</td>
                  <td className="px-6 py-4 text-right text-[var(--color-neutral-900)]">€{tier.total.toLocaleString("nl-NL")}</td>
                  <td className="px-6 py-4 text-right text-[var(--color-neutral-600)]">
                    €{PRICE_PER_USER} p.p.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
