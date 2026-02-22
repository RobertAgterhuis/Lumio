"use client";

import { useState } from "react";
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
      titel: "Over uzelf",
      beschrijving:
        "Laten we beginnen. We stellen u een paar vragen om uw profiel op te zetten.",
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag="Hoe heet u?"
            toelichting="Uw volledige naam zoals op uw identiteitsbewijs."
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Voornaam</Label>
                <Input
                  value={data.voornaam}
                  onChange={(e) => update("voornaam", e.target.value)}
                  placeholder="Jan"
                />
              </div>
              <div className="space-y-1">
                <Label>Achternaam</Label>
                <Input
                  value={data.achternaam}
                  onChange={(e) => update("achternaam", e.target.value)}
                  placeholder="de Vries"
                />
              </div>
            </div>
          </QuestionBlock>

          <QuestionBlock vraag="Wat is uw geboortedatum?">
            <Input
              type="date"
              value={data.geboortedatum}
              onChange={(e) => update("geboortedatum", e.target.value)}
              className="max-w-xs"
            />
          </QuestionBlock>

          <QuestionBlock vraag="Waar woont u?">
            <Input
              value={data.woonplaats}
              onChange={(e) => update("woonplaats", e.target.value)}
              placeholder="Amsterdam"
              className="max-w-xs"
            />
          </QuestionBlock>

          <QuestionBlock
            vraag="Hoe kunnen nabestaanden u bereiken?"
            toelichting="Optioneel — wordt gebruikt voor uw noodkaart."
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Telefoon</Label>
                <Input
                  value={data.telefoon}
                  onChange={(e) => update("telefoon", e.target.value)}
                  placeholder="06-12345678"
                />
              </div>
              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jan@voorbeeld.nl"
                />
              </div>
            </div>
          </QuestionBlock>
        </div>
      ),
    },
    {
      id: "noodcontact",
      titel: "Vertrouwenspersoon",
      beschrijving:
        "Wie is de allerbelangrijkste persoon die moet worden geïnformeerd als u iets overkomt?",
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag="Wie is uw eerste contactpersoon?"
            toelichting="Dit kan uw partner, kind, vriend(in) of buurvrouw zijn."
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Naam</Label>
                <Input
                  value={data.noodcontactNaam}
                  onChange={(e) => update("noodcontactNaam", e.target.value)}
                  placeholder="Maria de Vries"
                />
              </div>
              <div className="space-y-1">
                <Label>Relatie</Label>
                <Input
                  value={data.noodcontactRelatie}
                  onChange={(e) =>
                    update("noodcontactRelatie", e.target.value)
                  }
                  placeholder="Partner, kind, vriend"
                />
              </div>
            </div>
          </QuestionBlock>

          <QuestionBlock vraag="Op welk nummer is deze persoon bereikbaar?">
            <Input
              value={data.noodcontactTelefoon}
              onChange={(e) => update("noodcontactTelefoon", e.target.value)}
              placeholder="06-12345678"
              className="max-w-xs"
            />
          </QuestionBlock>

          <QuestionBlock
            vraag="Welke rol heeft deze persoon?"
            toelichting="U kunt later meer contacten toevoegen (huisarts, notaris, etc.)."
          >
            <Select
              value={data.noodcontactRol}
              onChange={(e) => update("noodcontactRol", e.target.value)}
              className="max-w-xs"
            >
              <option value="Vertrouwenspersoon">Vertrouwenspersoon</option>
              <option value="Huisarts">Huisarts</option>
              <option value="Notaris">Notaris</option>
              <option value="Uitvaartondernemer">Uitvaartondernemer</option>
              <option value="Overig">Overig</option>
            </Select>
          </QuestionBlock>
        </div>
      ),
    },
    {
      id: "testament",
      titel: "Testament",
      beschrijving:
        "Heeft u al een testament? En zo ja, wat voor soort? Dit hoeft niet — u kunt het altijd later invullen.",
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag="Heeft u een testament?"
            toelichting="Een testament regelt wie uw erfgenamen zijn en hoe uw bezittingen worden verdeeld."
          >
            <div className="flex gap-3">
              {[
                { value: "ja", label: "Ja, ik heb een testament" },
                { value: "nee", label: "Nee, (nog) niet" },
                { value: "weet-niet", label: "Ik weet het niet zeker" },
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
              <QuestionBlock vraag="Wat voor soort testament heeft u?">
                <Select
                  value={data.testamentSoort}
                  onChange={(e) => update("testamentSoort", e.target.value)}
                  className="max-w-xs"
                >
                  <option value="">Selecteer...</option>
                  <option value="0">Notarieel testament</option>
                  <option value="1">Codicil (handgeschreven)</option>
                  <option value="2">Holografisch testament</option>
                </Select>
              </QuestionBlock>

              <QuestionBlock
                vraag="Bij welke notaris ligt uw testament?"
                toelichting="Optioneel — handig voor nabestaanden om dit te weten."
              >
                <Input
                  value={data.notarisNaam}
                  onChange={(e) => update("notarisNaam", e.target.value)}
                  placeholder="Naam van de notaris"
                  className="max-w-sm"
                />
              </QuestionBlock>
            </>
          )}

          {data.heeftTestament === "weet-niet" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> U kunt dit controleren via het Centraal Testamentenregister
                (CTR) of bij uw notaris. Lumio helpt u vervolgens alles netjes vast te
                leggen.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "uitvaart",
      titel: "Uitvaartwensen",
      beschrijving:
        "Heeft u al nagedacht over uw uitvaartwensen? U hoeft niet alles nu in te vullen — elke keuze helpt uw naasten later.",
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag="Heeft u een voorkeur voor begraven of cremeren?"
            toelichting="U kunt dit altijd later aanpassen."
          >
            <div className="flex gap-3">
              {[
                { value: "0", label: "Begraven" },
                { value: "1", label: "Cremeren" },
                { value: "2", label: "Natuurbegraven" },
                { value: "", label: "Nog geen voorkeur" },
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
            vraag="Heeft u een voorkeur voor een locatie?"
            toelichting="Bijv. een kerk, aula, thuis, of een specifieke begraafplaats."
          >
            <Input
              value={data.uitvaartLocatie}
              onChange={(e) => update("uitvaartLocatie", e.target.value)}
              placeholder="Bijv. Nieuwe Kerk, Amsterdam"
              className="max-w-sm"
            />
          </QuestionBlock>

          <QuestionBlock
            vraag="Is er muziek die u graag wilt laten spelen?"
            toelichting="U kunt hier een lied of meerdere nummers noemen."
          >
            <Textarea
              value={data.uitvaartMuziek}
              onChange={(e) => update("uitvaartMuziek", e.target.value)}
              rows={2}
              placeholder="Bijv. 'Aan de Amsterdamse grachten' van Wim Sonneveld"
            />
          </QuestionBlock>
        </div>
      ),
    },
    {
      id: "digitaal",
      titel: "Digitaal bezit",
      beschrijving:
        "Heeft u belangrijke online accounts? Denk aan e-mail, sociale media, of cloud-opslag. Eén voorbeeld is genoeg om te beginnen.",
      isOptional: true,
      content: (
        <div className="space-y-4">
          <QuestionBlock
            vraag="Welk online account is voor u het belangrijkst?"
            toelichting="Denk aan uw e-mail, Facebook, Google, iCloud, of bankrekening-app."
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Naam / dienst</Label>
                <Input
                  value={data.belangrijksteAccountNaam}
                  onChange={(e) =>
                    update("belangrijksteAccountNaam", e.target.value)
                  }
                  placeholder="Bijv. Gmail, Facebook"
                />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={data.belangrijksteAccountType}
                  onChange={(e) =>
                    update("belangrijksteAccountType", e.target.value)
                  }
                >
                  <option value="">Selecteer...</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Social media">Social media</option>
                  <option value="Cloud-opslag">Cloud-opslag</option>
                  <option value="Bankieren">Bankieren</option>
                  <option value="Overig">Overig</option>
                </Select>
              </div>
            </div>
          </QuestionBlock>

          <QuestionBlock
            vraag="Wat moeten nabestaanden met dit account doen?"
            toelichting="Bijv. bewaren, verwijderen, herdenkingsstatus instellen."
          >
            <Textarea
              value={data.belangrijksteAccountInstructie}
              onChange={(e) =>
                update("belangrijksteAccountInstructie", e.target.value)
              }
              rows={2}
              placeholder="Bijv. 'Account sluiten na overlijden' of 'Foto's bewaren'"
            />
          </QuestionBlock>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Goed om te weten:</strong> U kunt later onbeperkt accounts, bezittingen
              en wachtwoorden toevoegen. Dit is slechts een startpunt.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <WizardShell
      titel="Uw nalatenschap vastleggen"
      stappen={stappen}
      onComplete={handleSave}
      onCancel={onCancel}
    />
  );
}
