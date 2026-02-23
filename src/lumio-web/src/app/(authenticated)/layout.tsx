"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { IdleWarningDialog } from "@/components/layout/IdleWarningDialog";
import { ShortcutsDialog } from "@/components/layout/ShortcutsDialog";
import { OnboardingWizard } from "@/components/wizard/OnboardingWizard";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isUnlocked, setUnlocked, lock, setProfiles, setActiveProfile, setProfileSelected, setReadOnly, isReadOnly } =
    useAuthStore();
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
      .catch(() => router.replace("/"))
      .finally(() => setChecking(false));
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
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              <strong>{t("alleenLezen")}</strong> — {t("alleenLezenBeschrijving")}
            </span>
          </div>
        )}
        <ErrorBoundary>
          <main className="flex-1 overflow-y-auto p-6">
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
      {!isReadOnly && <OnboardingWizard />}
    </div>
  );
}
