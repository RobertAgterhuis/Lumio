"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { IdleWarningDialog } from "@/components/layout/IdleWarningDialog";
import { ShortcutsDialog } from "@/components/layout/ShortcutsDialog";
import { OnboardingWizard } from "@/components/wizard/OnboardingWizard";
import { WizardReturnBadge } from "@/components/wizard/WizardReturnBadge";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Lazy-load HelpPanel to reduce initial bundle size (loaded when user opens help)
const HelpPanel = dynamic(() => import("@/components/help/HelpPanel").then(m => m.HelpPanel), {
  ssr: false,
  loading: () => null,
});

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isUnlocked, setUnlocked, lock, setProfiles, setActiveProfile, setProfileSelected, setReadOnly, isReadOnly, activeProfile } =
    useAuthStore();
  const initForUser = usePreferencesStore((s) => s.initForUser);
  const [checking, setChecking] = useState(!isUnlocked);
  const t = useTranslations("auth.sessie");

  const handleIdleLock = async () => {
    try {
      await api.post("/api/auth/vergrendel");
    } catch {
      // Lock locally regardless
    }
    lock();
  };

  const { showWarning, secondsLeft, dismiss } = useIdleTimer(handleIdleLock);
  useKeyboardShortcuts();

  // Load per-user dashboard preferences whenever the active profile changes
  useEffect(() => {
    if (activeProfile?.id) {
      initForUser(activeProfile.id);
    }
  }, [activeProfile?.id, initForUser]);

  useEffect(() => {
    if (isUnlocked) {
      setChecking(false);
      return;
    }

    // Zustand loses state on refresh — verify with backend
    api
      .get<{
        isOntgrendeld: boolean;
        isEersteKeer: boolean;
        isAlleenLezen: boolean;
        profielGeselecteerd: boolean;
        actiefProfiel: { id: string; naam: string } | null;
      }>("/api/auth/status")
      .then(async (data) => {
        if (data.isOntgrendeld) {
          setUnlocked(true);
          setReadOnly(data.isAlleenLezen);
          setProfileSelected(data.profielGeselecteerd);

          // Restore profile state on refresh
          if (data.actiefProfiel) {
            try {
              const profiles = await api.get<Profile[]>("/api/profielen");
              setProfiles(profiles);
              const active = profiles.find(
                (p) => p.id === data.actiefProfiel!.id
              );
              if (active) setActiveProfile(active);
            } catch {
              // Non-critical
            }
          }
        } else {
          router.replace("/");
        }
      })
      .catch((err) => { console.error("Auth check failed:", err); router.replace("/"); })
      .finally(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only check
  }, []);

  useEffect(() => {
    if (!checking && !isUnlocked) {
      router.replace("/");
    }
  }, [isUnlocked, checking, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">{t("controleren")}</p>
      </div>
    );
  }

  if (!isUnlocked) return null;

  return (
    <div className="flex h-screen">
      {/* SC 2.4.1 — skip link targets #authenticated-main (unique id to avoid duplicating root layout's #main-content) */}
      <a
        href="#authenticated-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-sticky focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        {t("skipNaarInhoud")}
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {isReadOnly && (
          <Alert variant="warning" className="rounded-none border-x-0 border-t-0">
            <AlertDescription>
              <strong>{t("alleenLezen")}</strong> — {t("alleenLezenBeschrijving")}
            </AlertDescription>
          </Alert>
        )}
        {/* Portal target for PageBanner — same visual position as the read-only banner */}
        <div id="page-banner-portal" className="shrink-0" />
        <ErrorBoundary>
          <main id="authenticated-main" tabIndex={-1} className="flex-1 overflow-y-auto p-6 outline-none bg-[radial-gradient(ellipse_at_top_left,var(--color-primary-100)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,var(--color-primary-100)/0.05_0%,transparent_50%)]">
            {children}
          </main>
        </ErrorBoundary>
      </div>
      <IdleWarningDialog
        open={showWarning}
        secondsLeft={secondsLeft}
        onDismiss={dismiss}
      />
      <ShortcutsDialog />
      <HelpPanel />
      {!isReadOnly && <OnboardingWizard />}
      {/* SP-UX-01-003: return badge shown on wizard-step pages opened via the wizard */}
      {!isReadOnly && <WizardReturnBadge />}
    </div>
  );
}
