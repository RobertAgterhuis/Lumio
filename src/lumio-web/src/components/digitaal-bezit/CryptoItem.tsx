"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CryptoWallet } from "./types";

interface CryptoItemProps {
  wallet: CryptoWallet;
  onEdit: () => void;
  onDelete: () => void;
}

export function CryptoItem({ wallet, onEdit, onDelete }: CryptoItemProps) {
  const tEnum = useTranslations("enums");
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="font-medium text-sm">{wallet.walletNaam}</p>
        <p className="text-xs text-muted-foreground">
          {tEnum(`cryptoType.${wallet.cryptoType.toLowerCase()}` as Parameters<typeof tEnum>[0])}
          {wallet.exchange && ` — ${wallet.exchange}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
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
