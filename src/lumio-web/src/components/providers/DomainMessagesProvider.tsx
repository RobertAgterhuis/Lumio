"use client";

import { useLocale, useMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

interface DomainMessagesProviderProps {
  /**
   * A map of locale → messages for the domain-specific namespaces
   * this provider should make available to its children.
   *
   * Always provide at least "nl" as a fallback.
   * The provider reads the current locale from the nearest NextIntlClientProvider
   * ancestor and picks the correct message set synchronously — no flicker.
   *
   * Example:
   *   import nl from "@/messages/nl/testament.json";
   *   import en from "@/messages/en/testament.json";
   *   <DomainMessagesProvider messages={{ nl, en }}>...</DomainMessagesProvider>
   */
  messages: Record<string, AbstractIntlMessages>;
  children: React.ReactNode;
}

/**
 * Supplements the root NextIntlClientProvider with domain-specific messages.
 *
 * This component is the cornerstone of Sprint L-2. It reads the current locale
 * from the parent provider, picks the pre-imported message set for that locale,
 * and wraps children in a nested NextIntlClientProvider.
 *
 * next-intl v4 merges nested provider messages with the parent, so namespaces
 * from the root bundle (shared, ui, auth, dashboard) remain accessible alongside
 * the domain namespaces provided here.
 *
 * Because both NL and EN messages are imported statically (not dynamically),
 * there is no loading state and no hydration mismatch — both locales are
 * available synchronously from the moment the component mounts.
 *
 * NOTE: next-intl v4 does NOT automatically merge nested provider messages.
 * We use `useMessages()` to read the parent bundle and manually spread domain
 * namespaces on top, so shared/ui/auth/dashboard keys remain accessible.
 */
export function DomainMessagesProvider({
  messages,
  children,
}: DomainMessagesProviderProps) {
  const locale = useLocale();
  const parentMessages = useMessages();
  const domainMessages = messages[locale] ?? messages["nl"];
  const mergedMessages: AbstractIntlMessages = { ...parentMessages, ...domainMessages };

  return (
    <NextIntlClientProvider locale={locale} messages={mergedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
