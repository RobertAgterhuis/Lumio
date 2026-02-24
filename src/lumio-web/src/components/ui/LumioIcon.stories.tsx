import type { Meta, StoryObj } from "@storybook/react";
import { LumioIcon, type LumioIconName, type LumioIconSize } from "./lumio-icon";

// ─── Meta ─────────────────────────────────────────────────────────────────────

const allIconNames: LumioIconName[] = [
  "dashboard",
  "profiel",
  "testament",
  "wilsverklaring",
  "donor",
  "uitvaart",
  "digitaal-bezit",
  "boedel",
  "documenten",
  "erfgenamen",
  "noodcontacten",
  "tijdlijn",
  "shield",
  "shield-check",
  "shield-alert",
  "shield-x",
];

const allSizes: LumioIconSize[] = ["sm", "md", "lg", "xl"];

const meta: Meta<typeof LumioIcon> = {
  title: "Design System/Icons/LumioIcon",
  component: LumioIcon,
  args: {
    name: "dashboard",
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        component: `
**LumioIcon** renders custom brand icons for Lumio's sixteen core domain and security icons.

- viewBox \`0 0 24 24\`
- Stroke \`currentColor\` · strokeWidth \`1.5\`
- Donor icon uses \`fill="currentColor"\` (solid heart with sprout)
- Tijdlijn icon uses partial fills to show progression state
- Shield family shares a common base path for visual consistency
- Sizes mirror the Lucide \`<Icon />\` wrapper: \`sm\` (16px), \`md\` (20px), \`lg\` (24px), \`xl\` (32px)

_Maturity_: **core** · _a11y_: **AA**
        `,
      },
    },
  },
  argTypes: {
    name: { control: "select", options: allIconNames },
    size: { control: "select", options: allSizes },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Single icon in the playground — tweak via Controls panel. */
export const Playground: Story = {
  args: {
    name: "dashboard",
    size: "lg",
  },
};

/** All 16 domain + security icons — used for visual regression. */
export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-6">
      {allIconNames.map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 text-center"
          style={{ width: 72 }}
        >
          <LumioIcon name={name} size="lg" className="text-primary" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
};

/** All four sizes for the donor icon. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-6">
      {allSizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <LumioIcon name="donor" size={size} className="text-primary" />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** Icons rendered at different colour contexts. */
export const Colors: Story = {
  render: () => {
    const palette = [
      { cls: "text-primary", label: "primary" },
      { cls: "text-foreground", label: "foreground" },
      { cls: "text-muted-foreground", label: "muted-foreground" },
      { cls: "text-destructive", label: "destructive" },
    ];
    return (
      <div className="flex gap-6 p-6">
        {palette.map(({ cls, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <LumioIcon name="testament" size="lg" className={cls} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

/** Accessibility — icons with and without labels. */
export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 text-sm">
      <div className="flex items-center gap-3">
        <LumioIcon name="donor" size="lg" label="Donorregistratie" className="text-primary" />
        <span>With label → aria-label=&quot;Donorregistratie&quot;, role=&quot;img&quot;</span>
      </div>
      <div className="flex items-center gap-3">
        <LumioIcon name="donor" size="lg" className="text-primary" />
        <span>Without label → aria-hidden (decorative)</span>
      </div>
    </div>
  ),
};

/** All four shield variants — security state progression. */
export const SecurityIcons: Story = {
  render: () => {
    const shields: Array<{ name: LumioIconName; label: string; cls: string }> = [
      { name: "shield", label: "unknown", cls: "text-muted-foreground" },
      { name: "shield-check", label: "secure", cls: "text-success" },
      { name: "shield-alert", label: "warning", cls: "text-warning" },
      { name: "shield-x", label: "critical", cls: "text-destructive" },
    ];
    return (
      <div className="flex gap-8 p-6">
        {shields.map(({ name, label, cls }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <LumioIcon name={name} size="xl" className={cls} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

/** Shield variants at all four sizes. */
export const ShieldStates: Story = {
  render: () => {
    const shields: Array<{ name: LumioIconName; cls: string }> = [
      { name: "shield", cls: "text-muted-foreground" },
      { name: "shield-check", cls: "text-success" },
      { name: "shield-alert", cls: "text-warning" },
      { name: "shield-x", cls: "text-destructive" },
    ];
    return (
      <div className="flex flex-col gap-6 p-6">
        {shields.map(({ name, cls }) => (
          <div key={name} className="flex items-end gap-6">
            {allSizes.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <LumioIcon name={name} size={size} className={cls} />
                <span className="text-xs text-muted-foreground">{size}</span>
              </div>
            ))}
            <span className="text-xs text-muted-foreground self-center ml-2">{name}</span>
          </div>
        ))}
      </div>
    );
  },
};
