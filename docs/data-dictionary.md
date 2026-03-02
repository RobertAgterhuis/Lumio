# Data Dictionary — Lumio

**Status:** v1.0 — DEFINITIEF  
**Sprint:** SP-12-003  
**Datum:** 2026-03-02  
**Eigenaar:** Software Architect / Data Architect  
**AVG-grondslag:** AVG art. 5 lid 1 sub a (rechtmatigheid), art. 9 (bijzondere categorieën), DPIA `devdocs/dpia-bijzondere-categorieen.md` v1.0  
**Retentiebeleid:** `devdocs/data-retention-policy.md` v1.1  
**Gedekte entiteiten:** 30 van 26 geplande (≥24/26 ✅)

---

## Leeswijzer

### AVG-classificaties

| Klasse | Omschrijving |
|--------|--------------|
| **GEEN** | Geen persoonsgegevens; puur functionele of technische metadata |
| **GEWOON** | Reguliere persoonsgegevens (AVG art. 4 lid 1) — namen, contactgegevens, enz. |
| **FINANCIEEL** | Persoonsgegevens met financieel karakter (IBAN, schulden, vermogen) |
| **VERTROUWELIJK** | Sterk vertrouwelijke gegevens (inloggegevens, seeds, documenten) die versleuteld zijn opgeslagen |
| **BIJZONDER** | Bijzondere categorieën persoonsgegevens (AVG art. 9) — gezondheidsgegevens |

### Opslaglocaties

| Locatie | Omschrijving |
|---------|--------------|
| **SQLite (versleuteld)** | In de per-profiel versleutelde SQLite-database (`{profileId}.db`) |
| **profiles.json** | Onversleuteld manifest op schijf — bevat minimale profielmetadata |
| **Schijf (bestandssysteem)** | Videobestanden in `data/videos/` naast de database |
| **Geheugen** | Alleen tijdens sessie; nooit persistent opgeslagen |

---

## Module: Common

### 1. `Eigenaar`

**Beschrijving:** De primaire gebruiker van Lumio. Bevat alle persoonlijke NAW-gegevens, legitimatiegegevens en instellingen van de persoon wiens nalatenschap wordt beheerd.

**AVG-classificatie:** BIJZONDER (BSN), GEWOON (overige velden)  
**AVG-grondslag:** Art. 6 lid 1 sub b (contractuele noodzaak), art. 9 lid 2 sub a (toestemming voor BSN/legitimatie)  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang profiel actief; cascade delete bij profielverwijdering  
**Versleuteld:** Ja — volledige database AES-256

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK (BaseEntity) |
| `AangemaaktOp` | `DateTime` | ✅ | GEEN | Aanmaaktijdstip (BaseEntity) |
| `GewijzigdOp` | `DateTime` | ✅ | GEEN | Laatste wijziging (BaseEntity) |
| `Voornaam` | `string` | ✅ | GEWOON | |
| `Achternaam` | `string` | ✅ | GEWOON | |
| `Tussenvoegsel` | `string?` | ❌ | GEWOON | |
| `Geboortedatum` | `DateOnly` | ✅ | GEWOON | |
| `BSN` | `string?` | ❌ | BIJZONDER | Nooit in logs of exports zonder encryptie (zie retentiebeleid §3.2) |
| `Adres` | `string?` | ❌ | GEWOON | |
| `Postcode` | `string?` | ❌ | GEWOON | |
| `Woonplaats` | `string?` | ❌ | GEWOON | |
| `Telefoon` | `string?` | ❌ | GEWOON | |
| `Email` | `string?` | ❌ | GEWOON | |
| `Notaris` | `string?` | ❌ | GEWOON | Naam notaris |
| `NotarisKantoor` | `string?` | ❌ | GEWOON | |
| `NotarisTelefoon` | `string?` | ❌ | GEWOON | |
| `NotarisEmail` | `string?` | ❌ | GEWOON | |
| `NotarisAdres` | `string?` | ❌ | GEWOON | |
| `NotarisPostcode` | `string?` | ❌ | GEWOON | |
| `NotarisPlaats` | `string?` | ❌ | GEWOON | |
| `BurgerlijkeStaat` | `enum` | ✅ | GEWOON | Ongehuwd / Gehuwd / GeregistreerdPartnerschap / Gescheiden / Weduwe |
| `HuwelijksVoorwaarden` | `enum` | ✅ | GEWOON | GemeenschapVanGoederen / BeperkteGemeenschap / KoudeUitsluiting / NietVanToepassing |
| `DatumHuwelijk` | `DateOnly?` | ❌ | GEWOON | |
| `LegitimatieSoort` | `enum` | ✅ | GEWOON | Geen / Paspoort / Identiteitskaart / Rijbewijs |
| `LegitimatieNummer` | `string?` | ❌ | BIJZONDER | Documentnummer paspoort/ID; extra gevoelig |
| `LegitimatieDatumAfgifte` | `DateOnly?` | ❌ | GEWOON | |
| `LegitimatieGeldigTot` | `DateOnly?` | ❌ | GEWOON | |
| `ProfielFoto` | `byte[]?` | ❌ | GEWOON | Biometrisch gerelateerd; opgeslagen als binair blob |
| `ProfielFotoContentType` | `string?` | ❌ | GEEN | MIME-type |
| `ProfielFotoNaam` | `string?` | ❌ | GEEN | Bestandsnaam |
| `TijdlijnBekeken` | `bool` | ✅ | GEEN | UX-status |
| `OnboardingVoltooid` | `bool` | ✅ | GEEN | UX-status |
| `ShamirDrempel` | `int?` | ❌ | GEEN | Aantal codes vereist voor ontsleuteling |

---

### 2. `Erfgenaam`

**Beschrijving:** Een erfgenaam of vertrouwenspersoon die door de eigenaar is aangewezen. Ontvangt een Shamir-sleuteldeel voor toegang na overlijden.

