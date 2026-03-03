import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumio voor werkgevers — Eén-pagina overzicht",
  description:
    "Download of print het Lumio werkgevers-overzicht: WKR-info, ROI-model, module-overzicht en contactgegevens op één A4.",
  robots: { index: false, follow: false },
};

/**
 * Standalone layout for the one-pager: no site header/footer,
 * clean white background optimised for print / PDF export.
 */
export default function OnePagerLayout({ children }: { children: ReactNode }) {
  return <div className="bg-white">{children}</div>;
}
