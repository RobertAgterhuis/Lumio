import Container from "@/components/layout/Container";

export default function WkrCallout() {
  return (
    <section className="py-12 bg-primary-100">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <p className="text-sm font-semibold text-(--color-primary-600) uppercase tracking-widest mb-1">
              Fiscaal slim geregeld
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-(--color-neutral-900)">
              Lumio past binnen uw WKR-vrije ruimte
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-12 shrink-0">
            {[
              { value: "€125", label: "per medewerker" },
              { value: "WKR", label: "passend als personeelsvoorziening" },
              { value: "100%", label: "aftrekbaar als bedrijfskosten" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="font-display text-3xl text-primary-700">
                  {item.value}
                </div>
                <div className="text-sm text-neutral-600 mt-1 max-w-30 mx-auto">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
