import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { useState } from "react";
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

/**
 * Interactive tabs with play function test
 */
export const Interactive: Story = {
  args: {
    value: "tab1",
    onValueChange: fn(),
    children: null,
  },
  render: function Render() {
    const [value, setValue] = useState("tab1");
    return (
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="tab1" data-testid="tab1-trigger">
            Overzicht
          </TabsTrigger>
          <TabsTrigger value="tab2" data-testid="tab2-trigger">
            Details
          </TabsTrigger>
          <TabsTrigger value="tab3" data-testid="tab3-trigger">
            Instellingen
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="tab1-content">
          <p className="p-4 text-sm">Overzicht inhoud is zichtbaar.</p>
        </TabsContent>
        <TabsContent value="tab2" data-testid="tab2-content">
          <p className="p-4 text-sm">Details inhoud is zichtbaar.</p>
        </TabsContent>
        <TabsContent value="tab3" data-testid="tab3-content">
          <p className="p-4 text-sm">Instellingen inhoud is zichtbaar.</p>
        </TabsContent>
      </Tabs>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially tab1 should be active
    expect(canvas.getByTestId("tab1-content")).toBeInTheDocument();

    // Click on tab2
    await userEvent.click(canvas.getByTestId("tab2-trigger"));

    // tab2 content should be visible
    await waitFor(() => {
      expect(canvas.getByTestId("tab2-content")).toBeInTheDocument();
    });

    // tab1 content should be hidden
    expect(canvas.queryByTestId("tab1-content")).not.toBeInTheDocument();

    // Click on tab3
    await userEvent.click(canvas.getByTestId("tab3-trigger"));

    // tab3 content should be visible
    await waitFor(() => {
      expect(canvas.getByTestId("tab3-content")).toBeInTheDocument();
    });

    // Previous tabs content should be hidden
    expect(canvas.queryByTestId("tab2-content")).not.toBeInTheDocument();

    // Click back to tab1
    await userEvent.click(canvas.getByTestId("tab1-trigger"));

    await waitFor(() => {
      expect(canvas.getByTestId("tab1-content")).toBeInTheDocument();
    });
  },
};
