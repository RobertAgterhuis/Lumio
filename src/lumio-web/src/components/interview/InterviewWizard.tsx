"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";

interface InterviewData {
  // Stap 1: Persoonlijk
  voornaam: string;
  achternaam: string;
  geboortedatum: string;
  woonplaats: string;
  telefoon: string;
  email: string;
  // Stap 2: Noodcontact
  noodcontactNaam: string;
  noodcontactRelatie: string;
  noodcontactTelefoon: string;
  noodcontactRol: string;
  // Stap 3: Testament
  heeftTestament: string;
  testamentSoort: string;
  notarisNaam: string;
  // Stap 4: Uitvaart
  uitvaartVoorkeur: string;
  uitvaartLocatie: string;
  uitvaartMuziek: string;
  // Stap 5: Digitaal
  belangrijksteAccountNaam: string;
  belangrijksteAccountType: string;
  belangrijksteAccountInstructie: string;
}

const initial: InterviewData = {
  voornaam: "",
  achternaam: "",
  geboortedatum: "",
  woonplaats: "",
  telefoon: "",
  email: "",
  noodcontactNaam: "",
  noodcontactRelatie: "",
  noodcontactTelefoon: "",
  noodcontactRol: "Vertrouwenspersoon",
  heeftTestament: "",
  testamentSoort: "",
  notarisNaam: "",
  uitvaartVoorkeur: "",
  uitvaartLocatie: "",
  uitvaartMuziek: "",
  belangrijksteAccountNaam: "",
  belangrijksteAccountType: "",
  belangrijksteAccountInstructie: "",
};

