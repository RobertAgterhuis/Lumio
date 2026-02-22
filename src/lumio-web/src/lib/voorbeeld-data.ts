// P-S12: Voorbeeld-data per sectie — "Familie de Voorbeeld"
// Fictieve data om gebruikers te laten zien wat ze kunnen invullen.

export interface VoorbeeldVeld {
  label: string;
  waarde: string;
}

export interface VoorbeeldSectie {
  titel: string;
  velden: VoorbeeldVeld[];
}

export interface VoorbeeldData {
  domein: string;
  titel: string;
  beschrijving: string;
  secties: VoorbeeldSectie[];
}

export const voorbeeldData: Record<string, VoorbeeldData> = {
  eigenaar: {
    domein: "eigenaar",
    titel: "Mijn Profiel — Voorbeeld",
    beschrijving:
      "Hieronder ziet u een voorbeeld van een ingevuld profiel. Gebruik dit als inspiratie voor uw eigen gegevens.",
    secties: [
      {
        titel: "Persoonsgegevens",
        velden: [
          { label: "Voornaam", waarde: "Pieter" },
          { label: "Tussenvoegsel", waarde: "de" },
          { label: "Achternaam", waarde: "Voorbeeld" },
          { label: "Geboortedatum", waarde: "15-03-1965" },
          { label: "BSN", waarde: "123456789" },
          { label: "Telefoon", waarde: "06-12345678" },
          { label: "E-mail", waarde: "pieter@voorbeeld.nl" },
        ],
      },
      {
        titel: "Adresgegevens",
        velden: [
          { label: "Adres", waarde: "Voorbeeldstraat 42" },
          { label: "Postcode", waarde: "1234 AB" },
          { label: "Woonplaats", waarde: "Voorbeeldstad" },
        ],
      },
      {
        titel: "Burgerlijke staat",
        velden: [
          { label: "Burgerlijke staat", waarde: "Gehuwd" },
          { label: "Huwelijksvoorwaarden", waarde: "Beperkte gemeenschap" },
          { label: "Datum huwelijk", waarde: "22-06-1992" },
        ],
      },
      {
        titel: "Legitimatie",
        velden: [
          { label: "Soort", waarde: "Paspoort" },
          { label: "Documentnummer", waarde: "NX1234567" },
          { label: "Datum afgifte", waarde: "01-02-2022" },
          { label: "Geldig tot", waarde: "01-02-2032" },
        ],
      },
    ],
  },

  testament: {
    domein: "testament",
    titel: "Testament — Voorbeeld",
    beschrijving:
      "Een voorbeeld van testamentaire informatie. De inhoud is fictief.",
    secties: [
      {
        titel: "Testamentgegevens",
        velden: [
          { label: "Type testament", waarde: "Notarieel testament" },
          { label: "Datum testament", waarde: "10-09-2020" },
          { label: "CTR-nummer", waarde: "CTR-2020-098765" },
          { label: "Locatie", waarde: "Kluis bij notaris" },
        ],
      },
      {
        titel: "Notaris",
        velden: [
          { label: "Naam", waarde: "Mr. J.H. Bakker" },
          { label: "Kantoor", waarde: "Bakker & Partners Notarissen" },
          { label: "Telefoon", waarde: "020-1234567" },
          { label: "E-mail", waarde: "info@bakkernotarissen.nl" },
          { label: "Adres", waarde: "Keizersgracht 100, 1015 AB Amsterdam" },
        ],
      },
      {
        titel: "Executeur",
        velden: [
          { label: "Naam", waarde: "Maria de Voorbeeld-Jansen" },
          { label: "Relatie", waarde: "Echtgenote" },
          {
            label: "Bevoegdheden",
            waarde: "Driestereenexecuteur (beheer, verdeling, verkoop)",
          },
          { label: "Telefoon", waarde: "06-98765432" },
        ],
      },
      {
        titel: "Begunstigden",
        velden: [
          { label: "Maria de Voorbeeld-Jansen", waarde: "Echtgenote — 50%" },
          { label: "Thomas de Voorbeeld", waarde: "Zoon — 25%" },
          { label: "Sophie de Voorbeeld", waarde: "Dochter — 25%" },
        ],
      },
      {
        titel: "Aanvullend",
        velden: [
          { label: "Uitsluitingsclausule", waarde: "Ja" },
          {
            label: "Legaten",
            waarde: "Schilderij van opa → aan neef Karel",
          },
          {
            label: "Algemene wensen",
            waarde:
              "Mijn boekencollectie mag verdeeld worden onder de kinderen.",
          },
        ],
      },
    ],
  },

  euthanasie: {
    domein: "euthanasie",
    titel: "Wilsverklaring — Voorbeeld",
    beschrijving:
      "Een voorbeeld van een vastgelegde wilsverklaring euthanasie.",
    secties: [
      {
        titel: "Wilsverklaring",
        velden: [
          { label: "Type", waarde: "Euthanasieverzoek" },
          { label: "Datum opgesteld", waarde: "05-01-2021" },
          { label: "Locatie document", waarde: "Huisarts en thuiskluis" },
          {
            label: "Huisarts",
            waarde: "Dr. A.B. Smit — Huisartsenpraktijk Centrum",
          },
          { label: "Telefoon huisarts", waarde: "020-7654321" },
        ],
      },
      {
        titel: "Wensen & voorwaarden",
        velden: [
          {
            label: "Wanneer van toepassing",
            waarde:
              "Bij uitzichtloos en ondraaglijk lijden, ook bij vergevorderde dementie waarbij ik mijzelf en naasten niet meer herken.",
          },
          {
            label: "Behandelverbod",
            waarde:
              "Geen reanimatie, geen kunstmatige beademing, geen sondevoeding.",
          },
          {
            label: "Aanvullende wensen",
            waarde: "Ik wil in mijn eigen huis overlijden indien mogelijk.",
          },
        ],
      },
    ],
  },

  donor: {
    domein: "donor",
    titel: "Donorregistratie — Voorbeeld",
    beschrijving: "Een voorbeeld van een donorregistratie.",
    secties: [
      {
        titel: "Registratie",
        velden: [
          { label: "Keuze", waarde: "Ja, ik geef toestemming" },
          {
            label: "Specificatie",
            waarde: "Alle organen en weefsels, behalve cornea (ogen)",
          },
          { label: "Geregistreerd op", waarde: "12-04-2019" },
          { label: "Donorregister", waarde: "Ja, ingeschreven bij het Donorregister" },
        ],
      },
    ],
  },

  boedel: {
    domein: "boedel",
    titel: "Boedel — Voorbeeld",
    beschrijving:
      "Een voorbeeld van een ingevulde boedel met bezittingen, rekeningen, verzekeringen en schulden.",
    secties: [
      {
        titel: "Fysieke bezittingen",
        velden: [
          {
            label: "Woning Voorbeeldstraat 42",
            waarde: "€ 425.000 — Kad. ASD01-A-1234",
          },
          { label: "Volkswagen ID.4 (2023)", waarde: "€ 35.000 — AB-123-CD" },
          { label: "Antiek dressoir (erfstuk)", waarde: "€ 2.500" },
          { label: "Zonnepanelen (12 stuks)", waarde: "€ 4.000" },
        ],
      },
      {
        titel: "Bankrekeningen",
        velden: [
          { label: "ING Betaalrekening", waarde: "NL91INGB0001234567 — € 8.450" },
          { label: "Rabobank Spaarrekening", waarde: "NL20RABO9876543210 — € 52.300" },
          { label: "ABN AMRO Beleggingsrekening", waarde: "NL44ABNA5678901234 — € 87.000" },
        ],
      },
      {
        titel: "Verzekeringen",
        velden: [
          {
            label: "Overlijdensrisicoverzekering",
            waarde: "Nationale-Nederlanden — € 200.000 — Polis VZ-2019-4567",
          },
          {
            label: "Uitvaartverzekering",
            waarde: "DELA — € 12.500 — Polis UIT-2015-8901",
          },
          {
            label: "Inboedelverzekering",
            waarde: "Centraal Beheer — € 75.000",
          },
        ],
      },
      {
        titel: "Schulden",
        velden: [
          {
            label: "Hypotheek woning",
            waarde: "Rabobank — € 195.000 (restschuld)",
          },
          {
            label: "Persoonlijke lening",
            waarde: "ING — € 5.000",
          },
        ],
      },
    ],
  },

  uitvaart: {
    domein: "uitvaart",
    titel: "Uitvaartwensen — Voorbeeld",
    beschrijving: "Een voorbeeld van vastgelegde uitvaartwensen.",
    secties: [
      {
        titel: "Vorm & locatie",
        velden: [
          { label: "Voorkeur", waarde: "Crematie" },
          {
            label: "Locatie",
            waarde: "Crematorium Westgaarde, Amsterdam",
          },
          { label: "Uitvaartondernemer", waarde: "Monuta" },
          {
            label: "Verzekeraar",
            waarde: "DELA — Polisnummer UIT-2015-8901",
          },
        ],
      },
      {
        titel: "Ceremonie",
        velden: [
          { label: "Type", waarde: "Persoonlijke niet-religieuze bijeenkomst" },
          {
            label: "Muziek",
            waarde: "Time to Say Goodbye (Andrea Bocelli), Imagine (John Lennon)",
          },
          {
            label: "Spreker(s)",
            waarde: "Maria (echtgenote), Thomas (zoon), collega Jan",
          },
          { label: "Bloemen", waarde: "Witte rozen, geen kransen" },
          { label: "Dresscode", waarde: "Geen zwart, kleurrijke kleding gewenst" },
        ],
      },
      {
        titel: "Na de uitvaart",
        velden: [
          {
            label: "Asbestemming",
            waarde: "Verstrooien op de Noordzee bij Scheveningen",
          },
          { label: "Rouwkaart", waarde: "Eenvoudig, met foto uit 2023" },
          {
            label: "Condoleance",
            waarde: "Thuis, op de dag van de uitvaart",
          },
        ],
      },
    ],
  },

  erfgenamen: {
    domein: "erfgenamen",
    titel: "Erfgenamen — Voorbeeld",
    beschrijving: "Een voorbeeld van vastgelegde erfgenamen.",
    secties: [
      {
        titel: "Erfgenaam 1",
        velden: [
          { label: "Naam", waarde: "Maria de Voorbeeld-Jansen" },
          { label: "Relatie", waarde: "Echtgenote" },
          { label: "Geboortedatum", waarde: "28-07-1967" },
          { label: "BSN", waarde: "987654321" },
          { label: "Telefoon", waarde: "06-98765432" },
          { label: "E-mail", waarde: "maria@voorbeeld.nl" },
          { label: "Legitimatie", waarde: "Identiteitskaart — ID9876543" },
        ],
      },
      {
        titel: "Erfgenaam 2",
        velden: [
          { label: "Naam", waarde: "Thomas de Voorbeeld" },
          { label: "Relatie", waarde: "Kind" },
          { label: "Geboortedatum", waarde: "14-11-1995" },
          { label: "Telefoon", waarde: "06-11223344" },
          { label: "E-mail", waarde: "thomas@voorbeeld.nl" },
        ],
      },
      {
        titel: "Erfgenaam 3",
        velden: [
          { label: "Naam", waarde: "Sophie de Voorbeeld" },
          { label: "Relatie", waarde: "Kind" },
          { label: "Geboortedatum", waarde: "03-05-1998" },
          { label: "Telefoon", waarde: "06-55667788" },
          { label: "E-mail", waarde: "sophie@voorbeeld.nl" },
        ],
      },
    ],
  },

  "digitaal-bezit": {
    domein: "digitaal-bezit",
    titel: "Digitaal Bezit — Voorbeeld",
    beschrijving:
      "Een voorbeeld van vastgelegde online accounts en digitale bezittingen.",
    secties: [
      {
        titel: "E-mail & Cloud",
        velden: [
          {
            label: "Google (pieter@gmail.com)",
            waarde: "Verwijderen na overlijden — Inactief Account Beheerder ingesteld",
          },
          {
            label: "iCloud (pieter@icloud.com)",
            waarde: "Overdragen aan echtgenote — Digital Legacy contact ingesteld",
          },
        ],
      },
      {
        titel: "Social media",
        velden: [
          {
            label: "Facebook",
            waarde: "In memorial-modus plaatsen",
          },
          { label: "LinkedIn", waarde: "Profiel verwijderen" },
          { label: "Instagram (@pietervoorbeeld)", waarde: "Verwijderen" },
        ],
      },
      {
        titel: "Financieel & Crypto",
        velden: [
          {
            label: "PayPal",
            waarde: "Saldo overmaken en sluiten",
          },
          {
            label: "Bitcoin wallet (Ledger Nano)",
            waarde: "Seed phrase in kluis — overdragen aan Thomas",
          },
        ],
      },
    ],
  },

  noodcontacten: {
    domein: "noodcontacten",
    titel: "Noodcontacten — Voorbeeld",
    beschrijving: "Een voorbeeld van vastgelegde noodcontacten.",
    secties: [
      {
        titel: "Contactpersonen",
        velden: [
          {
            label: "Maria de Voorbeeld-Jansen",
            waarde: "Echtgenote — 06-98765432 — maria@voorbeeld.nl",
          },
          {
            label: "Mr. J.H. Bakker",
            waarde: "Notaris — 020-1234567 — info@bakkernotarissen.nl",
          },
          {
            label: "Dr. A.B. Smit",
            waarde: "Huisarts — 020-7654321",
          },
          {
            label: "Jan de Vries",
            waarde: "Financieel adviseur — 030-9876543",
          },
          {
            label: "Karel Jansen",
            waarde: "Buurman (sleutelhouder) — 06-44556677",
          },
        ],
      },
    ],
  },
};
