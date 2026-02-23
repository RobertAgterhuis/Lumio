import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Typ hier..." },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">E-mail</Label>
      <Input type="email" id="email" placeholder="naam@voorbeeld.nl" />
    </div>
  ),
};

export const Password: Story = {
  args: { type: "password", placeholder: "Wachtwoord" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Uitgeschakeld", value: "Kan niet bewerken" },
};

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="error-input">Verplicht veld</Label>
      <Input id="error-input" className="border-danger" placeholder="Dit veld is verplicht" />
      <p className="text-sm text-danger">Dit veld is verplicht.</p>
    </div>
  ),
};
