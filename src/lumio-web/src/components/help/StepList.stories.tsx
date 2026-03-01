import type { Meta, StoryObj } from "@storybook/react";
import { StepList } from "@/components/help/StepList";
import "@/styles/help-prose.css";

const meta = {
  title: "Help/StepList",
  component: StepList,
  parameters: {
    layout: "padded",
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StepList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeSteps: Story = {
  name: "3 stappen",
  args: {
    children: (
      <>
        <li>Ga naar het menu en klik op <strong>Testament</strong>.</li>
        <li>
          Vul de gevraagde gegevens in voor uw erfgenamen en begunstigden.
        </li>
        <li>
          Klik op <strong>Opslaan</strong> om uw testament-concept te bewaren.
        </li>
      </>
    ),
  },
};

export const SingleStep: Story = {
  name: "Enkele stap",
  args: {
    children: (
      <li>Klik op <strong>Toevoegen</strong> om een nieuwe erfgenaam te registreren.</li>
    ),
  },
};

export const FiveSteps: Story = {
  name: "5 stappen",
  args: {
    children: (
      <>
        <li>Log in op uw Lumio-account.</li>
        <li>
          Navigeer naar <strong>Mijn Profiel</strong> via het linkermenu.
        </li>
        <li>Klik op de tab <strong>Beveiliging</strong>.</li>
        <li>
          Kies <strong>Tweefactorauthenticatie inschakelen</strong> en volg de
          instructies.
        </li>
        <li>
          Sla de herstelcodes op een veilige locatie op en bevestig met
          <strong>Voltooien</strong>.
        </li>
      </>
    ),
  },
};
