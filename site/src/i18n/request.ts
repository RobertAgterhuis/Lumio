import { getRequestConfig } from "next-intl/server";

/**
 * Loads the root message bundle — the namespaces that must be available on
 * every page without a supplemental DomainMessagesProvider:
 *  - shared  : common, nav, enums, feedback, errors, idle, verwijderBevestiging,
 *              sectieNotitie, domainStatus, search, shortcuts, wizard, contacts
 *  - ui      : personSelect, help, hulpteksten, legeStaten
 *  - auth    : auth (+ sub-namespaces) — used by AuthenticatedLayout & auth pages
 *  - dashboard: dashboard (+ sub-namespaces) — used by NotificationsDropdown in Header
 *              (rendered on every authenticated page)
 *
 * Domain-specific namespaces (boedel, testament, uitvaart, …) are loaded
 * by per-route DomainMessagesProvider wrappers in each domain's layout.tsx.
 */
async function loadRootMessages(locale: string) {
  if (locale === "en") {
    const [shared, ui, auth, dashboard] = await Promise.all([
      import("../../messages/en/shared.json"),
      import("../../messages/en/ui.json"),
      import("../../messages/en/auth.json"),
      import("../../messages/en/dashboard.json"),
    ]);
    return {
      ...shared.default,
      ...ui.default,
      ...auth.default,
      ...dashboard.default,
    };
  }
  const [shared, ui, auth, dashboard] = await Promise.all([
    import("../../messages/nl/shared.json"),
    import("../../messages/nl/ui.json"),
    import("../../messages/nl/auth.json"),
    import("../../messages/nl/dashboard.json"),
  ]);
  return {
    ...shared.default,
    ...ui.default,
    ...auth.default,
    ...dashboard.default,
  };
}

export default getRequestConfig(async () => {
  try {
    // Static export: locale is determined client-side via localStorage.
    // Server-side (build time) always falls back to "nl".
    const locale =
      typeof window !== "undefined"
        ? localStorage.getItem("lumio-locale") ?? "nl"
        : "nl";

    return {
      locale,
      messages: await loadRootMessages(locale),
    };
  } catch {
    // Fallback during build time when locale detection fails
    return {
      locale: "nl",
      messages: await loadRootMessages("nl"),
    };
  }
});
