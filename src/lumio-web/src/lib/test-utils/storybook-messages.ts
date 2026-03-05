/**
 * storybook-messages.ts
 *
 * Utility for merging split i18n message files for Storybook stories.
 * This ensures Storybook components receive the same message structure
 * as runtime (via i18n/request.ts), without relying on build artifacts.
 *
 * Usage in .stories.tsx:
 *   import { storybookMessages } from "@/lib/test-utils/storybook-messages";
 *
 *   decorators: [
 *     (Story) => (
 *       <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
 *         <Story />
 *       </NextIntlClientProvider>
 *     ),
 *   ],
 */

import nlShared from "../../../messages/nl/shared.json";
import nlUi from "../../../messages/nl/ui.json";
import nlAuth from "../../../messages/nl/auth.json";
import nlDashboard from "../../../messages/nl/dashboard.json";
import nlErfgenamen from "../../../messages/nl/erfgenamen.json";

import enShared from "../../../messages/en/shared.json";
import enUi from "../../../messages/en/ui.json";
import enAuth from "../../../messages/en/auth.json";
import enDashboard from "../../../messages/en/dashboard.json";
import enErfgenamen from "../../../messages/en/erfgenamen.json";

type Messages = Record<string, unknown>;

/**
 * Returns merged i18n messages for Storybook stories.
 * Includes root namespaces (shared, ui, auth, dashboard) plus
 * commonly-needed domain namespaces (erfgenamen).
 *
 * Add additional domain imports as needed for specific stories.
 */
export function storybookMessages(locale: "nl" | "en"): Messages {
  if (locale === "en") {
    return {
      ...enShared,
      ...enUi,
      ...enAuth,
      ...enDashboard,
      ...enErfgenamen,
    };
  }

  return {
    ...nlShared,
    ...nlUi,
    ...nlAuth,
    ...nlDashboard,
    ...nlErfgenamen,
  };
}
