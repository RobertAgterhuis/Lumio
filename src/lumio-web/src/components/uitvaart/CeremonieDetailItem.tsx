"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { CeremonieDetail } from "./types";

interface CeremonieDetailItemProps {
  detail: CeremonieDetail;
  onEdit: (detail: CeremonieDetail) => void;
  onDelete: (id: string) => void;
}

export function CeremonieDetailItem({
  detail,
  onEdit,
  onDelete,
}: CeremonieDetailItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="font-medium text-sm">
          <span className="text-muted-foreground mr-2">{detail.volgorde}.</span>
          {detail.onderdeel}
        </p>
        {detail.beschrijving && (
          <p className="text-xs text-muted-foreground mt-1">
            {detail.beschrijving}
          </p>
        )}
        {(detail.muziek ||
          detail.spreker ||
          detail.tekstlezing ||
          detail.dresscode) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {detail.muziek && (
              <span className="text-xs text-muted-foreground">
                ♫ {detail.muziek}
              </span>
            )}
            {detail.spreker && (
              <span className="text-xs text-muted-foreground">
                🗣 {detail.spreker}
              </span>
            )}
            {detail.tekstlezing && (
              <span className="text-xs text-muted-foreground">
                📖 {detail.tekstlezing}
              </span>
            )}
            {detail.dresscode && (
              <span className="text-xs text-muted-foreground">
                👔 {detail.dresscode}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(detail)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(detail.id)}>
          <Trash2 className="h-3 w-3 text-danger" />
        </Button>
      </div>
    </div>
  );
}
