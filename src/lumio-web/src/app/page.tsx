"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UnlockForm } from "@/components/auth/UnlockForm";
import { SetupForm } from "@/components/auth/SetupForm";
import { HeirUnlockForm } from "@/components/auth/HeirUnlockForm";
import { ProfileSelector } from "@/components/auth/ProfileSelector";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const router = useRouter();
  const {
    isUnlocked,
    isFirstRun,
    isLoading,
    profileSelected,
    profileNeedsSetup,
    setUnlocked,
    setFirstRun,
    setReadOnly,
    setLoading,
    setProfiles,
    setActiveProfile,
    setProfileSelected,
    setProfileNeedsSetup,
  } = useAuthStore();
  const [heirMode, setHeirMode] = useState(false);
  const t = useTranslations("auth");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Load profiles list
        const profiles = await api.get<Profile[]>("/api/profielen");
        setProfiles(profiles);

        // Check auth status (includes profile state)
        const status = await api.get<{
          isOntgrendeld: boolean;
          isEersteKeer: boolean;
          isAlleenLezen: boolean;
          profielGeselecteerd: boolean;
          actiefProfiel: { id: string; naam: string } | null;
          profielHeeftSetupNodig: boolean;
        }>("/api/auth/status");
        setUnlocked(status.isOntgrendeld);
        setFirstRun(status.isEersteKeer);
        setReadOnly(status.isAlleenLezen);
        setProfileSelected(status.profielGeselecteerd);
        setProfileNeedsSetup(status.profielHeeftSetupNodig);

        if (status.actiefProfiel) {
          const activeProfile = profiles.find(
            (p) => p.id === status.actiefProfiel!.id
          );
          if (activeProfile) setActiveProfile(activeProfile);
        }
      } catch {
        // API not available yet — keep loading
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [setUnlocked, setFirstRun, setLoading, setProfiles, setActiveProfile, setProfileSelected, setProfileNeedsSetup]);

  useEffect(() => {
    if (isUnlocked) {
      router.push("/dashboard");
    }
  }, [isUnlocked, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">{t("laden")}</p>
        </div>
      </div>
    );
  }

  if (isUnlocked) {
    return null; // Redirecting to dashboard
  }

  // Determine which step of the auth flow to show
  const showProfileSelector = !profileSelected;
  const showSetup = profileSelected && profileNeedsSetup;
  const showUnlock = profileSelected && !profileNeedsSetup;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Lumio</h1>
        <p className="mt-2 text-muted-foreground">
          {t("tagline")}
        </p>
      </div>

      {showProfileSelector ? (
        <ProfileSelector onProfileSelected={() => {}} />
      ) : showSetup ? (
        <SetupForm />
      ) : heirMode ? (
        <HeirUnlockForm />
      ) : (
        <UnlockForm />
      )}

      {showUnlock && !heirMode && (
        <button
          onClick={() => setHeirMode((m) => !m)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {t("erfgenaamLink")}
        </button>
      )}

      {showUnlock && heirMode && (
        <button
          onClick={() => setHeirMode(false)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {t("wachtwoordLink")}
        </button>
      )}

      {profileSelected && (
        <button
          onClick={() => {
            setProfileSelected(false);
            setProfileNeedsSetup(false);
            setActiveProfile(null);
          }}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {t("anderProfiel")}
        </button>
      )}
    </div>
  );
}
