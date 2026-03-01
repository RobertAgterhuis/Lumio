import type { Meta, StoryObj } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import { HelpEmptyState } from "@/components/help/HelpEmptyState";
import nlMessages from "../../../messages/nl.json";

const meta = {
  title: "Help/HelpEmptyState",
  component: HelpEmptyState,
  parameters: {
    layout: "padded",
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={nlMessages}>
        <div className="max-w-md mx-auto">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
  args: {
    onAdd: () => alert("Toevoegen geklikt"),
  },
} satisfies Meta<typeof HelpEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Erfgenamen: Story = {
  args: {
    chapterSlug: "erfgenamen",
    domeinLabel: "erfgenamen",
    addLabel: "eerste erfgenaam toevoegen",
  },
};

export const Noodcontacten: Story = {
  args: {
    chapterSlug: "noodcontacten",
    domeinLabel: "noodcontacten",
    addLabel: "eerste noodcontact toevoegen",
  },
};

export const Documenten: Story = {
  args: {
    chapterSlug: "documenten",
    domeinLabel: "documenten",
    addLabel: "eerste document toevoegen",
  },
};
