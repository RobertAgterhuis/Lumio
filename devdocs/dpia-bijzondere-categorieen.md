# Data Protection Impact Assessment (DPIA)
**Lumio — Verwerking van Bijzondere Categorieën Persoonsgegevens**

**Status:** v1.0 — GOEDGEKEURD  
**Datum:** 2026-03-01  
**Uitvoerder:** DPO (Functionaris voor Gegevensbescherming)  
**DPO:** Softwaredeveloper Lumio (interne aanstelling)  
**Grondslag DPIA-verplichting:** AVG art. 35 lid 3 sub b — grootschalige verwerking bijzondere categorieën  
**Grondslag verwerking:** AVG art. 9 lid 2 sub a — uitdrukkelijke toestemming  
**Referentiedocument:** `devdocs/data-retention-policy.md` v1.0

---

## 1. Beschrijving van de verwerkingsactiviteit

### 1.1 Naam verwerking
Persoonlijke digitale nalatenschap — vastlegging van medische wensen, euthanasierichtlijnen en donorregistratie door de gebruiker in de lokale Lumio-applicatie.

### 1.2 Verwerkingsverantwoordelijke
Lumio (hierna: "de organisatie"). Voor B2B-inzet is de werkgever (als distributeur via het whitelabel-kanaal) gezamenlijk verantwoordelijke en dient een verwerkersovereenkomst of gezamenlijke verwerkersregeling te worden gesloten. De eindgebruiker verwerkt zijn eigen gegevens: de organisatie heeft geen toegang tot de data.

### 1.3 Doeleinden van de verwerking
| Doel | Omschrijving |
|------|-------------|
| Vastleggen euthanasiewens | Gebruiker legt schriftelijk zijn medische wens vast voor situaties van wilsonbekwaamheid |
| Vastleggen donorregistratie | Gebruiker registreert zijn donorkeuze voor organen, weefsels en cellen |
| Vastleggen medische vertegenwoordiger | Gebruiker benoemt een vertegenwoordiger voor medische beslissingen |
| Nabestaanden toegang | Via Shamir Secret Sharing kunnen aangewezen nabestaanden toegang krijgen na overlijden |

### 1.4 Categorieën betrokkenen
- Primaire gebruiker (eigenaar van de installatie) — volwassene, alle leeftijden
- B2C: particuliere gebruiker
- B2B: medewerker van een werkgever die Lumio aanbiedt als arbeidsvoorwaarde

### 1.5 Categorieën persoonsgegevens

**Reguliere persoonsgegevens (art. 4 lid 1 AVG):**
- NAW-gegevens eigenaar en erfgenamen
- BSN (eigenaar en erfgenamen) — alleen voor juridische doeleinden
- Contactgegevens

**Bijzondere categorieën (art. 9 AVG):**
| Categorie | Entiteit in database | Sub-categorie art. 9 |
|-----------|---------------------|---------------------|
| Euthanasiewens en -voorwaarden | `WilsverklaringEuthanasie`, `EuthanasieVoorwaarde` | Gezondheidsgegevens |
| Donorregistratie en orgaankeuzes | `DonorRegistraties`, `OrgaanKeuze` | Gezondheidsgegevens |
| Medische vertegenwoordiger (indirect) | `WilsverklaringEuthanasie.VertegenwoordigerNaam` | Gezondheidsgegevens (context) |
| Dementie-clausule | `WilsverklaringEuthanasie.DementieClausule` | Gezondheidsgegevens |
| Behandelverbod | `WilsverklaringEuthanasie.BehandelVerbod` | Gezondheidsgegevens |

### 1.6 Ontvangers van persoonsgegevens
- **Gebruiker zelf** — de enige die de versleutelde database kan ontsleutelen met zijn master password
- **Aangewezen nabestaanden** — via Shamir Secret Sharing; ontvangen elk slechts één deel en kunnen pas toegang krijgen met het gecombineerde minimum aantal codes
- **Lumio (de organisatie)** — **geen toegang**; applicatie is volledig offline, geen cloud-opslag, geen telemetrie
- **Werkgever (B2B)** — **geen toegang** tot gebruikersdata; werkgever distribueert uitsluitend de software-installer

