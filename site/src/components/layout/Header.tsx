"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "./Container";
import { NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary-700 font-display text-2xl font-normal tracking-tight">
            <img src="/logo.svg" alt="" width={28} height={28} className="w-7 h-7" />
            Lumio
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 hover:text-primary-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/prijzen"
              className="rounded-sm bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-600) transition-colors"
            >
              Aan de slag
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-neutral-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Menu sluiten" : "Menu openen"}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-primary-100 py-4">
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium py-1 text-neutral-700 hover:text-primary-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/prijzen"
                className="mt-2 inline-flex justify-center rounded-sm bg-primary-700 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Aan de slag
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
