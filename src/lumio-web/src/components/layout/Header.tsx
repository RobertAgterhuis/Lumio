"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";
import { Lock, Search, UserCircle, Moon, Sun } from "lucide-react";
import { SearchDialog } from "./SearchDialog";

export function Header() {
  const { lock, activeProfile } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

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
            <UserCircle className="h-4 w-4" />
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
            <span className="hidden sm:inline">Zoeken</span>
            <kbd className="ml-1 hidden rounded border bg-muted px-1.5 py-0.5 text-xs sm:inline-block">
              Ctrl+K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Licht thema" : "Donker thema"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLock} className="gap-2">
            <Lock className="h-4 w-4" />
            Vergrendelen
          </Button>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
