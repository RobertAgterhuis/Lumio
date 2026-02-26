import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
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
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("lumio-theme");if(t==="dark"||(t==null&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}if(localStorage.getItem("lumio-grote-tekst")==="true"){document.documentElement.classList.add("grote-tekst")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LocaleProvider defaultLocale={locale} defaultMessages={messages as Record<string, unknown>}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
