"use client";

import { PageTransition } from "@/components/ui/transitions";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { useDomainQuery } from "@/hooks";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
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
  ReferralCard,
} from "@/components/instellingen";
import { HelpButton } from "@/components/help/HelpButton";

/** Resolve initial tab from URL hash (e.g. #backup → beveiliging). */
function getInitialTab(): string {
  if (typeof window === "undefined") return "voorkeuren";
  const hash = window.location.hash.replace("#", "");
  if (hash === "backup" || hash === "beveiliging") return "beveiliging";
  if (["voorkeuren", "weergave", "account"].includes(hash)) return hash;
  return "voorkeuren";
}

export default function InstellingenPage() {
  const router = useRouter();
  const { lock, setProfiles } = useAuthStore();
  const backupRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const t = useTranslations("instellingen");

  // Scroll to backup card when deep-linked via #backup
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#backup" && backupRef.current) {
      // Small delay to let the tab content render first
      requestAnimationFrame(() => {
        backupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        backupRef.current?.focus();
      });
    }
  }, [activeTab]);

  // ── Dialog state ──────────────────────────────────────────────────────
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState<string | null>(null);
  const [pendingRestoreHandler, setPendingRestoreHandler] = useState<(() => void) | null>(null);
  const [pendingDeleteAccountHandler, setPendingDeleteAccountHandler] = useState<(() => void) | null>(null);

  // ── Profiles data ─────────────────────────────────────────────────────
  const { data: profilesData, refetch: refetchProfiles } = useDomainQuery<Profile[]>("profielen");
  useEffect(() => {
    if (profilesData) setProfiles(profilesData);
  }, [profilesData, setProfiles]);

  const handleDeleteProfile = async (profileId: string) => {
    setShowDeleteProfileConfirm(null);
    try {
      await api.delete(`/api/profielen/${profileId}`);
      refetchProfiles();
    } catch { /* handled in component */ }
  };

  const handleRestoreConfirm = () => {
    pendingRestoreHandler?.();
    setPendingRestoreHandler(null);
    setShowRestoreConfirm(false);
  };

  const handleDeleteAccountConfirm = () => {
    pendingDeleteAccountHandler?.();
    setPendingDeleteAccountHandler(null);
    setShowDeleteConfirm(false);
  };

  const handlePostAction = () => {
    lock();
    router.replace("/");
  };

  // Sync active tab to URL hash for deep-linking / back-button
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${value}`);
    }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          {t("titel")}
          <HelpButton />
        </h1>
        <p className="text-muted-foreground mt-1">{t("ondertitel")}</p>
      </div>

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="voorkeuren">{t("tabs.voorkeuren")}</TabsTrigger>
          <TabsTrigger value="weergave">{t("tabs.weergave")}</TabsTrigger>
          <TabsTrigger value="beveiliging">{t("tabs.beveiliging")}</TabsTrigger>
          <TabsTrigger value="account">{t("tabs.account")}</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Voorkeuren ──────────────────────────────────────── */}
        <TabsContent value="voorkeuren" className="pt-4">
          <div className="grid gap-6 sm:grid-cols-2 items-start">
            <div className="flex flex-col gap-6">
              <AutoLockCard />
              <TaalkeuzeCard />
            </div>
            <div className="flex flex-col gap-6">
              <ActualisatieCard />
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: Weergave ────────────────────────────────────────── */}
        <TabsContent value="weergave" className="pt-4">
          <div className="grid gap-6 sm:grid-cols-2 items-start">
            <GroteTekstCard />
            <DashboardWeergaveCard />
          </div>
        </TabsContent>

        {/* ── Tab 3: Beveiliging ─────────────────────────────────────── */}
        <TabsContent value="beveiliging" className="pt-4">
          <div className="grid gap-6 sm:grid-cols-2 items-start">
            <PasswordChangeCard />
            <div className="flex flex-col gap-6">
              <div id="backup" ref={backupRef} tabIndex={-1} className="outline-none">
                <BackupRestoreCard
                  onRestoreRequest={(handler: () => void) => {
                    setPendingRestoreHandler(() => handler);
                    setShowRestoreConfirm(true);
                  }}
                  onPostRestore={handlePostAction}
                />
              </div>
              <SecurityInfoCard />
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Account ─────────────────────────────────────────── */}
        <TabsContent value="account" className="pt-4">
          <div className="grid gap-6 sm:grid-cols-2 items-start">
            <ProfilesCard onDeleteRequest={(id) => setShowDeleteProfileConfirm(id)} />
            <div className="flex flex-col gap-6">
              <ReferralCard />
              <AboutCard />
            </div>
          </div>

          {/* Destructive zone — visually separated */}
          <hr className="my-8 border-border" />
          <AccountDeletionCard
            onDeleteRequest={(handler: () => void) => {
              setPendingDeleteAccountHandler(() => handler);
              setShowDeleteConfirm(true);
            }}
            onPostDelete={handlePostAction}
          />
        </TabsContent>
      </Tabs>

      {/* ── Confirmation dialogs ────────────────────────────────────── */}
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
    </PageTransition>
  );
}
