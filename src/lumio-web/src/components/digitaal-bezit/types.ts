/**
 * Type definitions for digitaal-bezit (digital assets) domain
 */

export interface DigitaalAccount {
  id: string;
  platformNaam: string;
  categorie?: string;
  gebruikersnaam?: string;
  emailAdres?: string;
  url?: string;
  gewensteActie: string;
  overdrachtAan?: string;
}

export interface WachtwoordEntry {
  id: string;
  naam: string;
  gebruikersnaam?: string;
  url?: string;
  notities?: string;
  accountId?: string;
  accountNaam?: string;
}

export interface CryptoWallet {
  id: string;
  walletNaam: string;
  cryptoType: string;
  walletAdres?: string;
  exchange?: string;
  notities?: string;
}

export interface AccountFormData {
  platformNaam: string;
  categorie: string;
  gebruikersnaam: string;
  emailAdres: string;
  url: string;
  gewensteActie: string;
  overdrachtAan: string;
  notities: string;
  wachtwoord: string;
  wachtwoordOpmerking: string;
}

export interface WachtwoordFormData {
  naam: string;
  gebruikersnaam: string;
  wachtwoord: string;
  url: string;
  notities: string;
}

export interface CryptoFormData {
  walletNaam: string;
  cryptoType: string;
  walletAdres: string;
  exchange: string;
  seedPhrase: string;
  notities: string;
}

export interface ImportResult {
  geimporteerd: number;
  fouten: number;
  details: string[];
}
