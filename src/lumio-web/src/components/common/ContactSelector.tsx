"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface SharedContact {
  id: string;
  naam: string;
  bedrijfsNaam?: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  functie?: string;
  type: string; // ContactType enum: "Notaris", "Huisarts", "Uitvaartondernemer", etc (from API)
  subType?: string;
  notities?: string;
}

/** Maps 0-based contact type index to enum name for API requests */
const CONTACT_TYPE_ENUM_NAMES = [
  "Notaris",              // 0
  "Huisarts",             // 1
  "Uitvaartondernemer",   // 2
  "Executeur",            // 3
  "Vertegenwoordiger",    // 4
] as const;

interface ContactSelectorProps {
  /** Label for the field */
  label: string;
  /** Contact type index: 0=Notaris, 1=Huisarts, 2=Uitvaartondernemer, etc. */
  contactType: number;
  /** Currently selected contact ID */
  selectedContactId?: string | null;
  /** Called when contact is selected - provides contact ID */
  onSelect: (contactId: string | null) => void;
  /** Called when contact details are selected - provides full contact object for auto-fill */
  onContactDetailsSelect?: (contact: SharedContact | null) => void;
  /** Whether field is required */
  required?: boolean;
  /** Custom className */
  className?: string;
  /** Show create new button */
  showCreateNew?: boolean;
}

/**
 * Component for selecting SharedContacts with optional inline creation.
 * Handles: Notaris, Huisarts, Uitvaartondernemer, and other contact types.
 */
