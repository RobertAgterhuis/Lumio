"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { Lock } from "lucide-react";

export function Header() {
  const { lock } = useAuthStore();

  const handleLock = async () => {
    try {
      await api.post("/api/auth/vergrendel");
    } catch {
      // Lock locally regardless
    }
    lock();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <Button variant="ghost" size="sm" onClick={handleLock} className="gap-2">
        <Lock className="h-4 w-4" />
        Vergrendelen
      </Button>
    </header>
  );
}
