"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { CryptoWallet } from "./types";

interface CryptoItemProps {
  wallet: CryptoWallet;
  onEdit: () => void;
  onDelete: () => void;
}

export function CryptoItem({ wallet, onEdit, onDelete }: CryptoItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="font-medium text-sm">{wallet.walletNaam}</p>
        <p className="text-xs text-muted-foreground">
          {wallet.cryptoType}
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
