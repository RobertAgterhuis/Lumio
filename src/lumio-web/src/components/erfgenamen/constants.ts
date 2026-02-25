import type { ErfgenaamFormData, ToewijzingFormData } from "./types";

export const ENTITY_TYPE_KEYS = [
  "bankrekening",
  "cryptowallet",
  "digitaalaccount",
  "voertuig",
  "onroerendgoed",
  "losroerend",
  "document",
] as const;

export const RELATIE_TYPES = [
  "Partner",
  "Kind",
  "Ouder",
  "Broer/Zus",
  "Kleinkind",
  "Neef/Nicht",
  "Vriend",
  "Organisatie",
  "Anders",
] as const;

export const LEGITIMATIE_SOORTEN = [
  { value: "0", key: "geen" },
  { value: "1", key: "paspoort" },
  { value: "2", key: "identiteitskaart" },
  { value: "3", key: "rijbewijs" },
] as const;

export const emptyErfgenaamForm: ErfgenaamFormData = {
  voornaam: "",
  tussenvoegsel: "",
  achternaam: "",
  relatie: "",
  email: "",
  telefoon: "",
  geboortedatum: "",
  bsn: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  legitimatieSoort: "0",
  legitimatieNummer: "",
  legitimatieDatumAfgifte: "",
  legitimatieGeldigTot: "",
  alsNoodcontact: false,
};

export const emptyToewijzingForm: ToewijzingFormData = {
  erfgenaamId: "",
  entityType: "",
  entityId: "",
  instructies: "",
};
