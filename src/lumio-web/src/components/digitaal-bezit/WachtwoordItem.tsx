"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WachtwoordEntry } from "./types";

interface WachtwoordItemProps {
  wachtwoord: WachtwoordEntry;
  ontsleuteldWachtwoord?: string;
  onToggleOntsluitel: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WachtwoordItem({
  wachtwoord,
  ontsleuteldWachtwoord,
  onToggleOntsluitel,
  onEdit,
  onDelete,
}: WachtwoordItemProps) {
  const t = useTranslations("digitaalBezit.wachtwoorden");

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="font-medium text-sm">{wachtwoord.naam}</p>
        {wachtwoord.gebruikersnaam && (
          <p className="text-xs text-muted-foreground">
            {wachtwoord.gebruikersnaam}
          </p>
        )}
        {ontsleuteldWachtwoord && (
          <p className="text-xs font-mono bg-warning-100 dark:bg-warning/20 text-warning px-2 py-0.5 rounded">
            {ontsleuteldWachtwoord}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {wachtwoord.url && (
          <span className="text-xs text-muted-foreground">{wachtwoord.url}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleOntsluitel}
          title={ontsleuteldWachtwoord ? t("verbergen") : t("ontsluiten")}
        >
          {ontsleuteldWachtwoord ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
