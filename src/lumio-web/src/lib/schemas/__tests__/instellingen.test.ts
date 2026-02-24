import { describe, it, expect } from "vitest";
import {
  passwordChangeSchema,
  profileCreateSchema,
  backupRestoreSchema,
  accountDeleteSchema,
  autoBackupConfigSchema,
} from "@/lib/schemas/instellingen";

describe("instellingen schemas", () => {
  describe("passwordChangeSchema", () => {
    it("validates valid password change data", () => {
      const data = {
        huidigWachtwoord: "currentPass123",
        nieuwWachtwoord: "NewPassword123!",
        bevestigWachtwoord: "NewPassword123!",
      };

      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects when current password is empty", () => {
      const data = {
        huidigWachtwoord: "",
        nieuwWachtwoord: "NewPassword123!",
        bevestigWachtwoord: "NewPassword123!",
      };

      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects when new password is too short", () => {
      const data = {
        huidigWachtwoord: "currentPass123",
        nieuwWachtwoord: "short",
        bevestigWachtwoord: "short",
      };

      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects when passwords do not match", () => {
      const data = {
        huidigWachtwoord: "currentPass123",
        nieuwWachtwoord: "NewPassword123!",
        bevestigWachtwoord: "DifferentPassword!",
      };

      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const message = result.error.issues[0]?.message;
        expect(message).toMatch(/wachtwoorden komen niet overeen/i);
      }
    });
  });

  describe("profileCreateSchema", () => {
    it("validates valid profile data", () => {
      const data = {
        naam: "Jan Jansen",
        relatie: "Partner" as const,
      };

      const result = profileCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const data = {
        naam: "",
        relatie: "Partner" as const,
      };

      const result = profileCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects invalid relation type", () => {
      const data = {
        naam: "Jan Jansen",
        relatie: "InvalidType",
      };

      const result = profileCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("accepts all valid relation types", () => {
      const relations = ["Partner", "Kind", "Ouder", "Overig"] as const;

      for (const relatie of relations) {
        const result = profileCreateSchema.safeParse({ naam: "Test", relatie });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("backupRestoreSchema", () => {
    it("validates backup restore with password", () => {
      const data = { wachtwoord: "myPassword123" };
      const result = backupRestoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
      const data = { wachtwoord: "" };
      const result = backupRestoreSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("accountDeleteSchema", () => {
    it("validates account deletion with password", () => {
      const data = { wachtwoord: "confirmPassword" };
      const result = accountDeleteSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
      const data = { wachtwoord: "" };
      const result = accountDeleteSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("autoBackupConfigSchema", () => {
    it("validates disabled auto-backup", () => {
      const data = { enabled: false };
      const result = autoBackupConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("validates enabled auto-backup with all fields", () => {
      const data = {
        enabled: true,
        pad: "/path/to/backup",
        frequentie: "dagelijks" as const,
      };
      const result = autoBackupConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("accepts all valid frequency values", () => {
      const frequencies = ["dagelijks", "wekelijks", "maandelijks"] as const;

      for (const frequentie of frequencies) {
        const result = autoBackupConfigSchema.safeParse({
          enabled: true,
          pad: "/backup",
          frequentie,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
