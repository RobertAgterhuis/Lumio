// Demo data — "Familie de Voorbeeld"
// Volledig hardcoded, geen API of database nodig.
// Twee perspectieven: eigenaar (invullen/raadplegen) en erfgenaam (stappenplan).

export interface DemoVeld {
  label: string;
  waarde: string;
  gevoelig?: boolean; // verberg gedeeltelijk in erfgenamen-weergave
}

export interface DemoSectie {
  titel: string;
  velden: DemoVeld[];
}

export interface DomeinData {
  id: string;
  label: string;
  icon: string; // lucide icon name
  beschrijving: string;
  volledig: boolean;
  secties: DemoSectie[];
}

export const EIGENAAR_NAAM = "Jan de Voorbeeld";
export const EIGENAAR_GEBOORTEJAAR = 1958;

export const DOMEINEN: DomeinData[] = [
  {
    id: "eigenaar",
    label: "Mijn profiel",
    icon: "User",
    beschrijving: "Persoonlijke gegevens, adres en legitimatie.",
    volledig: true,
    secties: [
      {
        titel: "Persoonsgegevens",
        velden: [
          { label: "Voornaam", waarde: "Jan" },
          { label: "Tussenvoegsel", waarde: "de" },
          { label: "Achternaam", waarde: "Voorbeeld" },
          { label: "Geboortedatum", waarde: "14 maart 1958" },
          { label: "BSN", waarde: "123 456 789", gevoelig: true },
          { label: "Telefoon", waarde: "+31 6 12 34 56 78" },
          { label: "E-mail", waarde: "jan@devoorbeeld.nl" },
        ],
      },
      {
        titel: "Adresgegevens",
        velden: [
          { label: "Adres", waarde: "Kastanjelaan 12" },
          { label: "Postcode", waarde: "3456 AB" },
          { label: "Woonplaats", waarde: "Utrecht" },
        ],
      },
      {
        titel: "Burgerlijke staat",
        velden: [
          { label: "Burgerlijke staat", waarde: "Gehuwd" },
          { label: "Huwelijksvoorwaarden", waarde: "Gemeenschap van goederen" },
          { label: "Datum huwelijk", waarde: "22 juni 1985" },
        ],
      },
      {
        titel: "Legitimatie",
        velden: [
          { label: "Soort", waarde: "Paspoort" },
          { label: "Documentnummer", waarde: "NL9A1B2C3D", gevoelig: true },
          { label: "Datum afgifte", waarde: "3 september 2019" },
          { label: "Geldig tot", waarde: "3 september 2029" },
        ],
      },
    ],
  },
  {
    id: "noodcontacten",
    label: "Noodcontacten",
    icon: "Phone",
    beschrijving: "Wie moeten als eerste worden gebeld?",
    volledig: true,
    secties: [
      {
        titel: "Contactpersonen",
        velden: [
          { label: "Maria de Voorbeeld (echtgenote)", waarde: "+31 6 98 76 54 32" },
          { label: "Notaris Van der Berg", waarde: "+31 30 234 56 78" },
          { label: "Huisarts De Wit", waarde: "+31 30 567 89 01" },
          { label: "Financieel adviseur Jansen", waarde: "+31 6 45 67 89 01" },
          { label: "Buurman Pietersen", waarde: "+31 6 23 45 67 89" },
        ],
      },
    ],
  },
  {
    id: "testament",
    label: "Testament",
    icon: "ScrollText",
    beschrijving: "Gegevens van uw testament, notaris en erfgenamen.",
    volledig: true,
    secties: [
      {
        titel: "Testamentgegevens",
        velden: [
          { label: "Type testament", waarde: "Beneficiaire aanvaarding met uitsluitingsclausule" },
          { label: "Datum testament", waarde: "15 januari 2020" },
          { label: "CTR-nummer", waarde: "CTR-2020-00847", gevoelig: true },
          { label: "Locatie origineel", waarde: "Bij notaris (kluis kantoor Utrecht)" },
        ],
      },
      {
        titel: "Notaris",
        velden: [
          { label: "Naam", waarde: "Mr. P. van der Berg" },
          { label: "Kantoor", waarde: "Van der Berg Notariaat B.V." },
          { label: "Telefoon", waarde: "+31 30 234 56 78" },
          { label: "E-mail", waarde: "info@vandenbergnotariaat.nl" },
          { label: "Adres", waarde: "Maliebaan 45, 3581 CD Utrecht" },
        ],
      },
      {
        titel: "Executeur",
        velden: [
          { label: "Naam", waarde: "Maria de Voorbeeld" },
          { label: "Relatie", waarde: "Echtgenote" },
          { label: "Bevoegdheden", waarde: "Volledige executeur, mag beheer voeren" },
          { label: "Telefoon", waarde: "+31 6 98 76 54 32" },
        ],
      },
      {
        titel: "Begunstigden",
        velden: [
          { label: "Maria de Voorbeeld", waarde: "Erfgename — 1/2 deel" },
          { label: "Thomas de Voorbeeld", waarde: "Erfgenaam — 1/4 deel (kind)" },
          { label: "Sophie de Voorbeeld", waarde: "Erfgename — 1/4 deel (kind)" },
        ],
      },
    ],
  },
  {
    id: "wilsverklaring",
    label: "Wilsverklaring",
    icon: "Stethoscope",
    beschrijving: "Wensen rond medische behandeling en levenseinde.",
    volledig: true,
    secties: [
      {
        titel: "Wilsverklaring",
        velden: [
          { label: "Type", waarde: "Behandelverbod met levenswensverklaring" },
          { label: "Datum opgesteld", waarde: "8 april 2021" },
          { label: "Locatie document", waarde: "Lumio — sectie Documenten" },
          { label: "Huisarts", waarde: "Dr. C. de Wit" },
          { label: "Telefoon huisarts", waarde: "+31 30 567 89 01" },
        ],
      },
      {
        titel: "Wensen en voorwaarden",
        velden: [
          { label: "Wanneer van toepassing", waarde: "Bij ernstig hersenletsel of terminale ziekte zonder herstelkans" },
          { label: "Behandelverbod", waarde: "Geen reanimatie, geen beademing bij uitzichtloze situatie" },
          { label: "Aanvullende wensen", waarde: "Palliatieve sedatie toegestaan; comfort boven levensverlenging" },
        ],
      },
    ],
  },
  {
    id: "donor",
    label: "Donorregistratie",
    icon: "Heart",
    beschrijving: "Uw registratie in het donorregister.",
    volledig: true,
    secties: [
      {
        titel: "Registratie",
        velden: [
          { label: "Keuze", waarde: "Ja — ik stem toe met orgaandonatie" },
          { label: "Specificatie", waarde: "Alle organen en weefsels, behalve ogen" },
          { label: "Geregistreerd op", waarde: "12 februari 2018" },
          { label: "Donorregister", waarde: "Donorregister.nl — geverifieerd" },
        ],
      },
    ],
  },
  {
    id: "boedel",
    label: "Boedel",
    icon: "Wallet",
    beschrijving: "Bezittingen, bankrekeningen, verzekeringen en schulden.",
    volledig: true,
    secties: [
      {
        titel: "Fysieke bezittingen",
        velden: [
          { label: "Woning", waarde: "Kastanjelaan 12, Utrecht — eigendomswoning, WOZ €485.000" },
          { label: "Auto", waarde: "Toyota Prius (2021) — kenteken AB-123-C" },
          { label: "Antiek dressoir", waarde: "Familiestuk, geschatte waarde €3.500" },
          { label: "Zonnepanelen", waarde: "20 panelen op dak, installatie 2022" },
        ],
      },
      {
        titel: "Bankrekeningen",
        velden: [
          { label: "ING Betaalrekening", waarde: "NL91 INGB 0001 2345 67", gevoelig: true },
          { label: "Rabobank Spaarrekening", waarde: "NL02 RABO 0123 4567 89", gevoelig: true },
          { label: "ABN AMRO Beleggingsrekening", waarde: "NL44 ABNA 0123 4567 89", gevoelig: true },
        ],
      },
      {
        titel: "Verzekeringen",
        velden: [
          { label: "Overlijdensrisicoverzekering", waarde: "Aegon — polisnr. OV-2019-4521 — €100.000 dekking" },
          { label: "Uitvaartverzekering", waarde: "DELA — natura, polisnr. UIT-8876" },
          { label: "Inboedelverzekering", waarde: "Centraal Beheer — polisnr. INB-33210" },
        ],
      },
      {
        titel: "Schulden",
        velden: [
          { label: "Hypotheek woning", waarde: "Rabobank — restschuld €142.000 (aflossingsvrij)" },
          { label: "Persoonlijke lening", waarde: "ING — verbouwingslening €8.500, eindigt 2026" },
        ],
      },
    ],
  },
  {
    id: "digitaal-bezit",
    label: "Digitaal bezit",
    icon: "Globe",
    beschrijving: "Online accounts, sociale media en digitale activa.",
    volledig: true,
    secties: [
      {
        titel: "E-mail & cloud",
        velden: [
          { label: "Google account", waarde: "jan.devoorbeeld@gmail.com — herstelcode in Lumio", gevoelig: true },
          { label: "iCloud", waarde: "jan@devoorbeeld.nl — Apple ID, 2FA ingeschakeld", gevoelig: true },
        ],
      },
      {
        titel: "Sociale media",
        velden: [
          { label: "Facebook", waarde: "Profiel: Jan de Voorbeeld — memorialiseren na overlijden" },
          { label: "LinkedIn", waarde: "Profiel verwijderen na overlijden" },
          { label: "Instagram", waarde: "Privéprofiel — verwijderen" },
        ],
      },
      {
        titel: "Financieel & crypto",
        velden: [
          { label: "PayPal", waarde: "jan@devoorbeeld.nl — saldo overmaken naar IBAN" },
          { label: "Bitcoin wallet", waarde: "Hardware wallet in brandkast — instructies in sectie Documenten", gevoelig: true },
        ],
      },
    ],
  },
  {
    id: "uitvaart",
    label: "Uitvaartwensen",
    icon: "Church",
    beschrijving: "Uw persoonlijke wensen voor de uitvaart.",
    volledig: true,
    secties: [
      {
        titel: "Vorm en locatie",
        velden: [
          { label: "Voorkeur", waarde: "Crematie" },
          { label: "Locatie", waarde: "Crematorium De Nieuwe Ooster, Amsterdam" },
          { label: "Uitvaartondernemer", waarde: "DELA — reeds geregeld via uitvaartverzekering" },
          { label: "Verzekeraar", waarde: "DELA — natura, all-in" },
        ],
      },
      {
        titel: "Ceremonie",
        velden: [
          { label: "Type ceremonie", waarde: "Besloten plechtigheid — max. 40 personen" },
          { label: "Muziek", waarde: "Bach Cello Suite nr. 1 bij binnenkomst; Sinatra 'My Way' bij afscheid" },
          { label: "Sprekers", waarde: "Maria, Thomas en een goede vriend (Kees Bakker)" },
          { label: "Bloemen", waarde: "Witte rozen en lavendel — geen kransen" },
          { label: "Dresscode", waarde: "Casual, liever geen zwart" },
        ],
      },
      {
        titel: "Na de uitvaart",
        velden: [
          { label: "Asbestemming", waarde: "Urn thuis, later uitstrooien op de Waddenzee" },
          { label: "Rouwkaart", waarde: "Eenvoudige kaart met foto — ontwerp in Lumio Documenten" },
          { label: "Condoleanceregister", waarde: "Online condoleanceregister via DELA" },
        ],
      },
    ],
  },
  {
    id: "erfgenamen",
    label: "Erfgenamen",
    icon: "Users",
    beschrijving: "Contactgegevens en legitimatie van de erfgenamen.",
    volledig: true,
    secties: [
      {
        titel: "Maria de Voorbeeld — echtgenote",
        velden: [
          { label: "Naam", waarde: "Maria de Voorbeeld-Smits" },
          { label: "Relatie", waarde: "Echtgenote / executeur" },
          { label: "Geboortedatum", waarde: "3 oktober 1960" },
          { label: "BSN", waarde: "987 654 321", gevoelig: true },
          { label: "Telefoon", waarde: "+31 6 98 76 54 32" },
          { label: "E-mail", waarde: "maria@devoorbeeld.nl" },
          { label: "Legitimatie", waarde: "Rijbewijs — NL8B9C0D1E, geldig t/m 2028" },
        ],
      },
      {
        titel: "Thomas de Voorbeeld — kind",
        velden: [
          { label: "Naam", waarde: "Thomas de Voorbeeld" },
          { label: "Relatie", waarde: "Zoon" },
          { label: "Geboortedatum", waarde: "17 mei 1988" },
          { label: "Telefoon", waarde: "+31 6 55 44 33 22" },
          { label: "E-mail", waarde: "thomas@devoorbeeld.nl" },
        ],
      },
      {
        titel: "Sophie de Voorbeeld — kind",
        velden: [
          { label: "Naam", waarde: "Sophie de Voorbeeld" },
          { label: "Relatie", waarde: "Dochter" },
          { label: "Geboortedatum", waarde: "29 november 1991" },
          { label: "Telefoon", waarde: "+31 6 77 88 99 00" },
          { label: "E-mail", waarde: "sophie@devoorbeeld.nl" },
        ],
      },
    ],
  },
  {
    id: "documenten",
    label: "Documenten",
    icon: "FileText",
    beschrijving: "Opgeslagen bestanden en scans.",
    volledig: false,
    secties: [
      {
        titel: "Opgeslagen documenten",
        velden: [
          { label: "Testament (PDF)", waarde: "Geüpload op 20 jan 2020 — 248 KB" },
          { label: "Paspoort scan", waarde: "Geüpload op 5 sep 2019 — 1,2 MB" },
          { label: "Wilsverklaring (PDF)", waarde: "Geüpload op 10 apr 2021 — 180 KB" },
          { label: "Polisblad DELA (PDF)", waarde: "Geüpload op 15 mrt 2022 — 320 KB" },
        ],
      },
    ],
  },
];

