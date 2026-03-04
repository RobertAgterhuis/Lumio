import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ElectronThemeSync } from "@/components/electron/ElectronThemeSync";
import { SkipNavLink } from "@/components/layout/SkipNavLink";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumio — Digitale Nalatenschap",
  description: "Beheer uw digitale nalatenschap veilig en offline",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <head>
{/*
          CSP NOTE: Next.js with `output: "export"` (static) injects inline hydration scripts at build time.
          A nonce-based or hash-based strict CSP requires a server runtime (middleware), which is unavailable
          here. 'unsafe-inline' is therefore retained for script-src. All other directives enforce meaningful
          restrictions: connect-src limits exfiltration, frame-ancestors prevents clickjacking,
          object-src/base-uri prevent plugin and base-tag injection.
          TODO: migrate to SSR (remove output:"export") to enable nonce-based strict CSP.
        */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://eu.i.posthog.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        />
        {/* T-007: Synchronous external script — no async/defer keeps FOUC absent, no unsafe-inline needed */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Sync OS dark/light-mode changes into the renderer (Electron only, no-op in browser) */}
        <ElectronThemeSync />
        <LocaleProvider defaultLocale={locale} defaultMessages={messages as Record<string, unknown>}>
          {/* SC 2.4.1 — skip navigation link (inside LocaleProvider for i18n) */}
          <SkipNavLink />
          <PostHogProvider>
            {/* id="main-content" is the skip-nav target (SC 2.4.1); tabIndex={-1} allows programmatic focus */}
            <div id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </div>
          </PostHogProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
