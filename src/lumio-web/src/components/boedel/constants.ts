import type { BezitFormData, RekeningFormData, VerzekeringFormData, SchuldFormData } from "./types";

export const emptyBezitForm: BezitFormData = {
  categorie: "",
  omschrijving: "",
  geschatteWaarde: "",
  locatie: "",
  bestemdeErfgenaam: "",
  notities: "",
  vermogensSoort: "0",
  kadastraalNummer: "",
  kenteken: "",
  kvKNummer: "",
};

export const emptyRekeningForm: RekeningFormData = {
  bankNaam: "",
  rekeningType: "",
  iban: "",
  notities: "",
  saldo: "",
  vermogensSoort: "0",
};

export const emptyVerzekeringForm: VerzekeringFormData = {
  verzekeraar: "",
  verzekeraarTelefoon: "",
  verzekeraarEmail: "",
  type: "",
  polisNummer: "",
  verzekerdBedrag: "",
  begunstigde: "",
  notities: "",
  vermogensSoort: "0",
};

export const emptySchuldForm: SchuldFormData = {
  schuldeiser: "",
  schuldeiserTelefoon: "",
  schuldeiserEmail: "",
  type: "",
  bedrag: "",
  maandelijkseAflossing: "",
  referentie: "",
  notities: "",
  vermogensSoort: "0",
  hypotheekVorm: "",
  rentepercentage: "",
  maandelijkseRente: "",
  einddatum: "",
  restschuld: "",
};
