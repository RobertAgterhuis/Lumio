"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("crypto.titel")}</CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
        </Button>
      </CardHeader>
      <CardContent>
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
