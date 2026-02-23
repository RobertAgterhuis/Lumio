import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Kaart titel</CardTitle>
        <CardDescription>Beschrijving van de kaart.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Kaart inhoud hier.</p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Instellingen</CardTitle>
        <CardDescription>Pas uw voorkeuren aan.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Uw huidige instellingen worden automatisch opgeslagen.
        </p>
        <Button className="w-fit">Opslaan</Button>
      </CardContent>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p className="text-sm">Een eenvoudige kaart zonder header.</p>
      </CardContent>
    </Card>
  ),
};
