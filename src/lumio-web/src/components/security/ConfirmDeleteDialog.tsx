"use client";

import { ConfirmDestructiveAction } from "./ConfirmDestructiveAction";
import { useTranslations } from "next-intl";

export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** The type of item being deleted (for translation key lookup) */
  itemType:
    | "erfgenaam"
    | "bezit"
    | "rekening"
    | "verzekering"
    | "schuld"
    | "document"
    | "account"
    | "wachtwoord"
    | "wallet"
    | "noodcontact"
    | "begunstigde"
    | "executeur"
    | "genodigde"
    | "detail";
  /** The name/identifier of the item being deleted */
  itemName: string;
  /** Callback when user confirms deletion */
  onConfirm: () => Promise<void> | void;
  /** Whether the action is currently loading */
  loading?: boolean;
}

/**
 * ConfirmDeleteDialog - A specific confirmation dialog for delete operations.
 *
 * Displays the item name prominently to prevent accidental deletions.
 *
 * Usage:
 * ```tsx
 * <ConfirmDeleteDialog
 *   open={showDelete}
 *   onOpenChange={setShowDelete}
 *   itemType="erfgenaam"
 *   itemName="Jan de Vries"
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const t = useTranslations("verwijderBevestiging");

  return (
    <ConfirmDestructiveAction
      open={open}
      onOpenChange={onOpenChange}
      title={t("titel", { type: t(`types.${itemType}`) })}
      description={t("beschrijving", { naam: itemName })}
      confirmLabel={t("bevestigen")}
      cancelLabel={t("annuleren")}
      onConfirm={onConfirm}
    >
      <div className="rounded-lg border border-muted bg-muted/50 p-3 text-center">
        <p className="text-sm text-muted-foreground">{t("itemLabel")}</p>
        <p className="font-medium text-foreground">{itemName}</p>
      </div>
    </ConfirmDestructiveAction>
  );
}
