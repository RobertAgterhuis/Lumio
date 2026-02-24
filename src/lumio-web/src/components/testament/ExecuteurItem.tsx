"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Executeur } from "./types";

interface ExecuteurItemProps {
  executeur: Executeur;
  onEdit: (executeur: Executeur) => void;
  onDelete: (id: string) => void;
}

export function ExecuteurItem({ executeur, onEdit, onDelete }: ExecuteurItemProps) {
  return (
    <li className="flex items-center justify-between text-sm rounded-md border p-2">
      <div>
        <span className="font-medium">{executeur.naam}</span>
        {executeur.relatie && <span className="text-muted-foreground ml-2">({executeur.relatie})</span>}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(executeur)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(executeur.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </li>
  );
}
