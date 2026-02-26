"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import {
  Download,
  Upload,
  HardDrive,
  FolderOpen,
  Check,
  Loader2,
} from "lucide-react";

interface BackupRestoreCardProps {
  /** Callback when restore confirmation is requested (passes actual restore handler) */
  onRestoreRequest?: (executeRestore: () => void) => void;
  /** Callback after successful restore (e.g., to redirect) */
  onPostRestore?: () => void;
}

/**
 * Card component for backup and restore functionality.
 * Includes download backup, restore from backup, and auto-backup settings (Electron only).
 */
export function BackupRestoreCard({ onRestoreRequest, onPostRestore }: BackupRestoreCardProps) {
  const t = useTranslations("instellingen");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isElectron = typeof window !== "undefined" && !!(window as any).lumio?.isElectron;

  // Download state
  const [downloading, setDownloading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePassword, setRestorePassword] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-backup state (Electron only)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupPad, setAutoBackupPad] = useState("");
  const [autoBackupFrequentie, setAutoBackupFrequentie] = useState("dagelijks");
  const [autoBackupSaving, setAutoBackupSaving] = useState(false);
  const [autoBackupTesting, setAutoBackupTesting] = useState(false);
  const [autoBackupMessage, setAutoBackupMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // S2-09: Load auto-backup config on mount (Electron only)
  useEffect(() => {
    if (!isElectron) return;
    (async () => {
      try {
        const config = await (window as any).lumio.getAutoBackupConfig();
        if (config) {
          setAutoBackupEnabled(config.ingeschakeld ?? false);
          setAutoBackupPad(config.pad ?? "");
          setAutoBackupFrequentie(config.frequentie ?? "dagelijks");
        }
      } catch { /* ignore — desktop API not available in dev/browser */ }
    })();
  }, [isElectron]);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    setBackupMessage(null);
    try {
      const { blob, filename } = await api.download("/api/backup");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage({ type: "success", text: t("backup.gedownload") });
    } catch {
      setBackupMessage({ type: "error", text: t("backup.downloadMislukt") });
    } finally {
      setDownloading(false);
    }
  };

  const executeRestore = async () => {
    if (!restoreFile || !restorePassword) return;
    setRestoring(true);
    setRestoreMessage(null);
    try {
      const formData = new FormData();
      formData.append("bestand", restoreFile);
      formData.append("wachtwoord", restorePassword);
      await api.upload("/api/backup/restore", formData);
      setRestoreMessage({ type: "success", text: t("backup.hersteld") });
      setRestoreFile(null);
      setRestorePassword("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onPostRestore) {
        setTimeout(onPostRestore, 2000);
      }
    } catch (err) {
      setRestoreMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("backup.herstelMislukt"),
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreClick = () => {
    if (onRestoreRequest) {
      onRestoreRequest(executeRestore);
    } else {
      executeRestore();
    }
  };

  // Auto-backup handlers (Electron only)
  const handleSelectBackupDirectory = async () => {
    if (!isElectron) return;
    const path = await (window as any).lumio.selectDirectory();
    if (path) setAutoBackupPad(path);
  };

  const handleSaveAutoBackup = async () => {
    if (!isElectron) return;
    setAutoBackupSaving(true);
    setAutoBackupMessage(null);
    try {
      if (autoBackupEnabled && autoBackupPad) {
        await (window as any).lumio.setAutoBackupConfig({
          pad: autoBackupPad,
          frequentie: autoBackupFrequentie,
        });
        setAutoBackupMessage({ type: "success", text: t("autoBackup.opgeslagen") });
      } else {
        await (window as any).lumio.setAutoBackupConfig(null);
        setAutoBackupMessage({ type: "success", text: t("autoBackup.uitgeschakeld") });
      }
    } catch {
      setAutoBackupMessage({ type: "error", text: t("autoBackup.opslaanMislukt") });
    } finally {
      setAutoBackupSaving(false);
    }
  };

  const handleTestAutoBackup = async () => {
    if (!isElectron) return;
    setAutoBackupTesting(true);
    setAutoBackupMessage(null);
    try {
      const result = await (window as any).lumio.triggerAutoBackup();
      if (result.success) {
        setAutoBackupMessage({ type: "success", text: t("autoBackup.testSucces") });
      } else {
        setAutoBackupMessage({ type: "error", text: result.error || t("autoBackup.backupMislukt") });
      }
    } catch {
      setAutoBackupMessage({ type: "error", text: t("autoBackup.backupMislukt") });
    } finally {
      setAutoBackupTesting(false);
    }
  };

  return (
    <>
      {/* Backup & Restore Card */}
      <Card className="overflow-hidden">
        <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
          <Download className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary leading-tight">{t("backup.titel")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("backup.beschrijving")}</p>
          </div>
        </div>
        <CardContent className="pt-5 space-y-6">
          {/* Download backup section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("backup.downloadTitel")}</h3>
            <p className="text-sm text-muted-foreground">{t("backup.downloadBeschrijving")}</p>
            <Button onClick={handleDownloadBackup} disabled={downloading} variant="outline">
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t("backup.downloadKnop")}
            </Button>
            {backupMessage && (
              <p className={`text-sm ${backupMessage.type === "success" ? "text-success" : "text-danger"}`}>
                {backupMessage.text}
              </p>
            )}
          </div>

          <hr />

          {/* Restore backup section */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-sm font-medium">{t("backup.herstelTitel")}</h3>
            <p className="text-sm text-muted-foreground">{t("backup.herstelBeschrijving")}</p>
            <div className="space-y-2">
              <Label htmlFor="restore-file">{t("backup.bestandLabel")}</Label>
              <Input
                ref={fileInputRef}
                id="restore-file"
                type="file"
                accept=".zip"
                onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-password">{t("backup.wachtwoordLabel")}</Label>
              <Input
                id="restore-password"
                type="password"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                placeholder={t("backup.wachtwoordPlaceholder")}
              />
            </div>
            <Button
              onClick={handleRestoreClick}
              disabled={!restoreFile || !restorePassword || restoring}
              variant="outline"
            >
              {restoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {t("backup.herstelKnop")}
            </Button>
            {restoreMessage && (
              <p className={`text-sm ${restoreMessage.type === "success" ? "text-success" : "text-danger"}`}>
                {restoreMessage.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-backup Card (Electron only) */}
      {isElectron && (
        <Card className="overflow-hidden">
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <HardDrive className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-primary leading-tight">{t("autoBackup.titel")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t("autoBackup.beschrijving")}</p>
            </div>
          </div>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="auto-backup-toggle" className="flex-1">
                {t("autoBackup.inschakelen")}
              </Label>
              <button
                id="auto-backup-toggle"
                type="button"
                role="switch"
                aria-checked={autoBackupEnabled}
                onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoBackupEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoBackupEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {autoBackupEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("autoBackup.backupMap")}</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={autoBackupPad}
                      placeholder={t("autoBackup.selecteerMap")}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleSelectBackupDirectory}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {t("autoBackup.bladeren")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-backup-freq">{t("autoBackup.frequentie")}</Label>
                  <select
                    id="auto-backup-freq"
                    value={autoBackupFrequentie}
                    onChange={(e) => setAutoBackupFrequentie(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="dagelijks">{t("autoBackup.dagelijks")}</option>
                    <option value="wekelijks">{t("autoBackup.wekelijks")}</option>
                    <option value="maandelijks">{t("autoBackup.maandelijks")}</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveAutoBackup} disabled={autoBackupSaving || !autoBackupPad}>
                    {autoBackupSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {t("autoBackup.opslaan")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestAutoBackup}
                    disabled={autoBackupTesting || !autoBackupPad}
                  >
                    {autoBackupTesting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {t("autoBackup.nuBackup")}
                  </Button>
                </div>
              </div>
            )}

            {autoBackupMessage && (
              <p className={`text-sm ${autoBackupMessage.type === "success" ? "text-success" : "text-danger"}`}>
                {autoBackupMessage.text}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