export function ContactSelector({
  label,
  contactType,
  selectedContactId,
  onSelect,
  onContactDetailsSelect,
  required = false,
  className = "",
  showCreateNew = true,
}: ContactSelectorProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createErrorDetails, setCreateErrorDetails] = useState<string[]>([]);

  // Form state for creating new contact
  const [formData, setFormData] = useState({
    naam: "",
    bedrijfsNaam: "",
    telefoon: "",
    email: "",
    adres: "",
    postcode: "",
    woonplaats: "",
  });

  // Fetch shared contacts for this type
  const { data: contacts = [], isLoading, refetch } = useQuery<SharedContact[]>({
    queryKey: ["sharedContacts", contactType],
    queryFn: async () => {
      try {
        const response = await api.get<SharedContact[]>(
          `/api/v1/shared-contacts?type=${CONTACT_TYPE_ENUM_NAMES[contactType]}`
        );
        return response;
      } catch (error: unknown) {
        console.error("Failed to fetch contacts:", error);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Find currently selected contact
  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId),
    [contacts, selectedContactId]
  );

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchValue) return contacts;
    return contacts.filter((c) =>
      c.naam.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [contacts, searchValue]);

  const handleSelectContact = (contact: SharedContact) => {
    onSelect(contact.id);
    onContactDetailsSelect?.(contact);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onSelect(null);
    onContactDetailsSelect?.(null);
    setSearchValue("");
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.naam.trim()) return;

    setCreateError(null);
    setCreateErrorDetails([]);

    try {
      const response = await api.post<SharedContact>("/api/v1/shared-contacts", {
        naam: formData.naam.trim(),
        bedrijfsNaam: formData.bedrijfsNaam.trim() || undefined,
        telefoon: formData.telefoon.trim() || undefined,
        email: formData.email.trim() || undefined,
        adres: formData.adres.trim() || undefined,
        postcode: formData.postcode.trim() || undefined,
        woonplaats: formData.woonplaats.trim() || undefined,
        type: CONTACT_TYPE_ENUM_NAMES[contactType],
      });

      if (response) {
        handleSelectContact(response);
        setFormData({
          naam: "",
          bedrijfsNaam: "",
          telefoon: "",
          email: "",
          adres: "",
          postcode: "",
          woonplaats: "",
        });
        setIsCreating(false);
      }

      await refetch();
    } catch (error: unknown) {
      console.error("Failed to create contact:", error);

      if (error instanceof ApiError && error.errors && Object.keys(error.errors).length > 0) {
        const fieldLabels: Record<string, string> = {
          naam: "Naam",
          telefoon: "Telefoon",
          email: "E-mail",
          postcode: "Postcode",
          type: "Type",
        };

        const details = Object.entries(error.errors).flatMap(([field, messages]) => {
          const key = field.toLowerCase();
          const label = fieldLabels[key] ?? field;
          return messages.map((message) => `${label}: ${message}`);
        });

        setCreateError(error.title || "Controleer de invoer.");
        setCreateErrorDetails(details);
      } else {
        const errorMessage = error instanceof Error ? error.message : "Fout bij het aanmaken van contactpersoon";
        setCreateError(errorMessage);
        setCreateErrorDetails([]);
      }
    }
  };

  return (
    <div className={className}>
      <Label>{label}</Label>

      {selectedContact ? (
        // Display selected contact
        <div className="mt-2 p-3 bg-secure-50 border border-secure-200 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {selectedContact.naam}
              </p>
              {selectedContact.bedrijfsNaam && (
                <p className="text-xs text-muted-foreground">
                  {selectedContact.bedrijfsNaam}
                </p>
              )}
              {(selectedContact.telefoon || selectedContact.email) && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {selectedContact.telefoon && (
                    <span>{selectedContact.telefoon}</span>
                  )}
                  {selectedContact.email && <span>{selectedContact.email}</span>}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-danger-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Dropdown/search interface
        <div className="mt-2 relative">
          {isCreating ? (
            // Create new contact form
            <form onSubmit={handleCreateNew} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {/* Naam - Required */}
                <div>
                  <Label htmlFor="new-contact-naam" className="text-sm">
                    {t("contacts.name")} <span className="text-danger-600">*</span>
                  </Label>
                  <Input
                    id="new-contact-naam"
                    placeholder={t("contacts.namePlaceholder")}
                    value={formData.naam}
                    onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                    autoFocus
                    className="mt-1"
                    required
                  />
                </div>

                {/* Bedrijfsnaam */}
                <div>
                  <Label htmlFor="new-contact-bedrijf" className="text-sm">
                    {t("contacts.companyName")}
                  </Label>
                  <Input
                    id="new-contact-bedrijf"
                    placeholder={t("contacts.companyNamePlaceholder")}
                    value={formData.bedrijfsNaam}
                    onChange={(e) => setFormData({ ...formData, bedrijfsNaam: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Telefoon en Email in 1 regel */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-contact-telefoon" className="text-sm">
                      {t("contacts.phone")}
                    </Label>
                    <Input
                      id="new-contact-telefoon"
                      type="tel"
                      placeholder={t("contacts.phonePlaceholder")}
                      value={formData.telefoon}
                      onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Formaat: +31612345678 of 0612345678</p>
                  </div>
                  <div>
                    <Label htmlFor="new-contact-email" className="text-sm">
                      {t("contacts.email")}
                    </Label>
                    <Input
                      id="new-contact-email"
                      type="email"
                      placeholder={t("contacts.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Formaat: naam@domein.nl</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Voor notaris, huisarts en uitvaartondernemer is minimaal telefoon of e-mail verplicht.</p>

                {/* Adres */}
                <div>
                  <Label htmlFor="new-contact-adres" className="text-sm">
                    {t("contacts.address")}
                  </Label>
                  <Input
                    id="new-contact-adres"
                    placeholder={t("contacts.addressPlaceholder")}
                    value={formData.adres}
                    onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Postcode en Woonplaats in 1 regel */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-contact-postcode" className="text-sm">
                      {t("contacts.postalCode")}
                    </Label>
                    <Input
                      id="new-contact-postcode"
                      placeholder={t("contacts.postalCodePlaceholder")}
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Formaat: 1234AB of 1234 AB</p>
                  </div>
                  <div>
                    <Label htmlFor="new-contact-woonplaats" className="text-sm">
                      {t("contacts.city")}
                    </Label>
                    <Input
                      id="new-contact-woonplaats"
                      placeholder={t("contacts.cityPlaceholder")}
                      value={formData.woonplaats}
                      onChange={(e) => setFormData({ ...formData, woonplaats: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {createError && (
                <Alert variant="warning">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>{createError}</p>
                      {createErrorDetails.length > 0 && (
                        <ul className="list-disc pl-5 text-xs space-y-0.5">
                          {createErrorDetails.map((msg) => (
                            <li key={msg}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({
                      naam: "",
                      bedrijfsNaam: "",
                      telefoon: "",
                      email: "",
                      adres: "",
                      postcode: "",
                      woonplaats: "",
                    });
                    setCreateError(null);
                    setCreateErrorDetails([]);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={!formData.naam.trim()}>
                  {t("common.save")}
                </Button>
              </div>
            </form>
          ) : (
            // Search/filter interface
            <>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder={t("common.search")}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {showCreateNew && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreating(true);
                      setIsOpen(false);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t("common.new")}
                  </Button>
                )}
              </div>

              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg z-50 max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 flex justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleSelectContact(contact)}
                        className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-b-0 transition-colors"
                      >
                        <p className="font-medium text-sm text-foreground">
                          {contact.naam}
                        </p>
                        {contact.bedrijfsNaam && (
                          <p className="text-xs text-muted-foreground">
                            {contact.bedrijfsNaam}
                          </p>
                        )}
                        {contact.telefoon && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {contact.telefoon}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t("common.noResults")}
                    </div>
                  )}
                </div>
              )}
            </>
          )}        </div>
      )}
      {required && !selectedContact && (
        <Alert variant="warning" className="mt-2">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{t("common.required")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

