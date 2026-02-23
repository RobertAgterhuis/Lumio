import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "overzicht",
    onValueChange: () => {},
    children: null,
  },
  render: () => (
    <Tabs value="overzicht" onValueChange={() => {}}>
      <TabsList>
        <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="geschiedenis">Geschiedenis</TabsTrigger>
      </TabsList>
      <TabsContent value="overzicht">
        <p className="p-4 text-sm text-muted-foreground">
          Overzicht inhoud wordt hier getoond.
        </p>
      </TabsContent>
      <TabsContent value="details">
        <p className="p-4 text-sm text-muted-foreground">
          Details inhoud hier.
        </p>
      </TabsContent>
      <TabsContent value="geschiedenis">
        <p className="p-4 text-sm text-muted-foreground">
          Geschiedenis inhoud hier.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  args: {
    value: "tab1",
    onValueChange: () => {},
    children: null,
  },
  render: () => (
    <Tabs value="tab1" onValueChange={() => {}}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="p-4 text-sm">Eerste tab.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="p-4 text-sm">Tweede tab.</p>
      </TabsContent>
    </Tabs>
  ),
};
