"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { IdleWarningDialog } from "@/components/layout/IdleWarningDialog";
import { useAuthStore } from "@/stores/authStore";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { api } from "@/lib/api-client";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isUnlocked, setUnlocked, lock } = useAuthStore();
  const [checking, setChecking] = useState(!isUnlocked);

  const handleIdleLock = async () => {
    try {
      await api.post("/api/auth/vergrendel");
    } catch {
      // Lock locally regardless
    }
    lock();
  };

  const { showWarning, secondsLeft, dismiss } = useIdleTimer(handleIdleLock);

  useEffect(() => {
    if (isUnlocked) {
      setChecking(false);
      return;
    }

    // Zustand loses state on refresh — verify with backend
    api
      .get<{ isOntgrendeld: boolean; isEersteKeer: boolean }>("/api/auth/status")
      .then((data) => {
        if (data.isOntgrendeld) {
          setUnlocked(true);
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
        <p className="text-muted-foreground">Sessie controleren...</p>
      </div>
    );
  }

  if (!isUnlocked) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
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
    </div>
  );
}
