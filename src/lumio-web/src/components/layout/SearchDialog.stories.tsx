import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Minimal messages for SearchDialog
const messages = {
  nav: {
    dashboard: "Dashboard",
    mijnProfiel: "Mijn Profiel",
    testament: "Testament",
    wilsverklaring: "Wilsverklaring",
    donorregistratie: "Donorregistratie",
    digitaalBezit: "Digitaal Bezit",
    boedel: "Boedel",
    uitvaartwensen: "Uitvaartwensen",
    documenten: "Documenten",
    erfgenamen: "Erfgenamen",
    noodcontacten: "Noodcontacten",
    tijdlijnOverlijden: "Tijdlijn Overlijden",
    exporteren: "Exporteren",
    activiteitenlog: "Activiteitenlog",
    instellingen: "Instellingen",
  },
  search: {
    placeholder: "Zoeken in alle gegevens...",
    laden: "Zoeken...",
    geenResultaten: "Geen resultaten gevonden voor \"{query}\"",
    geenResultatenTip: "Probeer een andere zoekterm",
    minimaalTekens: "Typ minimaal 2 tekens om te zoeken",
    resultaten: "{count, plural, one {# resultaat} other {# resultaten}}",
    footer: "Zoek in erfgenamen, accounts, bezittingen...",
    recent: "Recent gezocht",
    snelNavigatie: "Snel navigeren",
    navigeer: "navigeer",
    openen: "openen",
    sluiten: "sluiten",
    domein: {
      erfgenamen: "Erfgenamen",
      noodcontacten: "Noodcontacten",
      digitaleAccounts: "Digitale Accounts",
      wachtwoorden: "Wachtwoorden",
      cryptoWallets: "Crypto Wallets",
      bezittingen: "Bezittingen",
      bankrekeningen: "Bankrekeningen",
      verzekeringen: "Verzekeringen",
      schulden: "Schulden",
      documenten: "Documenten",
    },
  },
};

const meta = {
  title: "Layout/SearchDialog",
  component: SearchDialog,
  tags: ["autodocs"],
  parameters: {
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
    // SearchDialog uses translations
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    // Provide translation context
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={messages}>
        <div className="min-h-[400px]">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
  },
};

/**
 * Interactive search dialog with open/close behavior
 */
export const Interactive: Story = {
  args: {
    open: false,
    onClose: fn(),
  },
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)} data-testid="open-search">
          <Search className="h-4 w-4 mr-2" />
          Zoeken
        </Button>
        <SearchDialog open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Click button to open search dialog
    const openButton = canvas.getByTestId("open-search");
    await userEvent.click(openButton);

    // Wait for search dialog to appear (it has a combobox input)
    await waitFor(() => {
      expect(body.getByRole("combobox")).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = body.getByRole("combobox");
    await userEvent.type(searchInput, "test");

    // Verify the input has the typed value
    expect(searchInput).toHaveValue("test");

    // Press Escape to close
    await userEvent.keyboard("{Escape}");

    // Dialog should be closed
    await waitFor(() => {
      expect(body.queryByRole("combobox")).not.toBeInTheDocument();
    });
  },
};

/**
 * Test keyboard navigation hint visibility
 */
export const KeyboardHints: Story = {
  args: {
    open: false,
    onClose: fn(),
  },
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)} data-testid="open-search">
          <Search className="h-4 w-4 mr-2" />
          Zoeken (Ctrl+K)
        </Button>
        <SearchDialog open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Open dialog
    await userEvent.click(canvas.getByTestId("open-search"));

    // Wait for dialog
    await waitFor(() => {
      expect(body.getByRole("combobox")).toBeInTheDocument();
    });

    // Verify placeholder text exists
    const searchInput = body.getByRole("combobox");
    expect(searchInput).toHaveAttribute("placeholder");
  },
};
