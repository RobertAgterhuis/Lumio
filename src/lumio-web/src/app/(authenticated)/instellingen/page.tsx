"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataHandtekening } from "@/components/instellingen/DataHandtekening";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import {
  getIdleTimeoutMinutes,
  setIdleTimeoutMinutes,
} from "@/hooks/useIdleTimer";
import { useTranslations, useLocale } from "next-intl";
import {
  Settings,
  Key,
  Shield,
  Loader2,
  Timer,
  Download,
  Upload,
  Trash2,
  Users,
  Plus,
  UserCircle,
  HardDrive,
  FolderOpen,
  Check,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Type,
  Globe,
  LayoutDashboard,
  Eye,
  EyeOff,
} from "lucide-react";

const TIMEOUT_VALUES = [1, 2, 5, 10, 15, 30, 0];

function DashboardToggle({ sectionKey, label }: { sectionKey: "showVoortgang" | "showVoortgangGranulair" | "showSuggesties" | "showDomeinKaarten"; label: string }) {
  const value = usePreferencesStore((s) => s[sectionKey]);
  const toggle = usePreferencesStore((s) => s.toggleSection);
  return (
    <button
      type="button"
      onClick={() => toggle(sectionKey)}
      className="flex items-center justify-between w-full rounded-lg border p-3 hover:bg-muted/50 transition-colors"
    >
      <span className="text-sm font-medium">{label}</span>
      {value ? (
        <Eye className="h-4 w-4 text-primary" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

export default function InstellingenPage() {
  const router = useRouter();
  const { lock, profiles, activeProfile, setProfiles } = useAuthStore();
  const t = useTranslations("instellingen");
  const locale = useLocale();

  // Profile management state
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileRelatie, setNewProfileRelatie] = useState("Partner");
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState<string | null>(null);

  // Password change state
  const [huidigWachtwoord, setHuidigWachtwoord] = useState("");
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState("");
  const [bevestigWachtwoord, setBevestigWachtwoord] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Idle timeout state
  const [idleTimeout, setIdleTimeout] = useState(5);

  // Grote-tekst modus (P-C8)
  const [groteTekst, setGroteTekst] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lumio-grote-tekst");
    if (saved === "true") {
      setGroteTekst(true);
      document.documentElement.classList.add("grote-tekst");
    }
  }, []);

  const toggleGroteTekst = (aan: boolean) => {
    setGroteTekst(aan);
    if (aan) {
      document.documentElement.classList.add("grote-tekst");
      localStorage.setItem("lumio-grote-tekst", "true");
    } else {
      document.documentElement.classList.remove("grote-tekst");
      localStorage.removeItem("lumio-grote-tekst");
    }
  };

  // Backup state
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
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-backup state
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupPad, setAutoBackupPad] = useState("");
  const [autoBackupFrequentie, setAutoBackupFrequentie] = useState("dagelijks");
  const [autoBackupSaving, setAutoBackupSaving] = useState(false);
  const [autoBackupTesting, setAutoBackupTesting] = useState(false);
  const [autoBackupMessage, setAutoBackupMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const isElectron = typeof window !== "undefined" && !!(window as any).lumio?.isElectron;

  // Account delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Actualisatie state (P-S7)
  interface ActualisatieDomein {
    domein: string;
    label: string;
    laatsteBevestiging: string | null;
    actualisatieNodig: boolean;
  }
  const [actualisatieDomeinen, setActualisatieDomeinen] = useState<ActualisatieDomein[]>([]);
  const [actualisatieLoading, setActualisatieLoading] = useState(false);
  const [actualisatieConfirming, setActualisatieConfirming] = useState<string | null>(null);
  const [actualisatieMessage, setActualisatieMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setIdleTimeout(getIdleTimeoutMinutes());
  }, []);

  // Load auto-backup config on mount (Electron only)
  useEffect(() => {
    if (!isElectron) return;
    const loadAutoBackup = async () => {
      try {
        const config = await (window as any).lumio.getAutoBackupConfig();
        if (config) {
          setAutoBackupEnabled(true);
          setAutoBackupPad(config.pad);
          setAutoBackupFrequentie(config.frequentie);
        }
      } catch {
        // Ignore
      }
    };
    loadAutoBackup();
  }, [isElectron]);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await api.get<Profile[]>("/api/profielen");
        setProfiles(data);
      } catch {
        // Ignore
      }
    };
    loadProfiles();
  }, [setProfiles]);

  // Load actualisatie status (P-S7)
  const loadActualisatie = async () => {
    try {
      const data = await api.get<{ domeinen: ActualisatieDomein[]; herinneringNodig: boolean }>("/api/status/actualisatie");
      setActualisatieDomeinen(data.domeinen);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadActualisatie();
  }, []);

  const handleBevestigAlles = async () => {
    setActualisatieConfirming("alles");
    setActualisatieMessage(null);
    try {
      await api.post("/api/status/actualisatie/alles", {});
      await loadActualisatie();
      setActualisatieMessage({ type: "success", text: t("actualisatie.bevestigdSucces") });
    } catch {
      setActualisatieMessage({ type: "error", text: t("actualisatie.bevestigdFout") });
    } finally {
      setActualisatieConfirming(null);
    }
  };

  const handleBevestigDomein = async (domein: string) => {
    setActualisatieConfirming(domein);
    setActualisatieMessage(null);
    try {
      await api.post(`/api/status/actualisatie/${domein}`, {});
      await loadActualisatie();
    } catch {
      setActualisatieMessage({ type: "error", text: t("actualisatie.bevestigdFout") });
    } finally {
      setActualisatieConfirming(null);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    if (!newProfileName.trim()) return;

    setProfileSaving(true);
    try {
      const profile = await api.post<Profile>("/api/profielen", {
        naam: newProfileName.trim(),
        relatie: newProfileRelatie,
      });
      setProfiles([...profiles, profile]);
      setNewProfileName("");
      setShowCreateProfile(false);
      setProfileMessage({ type: "success", text: t("profielen.aangemaakt", { naam: profile.naam }) });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("profielen.aanmakenMislukt"),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    setShowDeleteProfileConfirm(null);
    setProfileMessage(null);
    try {
      await api.delete(`/api/profielen/${profileId}`);
      setProfiles(profiles.filter((p) => p.id !== profileId));
      setProfileMessage({ type: "success", text: t("profielen.verwijderd") });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("profielen.verwijderenMislukt"),
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (nieuwWachtwoord !== bevestigWachtwoord) {
      setMessage({ type: "error", text: t("wachtwoord.nietOvereen") });
      return;
    }

    if (nieuwWachtwoord.length < 8) {
      setMessage({
        type: "error",
        text: t("wachtwoord.teKort"),
      });
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/auth/wachtwoord", {
        huidigWachtwoord,
        nieuwWachtwoord,
      });
      setMessage({
        type: "success",
        text: t("wachtwoord.gewijzigd"),
      });
      setHuidigWachtwoord("");
      setNieuwWachtwoord("");
      setBevestigWachtwoord("");
    } catch {
      setMessage({
        type: "error",
        text: t("wachtwoord.wijzigenMislukt"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleIdleTimeoutChange = (value: number) => {
    setIdleTimeout(value);
    setIdleTimeoutMinutes(value);
  };

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
      setBackupMessage({
        type: "error",
        text: t("backup.downloadMislukt"),
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile || !restorePassword) return;
    setShowRestoreConfirm(false);
    setRestoring(true);
    setRestoreMessage(null);
    try {
      const formData = new FormData();
      formData.append("bestand", restoreFile);
      formData.append("wachtwoord", restorePassword);
      await api.upload("/api/backup/restore", formData);
      setRestoreMessage({
        type: "success",
        text: t("backup.hersteld"),
      });
      setRestoreFile(null);
      setRestorePassword("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => {
        lock();
        router.replace("/");
      }, 2000);
    } catch (err) {
      setRestoreMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : t("backup.herstelMislukt"),
      });
    } finally {
      setRestoring(false);
    }
  };

  // Auto-backup handlers
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

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    setDeleteMessage(null);
    try {
      await api.deleteWithBody("/api/auth/account", {
        wachtwoord: deletePassword,
      });
      setDeleteMessage({
        type: "success",
        text: t("verwijderen.succes"),
      });
      setDeletePassword("");
      setTimeout(() => {
        lock();
        router.replace("/");
      }, 2000);
    } catch (err) {
      setDeleteMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : t("verwijderen.mislukt"),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("ondertitel")}
        </p>
      </div>

      {/* Two-column grid layout */}
      <div className="grid gap-6 lg:grid-cols-2">
      {/* Left column — Preferences */}
      <div className="space-y-6">

      {/* Auto-lock timeout (M1) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" /> {t("autoLock.titel")}
          </CardTitle>
          <CardDescription>
            {t("autoLock.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TIMEOUT_VALUES.map((value) => (
              <Button
                key={value}
                variant={idleTimeout === value ? "default" : "outline"}
                size="sm"
                onClick={() => handleIdleTimeoutChange(value)}
              >
                {t(`timeoutOpties.${value}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grote-tekst modus (P-C8) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" /> {t("groteTekst.titel")}
          </CardTitle>
          <CardDescription>
            {t("groteTekst.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={!groteTekst ? "default" : "outline"}
              size="sm"
              onClick={() => toggleGroteTekst(false)}
            >
              {t("groteTekst.normaal")}
            </Button>
            <Button
              variant={groteTekst ? "default" : "outline"}
              size="sm"
              onClick={() => toggleGroteTekst(true)}
            >
              {t("groteTekst.groot")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard weergave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" /> {t("dashboardWeergave.titel")}
          </CardTitle>
          <CardDescription>
            {t("dashboardWeergave.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DashboardToggle sectionKey="showVoortgang" label={t("dashboardWeergave.voortgang")} />
          <DashboardToggle sectionKey="showVoortgangGranulair" label={t("dashboardWeergave.voortgangGranulair")} />
          <DashboardToggle sectionKey="showSuggesties" label={t("dashboardWeergave.suggesties")} />
          <DashboardToggle sectionKey="showDomeinKaarten" label={t("dashboardWeergave.domeinKaarten")} />
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => usePreferencesStore.getState().resetDashboard()}
            >
              {t("dashboardWeergave.allesHerstellen")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Taalkeuze */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> {t("taal.titel")}
          </CardTitle>
          <CardDescription>
            {t("taal.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector />
        </CardContent>
      </Card>

      {/* Periodieke actualisatie (P-S7) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" /> {t("actualisatie.titel")}
          </CardTitle>
          <CardDescription>
            {t("actualisatie.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actualisatieDomeinen.length > 0 ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {actualisatieDomeinen.map((d) => (
                  <div
                    key={d.domein}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      d.actualisatieNodig
                        ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {d.actualisatieNodig ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.laatsteBevestiging
                            ? t("actualisatie.gecontroleerd", { datum: new Date(d.laatsteBevestiging).toLocaleDateString(locale) })
                            : t("actualisatie.nietGecontroleerd")}
                        </p>
                      </div>
                    </div>
                    {d.actualisatieNodig && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 ml-2"
                        disabled={actualisatieConfirming !== null}
                        onClick={() => handleBevestigDomein(d.domein)}
                      >
                        {actualisatieConfirming === d.domein ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {actualisatieMessage && (
                <p
                  className={`text-sm ${
                    actualisatieMessage.type === "success"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {actualisatieMessage.text}
                </p>
              )}

              {actualisatieDomeinen.some((d) => d.actualisatieNodig) && (
                <Button
                  onClick={handleBevestigAlles}
                  disabled={actualisatieConfirming !== null}
                >
                  {actualisatieConfirming === "alles" && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {t("actualisatie.allesBevestigen")}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("actualisatie.laden")}
            </p>
          )}
        </CardContent>
      </Card>

      </div>
      {/* Right column — Account & Data */}
      <div className="space-y-6">

      {/* Profile management (M7) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> {t("profielen.titel")}
          </CardTitle>
          <CardDescription>
            {t("profielen.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* List existing profiles */}
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserCircle className="h-8 w-8 text-primary/60 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {profile.naam}
                      {activeProfile?.id === profile.id && (
                        <span className="ml-2 text-xs text-primary font-normal">{t("profielen.actief")}</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{t(`profielen.relaties.${profile.relatie}`)}</p>
                  </div>
                </div>
                {!profile.isPrimair && profile.id !== activeProfile?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => setShowDeleteProfileConfirm(profile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {profileMessage && (
            <p
              className={`text-sm ${
                profileMessage.type === "success"
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {profileMessage.text}
            </p>
          )}

          {/* Create new profile form */}
          {showCreateProfile ? (
            <form onSubmit={handleCreateProfile} className="space-y-3 max-w-md rounded-lg border border-border p-4">
              <div className="space-y-2">
                <Label htmlFor="new-profile-name">{t("profielen.naam")}</Label>
                <Input
                  id="new-profile-name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder={t("profielen.naamPlaceholder")}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>{t("profielen.relatie")}</Label>
                <div className="flex flex-wrap gap-2">
                  {(["Partner", "Kind", "Ouder", "Overig"] as const).map((rel) => (
                    <Button
                      key={rel}
                      type="button"
                      variant={newProfileRelatie === rel ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewProfileRelatie(rel)}
                    >
                      {t(`profielen.relaties.${rel}`)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={profileSaving || !newProfileName.trim()}>
                  {profileSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("profielen.aanmaken")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateProfile(false)}
                >
                  {t("profielen.annuleren")}
                </Button>
              </div>
            </form>
          ) : profiles.length < 5 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateProfile(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("profielen.nieuwProfiel")}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("profielen.maxBereikt")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> {t("wachtwoord.titel")}
          </CardTitle>
          <CardDescription>
            {t("wachtwoord.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="huidig">{t("wachtwoord.huidig")}</Label>
              <Input
                id="huidig"
                type="password"
                value={huidigWachtwoord}
                onChange={(e) => setHuidigWachtwoord(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nieuw">{t("wachtwoord.nieuw")}</Label>
              <Input
                id="nieuw"
                type="password"
                value={nieuwWachtwoord}
                onChange={(e) => setNieuwWachtwoord(e.target.value)}
                required
                minLength={8}
              />
              <PasswordStrengthMeter password={nieuwWachtwoord} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bevestig">{t("wachtwoord.bevestig")}</Label>
              <Input
                id="bevestig"
                type="password"
                value={bevestigWachtwoord}
                onChange={(e) => setBevestigWachtwoord(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {message && (
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {message.text}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("wachtwoord.wijzigen")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Backup & Restore (M2) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> {t("backup.titel")}
          </CardTitle>
          <CardDescription>
            {t("backup.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download backup */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("backup.downloadTitel")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("backup.downloadBeschrijving")}
            </p>
            <Button
              onClick={handleDownloadBackup}
              disabled={downloading}
              variant="outline"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t("backup.downloadKnop")}
            </Button>
            {backupMessage && (
              <p
                className={`text-sm ${
                  backupMessage.type === "success"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {backupMessage.text}
              </p>
            )}
          </div>

          <hr />

          {/* Restore backup */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-sm font-medium">{t("backup.herstelTitel")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("backup.herstelBeschrijving")}
            </p>
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
              <Label htmlFor="restore-password">
                {t("backup.wachtwoordLabel")}
              </Label>
              <Input
                id="restore-password"
                type="password"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                placeholder={t("backup.wachtwoordPlaceholder")}
              />
            </div>
            <Button
              onClick={() => setShowRestoreConfirm(true)}
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
              <p
                className={`text-sm ${
                  restoreMessage.type === "success"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {restoreMessage.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-backup (Electron only) */}
      {isElectron && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" /> {t("autoBackup.titel")}
            </CardTitle>
            <CardDescription>
              {t("autoBackup.beschrijving")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="auto-backup-toggle" className="flex-1">
                {t("autoBackup.inschakelen")}
              </Label>
              <button
                id="auto-backup-toggle"
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
                  <Button
                    onClick={handleSaveAutoBackup}
                    disabled={autoBackupSaving || !autoBackupPad}
                  >
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
              <p
                className={`text-sm ${
                  autoBackupMessage.type === "success"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {autoBackupMessage.text}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      </div>
      </div>
      {/* End two-column grid */}

      {/* Security info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> {t("beveiliging.titel")}
          </CardTitle>
          <CardDescription>
            {t("beveiliging.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span>{t("beveiliging.sqlcipher")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span>
              {t("beveiliging.aesGcm")}
            </span>
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
            <h3 className="text-sm font-semibold mb-2">{t("beveiliging.handtekeningTitel")}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t("beveiliging.handtekeningBeschrijving")}
            </p>
            <DataHandtekening />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> {t("overLumio.titel")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {t("overLumio.beschrijving")}
          </p>
          <p className="mt-2">
            {t("overLumio.juridisch")}
          </p>
        </CardContent>
      </Card>

      {/* Account deletion (M3) */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" /> {t("verwijderen.titel")}
          </CardTitle>
          <CardDescription>
            {t("verwijderen.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="delete-password">
              {t("verwijderen.bevestigLabel")}
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t("verwijderen.bevestigPlaceholder")}
            />
          </div>
          {deleteMessage && (
            <p
              className={`text-sm ${
                deleteMessage.type === "success"
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {deleteMessage.text}
            </p>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!deletePassword || deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {t("verwijderen.knop")}
          </Button>
        </CardContent>
      </Card>

      {/* Restore confirmation dialog */}
      <Dialog
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
      >
        <DialogHeader>
          <DialogTitle>{t("dialogen.herstel.titel")}</DialogTitle>
          <DialogDescription>
            {t("dialogen.herstel.beschrijving")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRestoreConfirm(false)}
          >
            {t("dialogen.herstel.annuleren")}
          </Button>
          <Button onClick={handleRestore}>{t("dialogen.herstel.bevestigen")}</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("dialogen.verwijderAlles.titel")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogen.verwijderAlles.beschrijving")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
          >
            {t("dialogen.verwijderAlles.annuleren")}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            {t("dialogen.verwijderAlles.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Profile delete confirmation dialog */}
      <Dialog
        open={showDeleteProfileConfirm !== null}
        onOpenChange={(open) => !open && setShowDeleteProfileConfirm(null)}
      >
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("dialogen.verwijderProfiel.titel")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogen.verwijderProfiel.beschrijving")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteProfileConfirm(null)}
          >
            {t("dialogen.verwijderProfiel.annuleren")}
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              showDeleteProfileConfirm &&
              handleDeleteProfile(showDeleteProfileConfirm)
            }
          >
            {t("dialogen.verwijderProfiel.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
