import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
} from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Skeleton loading placeholders for indicating content loading state while maintaining layout stability.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["pulse", "shimmer"],
      description: "Animation style",
    },
    shape: {
      control: "select",
      options: ["line", "circle", "card", "button"],
      description: "Pre-defined shape preset",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-48",
  },
};

export const Pulse: Story = {
  args: {
    variant: "pulse",
    className: "h-16 w-64",
  },
};

export const Shimmer: Story = {
  args: {
    variant: "shimmer",
    className: "h-16 w-64",
  },
};

export const Shapes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Line</p>
        <Skeleton shape="line" className="max-w-md" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Circle</p>
        <Skeleton shape="circle" className="h-12 w-12" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Button</p>
        <Skeleton shape="button" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Card</p>
        <Skeleton shape="card" className="max-w-md" />
      </div>
    </div>
  ),
};

export const TextLines: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">2 Lines</p>
        <SkeletonText lines={2} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">4 Lines</p>
        <SkeletonText lines={4} />
      </div>
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Small</p>
        <SkeletonAvatar size="sm" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Medium</p>
        <SkeletonAvatar size="md" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Large</p>
        <SkeletonAvatar size="lg" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Without Text</p>
        <SkeletonAvatar showText={false} />
      </div>
    </div>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <Card className="max-w-sm">
      <SkeletonCard />
    </Card>
  ),
};

export const RealWorldExample: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonAvatar />
          <SkeletonText lines={3} />
          <div className="flex gap-2 pt-2">
            <Skeleton shape="button" />
            <Skeleton shape="button" className="w-16" />
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
