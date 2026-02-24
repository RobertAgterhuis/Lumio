"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, KeyRound, Package, Pencil, Share2, Trash2 } from "lucide-react";
import type { Erfgenaam, Toewijzing } from "./types";

interface ErfgenaamItemProps {
  erfgenaam: Erfgenaam;
  toewijzingen: Toewijzing[];
  isExpanded: boolean;
  displayName: (e: Erfgenaam) => string;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onShare: () => void;
  onAssignAsset: () => void;
  onDeleteToewijzing: (id: string) => void;
  translations: {
    relatie: (key: string) => string;
    entityType: (key: string) => string;
    geenBezittingen: string;
    toewijzenKnop: string;
    toegewezenBezittingen: string;
    bezitToewijzen: string;
    pdfDownloaden: string;
    deelOverzicht: string;
  };
}

export function ErfgenaamItem({
  erfgenaam,
  toewijzingen,
  isExpanded,
  displayName,
  onToggleExpand,
  onEdit,
  onDelete,
  onExport,
  onShare,
  onAssignAsset,
  onDeleteToewijzing,
  translations,
}: ErfgenaamItemProps) {
  const { relatie, entityType, geenBezittingen, toewijzenKnop, toegewezenBezittingen, bezitToewijzen, pdfDownloaden, deelOverzicht } = translations;

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
          <p className="text-sm font-medium">{displayName(erfgenaam)}</p>
          <p className="text-xs text-muted-foreground">
            {relatie(erfgenaam.relatie)}
            {erfgenaam.email && ` \u2014 ${erfgenaam.email}`}
            {erfgenaam.telefoon && ` \u2014 ${erfgenaam.telefoon}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toewijzingen.length > 0 && (
            <Badge variant="outline">
              <Package className="h-3 w-3 mr-1" />
              {toewijzingen.length}
            </Badge>
          )}
          {erfgenaam.heeftShareOntvangen && (
            <Badge variant="outline">
              <KeyRound className="h-3 w-3 mr-1" />
              Share
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAssignAsset}
            title={bezitToewijzen}
          >
            <Package className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            title={pdfDownloaden}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            title={deelOverzicht}
          >
            <Share2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 text-danger" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 border-t pt-3">
          {toewijzingen.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              {geenBezittingen}{" "}
              <button
                className="underline text-primary"
                onClick={onAssignAsset}
              >
                {toewijzenKnop}
              </button>
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{toegewezenBezittingen}</p>
              {toewijzingen.map((tw) => (
                <div
                  key={tw.id}
                  className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm">{tw.entityNaam}</p>
                    <p className="text-xs text-muted-foreground">
                      {entityType(tw.entityType)}
                      {tw.instructies && ` — ${tw.instructies}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteToewijzing(tw.id)}
                  >
                    <Trash2 className="h-3 w-3 text-danger" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
