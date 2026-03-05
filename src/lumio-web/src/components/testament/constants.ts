import type { ExecuteurFormData, BegunstigdeFormData, TestamentEditFormData } from "./types";

export const emptyExecuteurForm: ExecuteurFormData = {
  naam: "",
  relatie: "",
  telefoon: "",
  email: "",
  adres: "",
  postcode: "",
  woonplaats: "",
};

export const emptyBegunstigdeForm: BegunstigdeFormData = {
  naam: "",
  relatie: "",
  telefoon: "",
  email: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  percentage: "",
  isLegitiemePortie: false,
};

export const emptyTestamentEditForm: TestamentEditFormData = {
  testamentType: "",
  notarisContactId: null,
  datumTestament: "",
  testamentLocatie: "",
  ctr_Nummer: "",
  algemeneWensen: "",
  bijzondereBepalingen: "",
  uitsluitingsClausule: true,
  legaten: "",
};
