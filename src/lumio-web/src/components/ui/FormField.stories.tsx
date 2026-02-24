import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { runA11yChecks } from "@/lib/test-utils/storybook-a11y";

const meta = {
  title: "Primitives/FormField",
  component: FormField.Root,
  tags: ["autodocs"],
  parameters: {
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
} satisfies Meta<typeof FormField.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <FormField.Root>
      <FormField.Label>Email</FormField.Label>
      <FormField.Input type="email" placeholder="naam@voorbeeld.nl" />
    </FormField.Root>
  ),
};

export const Required: Story = {
  args: {
    required: true,
    children: null,
  },
  render: () => (
    <FormField.Root required>
      <FormField.Label>Naam</FormField.Label>
      <FormField.Input placeholder="Voer uw naam in" />
    </FormField.Root>
  ),
};

export const WithHelper: Story = {
  args: {
    children: null,
  },
  render: () => (
    <FormField.Root>
      <FormField.Label>Wachtwoord</FormField.Label>
      <FormField.Input type="password" />
      <FormField.Helper>Minimaal 8 tekens, inclusief een cijfer.</FormField.Helper>
    </FormField.Root>
  ),
};

export const WithError: Story = {
  args: {
    error: "Dit veld is verplicht.",
    children: null,
  },
  render: () => (
    <FormField.Root error="Dit veld is verplicht." required>
      <FormField.Label>Email</FormField.Label>
      <FormField.Input type="email" />
      <FormField.Error />
    </FormField.Root>
  ),
};

export const WithTextarea: Story = {
  args: {
    children: null,
  },
  render: () => (
    <FormField.Root>
      <FormField.Label>Beschrijving</FormField.Label>
      <FormField.Textarea placeholder="Voer een beschrijving in..." />
      <FormField.Helper>Maximaal 500 tekens.</FormField.Helper>
    </FormField.Root>
  ),
};

export const WithSelect: Story = {
  args: {
    children: null,
  },
  render: () => (
    <FormField.Root required>
      <FormField.Label>Land</FormField.Label>
      <FormField.Select>
        <option value="">Selecteer een land</option>
        <option value="nl">Nederland</option>
        <option value="be">België</option>
        <option value="de">Duitsland</option>
      </FormField.Select>
    </FormField.Root>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: null,
  },
  render: () => (
    <FormField.Root disabled>
      <FormField.Label>Gebruikersnaam</FormField.Label>
      <FormField.Input value="john_doe" />
      <FormField.Helper>Gebruikersnaam kan niet worden gewijzigd.</FormField.Helper>
    </FormField.Root>
  ),
};

export const CompleteForm: Story = {
  args: {
    children: null,
  },
  render: () => (
    <form className="space-y-6 max-w-md">
      <FormField.Root required>
        <FormField.Label>Naam</FormField.Label>
        <FormField.Input placeholder="Voer uw volledige naam in" />
      </FormField.Root>

      <FormField.Root required error="Voer een geldig e-mailadres in.">
        <FormField.Label>Email</FormField.Label>
        <FormField.Input type="email" defaultValue="invalid-email" />
        <FormField.Error />
      </FormField.Root>

      <FormField.Root>
        <FormField.Label>Telefoonnummer</FormField.Label>
        <FormField.Input type="tel" placeholder="+31 6 12345678" />
        <FormField.Helper>Optioneel — voor 2FA.</FormField.Helper>
      </FormField.Root>

      <FormField.Root>
        <FormField.Label>Bio</FormField.Label>
        <FormField.Textarea placeholder="Vertel iets over uzelf..." />
      </FormField.Root>

      <Button type="submit">Opslaan</Button>
    </form>
  ),
};

/**
 * Tests that FormField correctly sets accessibility attributes
 */
export const AccessibilityTest: Story = {
  args: {
    children: null,
  },
  render: function Render() {
    const [error, setError] = useState<string | undefined>(undefined);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        setError("Dit veld is verplicht.");
      } else if (!e.target.value.includes("@")) {
        setError("Voer een geldig e-mailadres in.");
      } else {
        setError(undefined);
      }
    };

    return (
      <FormField.Root error={error} required>
        <FormField.Label>Email</FormField.Label>
        <FormField.Input
          type="email"
          placeholder="naam@voorbeeld.nl"
          onBlur={handleBlur}
          data-testid="email-input"
        />
        <FormField.Helper>We delen uw email nooit.</FormField.Helper>
        <FormField.Error />
      </FormField.Root>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the input
    const input = canvas.getByTestId("email-input");

    // Verify label is associated with input via htmlFor/id
    const label = canvas.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    const labelFor = label.getAttribute("for");
    expect(input.getAttribute("id")).toBe(labelFor);

    // Verify required indicator is present
    expect(canvas.getByText("*")).toBeInTheDocument();

    // Initially no error, so aria-invalid should not be "true"
    expect(input.getAttribute("aria-invalid")).toBeNull();

    // Focus and blur without value to trigger error
    input.focus();
    await userEvent.tab(); // blur

    // Wait for error to appear
    await waitFor(() => {
      expect(canvas.getByText("Dit veld is verplicht.")).toBeInTheDocument();
    });

    // Verify aria-invalid is now "true"
    expect(input.getAttribute("aria-invalid")).toBe("true");

    // Verify aria-describedby links to error and helper
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    // Type invalid email and blur
    await userEvent.type(input, "invalid");
    await userEvent.tab();

    await waitFor(() => {
      expect(canvas.getByText("Voer een geldig e-mailadres in.")).toBeInTheDocument();
    });

    // Type valid email and blur
    await userEvent.clear(input);
    await userEvent.type(input, "test@example.com");
    await userEvent.tab();

    // Error should be cleared
    await waitFor(() => {
      expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    });

    // aria-invalid should be removed
    expect(input.getAttribute("aria-invalid")).toBeNull();

    // Run axe-core accessibility checks
    await runA11yChecks(canvasElement);
  },
};
