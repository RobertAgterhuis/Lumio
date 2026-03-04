"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { SHORTCUT_LIST } from "@/hooks/useKeyboardShortcuts";

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("shortcuts");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("lumio:show-shortcuts", handler);
    return () => window.removeEventListener("lumio:show-shortcuts", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <DialogTitle>{t("titel")}</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <div className="grid gap-1.5">
          {SHORTCUT_LIST.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between py-1.5 px-1 rounded-md transition-colors hover:bg-muted/50"
            >
              <span className="text-sm text-foreground">
                {t(s.beschrijvingKey)}
              </span>
              <div className="flex items-center gap-1">
                {s.keys.split("+").map((key, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="text-xs text-muted-foreground mx-0.5">+</span>
                    )}
                    <kbd className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground shadow-sm">
                      {key.trim().replace("→ ", "")}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