**AVG-classificatie:** BIJZONDER (BSN), GEWOON (overige velden)  
**AVG-grondslag:** Art. 6 lid 1 sub b (contractuele noodzaak)  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  
**Versleuteld:** Ja

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Voornaam` | `string` | ✅ | GEWOON | |
| `Achternaam` | `string` | ✅ | GEWOON | |
| `Tussenvoegsel` | `string?` | ❌ | GEWOON | |
| `Relatie` | `string` | ✅ | GEWOON | Vrije tekst én `ErfgenaamRelatie` enum |
| `Telefoon` | `string?` | ❌ | GEWOON | |
| `Email` | `string?` | ❌ | GEWOON | |
| `Adres` | `string?` | ❌ | GEWOON | |
| `Postcode` | `string?` | ❌ | GEWOON | |
| `Woonplaats` | `string?` | ❌ | GEWOON | |
| `Geboortedatum` | `DateOnly?` | ❌ | GEWOON | |
| `BSN` | `string?` | ❌ | BIJZONDER | Alleen voor juridische doeleinden; nooit in logs |
| `ShareIndex` | `int?` | ❌ | GEEN | Positie in Shamir-sleutelset |
| `HeeftShareOntvangen` | `bool` | ✅ | GEEN | Status sleuteluitgifte |
| `ShareUitgegevenOp` | `DateTime?` | ❌ | GEEN | Tijdstip uitgifte |
| `LegitimatieSoort` | `enum` | ✅ | GEWOON | |
| `LegitimatieNummer` | `string?` | ❌ | BIJZONDER | |
| `LegitimatieDatumAfgifte` | `DateOnly?` | ❌ | GEWOON | |
| `LegitimatieGeldigTot` | `DateOnly?` | ❌ | GEWOON | |

---

### 3. `Noodcontact`

**Beschrijving:** Een contactpersoon die in geval van nood of overlijden gebeld moet worden. Kan een privépersoon zijn (familielid, vriend) of een professionele rol (huisarts, notaris, uitvaartondernemer).

**AVG-classificatie:** GEWOON  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Naam` | `string` | ✅ | GEWOON | |
| `Relatie` | `string` | ✅ | GEWOON | |
| `Telefoon` | `string?` | ❌ | GEWOON | |
| `Email` | `string?` | ❌ | GEWOON | |
| `Adres` | `string?` | ❌ | GEWOON | |
| `Postcode` | `string?` | ❌ | GEWOON | |
| `Woonplaats` | `string?` | ❌ | GEWOON | |
| `Rol` | `string` | ✅ | GEWOON | Bijv. "Huisarts", "Notaris", "Naaste familie" |
| `Instructies` | `string?` | ❌ | GEWOON | Vrije tekst |
| `BedrijfsNaam` | `string?` | ❌ | GEWOON | |
| `Functie` | `string?` | ❌ | GEWOON | |
| `Prioriteit` | `int` | ✅ | GEEN | Belprioriteitsvolgorde (1=eerst) |
| `IsGedeeld` | `bool` | ✅ | GEEN | Vlag voor gedeelde contacten (meerdere profielen) |

---

### 4. `Profile`

**Beschrijving:** Profielmanifest — puur technische registratie van aanwezige Lumio-profielen op het apparaat. Opgeslagen *buiten* de versleutelde database in `profiles.json`. Maximum 5 profielen per installatie.

**AVG-classificatie:** GEWOON (naam)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** `profiles.json` (onversleuteld, lokaal)  
**Bewaartermijn:** Zolang profiel actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `Naam` | `string` | ✅ | GEWOON | Profielnaam (bijv. "Jan de Vries") |
| `Relatie` | `string` | ✅ | GEWOON | "Primair" / "Partner" / "Kind" / "Ouder" / "Overig" |
| `DbBestand` | `string` | ✅ | GEEN | Bestandsnaam (bijv. `{id}.db`) |
| `AangemaaktOp` | `DateTime` | ✅ | GEEN | |
| `IsPrimair` | `bool` | ✅ | GEEN | |
| `FotoThumbnail` | `string?` | ❌ | GEWOON | Base64 thumbnail max ~10KB; beschikbaar vóór DB-ontsleuteling |

---

### 5. `Werkgever`

**Beschrijving:** Werkgeversinformatie van de eigenaar, inclusief HR-contact, leidinggevende en pensioenfonds. Nodig voor nabestaanden om arbeidsrechtelijke zaken af te handelen.

**AVG-classificatie:** GEWOON (persoonsnamen HR/leidinggevende), FINANCIEEL (pensioenfonds)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `BedrijfsNaam` | `string` | ✅ | GEWOON | |
| `KvKNummer` | `string?` | ❌ | GEEN | Publiek register |
| `Adres` | `string?` | ❌ | GEEN | Bedrijfsadres |
| `Postcode` | `string?` | ❌ | GEEN | |
| `Vestigingsplaats` | `string?` | ❌ | GEEN | |
| `Website` | `string?` | ❌ | GEEN | |
| `TelefoonHoofdkantoor` | `string?` | ❌ | GEEN | |
| `Functietitel` | `string?` | ❌ | GEWOON | Functietitel eigenaar |
| `Afdeling` | `string?` | ❌ | GEWOON | |
| `StartdatumDienstverband` | `DateOnly?` | ❌ | GEWOON | |
| `IsZzp` | `bool` | ✅ | GEWOON | |
| `PensioenfondNaam` | `string?` | ❌ | FINANCIEEL | |
| `PensioenfondTelefoon` | `string?` | ❌ | FINANCIEEL | |
| `PensioenfondEmail` | `string?` | ❌ | FINANCIEEL | |
| `HrContactNaam` | `string?` | ❌ | GEWOON | Naam derde |
| `HrContactTelefoon` | `string?` | ❌ | GEWOON | |
| `HrContactEmail` | `string?` | ❌ | GEWOON | |
| `LeidinggevendeNaam` | `string?` | ❌ | GEWOON | Naam derde |
| `LeidinggevendeTelefoon` | `string?` | ❌ | GEWOON | |
| `LeidinggevendeEmail` | `string?` | ❌ | GEWOON | |
| `Notities` | `string?` | ❌ | GEWOON | Vrije tekst |

