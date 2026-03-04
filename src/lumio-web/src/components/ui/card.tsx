import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-shadow duration-200",
  {
    variants: {
      variant: {
        default: "border-border shadow-sm",
        elevated:
          "border-border/60 shadow-md hover:shadow-lg",
        hero:
          "border-primary/20 shadow-lg ring-1 ring-primary/10 bg-linear-to-br from-card to-primary-50/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type CardVariant = VariantProps<typeof cardVariants>["variant"];

/**
 * Card container component with rounded borders and shadow.
 * Supports three elevation variants:
 *  - `default`: flat card with subtle shadow (dashboard secondary)
 *  - `elevated`: mid-depth card with hover lift (widgets, forms)
 *  - `hero`: high-emphasis card with gradient tint + ring (dashboard hero, CTAs)
 *
 * @example
 * <Card variant="hero">
 *   <CardHeader>
 *     <CardTitle>Welcome back</CardTitle>
 *   </CardHeader>
 * </Card>
 */
const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant }), className)}
    {...props}
  />
));
Card.displayName = "Card";

/** Header section of a Card. Contains title and description. */
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

/** Title element within CardHeader. Renders as an h3. */
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

/** Muted description text within CardHeader. */
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

/** Main content area of a Card with padding. */
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

/** Footer section of a Card – typically used for actions or meta info. */
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
