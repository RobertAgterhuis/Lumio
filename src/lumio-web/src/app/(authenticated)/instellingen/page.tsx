"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { useTranslations } from "next-intl";
import {
  PasswordChangeCard,
  ProfilesCard,
  BackupRestoreCard,
  SecurityInfoCard,
  AccountDeletionCard,
  AboutCard,
  AutoLockCard,
  GroteTekstCard,
  DashboardWeergaveCard,
  TaalkeuzeCard,
  ActualisatieCard,
} from "@/components/instellingen";

export default function InstellingenPage() {
  const router = useRouter();
  const { lock, profiles, setProfiles } = useAuthStore();
  const t = useTranslations("instellingen");

  // Dialog state (orchestrated at page level)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState<string | null>(null);

  // Callback refs for child component handlers
  const [pendingRestoreHandler, setPendingRestoreHandler] = useState<(() => void) | null>(null);
  const [pendingDeleteAccountHandler, setPendingDeleteAccountHandler] = useState<(() => void) | null>(null);

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

  // Profile deletion handler
  const handleDeleteProfile = async (profileId: string) => {
    setShowDeleteProfileConfirm(null);
    try {
      await api.delete(`/api/profielen/${profileId}`);
      setProfiles(profiles.filter((p) => p.id !== profileId));
    } catch {
      // Error handled in component
    }
  };

  // Restore confirmation handler
  const handleRestoreConfirm = () => {
    if (pendingRestoreHandler) {
      pendingRestoreHandler();
      setPendingRestoreHandler(null);
    }
    setShowRestoreConfirm(false);
  };

  // Delete account confirmation handler
  const handleDeleteAccountConfirm = () => {
    if (pendingDeleteAccountHandler) {
      pendingDeleteAccountHandler();
      setPendingDeleteAccountHandler(null);
    }
    setShowDeleteConfirm(false);
  };

  // Post-restore/delete redirect
  const handlePostAction = () => {
    lock();
    router.replace("/");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">{t("ondertitel")}</p>
      </div>

      {/* Two-column grid layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column — Preferences */}
        <div className="space-y-6">
          <AutoLockCard />
          <GroteTekstCard />
          <DashboardWeergaveCard />
          <TaalkeuzeCard />
          <ActualisatieCard />
        </div>

        {/* Right column — Account & Data */}
        <div className="space-y-6">
          <ProfilesCard
            onDeleteRequest={(profileId) => setShowDeleteProfileConfirm(profileId)}
          />
          <PasswordChangeCard />
          <BackupRestoreCard
            onRestoreRequest={(handler: () => void) => {
              setPendingRestoreHandler(() => handler);
              setShowRestoreConfirm(true);
            }}
            onPostRestore={handlePostAction}
          />
        </div>
      </div>

      {/* Full-width bottom cards */}
      <SecurityInfoCard />
      <AboutCard />
      <AccountDeletionCard
        onDeleteRequest={(handler: () => void) => {
          setPendingDeleteAccountHandler(() => handler);
          setShowDeleteConfirm(true);
        }}
        onPostDelete={handlePostAction}
      />

      {/* Restore confirmation dialog */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogHeader>
          <DialogTitle>{t("dialogen.herstel.titel")}</DialogTitle>
          <DialogDescription>{t("dialogen.herstel.beschrijving")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
            {t("dialogen.herstel.annuleren")}
          </Button>
          <Button onClick={handleRestoreConfirm}>
            {t("dialogen.herstel.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete account confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("dialogen.verwijderAlles.titel")}
          </DialogTitle>
          <DialogDescription>{t("dialogen.verwijderAlles.beschrijving")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            {t("dialogen.verwijderAlles.annuleren")}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccountConfirm}>
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
          <DialogDescription>{t("dialogen.verwijderProfiel.beschrijving")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteProfileConfirm(null)}>
            {t("dialogen.verwijderProfiel.annuleren")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => showDeleteProfileConfirm && handleDeleteProfile(showDeleteProfileConfirm)}
          >
            {t("dialogen.verwijderProfiel.bevestigen")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