---

### 6. `AuditLogEntry`

**Beschrijving:** Onveranderlijk beveiligingslogboek van alle CRUD-, vergrendel- en exportacties binnen de applicatie. Automatisch gewist na 90 dagen.

**AVG-classificatie:** GEWOON (traceerbaar naar gebruikersacties; `EntityId` koppelt indirect aan persoonsdata)  
**AVG-grondslag:** Art. 6 lid 1 sub f (legitiem belang — beveiligingslogging)  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** **90 dagen** (automatisch via `AuditLogRotatieService`)  
**Bijzonder:** BSN mag **nooit** in `Details` worden opgeslagen (RetentiePolicy §3.2)

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK (geen BaseEntity) |
| `Tijdstip` | `DateTime` | ✅ | GEEN | UTC |
| `Actie` | `string` | ✅ | GEEN | "Aangemaakt" / "Gewijzigd" / "Verwijderd" / "Ontgrendeld" / "Export" |
| `EntityType` | `string?` | ❌ | GEEN | Bijv. `"Erfgenaam"` |
| `EntityId` | `Guid?` | ❌ | GEWOON | Indirecte koppeling aan betrokkene |
| `Details` | `string?` | ❌ | GEWOON | Vrije tekst; **GEEN BSN of wachtwoorden** |

---

### 7. `SectieNotitie`

**Beschrijving:** Vrij-tekst notitie per sectiepagina (bijv. testament, uitvaart, digitaal bezit). Eén notitie per sectie per eigenaar.

**AVG-classificatie:** GEWOON (kan persoonsgegevens bevatten als vrije tekst)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Sectie` | `string` | ✅ | GEEN | Bijv. `"testament"`, `"uitvaart"`, `"erfgenamen"` |
| `Inhoud` | `string` | ✅ | GEWOON | Vrije tekst door gebruiker |

---

### 8. `ActualisatieBevestiging`

**Beschrijving:** Registratie van de laatste keer dat de gebruiker heeft bevestigd dat gegevens in een bepaald domein actueel zijn. Functionele metadata voor herinneringen.

**AVG-classificatie:** GEEN (puur functionele metadata)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Domein` | `string` | ✅ | GEEN | Bijv. `"erfgenamen"`, `"boedel"` |
| `BevestigdOp` | `DateTime` | ✅ | GEEN | UTC timestamp |

---

### 9. `AfhandelingsItem`

**Beschrijving:** Status van afhandeling van een domeinitem vanuit het perspectief van de nabestaanden (erfgenamen). Nabestaanden kunnen bijhouden welke zaken afgehandeld zijn.

**AVG-classificatie:** GEEN (functionele statusregistratie)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `Domein` | `string` | ✅ | GEEN | Bijv. `"noodcontacten"`, `"testament"`, `"boedel"` |
| `EntityId` | `Guid?` | ❌ | GEEN | Optionele FK naar specifiek item |
| `Label` | `string?` | ❌ | GEEN | Beschrijvend label |
| `Status` | `enum` | ✅ | GEEN | Open / InBehandeling / Afgehandeld |
| `Notitie` | `string?` | ❌ | GEWOON | Vrije tekst nabestaande (kan persoonsgegevens bevatten) |
| `AfgehandeldOp` | `DateTime?` | ❌ | GEEN | |

---

## Module: AssetRegistry (Boedel)

### 10. `Bankrekening`

**Beschrijving:** Bankrekening van de eigenaar. IBAN en saldo worden bewaard voor nabestaanden.

**AVG-classificatie:** FINANCIEEL  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `BankNaam` | `string` | ✅ | FINANCIEEL | |
| `IBAN` | `string` | ✅ | FINANCIEEL | Gevoelig financieel gegeven |
| `RekeningType` | `string` | ✅ | FINANCIEEL | Bijv. "Betaalrekening", "Spaarrekening" |
| `Saldo` | `decimal?` | ❌ | FINANCIEEL | |
| `VermogensSoort` | `enum` | ✅ | GEEN | Prive / Gezamenlijk |
| `Notities` | `string?` | ❌ | GEWOON | Vrije tekst |

---

### 11. `FysiekBezit`

**Beschrijving:** Fysiek bezit (onroerend goed, voertuig, onderneming, kunst, enz.) met optionele registernummers en gekoppelde schulden.

