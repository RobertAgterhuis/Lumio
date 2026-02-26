"use client";

import type { LabelHTMLAttributes } from "react";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFieldHelp } from "@/hooks/useFieldHelp";

interface LabelWithHelpProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Domain key used to look up help text, e.g. "eigenaar" */
  domain: string;
  /** Field key within the domain, e.g. "bsn" */
  field: string;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for `<Label>` that adds an optional help-text tooltip.
 * The tooltip is only rendered when the `hulpteksten.[domain].[field]` i18n
 * key exists — fields without a key behave exactly like a plain `<Label>`.
 *
 * @example
 *   <LabelWithHelp htmlFor="bsn" domain="eigenaar" field="bsn">
 *     BSN
 *   </LabelWithHelp>
 */
export function LabelWithHelp({
  domain,
  field,
  children,
  ...props
}: LabelWithHelpProps) {
  const helpText = useFieldHelp(domain, field);

  if (!helpText) {
    return <Label {...props}>{children}</Label>;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        <Label {...props}>{children}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Uitleg bij dit veld"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="max-w-xs">{helpText}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
