/**
 * ShamirDialog stories — SP-UX-02-003 (REC-UIDESIGN-003)
 *
 * Documenteert de 4-staps Shamir noodcodes wizard in de primaire visuele
 * varianten. Stories worden opgepikt door de a11y CI-job (`npm run test:storybook`).
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";
import { ShamirDialog } from "./ShamirDialog";
import type { Erfgenaam, GenereerResponse } from "./types";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_ERFGENAMEN: Erfgenaam[] = [
  {
    id: "e1",
    voornaam: "Anna",
    tussenvoegsel: "van",
    achternaam: "Dijk",
    relatie: "kind",
    email: "anna.vandijk@example.com",
    telefoon: "0612345678",
    geboortedatum: "1985-03-15",
    bsn: "",
    adres: "Voorstraat 1",
    postcode: "1234 AB",
    woonplaats: "Amsterdam",
    legitimatieSoort: "paspoort",
    legitimatieNummer: "",
    legitimatieDatumAfgifte: "",
    legitimatieGeldigTot: "",
    heeftShareOntvangen: false,
  },
  {
    id: "e2",
    voornaam: "Bas",
    tussenvoegsel: "",
    achternaam: "Smit",
    relatie: "partner",
    email: "bas.smit@example.com",
    telefoon: "0698765432",
    geboortedatum: "1983-07-22",
    bsn: "",
    adres: "Kerkstraat 5",
    postcode: "2345 CD",
    woonplaats: "Utrecht",
    legitimatieSoort: "id-kaart",
    legitimatieNummer: "",
    legitimatieDatumAfgifte: "",
    legitimatieGeldigTot: "",
    heeftShareOntvangen: false,
  },
  {
    id: "e3",
    voornaam: "Carmen",
    tussenvoegsel: "de",
    achternaam: "Boer",
    relatie: "kind",
    email: "carmen.deboer@example.com",
    telefoon: "0687654321",
    geboortedatum: "1990-11-08",
    bsn: "",
    adres: "Lindelaan 12",
    postcode: "3456 EF",
    woonplaats: "Rotterdam",
    legitimatieSoort: "paspoort",
    legitimatieNummer: "",
    legitimatieDatumAfgifte: "",
    legitimatieGeldigTot: "",
    heeftShareOntvangen: true,
  },
];

const MOCK_GENERATED_SHARES: GenereerResponse = {
  delen: [
    { index: 1, waarde: "lumio-share-aB3kX9mNqW2pL7yT5vR0sZ6uCdEfGhIj" },
    { index: 2, waarde: "lumio-share-mK4nP8rS1tU6wY9zA2bCdEfGhIjKlMnOp" },
    { index: 3, waarde: "lumio-share-xQ5vR7sT9uV0wX3yZ4aBcDeFgHiJkLmNo" },
  ],
  drempel: 2,
  totaalAantalDelen: 3,
};

/** Hardcoded NL translations — gespiegeld vanuit messages/nl/erfgenamen.json#erfgenamen.shamir */
const TRANSLATIONS = {
  stap1Titel: "Wat zijn noodcodes?",
  stap1Uitleg:
    "Met de Shamir-methode wordt uw hoofdwachtwoord veilig opgesplitst in unieke codes. Elk van uw erfgenamen ontvangt één code. Pas wanneer het minimum aantal erfgenamen hun codes samenvoegt, kan uw nalatenschap worden ontgrendeld.",
  stap1Bullet1: "Eén code alleen is waardeloos — samenwerking is vereist.",
  stap1Bullet2: "U bepaalt het minimum aantal (de drempel) dat nodig is.",
  stap1Bullet3: "Veilig, zelfs als één erfgenaam zijn code kwijt is.",
  stap1Callout:
    "De noodcodes worden NIET opgeslagen in Lumio. Noteer of druk ze af en geef ze persoonlijk aan uw erfgenamen.",
  stap2Titel: "Instellingen",
  stap2ErfgenamenLabel: "Erfgenamen die een noodcode ontvangen",
  stap3Titel: "Beveiliging",
  stap4Titel: "Verdeel de noodcodes",
  stap4NogTeKopieren: (n: number) =>
    `${n} ${n === 1 ? "code nog te kopiëren" : "codes nog te kopiëren"}`,
  stap4AlleGekopieerd: "✓ Alle codes gekopieerd",
  stap4CodeFormaat: "Geef de volledige code door inclusief het cijfer vóór het streepje (bijv. 01-XXXX). Het getal is vereist voor het samenstellen van het wachtwoord.",
  volgende: "Volgende",
  vorige: "Vorige",
  stapIndicator: (huidig: number, totaal: number) => `Stap ${huidig} van ${totaal}`,
  titel: "Noodcodes Genereren",
  beschrijving: (aantal: number) =>
    `Verdeel uw hoofdwachtwoord in ${aantal} unieke noodcodes. Alleen wanneer het minimum aantal personen (drempel) hun code samenvoegt, kan het wachtwoord worden gereconstrueerd.`,
  waarschuwing: "Waarschuwing:",
  waarschuwingTekst:
    "De noodcodes worden NIET opgeslagen in Lumio. Noteer ze zorgvuldig of druk ze af. Verloren codes kunnen niet worden hersteld.",
  wachtwoord: "Uw hoofdwachtwoord",
  wachtwoordPlaceholder: "Voer uw Lumio hoofdwachtwoord in",
  drempel: "Drempel (minimum aantal noodcodes voor reconstructie)",
  drempelTooltip:
    "De drempel bepaalt hoeveel erfgenamen samen nodig zijn om uw hoofdwachtwoord te reconstrueren.",
  drempelOptie: (n: number, totaal: number) => `${n} van ${totaal} personen`,
  delenInfo: (params: { aantal: number; drempel: string }): ReactNode =>
    `Er worden ${params.aantal} delen gegenereerd, waarvan er minimaal ${params.drempel} nodig zijn.`,
  annuleren: "Annuleren",
  genererenBezig: "Genereren...",
  genereren: "Genereren",
  succes: "Succes!",
  succesTekst: (aantal: number, drempel: number) =>
    `Er zijn ${aantal} delen gegenereerd met een drempel van ${drempel}. Kopieer elk deel en geef het aan de betreffende erfgenaam.`,
  deel: (index: number) => `Deel ${index}`,
  erfgenaamFallback: (nummer: number) => `Erfgenaam ${nummer}`,
  gekopieerd: "Gekopieerd",
  kopieren: "Kopiëren",
  sluiten: "Sluiten",
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ShamirDialog> = {
  title: "Erfgenamen/ShamirDialog",
  component: ShamirDialog,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  args: {
    open: true,
    onClose: fn(),
    erfgenamen: MOCK_ERFGENAMEN,
    password: "",
    onPasswordChange: fn(),
    threshold: "2",
    onThresholdChange: fn(),
    generating: false,
    onGenerate: fn(),
    generatedShares: null,
    copiedIndex: null,
    onCopyShare: fn(),
    displayName: (e: Erfgenaam) =>
      [e.voornaam, e.tussenvoegsel, e.achternaam].filter(Boolean).join(" "),
    translations: TRANSLATIONS,
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        <div className="w-full max-w-lg">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ShamirDialog>;

// ---------------------------------------------------------------------------
// Stories (≥ 2 varianten, zie AC SP-UX-02-003)
// ---------------------------------------------------------------------------

/**
 * Stap 1: Uitleg over noodcodes (beginstaat bij openen dialog).
 * Toont de informatieve wizard-stap met bullets en callout.
 */
export const Stap1Uitleg: Story = {
  name: "Stap 1 — Uitleg noodcodes (beginstaat)",
  args: {
    password: "",
    generatedShares: null,
  },
};

/**
 * Stap 3: Wachtwoord ingevoerd, klaar om te genereren (laden-staat).
 * Genereerknop toont spinner; stap-indicator staat op 3/4.
 */
export const Stap3Genereren: Story = {
  name: "Stap 3 — Bezig met genereren (loading-staat)",
  args: {
    password: "MijnVeiligWachtwoord123!",
    threshold: "2",
    generating: true,
    generatedShares: null,
  },
};

/**
 * Stap 4: Noodcodes gegenereerd, 1 van 3 codes al gekopieerd.
 * Toont de gedeelde codes per erfgenaam met kopieer-knoppen.
 */
export const Stap4GedeeldeCodesGedeeltelijkGekopieerd: Story = {
  name: "Stap 4 — Codes gegenereerd (1/3 gekopieerd)",
  args: {
    password: "MijnVeiligWachtwoord123!",
    generating: false,
    generatedShares: MOCK_GENERATED_SHARES,
    copiedIndex: 0,
  },
};

/**
 * Lege erfgenamen-lijst: dialog opent maar drempel-selector toont
 * één optie. Randgeval voor gebruikers die per ongeluk de dialog openen.
 */
export const GeenErfgenamen: Story = {
  name: "Randgeval — geen erfgenamen (lege lijst)",
  args: {
    erfgenamen: [],
    generatedShares: null,
  },
};
