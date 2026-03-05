/**
 * OnboardingWizardModal stories — SP-UX-01-009 (REC-UIDESIGN-002)
 *
 * Uses the presentational OnboardingWizardModal component (extracted from
 * OnboardingWizard.tsx) so stories have no Tanstack Query / Zustand deps.
 * Covered by the existing `a11y` CI job via `npm run test:storybook`.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";
import {
  User,
  Phone,
  ScrollText,
  Church,
  Download,
  Users,
  UserCheck,
} from "lucide-react";
import {
  OnboardingWizardModal,
  type OnboardingStapDisplay,
} from "./OnboardingWizardModal";

const ALLE_STAPPEN: OnboardingStapDisplay[] = [
  { id: "profiel", stapKey: "profiel", icon: User, href: "/eigenaar" },
  { id: "noodcontacten", stapKey: "noodcontacten", icon: Phone, href: "/noodcontacten" },
  { id: "testament", stapKey: "testament", icon: ScrollText, href: "/testament" },
  { id: "uitvaart", stapKey: "uitvaart", icon: Church, href: "/uitvaart" },
  { id: "documenten", stapKey: "documenten", icon: Download, href: "/documenten" },
  { id: "erfgenamen", stapKey: "erfgenamen", icon: Users, href: "/erfgenamen" },
  { id: "sleutels", stapKey: "sleutels", icon: UserCheck, href: "/erfgenamen" },
];

const alleNietGedaan: Record<string, boolean> = Object.fromEntries(
  ALLE_STAPPEN.map((s) => [s.id, false])
);

const meta: Meta<typeof OnboardingWizardModal> = {
  title: "Wizard/OnboardingWizardModal",
  component: OnboardingWizardModal,
  parameters: {
    layout: "fullscreen",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  args: {
    stappen: ALLE_STAPPEN,
    stapStatus: alleNietGedaan,
    completedCount: 0,
    onNavigate: fn(),
    onClose: fn(),
    onDontShowAgain: fn(),
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        {/* Provide backdrop so modal renders correctly in Storybook canvas */}
        <div className="relative min-h-screen bg-black/50">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OnboardingWizardModal>;

/** Gebruiker is net gestart: geen enkele stap afgerond. */
export const Leeg: Story = {
  name: "Leeg (0/7 stappen afgerond)",
  args: {
    stapStatus: alleNietGedaan,
    completedCount: 0,
  },
};

/** Gebruiker heeft de eerste drie stappen voltooid. */
export const DeelsIngevuld: Story = {
  name: "Deels ingevuld (3/7 stappen afgerond)",
  args: {
    stapStatus: {
      profiel: true,
      noodcontacten: true,
      testament: true,
      uitvaart: false,
      documenten: false,
      erfgenamen: false,
      sleutels: false,
    },
    completedCount: 3,
  },
};

/** Alle stappen zijn voltooid — "Afronden"-knop verschijnt. */
export const Volledig: Story = {
  name: "Volledig (7/7 stappen afgerond)",
  args: {
    stapStatus: Object.fromEntries(ALLE_STAPPEN.map((s) => [s.id, true])),
    completedCount: 7,
  },
};
