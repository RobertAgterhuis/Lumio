"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataHandtekening } from "@/components/instellingen/DataHandtekening";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { Shield, Trash2, Loader2, Settings } from "lucide-react";

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
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" /> {t("verwijderen.titel")}
        </CardTitle>
        <CardDescription>{t("verwijderen.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> {t("beveiliging.titel")}
        </CardTitle>
        <CardDescription>{t("beveiliging.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> {t("overLumio.titel")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>{t("overLumio.beschrijving")}</p>
        <p className="mt-2">{t("overLumio.juridisch")}</p>
      </CardContent>
    </Card>
  );
}
