import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SessionTimeoutWarning } from "@/components/security/SessionTimeoutWarning";

const meta = {
  title: "Security/SessionTimeoutWarning",
  component: SessionTimeoutWarning,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    secondsLeft: { control: { type: "range", min: 0, max: 300, step: 1 } },
  },
} satisfies Meta<typeof SessionTimeoutWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    secondsLeft: 120,
    onDismiss: () => {},
  },
};

export const Urgent: Story = {
  args: {
    open: true,
    secondsLeft: 15,
    onDismiss: () => {},
  },
};

export const WithLockButton: Story = {
  args: {
    open: true,
    secondsLeft: 60,
    onDismiss: () => {},
    onLock: () => {},
  },
};

export const AlmostExpired: Story = {
  args: {
    open: true,
    secondsLeft: 5,
    onDismiss: () => {},
    onLock: () => {},
  },
};
