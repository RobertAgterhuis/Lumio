import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/layout/Container";

export default function WatIsLumio() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <SectionHeading
              badge="Wat is Lumio?"
              title="Alles wat er toe doet, altijd bij de hand"
              subtitle="Lumio is een offline-first app waarmee medewerkers hun persoonlijke
              levensplanning veilig kunnen bijhouden. Geen cloud, geen abonnementen,
              geen wachtwoorden die verlopen — gewoon altijd beschikbaar."
            />

            <ul className="space-y-4 text-neutral-600">
              {[
                "Sla testament, wilsverklaring en donorkeuze op één plek op",
                "Beheer digitale bezittingen en toegangscodes veilig",
                "Videoboodschappen en noodcontacten voor nabestaanden",
                "100% offline — geen internetverbinding vereist",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-700" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 9 2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Illustration placeholder — purely decorative, hidden from assistive technology */}
          <div
            className="rounded-2xl overflow-hidden bg-(--color-primary-50) border border-primary-100 aspect-4/3 flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="text-center text-primary-500 p-8">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 96 96" stroke="currentColor" strokeWidth="1.5">
                <rect x="16" y="12" width="64" height="72" rx="6" />
                <line x1="28" y1="36" x2="68" y2="36" />
                <line x1="28" y1="48" x2="68" y2="48" />
                <line x1="28" y1="60" x2="52" y2="60" />
              </svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
