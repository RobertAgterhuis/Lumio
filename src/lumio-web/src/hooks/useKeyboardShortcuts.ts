"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api-client";

const NAV_SHORTCUTS: Record<string, string> = {
  d: "/dashboard",
  p: "/eigenaar",
  t: "/testament",
  w: "/euthanasie",
  o: "/donor",
  b: "/digitaal-bezit",
  e: "/boedel",
  u: "/uitvaart",
  f: "/documenten",
  r: "/erfgenamen",
  n: "/noodcontacten",
  x: "/export",
  a: "/audit-log",
  i: "/instellingen",
};

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { lock } = useAuthStore();
  const gPressed = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Reset g-mode if user is typing
        gPressed.current = false;
        return;
      }

      // Ctrl+L — Lock
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        api.post("/api/auth/vergrendel").catch((err) => console.error("Failed to lock via API:", err));
        lock();
        return;
      }

      // Ctrl+N — New item (opens add dialog, context-dependent)
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        // Dispatch custom event that pages can listen to
        window.dispatchEvent(new CustomEvent("lumio:new-item"));
        return;
      }

      // ? — Show shortcuts help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("lumio:show-shortcuts"));
        return;
      }

      // G + letter navigation
      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (gPressed.current) return; // Already in g-mode
        gPressed.current = true;
        // Reset after 1.5 seconds
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          gPressed.current = false;
        }, 1500);
        return;
      }

      if (gPressed.current && !e.ctrlKey && !e.metaKey) {
        const route = NAV_SHORTCUTS[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          gPressed.current = false;
          if (gTimer.current) clearTimeout(gTimer.current);
          if (pathname !== route) {
            router.push(route);
          }
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [router, lock, pathname]);
}

export const SHORTCUT_LIST = [
  { keys: "Ctrl+K", beschrijvingKey: "zoeken" },
  { keys: "Ctrl+L", beschrijvingKey: "vergrendelen" },
  { keys: "Ctrl+N", beschrijvingKey: "nieuwItem" },
  { keys: "?", beschrijvingKey: "sneltoetsenTonen" },
  { keys: "G → D", beschrijvingKey: "gaNaarDashboard" },
  { keys: "G → P", beschrijvingKey: "gaNaarProfiel" },
  { keys: "G → T", beschrijvingKey: "gaNaarTestament" },
  { keys: "G → W", beschrijvingKey: "gaNaarWilsverklaring" },
  { keys: "G → O", beschrijvingKey: "gaNaarDonorregistratie" },
  { keys: "G → B", beschrijvingKey: "gaNaarDigitaalBezit" },
  { keys: "G → E", beschrijvingKey: "gaNaarBoedel" },
  { keys: "G → U", beschrijvingKey: "gaNaarUitvaartwensen" },
  { keys: "G → F", beschrijvingKey: "gaNaarDocumenten" },
  { keys: "G → R", beschrijvingKey: "gaNaarErfgenamen" },
  { keys: "G → N", beschrijvingKey: "gaNaarNoodcontacten" },
  { keys: "G → X", beschrijvingKey: "gaNaarExporteren" },
  { keys: "G → A", beschrijvingKey: "gaNaarActiviteitenlog" },
  { keys: "G → I", beschrijvingKey: "gaNaarInstellingen" },
];
