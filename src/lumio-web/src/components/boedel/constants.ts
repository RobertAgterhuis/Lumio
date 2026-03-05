import type { BezitFormData, RekeningFormData, VerzekeringFormData, SchuldFormData } from "./types";

export const emptyBezitForm: BezitFormData = {
  categorie: "",
  omschrijving: "",
  geschatteWaarde: "",
  locatie: "",
  bestemdeErfgenaamId: "",
  notities: "",
  vermogensSoort: "0",
  kadastraalNummer: "",
  kenteken: "",
  kvKNummer: "",
  bouwJaar: "",
  restWaarde: "",
  catalogusWaarde: "",  // OVI value from RDW
  merk: "",
  model: "",
  voertuigklasse: "",
  brandstof: "",
  vermogen: "",  // kW
  aantalCilinders: "",
  cilinderInhoud: "",  // cc
  kleur: "",
  massaRijklaar: "",  // kg
  aantalZitplaatsen: "",
  transmissie: "",
  kentekenBewijsDocumentGroepId: "",
  linkedSchulden: [],
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
  begunstigdeErfgenaamId: "",
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
