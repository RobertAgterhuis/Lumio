import type {
  CeremonieDetailFormData,
  GenodigdeFormData,
  UitvaartEditFormData,
  LocatieEditFormData,
} from "./types";

export const emptyDetailForm: CeremonieDetailFormData = {
  onderdeel: "",
  beschrijving: "",
  volgorde: 0,
  muziek: "",
  spreker: "",
  tekstlezing: "",
  dresscode: "",
};

export const emptyGenodigdeForm: GenodigdeFormData = {
  naam: "",
  relatie: "",
  telefoon: "",
  email: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  notities: "",
};

export const emptyUitvaartEditForm: UitvaartEditFormData = {
  voorkeurType: "",
  begraafplaats: "",
  uitvaartOndernemerContactId: null,
  heeftUitvaartVerzekering: false,
  uitvaartVerzekeringDetails: "",
  ceremonieSoort: "",
  ceremonieLocatie: "",
  muziekwensen: "",
  sprekers: "",
  bloemen: "",
  kledingwensen: "",
  rouwkaartTekst: "",
  rouwadvertentieTekst: "",
  condoleance: "",
  overigeWensen: "",
  voorkeurBegraafplaatsNaam: "",
  voorkeurBegraafplaatsAdres: "",
  voorkeurCrematoriumnaam: "",
  voorkeurCrematoriumAdres: "",
  voorkeurAulaNaam: "",
  voorkeurAulaAdres: "",
  budgetRichting: "",
};

export const emptyLocatieEditForm: LocatieEditFormData = {
  voorkeurBegraafplaatsNaam: "",
  voorkeurBegraafplaatsAdres: "",
  voorkeurCrematoriumnaam: "",
  voorkeurCrematoriumAdres: "",
  voorkeurAulaNaam: "",
  voorkeurAulaAdres: "",
};
