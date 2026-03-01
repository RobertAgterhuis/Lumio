// Testament domain types

export interface LegitimairePortieWaarschuwing {
  naam: string;
  toegewezenPercentage?: number;
  minimumPercentage: number;
}

export interface LegitimairePortieCheck {
  heeftWaarschuwing: boolean;
  aantalKinderen: number;
  heeftPartner: boolean;
  minimumPercentagePerKind: number;
  waarschuwingen: LegitimairePortieWaarschuwing[];
}

export interface TestamentInfo {
  id: string;
  testamentType?: string;
  notarisNaam?: string;
  notarisKantoor?: string;
  notarisTelefoon?: string;
  notarisEmail?: string;
  notarisAdres?: string;
  notarisPostcode?: string;
  notarisPlaats?: string;
  datumTestament?: string;
  testamentLocatie?: string;
  ctr_Nummer?: string;
  algemeneWensen?: string;
  bijzondereBepalingen?: string;
  uitsluitingsClausule: boolean;
  legaten?: string;
}

export interface Begunstigde {
  id: string;
  naam: string;
  relatie: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  percentage?: number;
  isLegitiemePortie: boolean;
  /** M4: Persistent link to originating person record */
  erfgenaamId?: string;
  noodcontactId?: string;
}

export interface Executeur {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  notarieleAkte?: boolean;
  /** M4: Persistent link to originating person record */
  erfgenaamId?: string;
  noodcontactId?: string;
}

export interface TestamentSnapshot {
  id: string;
  versie: number;
  snapshotDatum: string;
  notitie?: string;
}

export interface TestamentVerschil {
  veld: string;
  waardeVersie1?: string;
  waardeVersie2?: string;
}

export interface TestamentVergelijking {
  versie1: TestamentSnapshot & { snapshotJson: string };
  versie2: TestamentSnapshot & { snapshotJson: string };
  verschillen: TestamentVerschil[];
}

// Form data types
export interface ExecuteurFormData {
  naam: string;
  relatie: string;
  telefoon: string;
  email: string;
  adres: string;
  postcode: string;
  woonplaats: string;
  /** M4: Persistent link to originating person record */
  erfgenaamId?: string;
  noodcontactId?: string;
}

export interface BegunstigdeFormData {
  naam: string;
  relatie: string;
  telefoon: string;
  email: string;
  adres: string;
  postcode: string;
  woonplaats: string;
  percentage: string;
  isLegitiemePortie: boolean;
  /** M4: Persistent link to originating person record */
  erfgenaamId?: string;
  noodcontactId?: string;
}

export interface TestamentEditFormData {
  testamentType: string;
  notarisNaam: string;
  notarisKantoor: string;
  notarisTelefoon: string;
  notarisEmail: string;
  notarisAdres: string;
  notarisPostcode: string;
  notarisPlaats: string;
  datumTestament: string;
  testamentLocatie: string;
  ctr_Nummer: string;
  algemeneWensen: string;
  bijzondereBepalingen: string;
  uitsluitingsClausule: boolean;
  legaten: string;
}