**AVG-classificatie:** FINANCIEEL, GEWOON (kadastrale nummers, kenteken)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Categorie` | `string` | ✅ | GEEN | Bijv. "Onroerend goed", "Voertuig" |
| `Omschrijving` | `string` | ✅ | GEWOON | |
| `GeschatteWaarde` | `decimal?` | ❌ | FINANCIEEL | |
| `Locatie` | `string?` | ❌ | GEWOON | Adres van het bezit |
| `BestemdeErfgenaamId` | `Guid?` | ❌ | GEEN | FK → `Erfgenaam` |
| `VermogensSoort` | `enum` | ✅ | GEEN | |
| `KadastraalNummer` | `string?` | ❌ | GEWOON | Publiek register-referentie |
| `Kenteken` | `string?` | ❌ | GEWOON | Gekoppeld aan rijbewijs/persoon in RDW |
| `KvKNummer` | `string?` | ❌ | GEEN | Publiek register |
| `Notities` | `string?` | ❌ | GEWOON | |

---

### 12. `Schuld`

**Beschrijving:** Financiële verplichting (hypotheek, lening, leasecontract, creditcard) van de eigenaar. Bevat schuldeisercontactgegevens.

**AVG-classificatie:** FINANCIEEL, GEWOON (schuldeiser-contactgegevens van derden)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Schuldeiser` | `string` | ✅ | GEWOON | Naam bank/leasemaatschappij |
| `SchuldeiserTelefoon` | `string?` | ❌ | GEWOON | |
| `SchuldeiserEmail` | `string?` | ❌ | GEWOON | |
| `Type` | `string` | ✅ | GEEN | "Hypotheek" / "Lening" / "Lease" / enz. |
| `Bedrag` | `decimal` | ✅ | FINANCIEEL | |
| `MaandelijkseAflossing` | `decimal?` | ❌ | FINANCIEEL | |
| `Referentie` | `string?` | ❌ | FINANCIEEL | Contractnummer |
| `VermogensSoort` | `enum` | ✅ | GEEN | |
| `HypotheekVorm` | `string?` | ❌ | FINANCIEEL | |
| `Rentepercentage` | `decimal?` | ❌ | FINANCIEEL | |
| `MaandelijkseRente` | `decimal?` | ❌ | FINANCIEEL | |
| `Einddatum` | `DateTime?` | ❌ | FINANCIEEL | |
| `Restschuld` | `decimal?` | ❌ | FINANCIEEL | |
| `LeaseMaatschappij` | `string?` | ❌ | GEWOON | |
| `BezitId` | `Guid?` | ❌ | GEEN | FK → `FysiekBezit` |
| `Notities` | `string?` | ❌ | GEWOON | |

---

### 13. `Verzekering`

**Beschrijving:** Verzekeringspolissen van de eigenaar (levensverzekering, uitvaartverzekering, enz.) met verzekeraarcontactgegevens en begunstigde.

**AVG-classificatie:** FINANCIEEL, GEWOON (begunstigde-naam als vrije tekst)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Verzekeraar` | `string` | ✅ | GEWOON | |
| `VerzekeraarTelefoon` | `string?` | ❌ | GEWOON | |
| `VerzekeraarEmail` | `string?` | ❌ | GEWOON | |
| `PolisNummer` | `string` | ✅ | FINANCIEEL | |
| `Type` | `string` | ✅ | GEEN | Bijv. "Levensverzekering", "Uitvaartverzekering" |
| `VerzekerdBedrag` | `decimal?` | ❌ | FINANCIEEL | |
| `Begunstigde` | `string?` | ❌ | GEWOON | Vrije-tekst naam begunstigde |
| `BegunstigdeErfgenaamId` | `Guid?` | ❌ | GEEN | FK → `Erfgenaam` (optioneel type-veilige variant) |
| `VermogensSoort` | `enum` | ✅ | GEEN | |
| `Notities` | `string?` | ❌ | GEWOON | |

---

### 14. `ErfgenaamToewijzing`

**Beschrijving:** Koppeling tussen een boedelitem en een erfgenaam. Legt vast welk item aan welke erfgenaam toebedeeld is.

**AVG-classificatie:** GEEN (relatietabel; geen directe persoonsgegevens)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `ErfgenaamId` | `Guid` | ✅ | GEEN | FK → `Erfgenaam` |
| `EntityType` | `string` | ✅ | GEEN | "FysiekBezit" / "Bankrekening" / "Verzekering" / enz. |
| `EntityId` | `Guid` | ✅ | GEEN | FK naar het betreffende boedelitem |
| `Instructies` | `string?` | ❌ | GEWOON | Vrije tekst |

---

## Module: DigitalEstate (Digitaal Bezit)

### 15. `DigitaalAccount`

**Beschrijving:** Online account (social media, e-mail, cloud storage, enz.) van de eigenaar met de gewenste actie na overlijden (verwijderen, overdragen, enz.).

**AVG-classificatie:** VERTROUWELIJK (inloggegevens), GEWOON (e-mailadres)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `PlatformNaam` | `string` | ✅ | GEEN | |
| `Categorie` | `string?` | ❌ | GEEN | |
| `Gebruikersnaam` | `string?` | ❌ | VERTROUWELIJK | |
| `EmailAdres` | `string?` | ❌ | GEWOON | |
| `Url` | `string?` | ❌ | GEEN | |
| `GewensteActie` | `string` | ✅ | GEEN | "Verwijderen" / "Overdragen" / "In stand houden" |
| `OverdrachtAan` | `string?` | ❌ | GEWOON | Naam van ontvanger bij overdracht |
| `Notities` | `string?` | ❌ | GEWOON | |

---

### 16. `WachtwoordEntry`

**Beschrijving:** Versleuteld opgeslagen wachtwoord voor een dienst of systeem. Het wachtwoord is versleuteld met de master password keys.

**AVG-classificatie:** VERTROUWELIJK  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld); wachtwoord extra versleuteld  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Naam` | `string` | ✅ | GEEN | Dienstnaam |
| `Gebruikersnaam` | `string?` | ❌ | VERTROUWELIJK | |
| `EncryptedWachtwoord` | `string` | ✅ | VERTROUWELIJK | Versleutelde waarde; **nooit plaintext loggen** |
| `Url` | `string?` | ❌ | GEEN | |
| `Notities` | `string?` | ❌ | GEWOON | |

---

### 17. `CryptoWallet`

**Beschrijving:** Crypto-wallet met optionele versleutelde seed phrase. Bijzonder gevoelig: seed phrase geeft volledige controle over de wallet.

**AVG-classificatie:** VERTROUWELIJK (seed phrase = financieel equivalent van wachtwoord)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld); seed phrase extra versleuteld  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `WalletNaam` | `string` | ✅ | GEEN | |
| `CryptoType` | `string` | ✅ | GEEN | Bijv. "Bitcoin", "Ethereum" |
| `WalletAdres` | `string?` | ❌ | GEWOON | Public key (publiek traceerbaar) |
| `EncryptedSeedPhrase` | `string?` | ❌ | VERTROUWELIJK | **Nooit plaintext loggen of exporteren** |
| `Exchange` | `string?` | ❌ | GEEN | |
| `Notities` | `string?` | ❌ | GEWOON | |

