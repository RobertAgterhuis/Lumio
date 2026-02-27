import { DemoShell } from "@/components/demo/DemoShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live demo — Lumio in actie",
  description:
    "Bekijk hoe Lumio werkt met vooringevulde demodata. Stap in de schoenen van de eigenaar of " +
    "van een erfgenaam — geen account nodig.",
};

export default function DemoPage() {
  return (
    <div className="py-10 bg-[var(--color-background)]">
      <DemoShell />
    </div>
  );
}

