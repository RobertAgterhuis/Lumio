import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FadeIn, SlideIn, ScaleIn } from "@/components/ui/transitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const meta = {
  title: "Primitives/Transitions",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Animated transition wrapper components for smooth enter/exit animations.",
      },
    },
  },
} satisfies Meta;

export default meta;

export const FadeInDemo: StoryObj = {
  render: function Render() {
    const [show, setShow] = useState(true);
    return (
      <div className="space-y-4">
        <Button onClick={() => setShow(!show)}>
          {show ? "Verbergen" : "Tonen"}
        </Button>
        <FadeIn show={show}>
          <Card>
            <CardContent className="p-6">
              <p>Dit element fade in en uit.</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  },
};

export const SlideInDemo: StoryObj = {
  render: function Render() {
    const [show, setShow] = useState(true);
    const [direction, setDirection] = useState<"up" | "down" | "left" | "right">("up");
    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShow(!show)}>
            {show ? "Verbergen" : "Tonen"}
          </Button>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "up" | "down" | "left" | "right")}
            className="px-3 py-2 border rounded"
          >
            <option value="up">Van boven</option>
            <option value="down">Van onder</option>
            <option value="left">Van links</option>
            <option value="right">Van rechts</option>
          </select>
        </div>
        <SlideIn show={show} from={direction}>
          <Card>
            <CardContent className="p-6">
              <p>Dit element schuift van {direction}.</p>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    );
  },
};

export const ScaleInDemo: StoryObj = {
  render: function Render() {
    const [show, setShow] = useState(true);
    return (
      <div className="space-y-4">
        <Button onClick={() => setShow(!show)}>
          {show ? "Verbergen" : "Tonen"}
        </Button>
        <ScaleIn show={show}>
          <Card>
            <CardContent className="p-6">
              <p>Dit element schaalt in en uit.</p>
            </CardContent>
          </Card>
        </ScaleIn>
      </div>
    );
  },
};

export const CombinedExample: StoryObj = {
  render: function Render() {
    const [items, setItems] = useState([1, 2, 3]);
    const addItem = () => setItems([...items, Math.max(...items, 0) + 1]);
    const removeItem = (id: number) => setItems(items.filter((i) => i !== id));

    return (
      <div className="space-y-4">
        <Button onClick={addItem}>Item toevoegen</Button>
        <div className="space-y-2">
          {items.map((id) => (
            <SlideIn key={id} show={true} from="left">
              <Card>
                <CardContent className="p-4 flex justify-between items-center">
                  <span>Item {id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(id)}
                  >
                    Verwijderen
                  </Button>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>
      </div>
    );
  },
};