### 1.7 Internationale doorgifte
**Geen.** De database bevindt zich uitsluitend op het lokale apparaat van de gebruiker. Er vindt geen doorgifte aan derde landen of internationale organisaties plaats (AVG art. 44 t/m 49 niet van toepassing).

### 1.8 Bewaartermijnen
Conform `devdocs/data-retention-policy.md`:
- Bijzondere categorieën: zolang de gebruiker actief is; bij intrekking toestemming direct gewist
- Cascade delete bij profiel-verwijdering
- Audit log: 90 dagen, daarna automatisch gewist

---

## 2. Noodzakelijkheid en evenredigheid

### 2.1 Rechtsgrond
**AVG art. 9 lid 2 sub a — uitdrukkelijke toestemming**

De gebruiker geeft bij het invullen van euthanasie- en donorinformatie uitdrukkelijke toestemming via:
- Actieve invulling in de Wizard-flow (`EuthanasieWizardPage`, `DonorWizardPage`)
- Een bevestigingsstap in elke wizard met een expliciete disclaimer: "Lumio is geen juridisch advies..."
- De gebruiker is initiator van de vastlegging — er is geen externe druk of afdwinging

**Beoordeling:** De toestemming is vrij, specifiek, geïnformeerd en ondubbelzinnig conform art. 7 AVG.

### 2.2 Noodzakelijkheid
De verwerking is strikt noodzakelijk voor het bereiken van de doeleinden:
- Zonder het vastleggen van de euthanasiewens kan het product zijn primaire functie (digitale nalatenschap) niet vervullen
- Alternatieve methoden (bijv. papieren vastlegging) bereiken niet hetzelfde doel van centrale, versleutelde bewaring met nabestaanden-toegang via Shamir

### 2.3 Evenredigheid
| Aspect | Beoordeling |
|--------|------------|
| Minimale gegevensverwerking (dataminimalisatie) | ✅ Alleen de door de gebruiker actief ingevoerde gegevens worden opgeslagen; geen automatische profilering |
| Opslagbeperking | ✅ Conform retentiebeleid; cascade delete bij intrekking |
| Privacy by design | ✅ Offline-first; geen cloud; AES-256 SQLCipher; SecureString |
| Privacy by default | ✅ Geen gegevens verlaten het apparaat zonder expliciete export-handeling van de gebruiker |
| Proportionaliteit | ✅ De hoeveelheid verwerkte bijzondere gegevens is evenredig met het gebruikersdoel |

---

## 3. Risicobeoordeling

### 3.1 Identificatie van risico's

| ID | Risico | Kans (1-5) | Impact (1-5) | Score | Mitigatie |
|----|--------|-----------|-------------|-------|-----------|
| DPIA-R01 | Ongeoorloofde toegang tot lokale database door derde (bijv. diefstal apparaat) | 3 | 5 | **15** | AES-256 SQLCipher; master password vereist; database niet leesbaar zonder password |
| DPIA-R02 | Verlies van toegang door vergeten master password | 4 | 4 | **16** | Shamir Secret Sharing: nabestaanden kunnen toegang reconstrueren; encrypted backup |
| DPIA-R03 | Ongeoorloofde openbaarmaking via export-functie | 2 | 4 | **8** | Export vereist ontgrendeld profiel; encrypted backup met eigen wachtwoord; geen auto-upload |
| DPIA-R04 | Lek van bijzondere categorieën via logging/telemetrie | 1 | 5 | **5** | Geen telemetrie; Serilog logt geen persoonsgegevens of bijzondere categorieën; audit log lokaal; GUARD-006 verbiedt analytics-events met inhoud |
| DPIA-R05 | Manipulatie van nalatenschap-data door kwaadwillende met fysieke toegang tot apparaat | 2 | 4 | **8** | Master password vereist voor schrijfoperaties; read-only nabestaanden-modus gescheiden |
| DPIA-R06 | Residuele data na deïnstallatie | 3 | 3 | **9** | Database niet automatisch verwijderd bij deïnstallatie; documenteer dit in gebruikershandleiding en whitelabel onboarding (BrEVR-001 — zie aanbeveling) |
| DPIA-R07 | Inzageverzoek (AVG art. 15) — gegevens niet terug te vinden door organisatie | 1 | 2 | **2** | Gebruiker is eigen verwerkingsverantwoordelijke van zijn lokale data; organisatie heeft geen toegang; recht op inzage is zelfbediening |
| DPIA-R08 | Dataportabiliteit (AVG art. 20) niet geïmplementeerd | 1 | 2 | **2** | `/api/export/json`, `/api/export/xml` beschikbaar; dataportabiliteit is geïmplementeerd |

