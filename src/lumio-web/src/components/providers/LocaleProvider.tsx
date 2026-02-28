"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "./ToastProvider";
import { QueryProvider } from "./QueryProvider";
import { AxeDevTools } from "./AxeDevTools";

type Messages = Record<string, unknown>;

const LOCALE_KEY = "lumio-locale";
const DEFAULT_LOCALE = "nl";
const SUPPORTED = ["nl", "en"] as const;

function getStoredLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored && (SUPPORTED as readonly string[]).includes(stored)
    ? stored
    : DEFAULT_LOCALE;
}

/**
 * Loads the root bundle (shared + ui + auth + dashboard namespaces) for a given locale.
 * Domain-specific namespaces are not part of this bundle — they are loaded per-route
 * by DomainMessagesProvider wrappers in each domain's layout.tsx.
 */
async function loadMessages(locale: string): Promise<Messages> {
  if (locale === "en") {
    const [shared, ui, auth, dashboard] = await Promise.all([
      import("../../../messages/en/shared.json"),
      import("../../../messages/en/ui.json"),
      import("../../../messages/en/auth.json"),
      import("../../../messages/en/dashboard.json"),
    ]);
    return {
      ...shared.default,
      ...ui.default,
      ...auth.default,
      ...dashboard.default,
    } as Messages;
  }
  const [shared, ui, auth, dashboard] = await Promise.all([
    import("../../../messages/nl/shared.json"),
    import("../../../messages/nl/ui.json"),
    import("../../../messages/nl/auth.json"),
    import("../../../messages/nl/dashboard.json"),
  ]);
  return {
    ...shared.default,
    ...ui.default,
    ...auth.default,
    ...dashboard.default,
  } as Messages;
}

/**
 * Client-side locale provider that reads the locale from localStorage
 * and dynamically loads the correct message bundle.
 *
 * This is necessary because with `output: "export"` (static export),
 * the server-side getRequestConfig always falls back to "nl" since
 * localStorage is not available during build/SSR.
 */
export function LocaleProvider({
  defaultLocale,
  defaultMessages,
  children,
}: {
  defaultLocale: string;
  defaultMessages: Messages;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState(defaultLocale);
  const [messages, setMessages] = useState<Messages>(defaultMessages);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== defaultLocale) {
      loadMessages(stored).then((msgs) => {
        setLocale(stored);
        setMessages(msgs);
      });
    }
  }, [defaultLocale]);

  // Update html lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        {children}
      </QueryProvider>
      <ToastProvider />
      <AxeDevTools />
    </NextIntlClientProvider>
  );
}
