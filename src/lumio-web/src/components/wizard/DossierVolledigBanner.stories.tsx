/**
 * DossierVolledigBanner stories — SP-UX-03-001 (REC-UX-006, REC-UXDESIGN-006)
 *
 * Shows the 5-second celebration banner that appears on the dashboard after
 * the onboarding wizard is completed for the first time.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";
import { DossierVolledigBanner } from "./DossierVolledigBanner";

const meta: Meta<typeof DossierVolledigBanner> = {
  title: "Wizard/DossierVolledigBanner",
  component: DossierVolledigBanner,
  parameters: {
    layout: "padded",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
    docs: {
      description: {
        component:
          "Celebration banner shown on the dashboard for 5 seconds when all 7 onboarding steps are newly completed (SP-UX-03-001).",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DossierVolledigBanner>;

/** Fires the custom event on mount so the banner is visible in Storybook. */
const TriggerOnMount = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("lumio:dossier-volledig"));
  }, []);
  return <>{children}</>;
};

export const Zichtbaar: Story = {
  name: "Zichtbaar (event getriggerd)",
  decorators: [
    (Story) => (
      <TriggerOnMount>
        <Story />
      </TriggerOnMount>
    ),
  ],
};

export const Verborgen: Story = {
  name: "Verborgen (initieel)",
  // No event fired — banner starts hidden
};
