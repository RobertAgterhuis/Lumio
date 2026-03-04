"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { TestamentSnapshot } from "./types";

interface SnapshotItemProps {
  snapshot: TestamentSnapshot;
  onDelete: (id: string) => void;
}

export function SnapshotItem({ snapshot, onDelete }: SnapshotItemProps) {
  const t = useTranslations("testament");
  const locale = useLocale();

  return (
    <li className="flex items-center justify-between text-sm rounded-md border p-2 transition-colors hover:bg-muted/50">
      <div>
        <span className="font-medium">{t("versies.versie", { nummer: snapshot.versie })}</span>
        <span className="text-muted-foreground ml-2">
          {new Date(snapshot.snapshotDatum).toLocaleDateString(locale === "en" ? "en-NL" : "nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
        {snapshot.notitie && <span className="text-muted-foreground ml-2">— {snapshot.notitie}</span>}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onDelete(snapshot.id)}>
        <Trash2 className="h-3 w-3 text-danger" />
      </Button>
    </li>
  );
}
