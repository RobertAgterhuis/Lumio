"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { ROLLEN, ROL_KEYS } from "@/components/noodcontacten/useNoodcontacten";
import type { PersonDetails } from "./PersonSelect";

/** Extends PersonDetails with creation metadata so PersonSelect can add the new person to its list. */
export interface CreatedPersonResult extends PersonDetails {
  bron: "erfgenaam" | "noodcontact";
  rawId: string;
}

interface PersonCreateInlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Controls which type(s) the user can create */
  createNewAs: "erfgenaam" | "noodcontact" | "both";
  /** Pre-selects a noodcontact rol in the dropdown (e.g. "Uitvaartondernemer") */
  defaultRol?: string;
  /** Called after a successful API creation */
  onCreated: (person: CreatedPersonResult) => void;
}

export function PersonCreateInlineDialog({
  open,
  onOpenChange,
  createNewAs,
  defaultRol = "",
  onCreated,
}: PersonCreateInlineDialogProps) {
  const t = useTranslations("personSelect");
  const tEnum = useTranslations("enums");

  const initialType: "erfgenaam" | "noodcontact" =
    createNewAs === "noodcontact" ? "noodcontact" : "erfgenaam";

  const [type, setType] = useState<"erfgenaam" | "noodcontact">(initialType);
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [naam, setNaam] = useState("");
  const [relatie, setRelatie] = useState("");
  const [rol, setRol] = useState(defaultRol);
  const [telefoon, setTelefoon] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setVoornaam("");
    setAchternaam("");
    setNaam("");
    setRelatie("");
    setRol(defaultRol);
    setTelefoon("");
    setEmail("");
    setSaving(false);
    setError(null);
    setType(initialType);
  };

  const handleSave = async () => {
    setError(null);

    if (type === "erfgenaam") {
      if (!voornaam.trim()) {
        setError(t("createDialog.voornaamVereist"));
        return;
      }
      if (!achternaam.trim()) {
        setError(t("createDialog.achternaamVereist"));
        return;
      }
      setSaving(true);
      try {
        const res = await api.post<{ id: string }>("/api/erfgenamen", {
          voornaam: voornaam.trim(),
          achternaam: achternaam.trim(),
          tussenvoegsel: null,
          relatie: relatie.trim() || "",
          telefoon: telefoon.trim() || null,
          email: email.trim() || null,
          adres: null,
          postcode: null,
          woonplaats: null,
          geboortedatum: null,
          bsn: null,
          legitimatieSoort: 0,
          legitimatieNummer: null,
          legitimatieDatumAfgifte: null,
          legitimatieGeldigTot: null,
        });
        const fullName = `${voornaam.trim()} ${achternaam.trim()}`.trim();
        onCreated({
          naam: fullName,
          relatie: relatie.trim() || undefined,
          telefoon: telefoon.trim() || undefined,
          email: email.trim() || undefined,
          erfgenaamId: res.id,
          bron: "erfgenaam",
          rawId: res.id,
        });
        reset();
        onOpenChange(false);
      } catch {
        setError(t("createDialog.opslaanMislukt"));
        setSaving(false);
      }
    } else {
      if (!naam.trim()) {
        setError(t("createDialog.naamVereist"));
        return;
      }
      setSaving(true);
      try {
        const res = await api.post<{ id: string }>("/api/noodcontacten", {
          naam: naam.trim(),
          relatie: relatie.trim() || "",
          rol: rol || "Overig",
          telefoon: telefoon.trim() || null,
          email: email.trim() || null,
          adres: null,
          postcode: null,
          woonplaats: null,
          instructies: null,
          bedrijfsNaam: null,
          functie: null,
          prioriteit: 3,
          isGedeeld: false,
        });
        onCreated({
          naam: naam.trim(),
          relatie: relatie.trim() || undefined,
          telefoon: telefoon.trim() || undefined,
          email: email.trim() || undefined,
          bron: "noodcontact",
          rawId: res.id,
        });
        reset();
        onOpenChange(false);
      } catch {
        setError(t("createDialog.opslaanMislukt"));
        setSaving(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogHeader>
        <DialogTitle>{t("createDialog.titel")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {/* Type toggle — only shown when createNewAs="both" */}
        {createNewAs === "both" && (
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                type === "erfgenaam"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setType("erfgenaam")}
            >
              {t("createDialog.alsErfgenaam")}
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                type === "noodcontact"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setType("noodcontact")}
            >
              {t("createDialog.alsNoodcontact")}
            </button>
          </div>
        )}

        {/* Name fields */}
        {type === "erfgenaam" ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>
                {t("createDialog.voornaam")}{" "}
                <span className="text-danger">*</span>
              </Label>
              <Input
                value={voornaam}
                onChange={(e) => setVoornaam(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("createDialog.achternaam")}{" "}
                <span className="text-danger">*</span>
              </Label>
              <Input
                value={achternaam}
                onChange={(e) => setAchternaam(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>
              {t("createDialog.naam")}{" "}
              <span className="text-danger">*</span>
            </Label>
            <Input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
            />
          </div>
        )}

        {/* Relatie + Rol */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("createDialog.relatie")}</Label>
            <Input
              value={relatie}
              onChange={(e) => setRelatie(e.target.value)}
            />
          </div>
          {type === "noodcontact" && (
            <div className="space-y-2">
              <Label>{t("createDialog.rol")}</Label>
              <Select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="">—</option>
                {ROLLEN.map((r) => (
                  <option key={r} value={r}>
                    {tEnum(`noodcontactRol.${ROL_KEYS[r] ?? "overig"}`)}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Telefoon + Email */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("createDialog.telefoon")}</Label>
            <Input
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("createDialog.email")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            reset();
            onOpenChange(false);
          }}
        >
          {t("createDialog.annuleren")}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "…" : t("createDialog.opslaan")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
