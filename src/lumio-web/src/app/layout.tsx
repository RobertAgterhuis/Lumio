import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ElectronThemeSync } from "@/components/electron/ElectronThemeSync";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang={locale} suppressHydrationWarning className={dmSans.variable}>
      <head>
{/* T-007 (GAP-SEC-04): 'unsafe-inline' removed from script-src — theme script is now external (/theme-init.js) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://app.posthog.com https://us.i.posthog.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        />
        {/* T-007: Synchronous external script — no async/defer keeps FOUC absent, no unsafe-inline needed */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* SC 2.4.1 — skip navigation link: visually hidden until focused by keyboard */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-[--base-primary-600] focus:px-4 focus:py-2 focus:text-white focus:shadow-md"
        >
          Ga naar hoofdinhoud
        </a>
        {/* Sync OS dark/light-mode changes into the renderer (Electron only, no-op in browser) */}
        <ElectronThemeSync />
        <LocaleProvider defaultLocale={locale} defaultMessages={messages as Record<string, unknown>}>
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
