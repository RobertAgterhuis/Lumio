"use client";

import { useToastStore } from "@/stores/toastStore";
import { Toast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();
  const t = useTranslations("common");

  if (toasts.length === 0) {
    // Render the aria-live region even when empty so screen readers can announce new toasts
    return (
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-0 right-0 z-50 pointer-events-none"
      />
    );
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-label={t("meldingen")}
      className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toastId={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}
