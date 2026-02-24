"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";

/** Simplified person shape returned from erfgenamen/noodcontacten APIs */
interface Person {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  bron: "erfgenaam" | "noodcontact";
}

interface Erfgenaam {
  id: string;
  voornaam: string;
  achternaam: string;
  tussenvoegsel?: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
}

interface Noodcontact {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  rol?: string;
}

export type PersonSource =
  | "erfgenamen"
  | "noodcontacten"
  | "both"
  | { noodcontactRol: string };

export interface PersonDetails {
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
}

interface PersonSelectProps {
  /** Current string value of the name field */
  value: string;
  /** Called when value changes (always the name string) */
  onChange: (value: string) => void;
  /** Called when an existing person is selected (to auto-fill other fields) */
  onPersonSelect?: (person: PersonDetails) => void;
  /** Which data sources to load */
  source: PersonSource;
  /** Placeholder for the manual input */
  placeholder?: string;
}

function formatErfgenaamNaam(e: Erfgenaam): string {
  return e.tussenvoegsel
    ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
    : `${e.voornaam} ${e.achternaam}`;
}

/**
 * Dropdown to pick an existing erfgenaam/noodcontact, with fallback to manual text input.
 * Sets the name field as a string; optionally auto-fills related contact fields.
 */
export function PersonSelect({
  value,
  onChange,
  onPersonSelect,
  source,
  placeholder,
}: PersonSelectProps) {
  const t = useTranslations("personSelect");
  const [persons, setPersons] = useState<Person[]>([]);
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadPersons = async () => {
      const result: Person[] = [];

      const loadErfgenamen =
        source === "erfgenamen" || source === "both";
      const loadNoodcontacten =
        source === "noodcontacten" ||
        source === "both" ||
        typeof source === "object";
      const noodcontactRol =
        typeof source === "object" ? source.noodcontactRol : undefined;

      try {
        if (loadErfgenamen) {
          const erfgenamen = await api
            .get<Erfgenaam[]>("/api/erfgenamen")
            .catch((err) => { console.error("Failed to load erfgenamen:", err); return []; });
          for (const e of erfgenamen ?? []) {
            result.push({
              id: `erf-${e.id}`,
              naam: formatErfgenaamNaam(e),
              relatie: e.relatie,
              telefoon: e.telefoon,
              email: e.email,
              adres: e.adres,
              postcode: e.postcode,
              woonplaats: e.woonplaats,
              bron: "erfgenaam",
            });
          }
        }

        if (loadNoodcontacten) {
          const noodcontacten = await api
            .get<Noodcontact[]>("/api/noodcontacten")
            .catch((err) => { console.error("Failed to load noodcontacten:", err); return []; });
          for (const n of noodcontacten ?? []) {
            if (noodcontactRol && n.rol !== noodcontactRol) continue;
            result.push({
              id: `nood-${n.id}`,
              naam: n.naam,
              relatie: n.relatie,
              telefoon: n.telefoon,
              email: n.email,
              adres: n.adres,
              postcode: n.postcode,
              woonplaats: n.woonplaats,
              bron: "noodcontact",
            });
          }
        }
      } catch {
        // Silently fail — manual input remains available
      }

      setPersons(result);
      setLoaded(true);

      // If current value doesn't match any person, switch to manual mode
      if (value && result.length > 0 && !result.some((p) => p.naam === value)) {
        setMode("manual");
      }
    };

    loadPersons();
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__manual__") {
      setMode("manual");
      onChange("");
      return;
    }

    if (selectedValue === "") {
      onChange("");
      return;
    }

    const person = persons.find((p) => p.id === selectedValue);
    if (person) {
      onChange(person.naam);
      onPersonSelect?.({
        naam: person.naam,
        relatie: person.relatie,
        telefoon: person.telefoon,
        email: person.email,
        adres: person.adres,
        postcode: person.postcode,
        woonplaats: person.woonplaats,
      });
    }
  };

  const handleBackToSelect = () => {
    setMode("select");
    onChange("");
  };

  // No persons available → show plain input
  if (loaded && persons.length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleBackToSelect}
          className="text-xs text-info hover:underline"
        >
          {t("kiesUitLijst")}
        </button>
      </div>
    );
  }

  // Find the selected person's id by matching on name
  const selectedId = persons.find((p) => p.naam === value)?.id ?? "";

  return (
    <div className="space-y-1">
      <Select value={selectedId} onChange={(e) => handleSelectChange(e.target.value)}>
        <option value="">{t("selecteer")}</option>
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.naam}
            {p.relatie ? ` (${p.relatie})` : ""}
            {p.bron === "noodcontact" ? ` — ${t("noodcontact")}` : ""}
          </option>
        ))}
        <option value="__manual__">{t("handmatig")}</option>
      </Select>
    </div>
  );
}
