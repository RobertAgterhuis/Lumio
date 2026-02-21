import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumio — Digitale Nalatenschap",
  description: "Beheer uw digitale nalatenschap veilig en offline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
