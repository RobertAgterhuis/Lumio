"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DataHandtekening } from "@/components/instellingen/DataHandtekening";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { Trash2, Loader2, Settings } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";

interface AccountDeletionCardProps {
  /** Callback when delete confirmation is requested (passes actual delete handler) */
  onDeleteRequest?: (executeDelete: () => void) => void;
  /** Callback after successful deletion (e.g., to redirect) */
  onPostDelete?: () => void;
}

/**
 * Card component for account deletion.
 * Requires password confirmation before deletion.
 */
export function AccountDeletionCard({ onDeleteRequest, onPostDelete }: AccountDeletionCardProps) {
  const t = useTranslations("instellingen");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const executeDelete = async () => {
    setDeleting(true);
    setDeleteMessage(null);
    try {
      await api.deleteWithBody("/api/auth/account", {
        wachtwoord: deletePassword,
      });
      setDeleteMessage({ type: "success", text: t("verwijderen.succes") });
      setDeletePassword("");
      if (onPostDelete) {
        setTimeout(onPostDelete, 2000);
      }
    } catch (err) {
      setDeleteMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("verwijderen.mislukt"),
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteRequest) {
      onDeleteRequest(executeDelete);
    } else {
      executeDelete();
    }
  };

  return (
    <Card className="border-destructive/50 overflow-hidden">
      <div className="bg-danger-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Trash2 className="h-5 w-5 text-danger shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-danger leading-tight">{t("verwijderen.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("verwijderen.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5 space-y-4 max-w-md">
        <FormField.Root>
          <FormField.Label>{t("verwijderen.bevestigLabel")}</FormField.Label>
          <FormField.Input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder={t("verwijderen.bevestigPlaceholder")}
          />
        </FormField.Root>

        {deleteMessage && (
          <p
            className={`text-sm ${
              deleteMessage.type === "success" ? "text-success" : "text-danger"
            }`}
          >
            {deleteMessage.text}
          </p>
        )}

        <Button
          variant="destructive"
          onClick={handleDeleteClick}
          disabled={!deletePassword || deleting}
        >
          {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Trash2 className="h-4 w-4 mr-2" />
          {t("verwijderen.knop")}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Card component displaying security information.
 * Shows encryption status and data signature.
 */
export function SecurityInfoCard() {
  const t = useTranslations("instellingen");

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <LumioIcon name="shield" size="md" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("beveiliging.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("beveiliging.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>{t("beveiliging.sqlcipher")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>{t("beveiliging.aesGcm")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>{t("beveiliging.lokaal")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>{t("beveiliging.geenInternet")}</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <h3 className="text-sm font-semibold mb-2">
            {t("beveiliging.handtekeningTitel")}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {t("beveiliging.handtekeningBeschrijving")}
          </p>
          <DataHandtekening />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card component displaying about/version information.
 */
export function AboutCard() {
  const t = useTranslations("instellingen");
  const [appVersion, setAppVersion] = useState<string | null>(null);

  // EL-6-05: Fetch Electron app version once on mount.
  // Only runs inside the Electron shell; no-op in browser mode.
  useEffect(() => {
    if (typeof window === "undefined" || !window.lumio) return;
    window.lumio.getAppVersion().then(setAppVersion).catch(() => null);
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Settings className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("overLumio.titel")}</h3>
        </div>
      </div>
      <CardContent className="pt-5 text-sm text-muted-foreground">
        <p>{t("overLumio.beschrijving")}</p>
        <p className="mt-2">{t("overLumio.juridisch")}</p>
        {appVersion !== null && (
          <p className="mt-3 text-xs text-muted-foreground/70">
            Versie {appVersion}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
