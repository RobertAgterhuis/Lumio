"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "next-intl";
import { Lock, Search, UserCircle, Moon, Sun, HelpCircle } from "lucide-react";
import Image from "next/image";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useHelpStore } from "@/stores/helpStore";
import { getChapterForRoute, helpChapters } from "@/content/help-chapters";

// Lazy-load SearchDialog to reduce initial bundle size
const SearchDialog = dynamic(() => import("./SearchDialog").then(m => m.SearchDialog), {
  ssr: false,
  loading: () => null,
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Static map of pathname prefixes → human-readable page titles.
 *  Used for the native OS window title (ALT+TAB / CMD+TAB). */
const ROUTE_TITLES: Record<string, string> = {
  "/dashboard":          "Dashboard",
  "/eigenaar":           "Mijn Profiel",
  "/testament":          "Testament",
  "/euthanasie":         "Wilsverklaring",
  "/donor":              "Donorregistratie",
  "/uitvaart":           "Uitvaartwensen",
  "/digitaal-bezit":     "Digitaal Bezit",
  "/boedel":             "Boedel",
  "/documenten":         "Documenten",
  "/erfgenamen":         "Erfgenamen",
  "/noodcontacten":      "Noodcontacten",
  "/tijdlijn":           "Tijdlijn",
  "/videoboodschappen":  "Videoboodschappen",
  "/instellingen":       "Instellingen",
  "/help":               "Help",
  "/export":             "Exporteren",
};

function getPageTitleForPath(pathname: string): string {
  for (const [prefix, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.includes(prefix)) return title;
  }
  return "Lumio";
}

export function Header() {
  const { lock, activeProfile, profileFotoVersion } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const t = useTranslations("common");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const { openPanel } = useHelpStore();

  // EL-6-04: Update the native OS window title on every route change.
  // Guard: window.lumio is undefined in browser mode — no-op there.
  useEffect(() => {
    if (typeof window === "undefined" || !window.lumio || !pathname) return;
    const pageTitle = getPageTitleForPath(pathname);
    const windowTitle = pageTitle === "Lumio" ? "Lumio" : `${pageTitle} — Lumio`;
    window.lumio.setWindowTitle(windowTitle);
  }, [pathname]);

  // Fetch profile photo when authenticated, or when the photo is updated elsewhere
  useEffect(() => {
    if (!activeProfile) { setFotoUrl(null); return; } // eslint-disable-line react-hooks/set-state-in-effect
    api.get<{ heeftProfielFoto?: boolean }>("/api/eigenaar")
      .then((data) => {
        setFotoUrl(data.heeftProfielFoto ? `${API_BASE}/api/eigenaar/foto?t=${Date.now()}` : null);
      })
      .catch((err) => console.error("Failed to load profile:", err));
  }, [activeProfile, profileFotoVersion]);

  const handleLock = async () => {
    try {
      await api.post("/api/auth/vergrendel");
    } catch {
      // Lock locally regardless
    }
    lock();
  };

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  // Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSearch]);

  return (
    <>
      <header
        className="flex h-16 items-center justify-between border-b border-border bg-primary px-6 text-primary-foreground"
        style={{ WebkitAppRegion: "drag" } as any}
      >
        {activeProfile ? (
          <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
            {fotoUrl ? (
              <Image
                src={fotoUrl}
                alt={activeProfile.naam}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-4 w-4" />
            )}
            <span>{activeProfile.naam}</span>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as any}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSearch}
            className="gap-2 border border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{t("zoeken")}</span>
            <kbd className="ml-1 hidden rounded border border-primary-foreground/25 bg-primary-foreground/10 px-1.5 py-0.5 text-xs sm:inline-block">
              Ctrl+K
            </kbd>
          </Button>
          <NotificationsDropdown />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const chapter = getChapterForRoute(pathname ?? "");
              openPanel(chapter?.slug ?? helpChapters[0].slug);
            }}
            title={t("hulp")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? t("lichtThema") : t("donkerThema")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLock}
            className="gap-2 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Lock className="h-4 w-4" />
            {t("vergrendelen")}
          </Button>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