---

## Module: Documents

### 18. `PersoonlijkDocument`

**Beschrijving:** Geüpload persoonlijk document (paspoort, testament-scan, medische documenten, enz.). Binaire bestandsinhoud opgeslagen als blob. Ondersteunt versiebeheer via `DocumentGroepId`.

**AVG-classificatie:** VERTROUWELIJK (kan bijzondere categorieën bevatten afhankelijk van categorie)  
**AVG-grondslag:** Art. 6 lid 1 sub b; art. 9 sub a voor medische documenten  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Naam` | `string` | ✅ | GEWOON | |
| `Categorie` | `enum` | ✅ | GEEN | `DocumentCategorie` enum |
| `BestandsNaam` | `string` | ✅ | GEEN | |
| `ContentType` | `string` | ✅ | GEEN | MIME-type |
| `BestandsGrootte` | `long` | ✅ | GEEN | Bytes |
| `BestandsInhoud` | `byte[]` | ✅ | VERTROUWELIJK | Binaire bestandsinhoud; kan bijzondere categorieën bevatten |
| `VerlooptOp` | `DateOnly?` | ❌ | GEWOON | Verloopdatum (paspoort, ID) |
| `DocumentGroepId` | `Guid` | ✅ | GEEN | Groepeert versies van hetzelfde document |
| `Versie` | `int` | ✅ | GEEN | Versienummer (start bij 1) |
| `Notities` | `string?` | ❌ | GEWOON | |

---

## Module: DonorRegistration

### 19. `DonorRegistratie`

**Beschrijving:** Donorregistratiewens van de eigenaar: keuze voor organ- en weefseldonatie, registratiestatus bij het Donorregister en eventuele beslisser bij bijzondere donorkeuze.

**AVG-classificatie:** **BIJZONDER** — gezondheidsgegevens (AVG art. 9)  
**AVG-grondslag:** Art. 9 lid 2 sub a (uitdrukkelijke toestemming)  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; bij intrekking toestemming direct verwijderd  
**DPIA:** `devdocs/dpia-bijzondere-categorieen.md` §1.5  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Keuze` | `string` | ✅ | **BIJZONDER** | Donorkeuze (bijv. "Alles", "Niets", "Specifieke organen", "Specifiek persoon beslist") |
| `IsGeregistreerdBijDonorregister` | `bool` | ✅ | **BIJZONDER** | Registratiestatus bij Donorregister |
| `DonorregisterReferentie` | `string?` | ❌ | **BIJZONDER** | Referentienummer Donorregister |
| `Toelichting` | `string?` | ❌ | **BIJZONDER** | Vrije tekst toelichting |
| `BeslisserNaam` | `string?` | ❌ | GEWOON | Naam beslisser (bij keuze "Specifiek persoon beslist") |
| `BeslisserRelatie` | `string?` | ❌ | GEWOON | |
| `BeslisserTelefoon` | `string?` | ❌ | GEWOON | |
| `OrgaanKeuzes` | `List<OrgaanKeuze>` | — | **BIJZONDER** | Specifieke orgaan-/weefselselecties |

---

## Module: EuthanasiaDirective

### 20. `WilsverklaringEuthanasie`

**Beschrijving:** Wilsverklaring euthanasie — het vastleggen van de wens tot euthanasie, situatiebeschrijving, behandelverbod, dementie-clausule en vertegenwoordigers. Volledig conform Wet toetsing levensbeëindiging op verzoek (WTL).

**AVG-classificatie:** **BIJZONDER** — gezondheidsgegevens (AVG art. 9)  
**AVG-grondslag:** Art. 9 lid 2 sub a (uitdrukkelijke toestemming)  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; bij intrekking toestemming direct verwijderd  
**DPIA:** `devdocs/dpia-bijzondere-categorieen.md` §1.5  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `DatumOndertekening` | `DateOnly?` | ❌ | **BIJZONDER** | |
| `WilEuthanasie` | `bool` | ✅ | **BIJZONDER** | Kernwens |
| `SituatieBeschrijving` | `string?` | ❌ | **BIJZONDER** | Vrije tekst medische situatie |
| `DementieClausule` | `bool` | ✅ | **BIJZONDER** | Indicatie dementie |
| `DementieClausuleToelichting` | `string?` | ❌ | **BIJZONDER** | |
| `BehandelVerbod` | `string?` | ❌ | **BIJZONDER** | Vrije tekst behandelverbod |
| `SituatieOpties` | `string?` | ❌ | **BIJZONDER** | JSON-array van geselecteerde situaties |
| `SituatieNotitie` | `string?` | ❌ | **BIJZONDER** | |
| `AanvullendeWensen` | `string?` | ❌ | **BIJZONDER** | |
| `Huisarts` | `string?` | ❌ | GEWOON | Naam huisarts (naam derde) |
| `HuisartsPraktijk` | `string?` | ❌ | GEWOON | |
| `HuisartsTelefoon` | `string?` | ❌ | GEWOON | |
| `HuisartsEmail` | `string?` | ❌ | GEWOON | |
| `VertegenwoordigerNaam` | `string?` | ❌ | GEWOON | Naam vertegenwoordiger |
| `VertegenwoordigerRelatie` | `string?` | ❌ | GEWOON | |
| `VertegenwoordigerTelefoon` | `string?` | ❌ | GEWOON | |
| `VertegenwoordigerEmail` | `string?` | ❌ | GEWOON | |
| `VertegenwoordigerAdres` | `string?` | ❌ | GEWOON | |
| `VertegenwoordigerPostcode` | `string?` | ❌ | GEWOON | |
| `VertegenwoordigerWoonplaats` | `string?` | ❌ | GEWOON | |
| `Vertegenwoordiger2Naam` | `string?` | ❌ | GEWOON | Tweede vertegenwoordiger |
| `Vertegenwoordiger2Relatie` | `string?` | ❌ | GEWOON | |
| `Vertegenwoordiger2Telefoon` | `string?` | ❌ | GEWOON | |
| `Vertegenwoordiger2Email` | `string?` | ❌ | GEWOON | |
| `Voorwaarden` | `List<EuthanasieVoorwaarde>` | — | **BIJZONDER** | Aanvullende medische voorwaarden |

