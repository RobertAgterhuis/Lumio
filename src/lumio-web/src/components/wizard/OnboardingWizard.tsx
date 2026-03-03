"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDomainQuery } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api-client";
import posthog from "posthog-js";
import {
  User,
  Phone,
  ScrollText,
  Church,
  Download,
  Users,
  UserCheck,
} from "lucide-react";
import { OnboardingWizardModal } from "./OnboardingWizardModal";

export interface OnboardingStap {
  id: string;
  stapKey: string;
  icon: React.ElementType;
  href: string;
}

export const stappen: OnboardingStap[] = [
  { id: "profiel", stapKey: "profiel", icon: User, href: "/eigenaar" },
  { id: "noodcontacten", stapKey: "noodcontacten", icon: Phone, href: "/noodcontacten" },
  { id: "testament", stapKey: "testament", icon: ScrollText, href: "/testament" },
  { id: "erfgenamen", stapKey: "erfgenamen", icon: Users, href: "/erfgenamen" },
  // SP-S2-001 / SP-UX-01-002: Shamir-stap — informeer erfgenamen; icon gewijzigd naar UserCheck (REC-UXDESIGN-001)
  { id: "sleutels", stapKey: "sleutels", icon: UserCheck, href: "/erfgenamen" },
  // SP-UX-02-001: Uitvaart verplaatst naar positie 6 (na erfgenamen + sleutels) — REC-UX-003, REC-UXDESIGN-004
  // Rationale: uitvaartwensen zijn emotioneel zwaar; laattijdig in wizard = minder drop-off
  { id: "uitvaart", stapKey: "uitvaart", icon: Church, href: "/uitvaart" },
  { id: "backup", stapKey: "backup", icon: Download, href: "/instellingen" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { activeProfile } = useAuthStore();
  // S2-05: Profile-bound localStorage key — always per-user, never falls back to shared key
  const storageKey = activeProfile?.id ? `lumio_onboarding_${activeProfile.id}_completed` : null;
  const [visible, setVisible] = useState(false);
  const [localStorageChecked, setLocalStorageChecked] = useState(false);
  // Session-level ref: prevents wizard re-showing after user navigates via it
  const sessionDismissedRef = useRef(false);

  // Load data with React Query
  const { data: eigenaar, isLoading: loadingEigenaar } = useDomainQuery<{ id?: string } | null>("eigenaar");
  const { data: noodcontacten, isLoading: loadingNoodcontacten } = useDomainQuery<unknown[] | null>("noodcontacten");
  const { data: testament, isLoading: loadingTestament } = useDomainQuery<{ id?: string } | null>("testament");
  const { data: uitvaart, isLoading: loadingUitvaart } = useDomainQuery<{ id?: string } | null>("uitvaart");
  const { data: erfgenamen, isLoading: loadingErfgenamen } = useDomainQuery<unknown[] | null>("erfgenamen");
  const { data: statusMeldingen, isLoading: loadingStatus } = useDomainQuery<{ meldingen: { categorie: string }[] } | null>("status/meldingen");

  const loading = loadingEigenaar || loadingNoodcontacten || loadingTestament || loadingUitvaart || loadingErfgenamen || loadingStatus;

  // Derive completion status from query data
  const stapStatus = useMemo(() => ({
    profiel: !!eigenaar?.id,
    noodcontacten: Array.isArray(noodcontacten) && noodcontacten.length > 0,
    testament: !!testament?.id,
    uitvaart: !!uitvaart?.id,
    erfgenamen: Array.isArray(erfgenamen) && erfgenamen.length > 0,
    // SP-S2-001: Shamir-sleutels zijn verdeeld wanneer alle erfgenamen (min. 2) een share hebben ontvangen
    sleutels:
      Array.isArray(erfgenamen) &&
      erfgenamen.length >= 2 &&
      (erfgenamen as Array<{ heeftShareOntvangen?: boolean }>).every(
        (e) => e.heeftShareOntvangen === true
      ),
    backup: !statusMeldingen?.meldingen?.some((m) => m.categorie === "backup"),
  }), [eigenaar, noodcontacten, testament, uitvaart, erfgenamen, statusMeldingen]);

  // Check localStorage and determine visibility
  // Guard: do NOT run until we have a confirmed profile ID — prevents reading a shared/stale key
  useEffect(() => {
    if (!storageKey) return;
    const sessionKey = `${storageKey}_session`;
    if (sessionStorage.getItem(sessionKey) === "true") {
      sessionDismissedRef.current = true;
    }
    const completed = localStorage.getItem(storageKey);
    if (completed === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
    }
    setLocalStorageChecked(true);
  }, [storageKey]);

  // Auto-complete onboarding when all steps done
  useEffect(() => {
    if (!storageKey || !localStorageChecked || loading) return;

    const allDone = stappen.every((s) => stapStatus[s.id as keyof typeof stapStatus]);
    if (allDone) {
      const wasAlreadyCompleted = localStorage.getItem(storageKey) === "true";
      localStorage.setItem(storageKey, "true");
      void api.post("/api/eigenaar/onboarding-voltooid").catch(() => void 0);
      if (!wasAlreadyCompleted) {
        // SP-5-002: fire once when all onboarding steps are newly completed — GUARD-006 compliant
        posthog.capture("lumio_activated", {
          stappen_voltooid: 7,
          activatie_reden: "onboarding_wizard_compleet",
        });
        // SP-UX-03-001: trigger celebration banner on dashboard
        window.dispatchEvent(new CustomEvent("lumio:dossier-volledig"));
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
    } else {
      const completed = localStorage.getItem(storageKey);
      if (completed !== "true" && !sessionDismissedRef.current) {
        setVisible(true);
      }
    }
  }, [localStorageChecked, loading, stapStatus, storageKey]);

  const dismissForSession = () => {
    if (!storageKey) return;
    const sessionKey = `${storageKey}_session`;
    sessionStorage.setItem(sessionKey, "true");
    sessionDismissedRef.current = true;
  };

  const handleComplete = () => {
    if (!storageKey) return;
    dismissForSession();
    // Permanently complete only when all steps are truly done
    if (stappen.every((s) => stapStatus[s.id as keyof typeof stapStatus])) {
      const wasAlreadyCompleted = localStorage.getItem(storageKey) === "true";
      localStorage.setItem(storageKey, "true");
      void api.post("/api/eigenaar/onboarding-voltooid").catch(() => void 0);
      if (!wasAlreadyCompleted) {
        // SP-5-002: fire once on manual close when all steps done — GUARD-006 compliant
        posthog.capture("lumio_activated", {
          stappen_voltooid: 7,
          activatie_reden: "onboarding_wizard_compleet",
        });
        // SP-UX-03-001: trigger celebration banner on dashboard
        window.dispatchEvent(new CustomEvent("lumio:dossier-volledig"));
      }
    }
    setVisible(false);
  };

  const handleDontShowAgain = () => {
    if (!storageKey) return;
    // Permanently suppress the wizard (survives app restarts)
    localStorage.setItem(storageKey, "true");
    sessionDismissedRef.current = true;
    setVisible(false);
  };

  const handleNavigate = (href: string) => {
    dismissForSession();
    setVisible(false);
    // SP-UX-01-003: append ?vanWizard=true so destination page can show a return badge (REC-UXDESIGN-002)
    const separator = href.includes("?") ? "&" : "?";
    router.push(`${href}${separator}vanWizard=true`);
  };

  // SP-UX-01-003: allow WizardReturnBadge (on any wizard-step page) to reopen the wizard
  useEffect(() => {
    const handleReopen = () => {
      if (!storageKey) return;
      // Clear session-dismissed signal so wizard is allowed to show again
      const sessionKey = `${storageKey}_session`;
      sessionStorage.removeItem(sessionKey);
      sessionDismissedRef.current = false;
      setVisible(true);
    };
    window.addEventListener("lumio:wizard:reopen", handleReopen);
    return () => window.removeEventListener("lumio:wizard:reopen", handleReopen);
  }, [storageKey]);

  const completedCount = stappen.filter((s) => stapStatus[s.id as keyof typeof stapStatus]).length;

  if (loading || !localStorageChecked || !visible) return null;

  return (
    <OnboardingWizardModal
      stappen={stappen}
      stapStatus={stapStatus}
      completedCount={completedCount}
      onNavigate={handleNavigate}
      onClose={handleComplete}
      onDontShowAgain={handleDontShowAgain}
    />
  );
}
