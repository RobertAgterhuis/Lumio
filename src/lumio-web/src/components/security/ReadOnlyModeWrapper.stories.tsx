import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReadOnlyModeWrapper } from "@/components/security/ReadOnlyModeWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Security/ReadOnlyModeWrapper",
  component: ReadOnlyModeWrapper,
  tags: ["autodocs"],
  argTypes: {
    isReadOnly: { control: "boolean" },
    showBanner: { control: "boolean" },
    message: { control: "text" },
  },
} satisfies Meta<typeof ReadOnlyModeWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleForm = () => (
  <div className="space-y-4 p-4 border rounded-lg">
    <div className="grid gap-1.5">
      <Label htmlFor="naam">Naam</Label>
      <Input id="naam" defaultValue="Jan de Vries" />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" type="email" defaultValue="jan@voorbeeld.nl" />
    </div>
    <Button>Opslaan</Button>
  </div>
);

export const Editable: Story = {
  args: {
    isReadOnly: false,
    children: <SampleForm />,
  },
};

export const ReadOnly: Story = {
  args: {
    isReadOnly: true,
    children: <SampleForm />,
  },
};

export const ReadOnlyNoBanner: Story = {
  args: {
    isReadOnly: true,
    showBanner: false,
    children: <SampleForm />,
  },
};

export const CustomMessage: Story = {
  args: {
    isReadOnly: true,
    message: "U bent ingelogd als erfgenaam — alleen bekijken mogelijk.",
    children: <SampleForm />,
  },
};
