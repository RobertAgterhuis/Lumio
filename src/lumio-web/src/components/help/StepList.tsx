/**
 * Renders ordered list items as numbered step cards with a circular
 * accent-coloured badge — used for step-by-step instructions in help content.
 * The counter is handled by CSS (`counter-increment` on `.help-step-list`).
 */
export function StepList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="help-step-list my-4 list-none space-y-3 pl-0">{children}</ol>
  );
}