// Erfgenamen-specifieke data: toont wat een erfgenaam (Maria) ziet na overlijden
export const ERFGENAAM_NAAM = "Maria de Voorbeeld";

export const STAPPENPLAN = [
  {
    fase: "urgent",
    faseLabel: "Eerste 48 uur",
    kleur: "red",
    stappen: [
      { label: "Huisarts bellen voor verklaring van overlijden", gedaan: false },
      { label: "Uitvaartondernemer DELA contacteren", gedaan: false },
      { label: "Kinderen en naaste familie inlichten", gedaan: false },
      { label: "Notaris Van der Berg informeren", gedaan: false },
    ],
  },
  {
    fase: "week1",
    faseLabel: "Eerste week",
    kleur: "amber",
    stappen: [
      { label: "Overlijdensakte ophalen bij gemeente Utrecht", gedaan: false },
      { label: "Werkgever / pensioenuitvoerder informeren", gedaan: false },
      { label: "Testament laten openen bij notaris", gedaan: false },
      { label: "Bankrekeningen (tijdelijk) bevriezen", gedaan: false },
    ],
  },
  {
    fase: "maand1",
    faseLabel: "Eerste maand",
    kleur: "blue",
    stappen: [
      { label: "Boedelnotaris inschakelen voor verdeling", gedaan: false },
      { label: "Uitkering overlijdensrisicoverzekering aanvragen (Aegon)", gedaan: false },
      { label: "Digitale accounts opruimen / memorialiseren", gedaan: false },
      { label: "Belastingdienst op de hoogte stellen", gedaan: false },
    ],
  },
];

// Geeft aan welk percentage volledig ingevuld is
export const COMPLEETHEID = {
  percentage: 88,
  aantalIngevuld: 9,
  totaal: 10,
};