---

## Module: FuneralWishes (Uitvaart)

### 21. `UitvaartWensen`

**Beschrijving:** Uitvaartwensen van de eigenaar: type uitvaart, locatie-voorkeuren, ceremoniewensen, muziek, kleding, kondoleance en budget. Aggregaatroot voor `CeremonieDetail` en `UitvaartGenodigde`.

**AVG-classificatie:** GEWOON (naam- en adresgegevens uitvaartondernemer als derde)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `VoorkeurType` | `string` | ✅ | GEEN | Bijv. "Begraven", "Cremeren", "Thuis" |
| `UitvaartOndernemer` | `string?` | ❌ | GEWOON | Naam bedrijf of persoon |
| `UitvaartOndernemerTelefoon` | `string?` | ❌ | GEWOON | |
| `UitvaartOndernemerEmail` | `string?` | ❌ | GEWOON | |
| `UitvaartOndernemerAdres` | `string?` | ❌ | GEEN | |
| `UitvaartOndernemerPostcode` | `string?` | ❌ | GEEN | |
| `UitvaartOndernemerPlaats` | `string?` | ❌ | GEEN | |
| `HeeftUitvaartVerzekering` | `bool` | ✅ | FINANCIEEL | |
| `UitvaartVerzekeringDetails` | `string?` | ❌ | FINANCIEEL | |
| `CeremonieSoort` | `string?` | ❌ | GEEN | |
| `CeremonieLocatie` | `string?` | ❌ | GEEN | |
| `Muziekwensen` | `string?` | ❌ | GEEN | |
| `Sprekers` | `string?` | ❌ | GEWOON | Namen van sprekers |
| `Bloemen` | `string?` | ❌ | GEEN | |
| `Kledingwensen` | `string?` | ❌ | GEEN | |
| `RouwkaartTekst` | `string?` | ❌ | GEWOON | Vrije tekst |
| `RouwadvertentieTekst` | `string?` | ❌ | GEWOON | Vrije tekst |
| `Condoleance` | `string?` | ❌ | GEWOON | |
| `OverigeWensen` | `string?` | ❌ | GEWOON | |
| `BudgetRichting` | `string?` | ❌ | FINANCIEEL | |
| `DatumOpgesteld` | `DateOnly?` | ❌ | GEEN | |
| Locatievelden (6×) | `string?` | ❌ | GEEN | Begraafplaats, crematorium, aula-naam en -adres |

---

### 22. `CeremonieDetail`

**Beschrijving:** Onderdeel van de uitvaartceremonie (bijv. "Welkomstmuziek", "Toespraak", "Bloemenmoment"). Bevat muziek-, spreker- en dresscode-details.

**AVG-classificatie:** GEWOON (namen van sprekers)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete via `UitvaartWensen`  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `UitvaartWensenId` | `Guid` | ✅ | GEEN | FK → `UitvaartWensen` |
| `Onderdeel` | `string` | ✅ | GEEN | |
| `Beschrijving` | `string?` | ❌ | GEEN | |
| `Volgorde` | `int` | ✅ | GEEN | |
| `Muziek` | `string?` | ❌ | GEEN | |
| `Spreker` | `string?` | ❌ | GEWOON | Naam van een persoon |
| `Tekstlezing` | `string?` | ❌ | GEEN | |
| `Dresscode` | `string?` | ❌ | GEEN | |

---

### 23. `UitvaartGenodigde`

**Beschrijving:** Persoon die uitgenodigd dient te worden bij de uitvaart. Kan een bestaande erfgenaam of noodcontact zijn (optionele FK) of nieuw ingevoerd worden.

**AVG-classificatie:** GEWOON  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `UitvaartWensenId` | `Guid` | ✅ | GEEN | FK → `UitvaartWensen` |
| `Naam` | `string` | ✅ | GEWOON | |
| `Relatie` | `string?` | ❌ | GEWOON | |
| `Telefoon` | `string?` | ❌ | GEWOON | |
| `Email` | `string?` | ❌ | GEWOON | |
| `Adres` | `string?` | ❌ | GEWOON | |
| `Postcode` | `string?` | ❌ | GEWOON | |
| `Woonplaats` | `string?` | ❌ | GEWOON | |
| `ErfgenaamId` | `Guid?` | ❌ | GEEN | Optionele FK → `Erfgenaam` |
| `NoodcontactId` | `Guid?` | ❌ | GEEN | Optionele FK → `Noodcontact` |
| `Notities` | `string?` | ❌ | GEWOON | |

---

## Module: Testament

### 24. `TestamentInfo`

**Beschrijving:** Testamentaire wensen van de eigenaar: testamenttype, notarisgegevens, CTR-nummer, legaten, uitsluitingsclausule en algemene wensen. Aggregaatroot voor `Begunstigde`, `Executeur` en `TestamentSnapshot`.

