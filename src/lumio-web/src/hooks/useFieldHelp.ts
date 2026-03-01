import { useMessages } from "next-intl";

/**
 * Returns the field-level help text for a given domain and field name from the
 * "hulpteksten" i18n namespace, or `undefined` when no text is present.
 *
 * Usage is opt-in: fields without a matching key simply receive no tooltip.
 *
 * @example
 *   const helpText = useFieldHelp("eigenaar", "bsn");
 *   // returns "Uw Burgerservicenummer wordt versleuteld opgeslagen..."
 */
export function useFieldHelp(domain: string, field: string): string | undefined {
  const messages = useMessages() as Record<string, unknown>;

  const namespace = messages?.["hulpteksten"];
  if (!namespace || typeof namespace !== "object") return undefined;

  const domainTexts = (namespace as Record<string, unknown>)[domain];
  if (!domainTexts || typeof domainTexts !== "object") return undefined;

  const text = (domainTexts as Record<string, unknown>)[field];
  return typeof text === "string" ? text : undefined;
}