function QuestionBlock({
  vraag,
  toelichting,
  children,
}: {
  vraag: string;
  toelichting?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4 bg-card">
      <div>
        <p className="font-medium text-foreground">{vraag}</p>
        {toelichting && (
          <p className="text-xs text-muted-foreground mt-1">{toelichting}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface InterviewWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function InterviewWizard({ onComplete, onCancel }: InterviewWizardProps) {
  const [data, setData] = useState<InterviewData>(initial);
  const t = useTranslations("interview");

  const update = (field: keyof InterviewData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    // 1. Sla eigenaar op
    if (data.voornaam && data.achternaam) {
      const eigenaarPayload = {
        voornaam: data.voornaam,
        achternaam: data.achternaam,
        geboortedatum: data.geboortedatum || null,
        woonplaats: data.woonplaats || null,
        telefoon: data.telefoon || null,
        email: data.email || null,
        notaris: data.notarisNaam || null,
      };
      try {
        await api.post("/api/eigenaar", eigenaarPayload);
      } catch {
        // Profiel bestaat al, probeer PUT
        await api.put("/api/eigenaar", eigenaarPayload);
      }
    }

    // 2. Noodcontact
    if (data.noodcontactNaam) {
      await api.post("/api/noodcontacten", {
        naam: data.noodcontactNaam,
        relatie: data.noodcontactRelatie || "Niet opgegeven",
        telefoon: data.noodcontactTelefoon || null,
        rol: data.noodcontactRol || "Vertrouwenspersoon",
      });
    }

    // 3. Testament
    if (data.heeftTestament === "ja") {
      await api.post("/api/testament", {
        soortTestament: data.testamentSoort
          ? parseInt(data.testamentSoort)
          : 0,
      });
    }

    // 4. Uitvaartwensen
    if (data.uitvaartVoorkeur) {
      await api.post("/api/uitvaart", {
        typeUitvaart: data.uitvaartVoorkeur
          ? parseInt(data.uitvaartVoorkeur)
          : 0,
        voorkeurLocatie: data.uitvaartLocatie || null,
        muziekWensen: data.uitvaartMuziek || null,
      });
    }

    // 5. Digitaal account
    if (data.belangrijksteAccountNaam) {
      await api.post("/api/digitaal-bezit/accounts", {
        naam: data.belangrijksteAccountNaam,
        type: data.belangrijksteAccountType || "Overig",
        naBijInstructie: data.belangrijksteAccountInstructie || null,
      });
    }

    onComplete();
  };

  const stappen = [
    {
      id: "persoonlijk",
      titel: t("stappen.persoonlijk.titel"),
      beschrijving: t("stappen.persoonlijk.beschrijving"),
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag={t("stappen.persoonlijk.vraagNaam")}
            toelichting={t("stappen.persoonlijk.toelichtingNaam")}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("stappen.persoonlijk.voornaam")}</Label>
                <Input
                  value={data.voornaam}
                  onChange={(e) => update("voornaam", e.target.value)}
                  placeholder={t("stappen.persoonlijk.voornaamPlaceholder")}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("stappen.persoonlijk.achternaam")}</Label>
                <Input
                  value={data.achternaam}
                  onChange={(e) => update("achternaam", e.target.value)}
                  placeholder={t("stappen.persoonlijk.achternaamPlaceholder")}
                />
              </div>
            </div>
          </QuestionBlock>

          <QuestionBlock vraag={t("stappen.persoonlijk.vraagGeboortedatum")}>
            <Input
              type="date"
              value={data.geboortedatum}
              onChange={(e) => update("geboortedatum", e.target.value)}
              className="max-w-xs"
            />
          </QuestionBlock>

          <QuestionBlock vraag={t("stappen.persoonlijk.vraagWoonplaats")}>
            <Input
              value={data.woonplaats}
              onChange={(e) => update("woonplaats", e.target.value)}
              placeholder={t("stappen.persoonlijk.woonplaatsPlaceholder")}
              className="max-w-xs"
            />
          </QuestionBlock>

          <QuestionBlock
            vraag={t("stappen.persoonlijk.vraagContact")}
            toelichting={t("stappen.persoonlijk.toelichtingContact")}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("stappen.persoonlijk.telefoon")}</Label>
                <Input
                  value={data.telefoon}
                  onChange={(e) => update("telefoon", e.target.value)}
                  placeholder={t("stappen.persoonlijk.telefoonPlaceholder")}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("stappen.persoonlijk.email")}</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("stappen.persoonlijk.emailPlaceholder")}
                />
              </div>
            </div>
          </QuestionBlock>
        </div>
      ),
    },
    {
      id: "noodcontact",
      titel: t("stappen.noodcontact.titel"),
      beschrijving: t("stappen.noodcontact.beschrijving"),
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag={t("stappen.noodcontact.vraagContactpersoon")}
            toelichting={t("stappen.noodcontact.toelichtingContactpersoon")}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("stappen.noodcontact.naam")}</Label>
                <Input
                  value={data.noodcontactNaam}
                  onChange={(e) => update("noodcontactNaam", e.target.value)}
                  placeholder={t("stappen.noodcontact.naamPlaceholder")}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("stappen.noodcontact.relatie")}</Label>
                <Input
                  value={data.noodcontactRelatie}
                  onChange={(e) =>
                    update("noodcontactRelatie", e.target.value)
                  }
                  placeholder={t("stappen.noodcontact.relatiePlaceholder")}
                />
              </div>
            </div>
          </QuestionBlock>

          <QuestionBlock vraag={t("stappen.noodcontact.vraagTelefoon")}>
            <Input
              value={data.noodcontactTelefoon}
              onChange={(e) => update("noodcontactTelefoon", e.target.value)}
              placeholder={t("stappen.persoonlijk.telefoonPlaceholder")}
              className="max-w-xs"
            />
          </QuestionBlock>

          <QuestionBlock
            vraag={t("stappen.noodcontact.vraagRol")}
            toelichting={t("stappen.noodcontact.toelichtingRol")}
          >
            <Select
              value={data.noodcontactRol}
              onChange={(e) => update("noodcontactRol", e.target.value)}
              className="max-w-xs"
            >
              <option value="Vertrouwenspersoon">{t("stappen.noodcontact.rolVertrouwenspersoon")}</option>
              <option value="Huisarts">{t("stappen.noodcontact.rolHuisarts")}</option>
              <option value="Notaris">{t("stappen.noodcontact.rolNotaris")}</option>
              <option value="Uitvaartondernemer">{t("stappen.noodcontact.rolUitvaartondernemer")}</option>
              <option value="Overig">{t("stappen.noodcontact.rolOverig")}</option>
            </Select>
          </QuestionBlock>
        </div>
      ),
    },
    {
      id: "testament",
      titel: t("stappen.testament.titel"),
      beschrijving: t("stappen.testament.beschrijving"),
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag={t("stappen.testament.vraagHeeftTestament")}
            toelichting={t("stappen.testament.toelichtingTestament")}
          >
            <div className="flex gap-3">
              {[
                { value: "ja", label: t("stappen.testament.jaTestament") },
                { value: "nee", label: t("stappen.testament.neeTestament") },
                { value: "weet-niet", label: t("stappen.testament.weetNiet") },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("heeftTestament", opt.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    data.heeftTestament === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </QuestionBlock>

          {data.heeftTestament === "ja" && (
            <>
              <QuestionBlock vraag={t("stappen.testament.vraagSoort")}>
                <Select
                  value={data.testamentSoort}
                  onChange={(e) => update("testamentSoort", e.target.value)}
                  className="max-w-xs"
                >
                  <option value="">{t("stappen.testament.selecteer")}</option>
                  <option value="0">{t("stappen.testament.notarieel")}</option>
                  <option value="1">{t("stappen.testament.codicil")}</option>
                  <option value="2">{t("stappen.testament.holografisch")}</option>
                </Select>
              </QuestionBlock>

              <QuestionBlock
                vraag={t("stappen.testament.vraagNotaris")}
                toelichting={t("stappen.testament.toelichtingNotaris")}
              >
                <Input
                  value={data.notarisNaam}
                  onChange={(e) => update("notarisNaam", e.target.value)}
                  placeholder={t("stappen.testament.notarisPlaceholder")}
                  className="max-w-sm"
                />
              </QuestionBlock>
            </>
          )}

          {data.heeftTestament === "weet-niet" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                <strong>{t("stappen.testament.tipTitel")}</strong> {t("stappen.testament.tipTekst")}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "uitvaart",
      titel: t("stappen.uitvaart.titel"),
      beschrijving: t("stappen.uitvaart.beschrijving"),
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag={t("stappen.uitvaart.vraagVoorkeur")}
            toelichting={t("stappen.uitvaart.toelichtingVoorkeur")}
          >
            <div className="flex gap-3">
              {[
                { value: "0", label: t("stappen.uitvaart.begraven") },
                { value: "1", label: t("stappen.uitvaart.cremeren") },
                { value: "2", label: t("stappen.uitvaart.natuurbegraven") },
                { value: "", label: t("stappen.uitvaart.geenVoorkeur") },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("uitvaartVoorkeur", opt.value)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    data.uitvaartVoorkeur === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </QuestionBlock>

          <QuestionBlock
            vraag={t("stappen.uitvaart.vraagLocatie")}
            toelichting={t("stappen.uitvaart.toelichtingLocatie")}
          >
            <Input
              value={data.uitvaartLocatie}
              onChange={(e) => update("uitvaartLocatie", e.target.value)}
              placeholder={t("stappen.uitvaart.locatiePlaceholder")}
              className="max-w-sm"
            />
          </QuestionBlock>

          <QuestionBlock
            vraag={t("stappen.uitvaart.vraagMuziek")}
            toelichting={t("stappen.uitvaart.toelichtingMuziek")}
          >
            <Textarea
              value={data.uitvaartMuziek}
              onChange={(e) => update("uitvaartMuziek", e.target.value)}
              rows={2}
              placeholder={t("stappen.uitvaart.muziekPlaceholder")}
            />
          </QuestionBlock>
        </div>
      ),
    },
    {
      id: "digitaal",
      titel: t("stappen.digitaal.titel"),
      beschrijving: t("stappen.digitaal.beschrijving"),
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag={t("stappen.digitaal.vraagAccount")}
            toelichting={t("stappen.digitaal.toelichtingAccount")}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("stappen.digitaal.naamDienst")}</Label>
                <Input
                  value={data.belangrijksteAccountNaam}
                  onChange={(e) =>
                    update("belangrijksteAccountNaam", e.target.value)
                  }
                  placeholder={t("stappen.digitaal.naamDienstPlaceholder")}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("stappen.digitaal.type")}</Label>
                <Select
                  value={data.belangrijksteAccountType}
                  onChange={(e) =>
                    update("belangrijksteAccountType", e.target.value)
                  }
                >
                  <option value="">{t("stappen.digitaal.typeSelecteer")}</option>
                  <option value="E-mail">{t("stappen.digitaal.typeEmail")}</option>
                  <option value="Social media">{t("stappen.digitaal.typeSocialMedia")}</option>
                  <option value="Cloud-opslag">{t("stappen.digitaal.typeCloudOpslag")}</option>
                  <option value="Bankieren">{t("stappen.digitaal.typeBankieren")}</option>
                  <option value="Overig">{t("stappen.digitaal.typeOverig")}</option>
                </Select>
              </div>
            </div>
          </QuestionBlock>

          <QuestionBlock
            vraag={t("stappen.digitaal.vraagInstructie")}
            toelichting={t("stappen.digitaal.toelichtingInstructie")}
          >
            <Textarea
              value={data.belangrijksteAccountInstructie}
              onChange={(e) =>
                update("belangrijksteAccountInstructie", e.target.value)
              }
              rows={2}
              placeholder={t("stappen.digitaal.instructiePlaceholder")}
            />
          </QuestionBlock>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>{t("stappen.digitaal.infoTitel")}</strong> {t("stappen.digitaal.infoTekst")}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <WizardShell
      titel={t("titel")}
      stappen={stappen}
      onComplete={handleSave}
      onCancel={onCancel}
    />
  );
}
