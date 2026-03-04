"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Begunstigde } from "./types";

interface BegunstigdeItemProps {
  begunstigde: Begunstigde;
  onEdit: (begunstigde: Begunstigde) => void;
  onDelete: (id: string) => void;
}

export function BegunstigdeItem({ begunstigde, onEdit, onDelete }: BegunstigdeItemProps) {
  return (
    <li className="flex items-center justify-between text-sm rounded-md border p-2 transition-colors hover:bg-muted/50">
      <div>
        <span className="font-medium">{begunstigde.naam}</span>
        <span className="text-muted-foreground ml-2">({begunstigde.relatie})</span>
        {begunstigde.percentage != null && (
          <Badge variant="outline" className="ml-2">{begunstigde.percentage}%</Badge>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(begunstigde)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(begunstigde.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </li>
  );
}
