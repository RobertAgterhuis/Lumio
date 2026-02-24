export interface Erfgenaam {
  id: string;
  voornaam: string;
  tussenvoegsel: string;
  achternaam: string;
  relatie: string;
  email: string;
  telefoon: string;
  geboortedatum: string;
  bsn: string;
  adres: string;
  postcode: string;
  woonplaats: string;
  legitimatieSoort: string;
  legitimatieNummer: string;
  legitimatieDatumAfgifte: string;
  legitimatieGeldigTot: string;
  heeftShareOntvangen: boolean;
}

export interface ErfgenaamFormData {
  voornaam: string;
  tussenvoegsel: string;
  achternaam: string;
  relatie: string;
  email: string;
  telefoon: string;
  geboortedatum: string;
  bsn: string;
  adres: string;
  postcode: string;
  woonplaats: string;
  legitimatieSoort: string;
  legitimatieNummer: string;
  legitimatieDatumAfgifte: string;
  legitimatieGeldigTot: string;
  /** When true, also create a noodcontact entry on save */
  alsNoodcontact: boolean;
}

export interface ShareInfo {
  index: number;
  waarde: string;
}

export interface GenereerResponse {
  delen: ShareInfo[];
  drempel: number;
  totaalAantalDelen: number;
}

export interface Toewijzing {
  id: string;
  erfgenaamId: string;
  entityType: string;
  entityId: string;
  entityNaam: string;
  instructies: string;
}

export interface ToewijzingFormData {
  erfgenaamId: string;
  entityType: string;
  entityId: string;
  instructies: string;
}

export interface AssetItem {
  id: string;
  type: string;
  naam: string;
}
