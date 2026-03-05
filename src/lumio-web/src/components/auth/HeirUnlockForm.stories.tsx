/**
 * HeirUnlockForm stories — SP-UX-02-003 (REC-UIDESIGN-003)
 *
 * Documenteert het nabestaanden-formulier in de twee primaire visuele
 * varianten (intro-stap en codes-invoerstap).
 *
 * Let op: HeirUnlockForm heeft geen externe props — de component beheert
 * zijn eigen staat. De `play`-functie in `Codesinvoer` simuleert de
 * gebruikersinteractie om de tweede visuele staat zichtbaar te maken.
 *
 * Stories worden opgepikt door de a11y CI-job (`npm run test:storybook`).
 */

import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";
import { HeirUnlockForm } from "./HeirUnlockForm";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof HeirUnlockForm> = {
  title: "Auth/HeirUnlockForm",
  component: HeirUnlockForm,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        <div className="w-full max-w-lg p-4">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HeirUnlockForm>;

// ---------------------------------------------------------------------------
// Stories (≥ 2 varianten, zie AC SP-UX-02-003)
// ---------------------------------------------------------------------------

/**
 * Introstap: de erfgenaam ziet uitleg over de Shamir-methode en de
 * stappen die ze moeten volgen. Dit is de beginstaat van het formulier.
 */
export const Intro: Story = {
  name: "Intro — uitleg noodcodes (beginstaat)",
};

/**
 * Codes-invoerstap: erfgenaam voert noodcodes in om het dossier te
 * ontgrendelen. Bereikt via klik op de start-knop in de intro-stap.
 */
export const Codesinvoer: Story = {
  name: "Codesinvoer — noodcodes invoeren",
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Klik op start-knop in intro-stap", async () => {
      // Zoek de knop op via de zichtbare tekst (vertaald vanuit nl.json)
      const startButton = await canvas.findByRole("button", {
        name: /starten|ontgrendelen|codes/i,
      });
      await userEvent.click(startButton);
    });

    await step("Codes-formulier is zichtbaar", async () => {
      // Na klikken is er een input-veld voor de noodcodes zichtbaar
      await canvas.findByRole("textbox");
    });
  },
};

/**
 * Codesinvoer met pre-gevulde code (testdata): toont hoe het formulier
 * eruitziet wanneer een erfgenaam al een code heeft ingevuld.
 *
 * Gebruikt `play` om de intro-stap te doorlopen en vervolgens een code in
 * te typen.
 */
export const CodesinvoerMetWaarde: Story = {
  name: "Codesinvoer — met ingevulde code",
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Navigeer naar codes-invoer", async () => {
      const startButton = await canvas.findByRole("button", {
        name: /starten|ontgrendelen|codes/i,
      });
      await userEvent.click(startButton);
    });

    await step("Vul een noodcode in", async () => {
      const input = await canvas.findByRole("textbox");
      await userEvent.type(
        input,
        "lumio-share-aB3kX9mNqW2pL7yT5vR0sZ6uCdEfGhIj"
      );
      // Bevestig dat de input de waarde bevat
      expect(input).toHaveValue(
        "lumio-share-aB3kX9mNqW2pL7yT5vR0sZ6uCdEfGhIj"
      );
    });
  },
};
