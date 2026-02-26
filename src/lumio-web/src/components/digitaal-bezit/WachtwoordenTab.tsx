"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { WachtwoordItem } from "./WachtwoordItem";
import type { WachtwoordEntry } from "./types";

interface WachtwoordenTabProps {
  wachtwoorden: WachtwoordEntry[];
  ontsleuteld: Record<string, string>;
  onToggleOntsluitel: (id: string) => void;
  onAdd: () => void;
  onEdit: (wachtwoord: WachtwoordEntry) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
}

export function WachtwoordenTab({
  wachtwoorden,
  ontsleuteld,
  onToggleOntsluitel,
  onAdd,
  onEdit,
  onDelete,
  onImport,
}: WachtwoordenTabProps) {
  const t = useTranslations("digitaalBezit");

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <KeyRound className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("wachtwoorden.titel")}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onImport}>
            <Upload className="h-4 w-4 mr-1" /> {t("wachtwoorden.importeren")}
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
          </Button>
        </div>
      </div>
      <CardContent className="pt-5">
        {wachtwoorden.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("wachtwoorden.geenWachtwoorden")}
          </p>
        ) : (
          <div className="space-y-2">
            {wachtwoorden.map((w) => (
              <WachtwoordItem
                key={w.id}
                wachtwoord={w}
                ontsleuteldWachtwoord={ontsleuteld[w.id]}
                onToggleOntsluitel={() => onToggleOntsluitel(w.id)}
                onEdit={() => onEdit(w)}
                onDelete={() => onDelete(w.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
