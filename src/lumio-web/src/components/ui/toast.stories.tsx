import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { fn } from "storybook/test";
import { Toast } from "@/components/ui/toast";
import { runA11yChecks } from "@/lib/test-utils/storybook-a11y";

/**
 * Toast — transient notification component with semantic ARIA roles.
 *
 * WCAG 2.1 compliance:
 * - SC 4.1.3 Status messages: error/warning use `role="alert"` (assertive);
 *   success/info use `role="status"` (polite). The component sets this
 *   automatically based on `variant`.
 * - Dismiss button has visible focus ring and `aria-label`.
 * - Icons are decorative (`aria-hidden`).
 *
 * Governance: core · a11yLevel: AA
 */
const meta = {
  title: "Primitives/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    status: { type: "core" },
    governance: { maturity: "core", a11yLevel: "AA" },
    docs: {
      description: {
        component:
          "Transient notification. Error and warning variants use `role=\"alert\"` " +
          "(assertive ARIA live region); success and info use `role=\"status\"` " +
          "(polite). Always provide a meaningful `message` — avoid generic strings like " +
          "\"Mislukt\" that give no recovery information (GAP-CONTENT-001).",
      },
    },
  },
  args: {
    onDismiss: fn(),
    duration: 0, // Disable auto-dismiss in Storybook so stories remain visible
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "error", "warning", "info"],
    },
    duration: { control: "number" },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Single variants ──────────────────────────────────────────────────────────

export const Succes: Story = {
  args: {
    toastId: "toast-success",
    variant: "success",
    message: "De wijzigingen zijn succesvol opgeslagen.",
  },
};

export const Fout: Story = {
  args: {
    toastId: "toast-error",
    variant: "error",
    // Demonstrates specific error copy (GAP-CONTENT-001 compliant):
    // tell the user what went wrong + what to do next.
    message:
      "Ontgrendelen mislukt: de pincode is onjuist. Controleer uw pincode en probeer opnieuw.",
  },
};

export const Waarschuwing: Story = {
  args: {
    toastId: "toast-warning",
    variant: "warning",
    message: "Uw sessie verloopt over 1 minuut. Sla uw werk op.",
  },
};

export const Informatie: Story = {
  args: {
    toastId: "toast-info",
    variant: "info",
    message: "Het exportbestand wordt op de achtergrond aangemaakt.",
  },
};

// ── All variants overview ────────────────────────────────────────────────────

export const AlleVarianten: Story = {
  name: "Alle varianten",
  args: {
    toastId: "all",
    message: "Overzicht van alle varianten.",
  },
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <Toast
        toastId="t1"
        variant="success"
        message="Gelukt — wijzigingen opgeslagen."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="t2"
        variant="error"
        message="Fout — ontgrendelen mislukt. Controleer uw pincode."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="t3"
        variant="warning"
        message="Let op — sessie verloopt over 1 minuut."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="t4"
        variant="info"
        message="Bestand wordt aangemaakt op de achtergrond."
        duration={0}
        onDismiss={() => {}}
      />
    </div>
  ),
};

// ── Interactive: dismiss callback ────────────────────────────────────────────

export const DismissInteractief: Story = {
  name: "Sluiten (interactief)",
  args: {
    toastId: "toast-dismiss",
    variant: "info",
    message: "Klik op de × om dit bericht te sluiten.",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Dismiss button must be present and accessible
    const dismissButton = canvas.getByRole("button", { name: /dismiss/i });
    expect(dismissButton).toBeInTheDocument();
    expect(dismissButton).toBeVisible();

    // Click dismiss — onDismiss should be called with the toastId
    await userEvent.click(dismissButton);
    expect(args.onDismiss).toHaveBeenCalledWith("toast-dismiss");
  },
};

// ── ARIA role verification ───────────────────────────────────────────────────

export const AriaRoleAlert: Story = {
  name: "ARIA role=alert (error/warning)",
  args: {
    toastId: "aria-role-alert",
    message: "ARIA role=alert voorbeeld.",
  },
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <Toast
        toastId="aria-error"
        variant="error"
        message="role=alert — schermlezer kondigt direct aan."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="aria-warning"
        variant="warning"
        message="role=alert — waarschuwing wordt onmiddellijk voorgelezen."
        duration={0}
        onDismiss={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Error and warning must use role="alert" (assertive)
    const alerts = canvas.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    alerts.forEach((el) => {
      expect(el.getAttribute("role")).toBe("alert");
    });
  },
};

export const AriaRoleStatus: Story = {
  name: "ARIA role=status (success/info)",
  args: {
    toastId: "aria-role-status",
    message: "ARIA role=status voorbeeld.",
  },
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <Toast
        toastId="aria-success"
        variant="success"
        message="role=status — politely announced."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="aria-info"
        variant="info"
        message="role=status — informatief bericht."
        duration={0}
        onDismiss={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const statuses = canvas.getAllByRole("status");
    expect(statuses).toHaveLength(2);
  },
};

// ── Accessibility audit ──────────────────────────────────────────────────────

export const A11yAudit: Story = {
  name: "A11y audit (axe, alle varianten)",
  args: {
    toastId: "a11y-audit",
    message: "Axe audit voorbeeld.",
  },
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <Toast
        toastId="ax1"
        variant="success"
        message="Opgeslagen."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="ax2"
        variant="error"
        message="Ontgrendelen mislukt. Controleer uw pincode."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="ax3"
        variant="warning"
        message="Sessie verloopt binnenkort."
        duration={0}
        onDismiss={() => {}}
      />
      <Toast
        toastId="ax4"
        variant="info"
        message="Export wordt verwerkt."
        duration={0}
        onDismiss={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await runA11yChecks(canvasElement);
  },
};
