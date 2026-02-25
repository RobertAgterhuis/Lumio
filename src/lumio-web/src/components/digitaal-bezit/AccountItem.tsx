"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DigitaalAccount } from "./types";
import type { AfsluitInstructie } from "@/lib/afsluit-instructies";
import { CATEGORIE_KEYS, GEWENSTE_ACTIE_KEYS } from "./constants";

interface AccountItemProps {
  account: DigitaalAccount;
  instructie?: AfsluitInstructie;
  isInstructieOpen: boolean;
  onToggleInstructie: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AccountItem({
  account,
  instructie,
  isInstructieOpen,
  onToggleInstructie,
  onEdit,
  onDelete,
}: AccountItemProps) {
  const t = useTranslations("digitaalBezit");
  const tAfsluit = useTranslations("afsluitInstructies");
  const tEnum = useTranslations("enums");

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-3">
        <div>
          <p className="font-medium text-sm">{account.platformNaam}</p>
          {account.gebruikersnaam && (
            <p className="text-xs text-muted-foreground">
              {account.gebruikersnaam}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {account.categorie && (
            <Badge variant="outline">
              {tEnum(`accountCategorie.${CATEGORIE_KEYS[account.categorie] ?? account.categorie}`)}
            </Badge>
          )}
          {account.gewensteActie && (
            <Badge variant="secondary">
              {tEnum(`gewensteActie.${GEWENSTE_ACTIE_KEYS[account.gewensteActie] ?? account.gewensteActie}`)}
            </Badge>
          )}
          {instructie && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleInstructie}
              title="Afsluitinstructies"
            >
              <Info className={`h-3 w-3 ${isInstructieOpen ? "text-info" : ""}`} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-3 w-3 text-danger" />
          </Button>
        </div>
      </div>
      {instructie && isInstructieOpen && (
        <div className="border-t bg-info-100 dark:bg-info/20 px-3 py-2">
          <p className="text-xs font-medium text-info mb-1">
            {t("accounts.afsluitInstructies", { platform: instructie.platform })}
          </p>
          <p className="text-xs text-info">
            {tAfsluit(instructie.beschrijvingKey)}
          </p>
          <a
            href={instructie.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-info hover:underline mt-1"
          >
            <ExternalLink className="h-3 w-3" />
            {t("accounts.bekijkInstructies")}
          </a>
        </div>
      )}
    </div>
  );
}
