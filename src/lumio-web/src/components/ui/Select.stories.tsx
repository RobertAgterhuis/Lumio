import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="">
      <option value="" disabled>
        Kies een optie...
      </option>
      <option value="optie1">Optie 1</option>
      <option value="optie2">Optie 2</option>
      <option value="optie3">Optie 3</option>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="taal">Taal</Label>
      <Select id="taal" defaultValue="nl">
        <option value="nl">Nederlands</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="nl">
      <option value="nl">Nederlands</option>
    </Select>
  ),
};
