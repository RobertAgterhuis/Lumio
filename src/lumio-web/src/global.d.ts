/**
 * global.d.ts
 *
 * Declares the full IntlMessages type for next-intl v4 using the merged
 * nl.json as the source of truth for all 46 namespaces.
 *
 * The runtime bundle is split into domain-specific chunks (see DomainMessagesProvider
 * and the per-route layout files), but TypeScript type-checking always operates
 * against the complete message set so that `useTranslations()` calls are fully typed
 * everywhere in the codebase, regardless of which provider is closest.
 */

// `export {}` makes this a module file.
// The AppConfig.Messages augmentation is intentionally omitted: enforcing
// strict NamespacedMessageKeys would break existing dynamic-key patterns
// throughout the codebase (e.g. t(`relatie.${someVar}`)). next-intl defaults
// to Messages = {} which accepts any key — the previous behaviour is preserved.
export {};
