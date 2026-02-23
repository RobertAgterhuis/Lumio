"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "next-intl";
import { Lock, Search, UserCircle, Moon, Sun } from "lucide-react";
import { SearchDialog } from "./SearchDialog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function Header() {
  const { lock, activeProfile } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const t = useTranslations("common");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Fetch profile photo when authenticated
  useEffect(() => {
    if (!activeProfile) return;
    api.get<{ heeftProfielFoto?: boolean }>("/api/eigenaar")
      .then((data) => {
        if (data.heeftProfielFoto) {
          setFotoUrl(`${API_BASE}/api/eigenaar/foto?t=${Date.now()}`);
        }
      })
      .catch(() => { /* no eigenaar yet */ });
  }, [activeProfile]);

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
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
        {activeProfile ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={activeProfile.naam}
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSearch}
            className="gap-2 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{t("zoeken")}</span>
            <kbd className="ml-1 hidden rounded border bg-muted px-1.5 py-0.5 text-xs sm:inline-block">
              Ctrl+K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? t("lichtThema") : t("donkerThema")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLock} className="gap-2">
            <Lock className="h-4 w-4" />
            {t("vergrendelen")}
          </Button>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
