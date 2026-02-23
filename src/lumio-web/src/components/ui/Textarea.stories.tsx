import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    rows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Schrijf hier uw notitie..." },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="notitie">Notitie</Label>
      <Textarea id="notitie" placeholder="Voeg een notitie toe..." rows={4} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Uitgeschakeld", value: "Kan niet bewerken" },
};
