"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import {
  getIdleTimeoutMinutes,
  setIdleTimeoutMinutes,
} from "@/hooks/useIdleTimer";
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
} from "lucide-react";

const TIMEOUT_OPTIONS = [
  { value: 1, label: "1 minuut" },
  { value: 2, label: "2 minuten" },
  { value: 5, label: "5 minuten" },
  { value: 10, label: "10 minuten" },
  { value: 15, label: "15 minuten" },
  { value: 30, label: "30 minuten" },
  { value: 0, label: "Uitgeschakeld" },
];

export default function InstellingenPage() {
  const router = useRouter();
  const { lock, profiles, activeProfile, setProfiles } = useAuthStore();

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
      setProfileMessage({ type: "success", text: `Profiel "${profile.naam}" aangemaakt.` });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Profiel aanmaken mislukt.",
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
      setProfileMessage({ type: "success", text: "Profiel verwijderd." });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Profiel verwijderen mislukt.",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (nieuwWachtwoord !== bevestigWachtwoord) {
      setMessage({ type: "error", text: "Wachtwoorden komen niet overeen." });
      return;
    }

    if (nieuwWachtwoord.length < 8) {
      setMessage({
        type: "error",
        text: "Wachtwoord moet minimaal 8 tekens bevatten.",
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
        text: "Wachtwoord succesvol gewijzigd.",
      });
      setHuidigWachtwoord("");
      setNieuwWachtwoord("");
      setBevestigWachtwoord("");
    } catch {
      setMessage({
        type: "error",
        text: "Wachtwoord wijzigen mislukt. Controleer uw huidige wachtwoord.",
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
      setBackupMessage({ type: "success", text: "Backup gedownload." });
    } catch {
      setBackupMessage({
        type: "error",
        text: "Backup downloaden mislukt.",
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
        text: "Backup hersteld. U wordt doorgestuurd naar het ontgrendelscherm.",
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
            : "Backup herstellen mislukt.",
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
        setAutoBackupMessage({ type: "success", text: "Auto-backup instellingen opgeslagen." });
      } else {
        await (window as any).lumio.setAutoBackupConfig(null);
        setAutoBackupMessage({ type: "success", text: "Auto-backup uitgeschakeld." });
      }
    } catch {
      setAutoBackupMessage({ type: "error", text: "Opslaan mislukt." });
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
        setAutoBackupMessage({ type: "success", text: "Test-backup succesvol aangemaakt." });
      } else {
        setAutoBackupMessage({ type: "error", text: result.error || "Backup mislukt." });
      }
    } catch {
      setAutoBackupMessage({ type: "error", text: "Backup mislukt." });
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
        text: "Alle gegevens zijn verwijderd. U wordt doorgestuurd...",
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
            : "Verwijderen mislukt. Controleer uw wachtwoord.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Instellingen</h1>
        <p className="text-muted-foreground mt-1">
          Beheer uw beveiligingsinstellingen
        </p>
      </div>

      {/* Auto-lock timeout (M1) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" /> Auto-vergrendeling
          </CardTitle>
          <CardDescription>
            Vergrendel de app automatisch na een periode van inactiviteit. U
            krijgt 30 seconden voor vergrendeling een waarschuwing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TIMEOUT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={idleTimeout === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleIdleTimeoutChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile management (M7) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Profielen
          </CardTitle>
          <CardDescription>
            Beheer profielen voor uzelf en uw naasten. Elk profiel heeft een
            eigen versleutelde database. Maximaal 5 profielen.
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
                        <span className="ml-2 text-xs text-primary font-normal">(actief)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{profile.relatie}</p>
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
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {profileMessage.text}
            </p>
          )}

          {/* Create new profile form */}
          {showCreateProfile ? (
            <form onSubmit={handleCreateProfile} className="space-y-3 max-w-md rounded-lg border border-border p-4">
              <div className="space-y-2">
                <Label htmlFor="new-profile-name">Naam</Label>
                <Input
                  id="new-profile-name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Bijv. Jan, Partner"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Relatie</Label>
                <div className="flex flex-wrap gap-2">
                  {["Partner", "Kind", "Ouder", "Overig"].map((rel) => (
                    <Button
                      key={rel}
                      type="button"
                      variant={newProfileRelatie === rel ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewProfileRelatie(rel)}
                    >
                      {rel}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={profileSaving || !newProfileName.trim()}>
                  {profileSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Aanmaken
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateProfile(false)}
                >
                  Annuleren
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
              Nieuw profiel toevoegen
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Maximaal 5 profielen bereikt.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Wachtwoord wijzigen
          </CardTitle>
          <CardDescription>
            Wijzig uw hoofdwachtwoord. Na wijziging wordt de database opnieuw
            versleuteld met het nieuwe wachtwoord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="huidig">Huidig wachtwoord</Label>
              <Input
                id="huidig"
                type="password"
                value={huidigWachtwoord}
                onChange={(e) => setHuidigWachtwoord(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nieuw">Nieuw wachtwoord</Label>
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
              <Label htmlFor="bevestig">Bevestig nieuw wachtwoord</Label>
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
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Wachtwoord wijzigen
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Backup & Restore (M2) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> Backup & Herstel
          </CardTitle>
          <CardDescription>
            Maak een backup van uw versleutelde database of herstel een eerdere
            backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download backup */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Backup downloaden</h3>
            <p className="text-sm text-muted-foreground">
              Download een versleuteld ZIP-bestand met uw volledige database.
              Bewaar dit bestand op een veilige locatie.
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
              Download backup
            </Button>
            {backupMessage && (
              <p
                className={`text-sm ${
                  backupMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {backupMessage.text}
              </p>
            )}
          </div>

          <hr />

          {/* Restore backup */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-sm font-medium">Backup herstellen</h3>
            <p className="text-sm text-muted-foreground">
              Herstel een eerdere backup. Dit vervangt alle huidige gegevens. U
              hebt het wachtwoord van de backup nodig.
            </p>
            <div className="space-y-2">
              <Label htmlFor="restore-file">Backup-bestand (.zip)</Label>
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
                Wachtwoord van de backup
              </Label>
              <Input
                id="restore-password"
                type="password"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                placeholder="Wachtwoord waarmee de backup is versleuteld"
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
              Backup herstellen
            </Button>
            {restoreMessage && (
              <p
                className={`text-sm ${
                  restoreMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
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
              <HardDrive className="h-5 w-5" /> Automatische backup
            </CardTitle>
            <CardDescription>
              Configureer automatische backups naar een map op uw computer of USB-stick.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="auto-backup-toggle" className="flex-1">
                Automatische backup inschakelen
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
                  <Label>Backup-map</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={autoBackupPad}
                      placeholder="Selecteer een map..."
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleSelectBackupDirectory}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Bladeren
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-backup-freq">Frequentie</Label>
                  <select
                    id="auto-backup-freq"
                    value={autoBackupFrequentie}
                    onChange={(e) => setAutoBackupFrequentie(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="dagelijks">Dagelijks</option>
                    <option value="wekelijks">Wekelijks</option>
                    <option value="maandelijks">Maandelijks</option>
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
                    Opslaan
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
                    Nu backup maken
                  </Button>
                </div>
              </div>
            )}

            {autoBackupMessage && (
              <p
                className={`text-sm ${
                  autoBackupMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {autoBackupMessage.text}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Beveiliging
          </CardTitle>
          <CardDescription>
            Informatie over de beveiliging van uw gegevens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Database versleuteld met SQLCipher (AES-256-CBC)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>
              Gevoelige velden extra versleuteld (AES-256-GCM)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Alleen lokale verbinding (127.0.0.1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Geen internetverbinding vereist</span>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Over Lumio
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Lumio is een hulpmiddel voor het vastleggen van uw digitale
            nalatenschap. Alle gegevens worden lokaal en versleuteld opgeslagen.
          </p>
          <p className="mt-2">
            Een notarieel testament blijft vereist voor juridische geldigheid
            conform het Burgerlijk Wetboek (BW Boek 4).
          </p>
        </CardContent>
      </Card>

      {/* Account deletion (M3) */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" /> Alle gegevens wissen
          </CardTitle>
          <CardDescription>
            Verwijder uw volledige database permanent. Dit kan niet ongedaan
            worden gemaakt. Maak eerst een backup als u uw gegevens wilt
            bewaren.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="delete-password">
              Bevestig met uw wachtwoord
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Voer uw wachtwoord in ter bevestiging"
            />
          </div>
          {deleteMessage && (
            <p
              className={`text-sm ${
                deleteMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
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
            Alle gegevens permanent verwijderen
          </Button>
        </CardContent>
      </Card>

      {/* Restore confirmation dialog */}
      <Dialog
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
      >
        <DialogHeader>
          <DialogTitle>Backup herstellen?</DialogTitle>
          <DialogDescription>
            Weet u het zeker? Dit vervangt alle huidige gegevens door de
            gegevens uit de backup. Deze actie kan niet ongedaan worden
            gemaakt.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRestoreConfirm(false)}
          >
            Annuleren
          </Button>
          <Button onClick={handleRestore}>Ja, herstel backup</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Alle gegevens permanent verwijderen?
          </DialogTitle>
          <DialogDescription>
            Weet u het zeker? Alle gegevens worden permanent verwijderd. Dit
            omvat uw profiel, wachtwoorden, documenten, testament-gegevens en
            alle andere opgeslagen informatie. Deze actie kan niet ongedaan
            worden gemaakt.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Annuleren
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Ja, verwijder alles permanent
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
            Profiel verwijderen?
          </DialogTitle>
          <DialogDescription>
            Weet u het zeker? Het profiel en de bijbehorende database worden
            permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteProfileConfirm(null)}
          >
            Annuleren
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              showDeleteProfileConfirm &&
              handleDeleteProfile(showDeleteProfileConfirm)
            }
          >
            Ja, verwijder profiel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
