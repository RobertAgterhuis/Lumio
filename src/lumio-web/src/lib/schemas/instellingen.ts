import { z } from "zod";

/**
 * Zod schemas for Instellingen forms.
 * Used with react-hook-form's zodResolver for client-side validation.
 *
 * Error messages are in Dutch as primary language. The UI layer handles
 * any final translation needs via the existing i18n system.
 */

/**
 * Password change form validation.
 * - Current password required
 * - New password minimum 8 characters
 * - Confirmation must match new password
 */
export const passwordChangeSchema = z
  .object({
    huidigWachtwoord: z.string().min(1, "Huidig wachtwoord is verplicht"),
    nieuwWachtwoord: z.string().min(8, "Minimaal 8 tekens vereist"),
    bevestigWachtwoord: z.string().min(1, "Bevestig het nieuwe wachtwoord"),
  })
  .refine((data) => data.nieuwWachtwoord === data.bevestigWachtwoord, {
    message: "Wachtwoorden komen niet overeen",
    path: ["bevestigWachtwoord"],
  });

export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

/**
 * Profile creation form validation.
 * - Name is required and must have content
 * - Relation type must be one of the allowed values
 */
export const profileCreateSchema = z.object({
  naam: z.string().min(1, "Naam is verplicht").max(100, "Naam mag maximaal 100 tekens zijn"),
  relatie: z.enum(["Partner", "Kind", "Ouder", "Overig"], {
    error: "Selecteer een relatietype",
  }),
});

export type ProfileCreateForm = z.infer<typeof profileCreateSchema>;

/**
 * Backup restore form validation.
 * - Password is required
 * Note: File validation is handled separately (FileList is not a plain object)
 */
export const backupRestoreSchema = z.object({
  wachtwoord: z.string().min(1, "Wachtwoord is verplicht"),
});

export type BackupRestoreForm = z.infer<typeof backupRestoreSchema>;

/**
 * Account deletion form validation.
 * - Password is required to confirm deletion
 */
export const accountDeleteSchema = z.object({
  wachtwoord: z.string().min(1, "Wachtwoord is verplicht voor bevestiging"),
});

export type AccountDeleteForm = z.infer<typeof accountDeleteSchema>;

/**
 * Auto-backup configuration form (Electron only).
 * - Path must be valid if enabled
 * - Frequency must be one of the allowed values
 */
export const autoBackupConfigSchema = z.object({
  enabled: z.boolean(),
  pad: z.string().optional(),
  frequentie: z.enum(["dagelijks", "wekelijks", "maandelijks"]).default("dagelijks"),
}).refine(
  (data) => !data.enabled || (data.pad && data.pad.length > 0),
  {
    message: "Selecteer een backup map",
    path: ["pad"],
  }
);

export type AutoBackupConfigForm = z.infer<typeof autoBackupConfigSchema>;
