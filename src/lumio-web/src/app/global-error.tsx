"use client";

import { useEffect, useState } from "react";

const messages = {
  nl: {
    titel: "Er is een kritieke fout opgetreden",
    beschrijving: "De applicatie kon niet worden geladen. Probeer het opnieuw.",
    opnieuw: "Opnieuw proberen",
  },
  en: {
    titel: "A critical error occurred",
    beschrijving: "The application could not be loaded. Please try again.",
    opnieuw: "Try again",
  },
} as const;

function getLocale(): "nl" | "en" {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lumio-locale");
    if (stored === "en") return "en";
  }
  return "nl";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale] = useState(getLocale);
  const t = messages[locale];

  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang={locale}>
      <body className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
            <svg
              className="h-8 w-8 text-danger"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {t.titel}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.beschrijving}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t.opnieuw}
          </button>
        </div>
      </body>
    </html>
  );
}
