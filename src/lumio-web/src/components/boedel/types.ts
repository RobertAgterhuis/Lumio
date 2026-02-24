// Boedel domain types

export interface Samenvatting {
  totaalBezittingen: number;
  totaalSaldi: number;
  totaalVerzekeringen: number;
  totaalSchulden: number;
  brutoNalatenschap: number;
  nettoNalatenschap: number;
  aantalBezittingen: number;
  aantalRekeningen: number;
  aantalVerzekeringen: number;
  aantalSchulden: number;
}

export interface FysiekBezit {
  id: string;
  categorie: string;
  omschrijving: string;
  geschatteWaarde?: number;
  locatie?: string;
  bestemdeErfgenaam?: string;
  notities?: string;
  vermogensSoort: number;
  kadastraalNummer?: string;
  kenteken?: string;
  kvKNummer?: string;
}

export interface Bankrekening {
  id: string;
  bankNaam: string;
  iban: string;
  rekeningType: string;
  notities?: string;
  saldo?: number;
  vermogensSoort: number;
}

export interface Verzekering {
  id: string;
  verzekeraar: string;
  verzekeraarTelefoon?: string;
  verzekeraarEmail?: string;
  polisNummer: string;
  type: string;
  verzekerdBedrag?: number;
  begunstigde?: string;
  notities?: string;
  vermogensSoort: number;
}

export interface Schuld {
  id: string;
  schuldeiser: string;
  schuldeiserTelefoon?: string;
  schuldeiserEmail?: string;
  type: string;
  bedrag: number;
  maandelijkseAflossing?: number;
  referentie?: string;
  notities?: string;
  vermogensSoort: number;
  hypotheekVorm?: string;
  rentepercentage?: number;
  maandelijkseRente?: number;
  einddatum?: string;
  restschuld?: number;
}

export type DialogKind = "bezit" | "rekening" | "verzekering" | "schuld" | null;

// Form data types
export interface BezitFormData {
  categorie: string;
  omschrijving: string;
  geschatteWaarde: string;
  locatie: string;
  bestemdeErfgenaam: string;
  notities: string;
  vermogensSoort: string;
  kadastraalNummer: string;
  kenteken: string;
  kvKNummer: string;
}

export interface RekeningFormData {
  bankNaam: string;
  rekeningType: string;
  iban: string;
  notities: string;
  saldo: string;
  vermogensSoort: string;
}

export interface VerzekeringFormData {
  verzekeraar: string;
  verzekeraarTelefoon: string;
  verzekeraarEmail: string;
  type: string;
  polisNummer: string;
  verzekerdBedrag: string;
  begunstigde: string;
  notities: string;
  vermogensSoort: string;
}

export interface SchuldFormData {
  schuldeiser: string;
  schuldeiserTelefoon: string;
  schuldeiserEmail: string;
  type: string;
  bedrag: string;
  maandelijkseAflossing: string;
  referentie: string;
  notities: string;
  vermogensSoort: string;
  hypotheekVorm: string;
  rentepercentage: string;
  maandelijkseRente: string;
  einddatum: string;
  restschuld: string;
}
