/**
 * Converts a heading text to a URL-safe anchor slug.
 * Handles common accented characters used in Dutch and English.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, "a")
    .replace(/[ëèéê]/g, "e")
    .replace(/[ïìíî]/g, "i")
    .replace(/[öòóôõ]/g, "o")
    .replace(/[üùúû]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