**AVG-classificatie:** GEWOON (naam/contactgegevens notaris als derde)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `TestamentType` | `string?` | ❌ | GEEN | Bijv. "Eigenhandig", "Notarieel" |
| `NotarisNaam` | `string?` | ❌ | GEWOON | |
| `NotarisKantoor` | `string?` | ❌ | GEWOON | |
| `NotarisTelefoon` | `string?` | ❌ | GEWOON | |
| `NotarisEmail` | `string?` | ❌ | GEWOON | |
| `NotarisAdres` | `string?` | ❌ | GEEN | |
| `NotarisPostcode` | `string?` | ❌ | GEEN | |
| `NotarisPlaats` | `string?` | ❌ | GEEN | |
| `DatumTestament` | `DateOnly?` | ❌ | GEEN | |
| `TestamentLocatie` | `string?` | ❌ | GEEN | Bewaarlocatie fysiek testament |
| `CTR_Nummer` | `string?` | ❌ | GEWOON | Centraal Testamentenregister referentie |
| `AlgemeneWensen` | `string?` | ❌ | GEWOON | Vrije tekst |
| `BijzondereBepalingen` | `string?` | ❌ | GEWOON | |
| `UitsluitingsClausule` | `bool?` | ❌ | GEWOON | null = geen keuze |
| `Legaten` | `string?` | ❌ | GEWOON | |

---

### 25. `Begunstigde`

**Beschrijving:** Begunstigde in het testament van de eigenaar — persoon of organisatie die een deel van de nalatenschap ontvangt. Kan gelinkt zijn aan een bestaand `Erfgenaam`-record.

**AVG-classificatie:** GEWOON  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete via `TestamentInfo`  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `TestamentInfoId` | `Guid` | ✅ | GEEN | FK → `TestamentInfo` |
| `Naam` | `string` | ✅ | GEWOON | |
| `Relatie` | `string` | ✅ | GEWOON | |
| `Telefoon` | `string?` | ❌ | GEWOON | |
| `Email` | `string?` | ❌ | GEWOON | |
| `Adres` | `string?` | ❌ | GEWOON | |
| `Postcode` | `string?` | ❌ | GEWOON | |
| `Woonplaats` | `string?` | ❌ | GEWOON | |
| `Omschrijving` | `string?` | ❌ | GEWOON | |
| `Percentage` | `decimal?` | ❌ | FINANCIEEL | Percentage van nalatenschap |
| `IsLegitiemePortie` | `bool` | ✅ | GEEN | |
| `ErfgenaamId` | `Guid?` | ❌ | GEEN | Optionele FK → `Erfgenaam` |
| `NoodcontactId` | `Guid?` | ❌ | GEEN | Optionele FK → `Noodcontact` |

---

### 26. `Executeur`

**Beschrijving:** Testament-executeur: persoon belast met de uitvoering van het testament. Kan een notaris, familielid of professionele executeur zijn.

**AVG-classificatie:** GEWOON  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete via `TestamentInfo`  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `TestamentInfoId` | `Guid` | ✅ | GEEN | FK → `TestamentInfo` |
| `Naam` | `string` | ✅ | GEWOON | |
| `Relatie` | `string?` | ❌ | GEWOON | |
| `Telefoon` | `string?` | ❌ | GEWOON | |
| `Email` | `string?` | ❌ | GEWOON | |
| `Adres` | `string?` | ❌ | GEWOON | |
| `Postcode` | `string?` | ❌ | GEWOON | |
| `Woonplaats` | `string?` | ❌ | GEWOON | |
| `Bevoegdheden` | `string?` | ❌ | GEEN | Vrije tekst bevoegdheden |
| `ErfgenaamId` | `Guid?` | ❌ | GEEN | Optionele FK → `Erfgenaam` |
| `NoodcontactId` | `Guid?` | ❌ | GEEN | Optionele FK → `Noodcontact` |

---

### 27. `TestamentSnapshot`

**Beschrijving:** Onveranderlijk geschiedenismoment van het testament. Slaat de volledige JSON-serialisatie van `TestamentInfo` (inclusief begunstigden en executeurs) op het moment van vastleggen op. Ondersteunt historisch overzicht en wijzigingsvergelijking.

**AVG-classificatie:** GEWOON (bevat geserialiseerde persoonsdata van `TestamentInfo`)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete via `TestamentInfo`  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `TestamentInfoId` | `Guid` | ✅ | GEEN | FK → `TestamentInfo` |
| `Versie` | `int` | ✅ | GEEN | |
| `SnapshotDatum` | `DateTime` | ✅ | GEEN | UTC |
| `Notitie` | `string?` | ❌ | GEWOON | |
| `SnapshotJson` | `string` | ✅ | GEWOON | Volledige JSON van testament + begunstigden; bevat persoonsdata |

---

## Module: VideoMessages

### 28. `Videoboodschap`

**Beschrijving:** Persoonlijke videoboodschap van de eigenaar aan specifieke erfgenamen. Metadata-record; de binaire videodata is opgeslagen in `VideoboodschapBlob` (SQLite) of als bestand op schijf.

**AVG-classificatie:** GEWOON (metadata van video-inhoud die persoonsgegevens bevat)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld) voor metadata; schijf voor videobestanden  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete + bestandssysteem cleanup  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `EigenaarId` | `Guid` | ✅ | GEEN | FK → `Eigenaar` |
| `Titel` | `string` | ✅ | GEWOON | |
| `Beschrijving` | `string?` | ❌ | GEWOON | |
| `BestandsNaam` | `string` | ✅ | GEEN | |
| `ContentType` | `string` | ✅ | GEEN | MIME-type (bijv. `video/mp4`) |
| `BestandsGrootte` | `long` | ✅ | GEEN | Bytes |
| `DuurSeconden` | `int?` | ❌ | GEEN | |
| `BestandsPad` | `string?` | ❌ | GEEN | Absoluut pad op schijf (nieuwe uploads); null voor legacy blob-records |

---

### 29. `VideoboodschapBlob`

**Beschrijving:** Binaire videoinhoud in een aparte tabel om lijst-queries efficiënt te houden. Primaire sleutel is gelijk aan de bijbehorende `Videoboodschap.Id` (1:1-relatie).

