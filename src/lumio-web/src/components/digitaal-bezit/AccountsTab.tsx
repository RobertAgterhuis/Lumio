"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountItem } from "./AccountItem";
import type { DigitaalAccount } from "./types";
import type { AfsluitInstructie } from "@/lib/afsluit-instructies";
import { ACCOUNT_CATEGORIEEN, CATEGORIE_KEYS } from "./constants";

interface AccountsTabProps {
  accounts: DigitaalAccount[];
  categorieFilter: string;
  onCategorieFilterChange: (value: string) => void;
  getInstructie: (account: DigitaalAccount) => AfsluitInstructie | undefined;
  instructieOpen: Record<string, boolean>;
  onToggleInstructie: (id: string) => void;
  onAdd: () => void;
  onEdit: (account: DigitaalAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountsTab({
  accounts,
  categorieFilter,
  onCategorieFilterChange,
  getInstructie,
  instructieOpen,
  onToggleInstructie,
  onAdd,
  onEdit,
  onDelete,
}: AccountsTabProps) {
  const t = useTranslations("digitaalBezit");
  const tEnum = useTranslations("enums");

  const filteredAccounts = categorieFilter
    ? accounts.filter((a) => a.categorie === categorieFilter)
    : accounts;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("accounts.titel")}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={categorieFilter}
              onChange={(e) => onCategorieFilterChange(e.target.value)}
              className="w-40"
            >
              <option value="">{tEnum("accountCategorie.alle")}</option>
              {ACCOUNT_CATEGORIEEN.map((cat) => (
                <option key={cat} value={cat}>
                  {tEnum(`accountCategorie.${CATEGORIE_KEYS[cat]}`)}
                </option>
              ))}
            </Select>
          </div>
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAccounts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {categorieFilter
              ? t("accounts.geenInCategorie", {
                  categorie: tEnum(`accountCategorie.${CATEGORIE_KEYS[categorieFilter]}`),
                })
              : t("accounts.geenAccounts")}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredAccounts.map((a) => (
              <AccountItem
                key={a.id}
                account={a}
                instructie={getInstructie(a)}
                isInstructieOpen={!!instructieOpen[a.id]}
                onToggleInstructie={() => onToggleInstructie(a.id)}
                onEdit={() => onEdit(a)}
                onDelete={() => onDelete(a.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
