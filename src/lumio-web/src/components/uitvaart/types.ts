export interface UitvaartWensen {
  id: string;
  voorkeurType: string;
  begraafplaats?: string;
  uitvaartOndernemer?: string;
  uitvaartOndernemerTelefoon?: string;
  uitvaartOndernemerEmail?: string;
  uitvaartOndernemerAdres?: string;
  uitvaartOndernemerPostcode?: string;
  uitvaartOndernemerPlaats?: string;
  heeftUitvaartVerzekering: boolean;
  uitvaartVerzekeringDetails?: string;
  ceremonieSoort?: string;
  ceremonieLocatie?: string;
  muziekwensen?: string;
  sprekers?: string;
  bloemen?: string;
  kledingwensen?: string;
  rouwkaartTekst?: string;
  rouwadvertentieTekst?: string;
  condoleance?: string;
  overigeWensen?: string;
  voorkeurBegraafplaatsNaam?: string;
  voorkeurBegraafplaatsAdres?: string;
  voorkeurCrematoriumnaam?: string;
  voorkeurCrematoriumAdres?: string;
  voorkeurAulaNaam?: string;
  voorkeurAulaAdres?: string;
  budgetRichting?: string;
}

export interface CeremonieDetail {
  id: string;
  onderdeel: string;
  beschrijving?: string;
  volgorde: number;
  muziek?: string;
  spreker?: string;
  tekstlezing?: string;
  dresscode?: string;
}

export interface UitvaartGenodigde {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  notities?: string;
}

export interface CeremonieDetailFormData {
  onderdeel: string;
  beschrijving: string;
  volgorde: number;
  muziek: string;
  spreker: string;
  tekstlezing: string;
  dresscode: string;
}

export interface GenodigdeFormData {
  naam: string;
  relatie: string;
  telefoon: string;
  email: string;
  adres: string;
  postcode: string;
  woonplaats: string;
  notities: string;
}

export interface UitvaartEditFormData {
  voorkeurType: string;
  begraafplaats: string;
  uitvaartOndernemer: string;
  uitvaartOndernemerTelefoon: string;
  uitvaartOndernemerEmail: string;
  uitvaartOndernemerAdres: string;
  uitvaartOndernemerPostcode: string;
  uitvaartOndernemerPlaats: string;
  heeftUitvaartVerzekering: boolean;
  uitvaartVerzekeringDetails: string;
  ceremonieSoort: string;
  ceremonieLocatie: string;
  muziekwensen: string;
  sprekers: string;
  bloemen: string;
  kledingwensen: string;
  rouwkaartTekst: string;
  rouwadvertentieTekst: string;
  condoleance: string;
  overigeWensen: string;
  voorkeurBegraafplaatsNaam: string;
  voorkeurBegraafplaatsAdres: string;
  voorkeurCrematoriumnaam: string;
  voorkeurCrematoriumAdres: string;
  voorkeurAulaNaam: string;
  voorkeurAulaAdres: string;
  budgetRichting: string;
}

export interface LocatieEditFormData {
  voorkeurBegraafplaatsNaam: string;
  voorkeurBegraafplaatsAdres: string;
  voorkeurCrematoriumnaam: string;
  voorkeurCrematoriumAdres: string;
  voorkeurAulaNaam: string;
  voorkeurAulaAdres: string;
}
