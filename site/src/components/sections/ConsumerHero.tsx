import Button from "@/components/ui/Button";

export default function ConsumerHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-primary-700)] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e33] via-[var(--color-primary-700)] to-[var(--color-primary-500)] opacity-80" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide mb-6">
            Eenmalig · €125 · Offline &amp; privé
          </span>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Alles geregeld als het er echt toe doet
          </h1>

          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-2xl">
            Lumio helpt jou je testament, wilsverklaring, digitale bezittingen en noodcontacten
            op één veilige plek te zetten — offline, privé, en klaar voor de mensen die je
            vertrouwt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/prijzen#particulier" size="lg">
              Koop Lumio — €125
            </Button>
            <Button href="/product" variant="secondary" size="lg">
              Bekijk alle functies
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 0C480 0 240 60 0 30L0 60Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
