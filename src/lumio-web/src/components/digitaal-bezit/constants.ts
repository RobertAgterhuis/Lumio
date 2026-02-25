/**
 * Constants for digitaal-bezit (digital assets) domain
 */

import type { AccountFormData, WachtwoordFormData, CryptoFormData } from "./types";

export const ACCOUNT_CATEGORIEEN = [
  "E-mail",
  "Sociale media",
  "Financieel",
  "Winkelen",
  "Streaming",
  "Werk",
  "Gaming",
  "Cloud opslag",
  "Gezondheid",
  "Overig",
] as const;

export type AccountCategorie = (typeof ACCOUNT_CATEGORIEEN)[number];

export const CATEGORIE_KEYS: Record<string, string> = {
  "E-mail": "email",
  "Sociale media": "socialMedia",
  Financieel: "banking",
  Winkelen: "shopping",
  Streaming: "streaming",
  Werk: "werk",
  Gaming: "gaming",
  "Cloud opslag": "cloud",
  Gezondheid: "gezondheid",
  Overig: "overig",
};

export const GEWENSTE_ACTIE_KEYS: Record<string, string> = {
  Verwijderen: "verwijderen",
  Herdenkingsstatus: "herdenkingsstatus",
  Overdragen: "overdragen",
  "Geen actie": "geenActie",
};

export const CRYPTO_TYPES = [
  "Bitcoin",
  "Ethereum",
  "Solana",
  "Cardano",
  "Overig",
] as const;

export type CryptoType = (typeof CRYPTO_TYPES)[number];

export const GEWENSTE_ACTIES = [
  "Verwijderen",
  "Herdenkingsstatus",
  "Overdragen",
  "Geen actie",
] as const;

export type GewensteActie = (typeof GEWENSTE_ACTIES)[number];

export const emptyAccountForm: AccountFormData = {
  platformNaam: "",
  categorie: "",
  gebruikersnaam: "",
  emailAdres: "",
  url: "",
  gewensteActie: "",
  overdrachtAan: "",
  notities: "",
  wachtwoord: "",
  wachtwoordOpmerking: "",
};

export const emptyWachtwoordForm: WachtwoordFormData = {
  naam: "",
  gebruikersnaam: "",
  wachtwoord: "",
  url: "",
  notities: "",
};

export const emptyCryptoForm: CryptoFormData = {
  walletNaam: "",
  cryptoType: "",
  walletAdres: "",
  exchange: "",
  seedPhrase: "",
  notities: "",
};
