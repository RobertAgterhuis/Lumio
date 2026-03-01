import { Notification } from "electron";
import * as path from "path";

/** Platform-correct icon path for use in OS notifications. */
function getIconPath(): string {
  const buildDir = path.join(__dirname, "..", "..", "build");
  if (process.platform === "win32") return path.join(buildDir, "icon.ico");
  if (process.platform === "darwin") return path.join(buildDir, "icon.icns");
  return path.join(buildDir, "icons", "256.png");
}

/**
 * Show a native OS notification after a backup attempt.
 *
 * @param success  Whether the backup completed successfully.
 * @param location The destination path (shown in the body on success).
 */
export function showBackupNotification(success: boolean, location?: string): void {
  if (!Notification.isSupported()) return;

  new Notification({
    title: success ? "Back-up voltooid" : "Back-up mislukt",
    body: success
      ? `Uw gegevens zijn veilig opgeslagen${location ? ` in ${location}` : ""}.`
      : "Er ging iets mis met de back-up. Open Lumio voor meer informatie.",
    icon: getIconPath(),
    silent: false,
  }).show();
}
