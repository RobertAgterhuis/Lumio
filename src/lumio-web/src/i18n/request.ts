import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Static export: locale is determined client-side via localStorage.
  // Server-side (build time) always falls back to "nl".
  const locale =
    typeof window !== "undefined"
      ? localStorage.getItem("lumio-locale") ?? "nl"
      : "nl";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
