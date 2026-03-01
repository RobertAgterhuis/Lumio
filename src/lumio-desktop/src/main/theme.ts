import { nativeTheme, type BrowserWindow } from "electron";

/**
 * Sets up bi-directional OS theme synchronisation.
 *
 * Whenever the operating system switches between light and dark mode:
 * - The IPC channel `native-theme-changed` is pushed into the renderer.
 * - The optional `onUpdated` callback is invoked (used by callers that need
 *   to update platform UI chrome such as the Windows title-bar overlay).
 *
 * Call this once after the main window has been created.
 */
export function setupThemeSync(
  getWindow: () => BrowserWindow | null,
  onUpdated?: (isDark: boolean) => void
): void {
  nativeTheme.on("updated", () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    getWindow()?.webContents.send("native-theme-changed", isDark);
    onUpdated?.(isDark);
  });
}

/** Returns whether the OS is currently in dark mode. */
export function getCurrentThemeIsDark(): boolean {
  return nativeTheme.shouldUseDarkColors;
}
