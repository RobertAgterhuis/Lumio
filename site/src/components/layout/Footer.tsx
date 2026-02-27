import Link from "next/link";
import Container from "./Container";
import { NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-primary-900)] text-[var(--color-primary-200)]">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <span className="flex items-center gap-2 font-display text-xl text-white">
                <img src="/logo.svg" alt="" width={24} height={24} className="w-6 h-6" />
                Lumio
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-primary-300)]">
                Rust en overzicht voor iedereen bij wat er echt toe doet — voor jezelf of voor je medewerkers.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                Navigatie
              </p>
              <ul className="mt-4 space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                Aan de slag
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/voor-jezelf"
                  className="inline-block rounded-[var(--radius-sm)] bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-500)] transition-colors text-center"
                >
                  Koop voor jezelf →
                </Link>
                <Link
                  href="/contact"
                  className="inline-block rounded-[var(--radius-sm)] border border-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-200)] hover:bg-[var(--color-primary-800)] transition-colors text-center"
                >
                  Pilot voor uw organisatie →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-[var(--color-primary-800)] pt-6 flex flex-col sm:flex-row justify-between gap-3">
            <p className="text-xs text-[var(--color-primary-400)]">
              © {year} Lumio. Alle rechten voorbehouden.
            </p>
            <p className="text-xs text-[var(--color-primary-400)]">
              Offline-first · Privé · Veilig
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
