"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Bell, AlertTriangle, Info, X } from "lucide-react";

interface Melding {
  type: "waarschuwing" | "herinnering";
  categorie: string;
  bericht: string;
  actie: string;
}

interface MeldingenResponse {
  meldingen: Melding[];
  aantal: number;
}

export function NotificationsDropdown() {
  const [meldingen, setMeldingen] = useState<Melding[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("dashboard.meldingen");

  useEffect(() => {
    api
      .get<MeldingenResponse>("/api/status/meldingen")
      .then((data) => setMeldingen(data.meldingen))
      .catch(() => {});
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const visible = meldingen.filter((_, i) => !dismissed.has(i));
  const count = visible.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="relative"
        aria-label={t("titel", { aantal: count })}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t("titel", { aantal: count })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("geen") ?? "Geen meldingen"}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {meldingen.map((melding, idx) => {
                  if (dismissed.has(idx)) return null;
                  return (
                    <div key={idx} className="group relative">
                      <Link
                        href={melding.actie}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                          melding.type === "waarschuwing"
                            ? "bg-warning-100/30"
                            : "bg-info-100/30"
                        )}
                      >
                        {melding.type === "waarschuwing" ? (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        ) : (
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">
                            {melding.bericht}
                          </p>
                          <Badge
                            variant={
                              melding.type === "waarschuwing"
                                ? "warning"
                                : "info"
                            }
                            className="mt-1 text-[10px]"
                          >
                            {melding.categorie}
                          </Badge>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDismissed((prev) => new Set(prev).add(idx));
                        }}
                        className="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground group-hover:flex"
                        aria-label="Verwijder melding"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
