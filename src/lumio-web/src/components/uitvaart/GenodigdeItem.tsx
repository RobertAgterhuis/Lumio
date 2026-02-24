"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { UitvaartGenodigde } from "./types";

interface GenodigdeItemProps {
  genodigde: UitvaartGenodigde;
  onEdit: (genodigde: UitvaartGenodigde) => void;
  onDelete: (id: string) => void;
}

export function GenodigdeItem({
  genodigde,
  onEdit,
  onDelete,
}: GenodigdeItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="font-medium text-sm">{genodigde.naam}</p>
        <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          {genodigde.relatie && <span>{genodigde.relatie}</span>}
          {genodigde.telefoon && <span>📞 {genodigde.telefoon}</span>}
          {genodigde.email && <span>✉ {genodigde.email}</span>}
          {genodigde.woonplaats && <span>📍 {genodigde.woonplaats}</span>}
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(genodigde)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(genodigde.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