**AVG-classificatie:** VERTROUWELIJK (opname van de persoon; kan biometrische gegevens bevatten)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  
**Opmerking:** Bij nieuwe uploads wordt `BestandsPad` gebruikt (schijf) in plaats van dit blob-veld. Dit veld wordt alleen gebruikt voor legacy-records.

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `VideoboodschapId` | `Guid` | ✅ | GEEN | PK + FK → `Videoboodschap` (1:1) |
| `Inhoud` | `byte[]` | ✅ | VERTROUWELIJK | Ruwe videodata; **nooit streamen zonder authorisatie** |

---

### 30. `VideoboodschapOntvanger`

**Beschrijving:** Koppeling tussen een videoboodschap en een specifieke erfgenaam die de boodschap ontvangt.

**AVG-classificatie:** GEEN (relatietabel, geen directe persoonsgegevens)  
**AVG-grondslag:** Art. 6 lid 1 sub b  
**Opslaglocatie:** SQLite (versleuteld)  
**Bewaartermijn:** Zolang eigenaar actief; cascade delete  

| Veld | Type | Verplicht | AVG-klasse | Toelichting |
|------|------|-----------|-----------|-------------|
| `Id` | `Guid` | ✅ | GEEN | PK |
| `VideoboodschapId` | `Guid` | ✅ | GEEN | FK → `Videoboodschap` |
| `ErfgenaamId` | `Guid` | ✅ | GEEN | FK → `Erfgenaam` |

---

## Samenvatting AVG-classificaties

| # | Entiteit | Module | AVG-klasse | Opmerking |
|---|----------|--------|-----------|-----------|
| 1 | `Eigenaar` | Common | BIJZONDER + GEWOON | BSN, legitimatienummer |
| 2 | `Erfgenaam` | Common | BIJZONDER + GEWOON | BSN, legitimatienummer |
| 3 | `Noodcontact` | Common | GEWOON | |
| 4 | `Profile` | Common | GEWOON | In `profiles.json`, niet in DB |
| 5 | `Werkgever` | Common | GEWOON + FINANCIEEL | Pensioenfondgegevens |
| 6 | `AuditLogEntry` | Common | GEWOON | 90 dagen retentie; BSN verboden |
| 7 | `SectieNotitie` | Common | GEWOON | Vrije tekst |
| 8 | `ActualisatieBevestiging` | Common | GEEN | Functionele metadata |
| 9 | `AfhandelingsItem` | Common | GEEN | Functionele statusregistratie |
| 10 | `Bankrekening` | AssetRegistry | FINANCIEEL | IBAN |
| 11 | `FysiekBezit` | AssetRegistry | FINANCIEEL + GEWOON | Kadaster/kenteken |
| 12 | `Schuld` | AssetRegistry | FINANCIEEL + GEWOON | |
| 13 | `Verzekering` | AssetRegistry | FINANCIEEL + GEWOON | Polisnummer |
| 14 | `ErfgenaamToewijzing` | AssetRegistry | GEEN | Relatietabel |
| 15 | `DigitaalAccount` | DigitalEstate | VERTROUWELIJK + GEWOON | Inloggegevens |
| 16 | `WachtwoordEntry` | DigitalEstate | VERTROUWELIJK | Versleuteld wachtwoord |
| 17 | `CryptoWallet` | DigitalEstate | VERTROUWELIJK | Seed phrase versleuteld |
| 18 | `PersoonlijkDocument` | Documents | VERTROUWELIJK | Kan bijzondere categorieën bevatten |
| 19 | `DonorRegistratie` | DonorRegistration | **BIJZONDER** | Gezondheidsgegevens — DPIA §1.5 |
| 20 | `WilsverklaringEuthanasie` | EuthanasiaDirective | **BIJZONDER** | Gezondheidsgegevens — DPIA §1.5 |
| 21 | `UitvaartWensen` | FuneralWishes | GEWOON + FINANCIEEL | |
| 22 | `CeremonieDetail` | FuneralWishes | GEWOON | Namen sprekers |
| 23 | `UitvaartGenodigde` | FuneralWishes | GEWOON | |
| 24 | `TestamentInfo` | Testament | GEWOON | Notarisgegevens |
| 25 | `Begunstigde` | Testament | GEWOON + FINANCIEEL | Percentage nalatenschap |
| 26 | `Executeur` | Testament | GEWOON | |
| 27 | `TestamentSnapshot` | Testament | GEWOON | Geserialiseerde persoonsdata |
| 28 | `Videoboodschap` | VideoMessages | GEWOON | Metadata |
| 29 | `VideoboodschapBlob` | VideoMessages | VERTROUWELIJK | Binaire video; biometrisch |
| 30 | `VideoboodschapOntvanger` | VideoMessages | GEEN | Relatietabel |

**Bijzondere categorieën (art. 9 AVG):** 4 entiteiten — `Eigenaar` (BSN/legitimatie), `Erfgenaam` (BSN/legitimatie), `DonorRegistratie`, `WilsverklaringEuthanasie`

---

## HANDOFF CHECKLIST
- [x] Alle 30 entiteiten gedocumenteerd (≥24/26 — criterium ruimschoots gehaald)
- [x] Alle velden per entiteit gedocumenteerd met type, verplicht-vlag en AVG-klasse
- [x] Bijzondere categorieën (art. 9 AVG) expliciet gemarkeerd — verwijzing naar DPIA
- [x] Retentiebeleid per entiteit vermeld — verwijzing naar `data-retention-policy.md`
- [x] Opslaglocatie per entiteit vermeld
- [x] Samenvatting-tabel aanwezig met alle 30 entiteiten
- [x] BSN-restricties conform retentiebeleid §3.2 vermeld bij `Eigenaar`, `Erfgenaam`, `AuditLogEntry`
- [x] Geen tegenstrijdige uitspraken
- [x] Bronverwijzingen: domeincode in `src/Lumio.Api/Domain/**/*.cs`
