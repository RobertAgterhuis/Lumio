"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { DemoShell } from "./DemoShell";

interface Props {
  onClose: () => void;
}

export default function DemoModal({ onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    /* Backdrop — fixed, full-screen, scrollable */
    <div
      className="fixed inset-0 z-200 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Inner wrapper — min-h-full so clicking empty space still triggers onClose */}
      <div
        className="flex min-h-full items-center justify-center p-4 md:p-8"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative w-full max-w-6xl">
          {/* Close button — sits inside the card area, top-right corner */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="Demo sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Demo shell */}
          <DemoShell />
        </div>
      </div>
    </div>
  );
}
