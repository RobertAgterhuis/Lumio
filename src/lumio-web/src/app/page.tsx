"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UnlockForm } from "@/components/auth/UnlockForm";
import { SetupForm } from "@/components/auth/SetupForm";
import { HeirUnlockForm } from "@/components/auth/HeirUnlockForm";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api-client";

export default function HomePage() {
  const router = useRouter();
  const { isUnlocked, isFirstRun, isLoading, setUnlocked, setFirstRun, setLoading } =
    useAuthStore();
  const [heirMode, setHeirMode] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await api.get<{
          isOntgrendeld: boolean;
          isEersteKeer: boolean;
        }>("/api/auth/status");
        setUnlocked(status.isOntgrendeld);
        setFirstRun(status.isEersteKeer);
      } catch {
        // API not available yet — keep loading
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [setUnlocked, setFirstRun, setLoading]);

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
          <p className="text-muted-foreground">Lumio laden...</p>
        </div>
      </div>
    );
  }

  if (isUnlocked) {
    return null; // Redirecting to dashboard
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Lumio</h1>
        <p className="mt-2 text-muted-foreground">
          Uw digitale nalatenschap, veilig bewaard
        </p>
      </div>
      {isFirstRun ? (
        <SetupForm />
      ) : heirMode ? (
        <HeirUnlockForm />
      ) : (
        <UnlockForm />
      )}
      {!isFirstRun && (
        <button
          onClick={() => setHeirMode((m) => !m)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          {heirMode
            ? "Ontgrendelen met wachtwoord"
            : "Ik ben een erfgenaam (ontgrendelen met sleuteldelen)"}
        </button>
      )}
    </div>
  );
}
