"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDomainQuery } from "@/hooks";
import {
  PersonCreateInlineDialog,
  type CreatedPersonResult,
} from "./PersonCreateInlineDialog";

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
  /** Raw Guid of the erfgenaam when the selected person is an erfgenaam; undefined otherwise */
  erfgenaamId?: string;
  /** Raw Guid of the noodcontact when the selected person is a noodcontact; undefined otherwise */
  noodcontactId?: string;
}

interface PersonSelectProps {
  /** Current string value of the name field */
  value: string;
  /** Called when value changes (always the name string) */
  onChange: (value: string) => void;
  /** Called when an existing erfgenaam is selected — provides the raw Guid ID, or null when deselected */
  onIdChange?: (id: string | null) => void;
  /** Called when an existing person is selected (to auto-fill other fields) */
  onPersonSelect?: (person: PersonDetails) => void;
  /** Called when the user returns to select mode — use to clear any auto-filled fields in the parent form */
  onClear?: () => void;
  /** Which data sources to load */
  source: PersonSource;
  /** Placeholder for the manual input */
  placeholder?: string;
  /** When true, shows a '+ Nieuw aanmaken' option that opens an inline creation dialog */
  showCreateNew?: boolean;
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
  onIdChange,
  onPersonSelect,
  onClear,
  source,
  placeholder,
  showCreateNew = false,
}: PersonSelectProps) {
  const t = useTranslations("personSelect");
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  /** Persons created inline during this session — merged into the persons list until RQ cache refreshes */
  const [extraPersons, setExtraPersons] = useState<Person[]>([]);
  /** M5-4: Filter string shown when list exceeds the threshold */
  const [filter, setFilter] = useState("");

  // Derive createNewAs and defaultRol from source
  const createNewAs: "erfgenaam" | "noodcontact" | "both" =
    source === "erfgenamen" ? "erfgenaam" :
    source === "both" ? "both" :
    "noodcontact"; // covers "noodcontacten" and { noodcontactRol }
  const defaultRol = typeof source === "object" ? source.noodcontactRol : undefined;

  const loadErfgenamen = source === "erfgenamen" || source === "both";
  const loadNoodcontacten =
    source === "noodcontacten" || source === "both" || typeof source === "object";
  const noodcontactRol = typeof source === "object" ? source.noodcontactRol : undefined;

  // M5-1: React Query — PersonSelect auto-refreshes whenever the app invalidates erfgenamen or noodcontacten
  const { data: rawErfgenamen = [], isLoading: erfLoading } = useDomainQuery<Erfgenaam[]>(
    "erfgenamen",
    { enabled: loadErfgenamen }
  );
  const { data: rawNoodcontacten = [], isLoading: noodLoading } = useDomainQuery<Noodcontact[]>(
    "noodcontacten",
    { enabled: loadNoodcontacten }
  );

  const isLoading = (loadErfgenamen && erfLoading) || (loadNoodcontacten && noodLoading);

  // M5-3: Build the persons list; merge in-session new persons that may not yet be in the cache
  const persons = useMemo(() => {
    const result: Person[] = [];
    if (loadErfgenamen) {
      for (const e of rawErfgenamen) {
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
      for (const n of rawNoodcontacten) {
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
    // Merge persons added inline during this session
    for (const p of extraPersons) {
      if (!result.some((r) => r.id === p.id)) result.push(p);
    }
    return result;
  }, [rawErfgenamen, rawNoodcontacten, loadErfgenamen, loadNoodcontacten, noodcontactRol, extraPersons]);

  // Once loading completes: if the current value doesn't match any known person, switch to manual entry
  useEffect(() => {
    if (!isLoading && value && !persons.some((p) => p.naam === value)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("manual");
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called by PersonCreateInlineDialog after a successful creation — adds the new person to the list and auto-selects it. */
  const handleCreated = (created: CreatedPersonResult) => {
    const newPerson: Person = {
      id: created.bron === "erfgenaam" ? `erf-${created.rawId}` : `nood-${created.rawId}`,
      naam: created.naam,
      relatie: created.relatie,
      telefoon: created.telefoon,
      email: created.email,
      bron: created.bron,
    };
    setExtraPersons((prev) => [...prev, newPerson]);
    onChange(created.naam);
    onIdChange?.(created.bron === "erfgenaam" ? created.rawId : null);
    onPersonSelect?.({
      naam: created.naam,
      erfgenaamId: created.bron === "erfgenaam" ? created.rawId : undefined,
      noodcontactId: created.bron === "noodcontact" ? created.rawId : undefined,
      relatie: created.relatie,
      telefoon: created.telefoon,
      email: created.email,
    });
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__new__") {
      setShowCreateDialog(true);
      return;
    }

    if (selectedValue === "__manual__") {
      setMode("manual");
      onChange("");
      onIdChange?.(null);
      return;
    }

    if (selectedValue === "") {
      // M5-5: Use onClear to atomically clear naam + all auto-filled fields, preventing ghost data
      if (onClear) {
        onClear();
      } else {
        onChange("");
        onIdChange?.(null);
      }
      return;
    }

    const person = persons.find((p) => p.id === selectedValue);
    if (person) {
      onChange(person.naam);
      // Return the raw Guid for erfgenamen only (noodcontacten are not used as FK targets)
      onIdChange?.(person.bron === "erfgenaam" ? person.id.replace("erf-", "") : null);
      onPersonSelect?.({
        naam: person.naam,
        erfgenaamId: person.bron === "erfgenaam" ? person.id.replace("erf-", "") : undefined,
        noodcontactId: person.bron === "noodcontact" ? person.id.replace("nood-", "") : undefined,
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
    if (onClear) {
      // onClear is responsible for resetting naam and all auto-filled fields in one call,
      // avoiding React 18 batching conflicts between onChange and onIdChange.
      onClear();
    } else {
      onChange("");
      onIdChange?.(null);
    }
  };

  // Still loading — show a disabled placeholder to avoid layout shift (M5-2)
  if (isLoading) {
    return (
      <Input
        value=""
        disabled
        placeholder={t("laden")}
      />
    );
  }

  // No persons available → show plain input
  if (!isLoading && persons.length === 0) {
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

  // M5-4: Only show filter input when list exceeds this threshold
  const FILTER_THRESHOLD = 10;

  // Find the selected person's id by matching on name
  const selectedId = persons.find((p) => p.naam === value)?.id ?? "";

  // M5-4: Apply filter
  const filteredPersons = filter.trim()
    ? persons.filter((p) => p.naam.toLowerCase().includes(filter.toLowerCase()))
    : persons;

  // M5-3: Split into groups when both sources are present
  const erfPersons = filteredPersons.filter((p) => p.bron === "erfgenaam");
  const noodPersons = filteredPersons.filter((p) => p.bron === "noodcontact");
  const showGroups = erfPersons.length > 0 && noodPersons.length > 0;

  return (
    <div className="space-y-1">
      {/* M5-4: Search filter — shown when the unfiltered list is long */}
      {persons.length > FILTER_THRESHOLD && (
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t("zoekFilter")}
          className="text-sm"
        />
      )}
      <Select value={selectedId} onChange={(e) => handleSelectChange(e.target.value)}>
        <option value="">{t("selecteer")}</option>
        {showGroups ? (
          <>
            {/* M5-3: Grouped optgroup view when both erfgenamen and noodcontacten are loaded */}
            <optgroup label={t("optgroepErfgenamen")}>
              {erfPersons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naam}{p.relatie ? ` (${p.relatie})` : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label={t("optgroepNoodcontacten")}>
              {noodPersons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naam}{p.relatie ? ` (${p.relatie})` : ""}
                </option>
              ))}
            </optgroup>
          </>
        ) : (
          filteredPersons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.naam}
              {p.relatie ? ` (${p.relatie})` : ""}
              {p.bron === "noodcontact" ? ` — ${t("noodcontact")}` : ""}
            </option>
          ))
        )}
        <option value="__manual__">{t("handmatig")}</option>
        {showCreateNew && (
          <option value="__new__">+ {t("nieuwAanmaken")}</option>
        )}
      </Select>
      {showCreateNew && (
        <PersonCreateInlineDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          createNewAs={createNewAs}
          defaultRol={defaultRol}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