### 3.2 Risicoklassificatie na mitigatie

| Restrisico na mitigatie | Score | Acceptabel? |
|------------------------|-------|-------------|
| DPIA-R01 (diefstal apparaat) | **5** (na AES-256) | ✅ Ja — industrie-standaard encryptie |
| DPIA-R02 (vergeten wachtwoord) | **8** (na Shamir + backup) | ✅ Ja — meervoudig mitigatiemechanisme |
| DPIA-R03 (export-lek) | **4** (na encrypted export) | ✅ Ja |
| DPIA-R04 (telemetrie-lek) | **1** (geen telemetrie) | ✅ Ja |
| DPIA-R05 (manipulatie) | **4** (na password-gate) | ✅ Ja |
| DPIA-R06 (residuele data) | **6** (documentatiemaatregel vereist) | ✅ Ja — mits BrEVR-001 geïmplementeerd |
| DPIA-R07 (inzageverzoek) | **2** | ✅ Ja |
| DPIA-R08 (portabiliteit) | **1** | ✅ Ja — reeds geïmplementeerd |

**Totaal restrisico-niveau: LAAG tot MIDDEN — alle restrisico's zijn acceptabel.**

---

## 4. Technische en organisatorische beveiligingsmaatregelen

| Maatregel | Type | Status | Bewijs |
|-----------|------|--------|--------|
| AES-256-CBC + PBKDF2-SHA256 SQLCipher database-encryptie | Technisch | ✅ Actief | `src/Lumio.Api/Services/Security/` |
| SecureString / ReadOnlySpan<byte> voor master password — nooit als managed string | Technisch | ✅ Actief | `IMasterPasswordService.cs` — UsePassword(PasswordConsumer) |
| Shamir Secret Sharing nabestaanden-toegang | Technisch | ✅ Actief | `ShamirController.cs`, `ShamirDialog.tsx` (4-staps wizard) |
| Encrypted backup (AES-256, export) | Technisch | ✅ Actief | `EncryptedBackupService.cs`, `ExportBackupController.cs` |
| CodeQL SAST (C# + JavaScript, wekelijks) | Organisatorisch | ✅ Actief | `.github/workflows/codeql.yml` |
| Dependabot (npm + NuGet, wekelijks) | Organisatorisch | ✅ Actief | `.github/dependabot.yml` |
| GUARD-006: analytics-events mogen geen nalatenschap-inhoud bevatten | Organisatorisch | ✅ Actief | `docs/guardrails/00-global-guardrails.md` |
| Juridische disclaimer op juridisch-sensitieve schermen | Organisatorisch | ✅ Aanwezig | Testament wizard, Euthanasie wizard |
| Data Retention Policy v1.0 | Organisatorisch | ✅ Gepubliceerd | `devdocs/data-retention-policy.md` |
| Geen cloud-opslag, geen telemetrie, geen externe API-aanroepen bij gebruik | Technisch | ✅ Architectureel geborgd | `src/lumio-web/src/app/layout.tsx` — geen externe verbindingen; Content-Security-Policy |
| Cascade delete bij profiel-verwijdering | Technisch | ✅ Actief | EF Core cascade-configuratie |
| Offline-first architectuur | Technisch | ✅ Architecturcel geborgd | Electron + lokale SQLite — geen netwerk nodig |

### 4.1 Openstaande maatregel (BrEVR-001)

**BrEVR-001:** Voeg aan de gebruikershandleiding en de B2B whitelabel onboarding een expliciet alinea toe over deïnstallatie: "De database wordt NIET automatisch verwijderd bij deïnstallatie. Verwijder het data-bestand handmatig via [locatie] als u uw gegevens volledig wilt wissen." — Prioriteit: MIDDEN. Status: TODO (opnemen in SP-6-009 of aparte story).

---

## 5. Raadpleging betrokkenen en DPO-advies

### 5.1 DPO-advies

**DPO:** Softwaredeveloper Lumio (intern aangesteld per 2026-03-01)

**Advies:** De verwerking van bijzondere categorieën conform de beschrijving in dit DPIA-document is **proportioneel en noodzakelijk** voor het doeleinde (persoonlijke digitale nalatenschap). De technische beveiligingsmaatregelen zijn adequaat voor de risicoklasse. De restrisico's zijn acceptabel.

**Voorwaarden voor goedkeuring:**
1. ✅ Bevestigd: verwerking is strikt lokaal, geen cloud-doorgifte
2. ✅ Bevestigd: uitdrukkelijke toestemming als grondslag is correct voor deze bijzondere categorieën
3. ✅ Bevestigd: recht op vergetelheid is technisch geborgd via cascade delete
4. ✅ Bevestigd: recht op dataportabiliteit is geïmplementeerd (JSON/XML export)
5. ⬜ TODO: BrEVR-001 — deïnstallatie-melding toevoegen

**Conclusie DPO:** GOEDGEKEURD onder voorbehoud van BrEVR-001.

### 5.2 Raadpleging gebruikers / betrokkenen

Conform het principe dat "consumenten hier niet mee lastig gevallen worden" (beslissing Product Owner, 2026-03-01) en dat het B2B-kanaal hetzelfde beleid volgt: de DPIA is een intern document. De verplichte privacyinformatie richting gebruikers (AVG art. 13/14) is verwerkt in:
- De juridische disclaimers op euthanasie- en testament-schermen
- De Data Retention Policy (publiek beschikbaar als devdocs-document op aanvraag)
- Het privacybeleid dat onderdeel uitmaakt van de website (`site/src/app/privacy/page.tsx`)

### 5.3 Voorafgaande raadpleging Autoriteit Persoonsgegevens

**Niet vereist.** Na uitvoering van dit DPIA is gebleken dat het restrisico laag tot midden is en dat adequate maatregelen zijn getroffen. Voorafgaande raadpleging van de AP (art. 36 AVG) is niet vereist bij een laag restrisico.

---

## 6. Conclusie en goedkeuring

| Onderdeel | Status |
|-----------|--------|
| Beschrijving verwerking volledig | ✅ |
| Rechtsgrond gedocumenteerd (art. 9 lid 2 sub a) | ✅ |
| Noodzakelijkheid en evenredigheid beoordeeld | ✅ |
| Risicobeoordeling uitgevoerd (8 risico's geïdentificeerd) | ✅ |
| Alle hoge risico's gemitigeerd | ✅ |
| Technische en organisatorische maatregelen gedocumenteerd | ✅ |
| DPO-advies ontvangen | ✅ Goedgekeurd |
| Voorafgaande AP-raadpleging noodzakelijk | ✅ Niet vereist |
| Openstaande actie (BrEVR-001) | ⬜ TODO — opnemen in Fase 6 backlog |

**EINDOORDEEL: De verwerking van bijzondere categorieën persoonsgegevens in Lumio is conform de AVG. DPIA-verplichting voldaan. SYS-RISK-003 / DRIFT-001 GESLOTEN.**

---

## 7. Versiebeheer

| Versie | Datum | Wijziging | DPO sign-off |
|--------|-------|-----------|-------------|
| v1.0 | 2026-03-01 | Initiële DPIA — alle fasen doorlopen | ✅ Softwaredeveloper Lumio |

---

## 8. Review-cyclus

Dit DPIA-document wordt herzien:
- Bij elke significante wijziging in de verwerking van bijzondere categorieën
- Bij introductie van cloud-opslag of externe API-verbindingen (dit zou een nieuw DPIA vereisen)
- Bij introductie van telemetrie (DPO-toets vereist conform GUARD-006 + COMPLIANCE_RISK-GROWTH-001)
- Jaarlijks op de datum van dit document (uiterlijk 2027-03-01)
