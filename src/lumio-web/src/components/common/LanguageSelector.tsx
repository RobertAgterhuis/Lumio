"use client";

import { useCallback } from "react";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

function getCurrentLocale(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lumio-locale") ?? "nl";
  }
  return "nl";
}

export function LanguageSelector() {
  const current = getCurrentLocale();

  const handleChange = useCallback((locale: string) => {
    localStorage.setItem("lumio-locale", locale);
    window.location.reload();
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
