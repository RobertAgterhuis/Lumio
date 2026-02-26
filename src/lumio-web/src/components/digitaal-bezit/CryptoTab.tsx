"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { CryptoItem } from "./CryptoItem";
import type { CryptoWallet } from "./types";

interface CryptoTabProps {
  wallets: CryptoWallet[];
  onAdd: () => void;
  onEdit: (wallet: CryptoWallet) => void;
  onDelete: (id: string) => void;
}

export function CryptoTab({
  wallets,
  onAdd,
  onEdit,
  onDelete,
}: CryptoTabProps) {
  const t = useTranslations("digitaalBezit");

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Coins className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("crypto.titel")}</h3>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
        </Button>
      </div>
      <CardContent className="pt-5">
        {wallets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("crypto.geenWallets")}
          </p>
        ) : (
          <div className="space-y-2">
            {wallets.map((c) => (
              <CryptoItem
                key={c.id}
                wallet={c}
                onEdit={() => onEdit(c)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
