import { Menu } from "electron";

/**
 * Sets the application menu for the current platform:
 *
 * - macOS: Minimal native menu keeping the correct "Lumio" app-name slot,
 *   plus Edit (copy/paste) and Window roles. This is required on macOS — a
 *   null menu removes keyboard shortcuts like CMD+C entirely.
 *
 * - Windows / Linux: The default Electron menu (File / Edit / View / Window /
 *   Help) is removed because the web-app provides its own navigation and
 *   the menu bar is not expected in a kiosk-style desktop shell.
 *   Copy/paste works via the renderer's own keyboard event handling.
 */
export function buildApplicationMenu(): void {
  if (process.platform === "darwin") {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        // First item = macOS app menu — Electron uses app.getName() as label
        { role: "appMenu" },
        // Edit: CMD+C / CMD+V / CMD+Z etc. — required for text input in web-app
        { role: "editMenu" },
        // View: reload (CMD+R) handy during development & useful for end-users
        { role: "viewMenu" },
        // Window: minimize, zoom, front — standard macOS behaviour
        { role: "windowMenu" },
      ])
    );
  } else {
    // Windows & Linux: remove the menu bar entirely
    Menu.setApplicationMenu(null);
  }
}
