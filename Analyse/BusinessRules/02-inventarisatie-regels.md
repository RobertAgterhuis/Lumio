# 2. Inventarisatie Business Rules

> **Doel:** iedere business rule in de Lumio-codebase identificeren, localiseren,
> en voorzien van metadata zodat we later per regel kunnen bepalen welke
> externaliseringsoptie het beste past.

---

## 2.1 Leeswijzer

Elke regel krijgt een uniek ID (`BR-xxx`) dat door de rest van deze analyse
wordt gerefereerd. De classificatie wordt in **03-classificatie.md** verder
uitgewerkt; hier geven we alleen het type mee.

**Typen:**
- **PAR** = Parameter / drempelwaarde
- **VAL** = Veldvalidatie
- **BIZ** = Businesslogica / berekening
- **POL** = Beleidsregel / toegangscontrole
- **CRS** = Cross-entity check

---

## 2.2 Authenticatie & Beveiliging

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-001 | Wachtwoord minimaal 8 tekens | PAR | `AuthValidators.cs` | 🔴 3× (validator, AuthController L82, L128) |
| BR-002 | Wachtwoord verplicht bij setup | VAL | `AuthValidators.cs` | — |
| BR-003 | Wachtwoord verplicht bij unlock | VAL | `AuthValidators.cs` | — |
| BR-004 | Shares verplicht bij erfgenaam-unlock | VAL | `AuthValidators.cs` | — |
| BR-005 | Profiel moet geselecteerd zijn voor setup | POL | `AuthController.cs` | — |
| BR-006 | Profiel moet op IsFirstRun staan voor setup | POL | `AuthController.cs` | — |
| BR-007 | Na setup: IsFirstRun=false, IsUnlocked=true | POL | `AuthController.cs` | — |
| BR-008 | Profiel mag niet al ontgrendeld zijn (unlock) | POL | `AuthController.cs` | — |
| BR-009 | Wachtwoord geverifieerd via SQLCipher PRAGMA | POL | `AuthController.cs` | — |
| BR-010 | Na vergrendeling: profiel deselecteren, state reset | POL | `AuthController.cs` | — |
| BR-011 | Wachtwoord wijzigen: huidig wachtwoord verifiëren | POL | `AuthController.cs` | — |
| BR-012 | Wachtwoord wijzigen: alle versleutelde velden her-encrypten | BIZ | `AuthController.cs` | — |
| BR-013 | Wachtwoord wijzigen: Shamir-shares ongeldig waarschuwing | BIZ | `AuthController.cs` | — |
| BR-014 | Account verwijderen: wachtwoord vereist + DB+salt verwijderen | POL | `AuthController.cs` | — |
| BR-015 | Erfgenaam-unlock: altijd read-only (IsReadOnly=true) | POL | `AuthController.cs` | — |
| BR-016 | Shamir-reconstructie van master password | BIZ | `AuthController.cs` | — |

---

## 2.3 Profielen

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-017 | Maximum 5 profielen | PAR | `IProfileService.cs` | — |
| BR-018 | Eerste profiel is altijd relatie "Primair" | POL | `ProfileController.cs` | — |
| BR-019 | Volgende profielen: relatie ∈ {Partner, Kind, Ouder, Overig} | VAL | `ProfileController.cs` | — |
| BR-020 | Profielnaam mag niet leeg zijn | VAL | `ProfileController.cs` | — |
| BR-021 | Primair profiel niet verwijderbaar zolang anderen bestaan | POL | `ProfileService.cs` | — |
| BR-022 | Profiel moet actief + ontgrendeld zijn om te verwijderen | POL | `ProfileController.cs` | — |
| BR-023 | Legacy migratie: lumio.db → auto primair profiel aanmaken | BIZ | `ProfileService.cs` | — |
| BR-024 | Profielen opgeslagen in profiles.json (niet versleuteld) | POL | `ProfileService.cs` | — |

---

## 2.4 Eigenaar (Persoonsgegevens)

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-025 | Voornaam verplicht | VAL | `EigenaarValidator.cs` | — |
| BR-026 | Voornaam max 100 tekens | PAR | `EigenaarValidator.cs` | — |
| BR-027 | Achternaam verplicht | VAL | `EigenaarValidator.cs` | — |
| BR-028 | Achternaam max 100 tekens | PAR | `EigenaarValidator.cs` | — |
| BR-029 | Tussenvoegsel max 20 tekens | PAR | `EigenaarValidator.cs` | — |
| BR-030 | Email: geldig formaat (indien ingevuld) | VAL | `EigenaarValidator.cs` | — |
| BR-031 | Postcode max 10 tekens | PAR | `EigenaarValidator.cs` | — |
| BR-032 | Singleton: slechts één eigenaar per database | POL | `EigenaarController.cs` | — |
| BR-033 | Profielfoto max 10 MB | PAR | `EigenaarController.cs` | — |
| BR-034 | Profielfoto: alleen image/* content types | VAL | `EigenaarController.cs` | — |

---

## 2.5 Erfgenamen

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-035 | Voornaam verplicht | VAL | `ErfgenaamValidator.cs` | — |
| BR-036 | Voornaam max 100 tekens | PAR | `ErfgenaamValidator.cs` | — |
| BR-037 | Achternaam verplicht | VAL | `ErfgenaamValidator.cs` | — |
| BR-038 | Achternaam max 100 tekens | PAR | `ErfgenaamValidator.cs` | — |
| BR-039 | Relatie verplicht | VAL | `ErfgenaamValidator.cs` | — |
| BR-040 | Email: geldig formaat (indien ingevuld) | VAL | `ErfgenaamValidator.cs` | — |
| BR-041 | Erfbelasting: relatie-classificatie (partner/kind/kleinkind/ouder/overig) | BIZ | `ErfgenamenController.cs` | — |
| BR-042 | Erfbelasting: 5 vrijstellingsbedragen 2025 | PAR | `ErfgenamenController.cs` | — |
| BR-043 | Erfbelasting: schijf 1 tarieven (10%/18%/30%) | PAR | `ErfgenamenController.cs` | — |
| BR-044 | Erfbelasting: schijf 2 tarieven (20%/36%/40%) | PAR | `ErfgenamenController.cs` | — |
| BR-045 | Erfbelasting: schijfgrens €154.197 | PAR | `ErfgenamenController.cs` | — |
| BR-046 | Erfbelasting berekening: belastbaar = max(0, erfdeel − vrijstelling) | BIZ | `ErfgenamenController.cs` | — |
| BR-047 | Erfbelasting berekening: progressieve schijven | BIZ | `ErfgenamenController.cs` | — |
| BR-048 | Netto nalatenschap: bezittingen + saldi + verzekeringen − schulden | BIZ | `ErfgenamenController.cs` | 🔴 3× |
| BR-049 | Gelijke verdeling over alle erfgenamen (vereenvoudigd) | BIZ | `ErfgenamenController.cs` | — |

---

## 2.6 Testament

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-050 | Legitimaire portie: intestaat-erfdeel = 100% / aantalErfgenamen | BIZ | `TestamentController.cs` | — |
| BR-051 | Legitimaire portie: minimum = intestaat / 2 (BW 4:63-4:69) | BIZ | `TestamentController.cs` | — |
| BR-052 | Legitimaire portie: kind-relaties = {kind,zoon,dochter,stiefkind,...} | BIZ | `TestamentController.cs` | — |
| BR-053 | Legitimaire portie: partner telt mee als Gehuwd/GP | BIZ | `TestamentController.cs` | — |
| BR-054 | Begunstigden percentages moeten optellen tot 100% | CRS | `TestamentController.cs` | — |
| BR-055 | Codicil + onroerend goed = waarschuwing (BW 4:97) | CRS | `TestamentController.cs` | — |
| BR-056 | Handgeschreven testament + executeurs = waarschuwing | CRS | `TestamentController.cs` | — |
| BR-057 | Geen uitsluitingsclausule + kinderen = waarschuwing | CRS | `TestamentController.cs` | — |
| BR-058 | Notaris niet ingevuld bij profiel = waarschuwing | CRS | `TestamentController.cs` | — |
| BR-059 | Erfgenaam zonder contactgegevens = waarschuwing | CRS | `TestamentController.cs` | — |
| BR-060 | Onroerend goed detectie via KadastraalNummer of categorie-keywords | BIZ | `TestamentController.cs` | — |
| BR-061 | Snapshot versienummer auto-increment (maxVersie + 1) | BIZ | `TestamentController.cs` | — |
| BR-062 | Snapshot is JSON-serialisatie van huidige status | BIZ | `TestamentController.cs` | — |
| BR-063 | UitsluitingsClausule default: true | PAR | `TestamentInfo.cs` | — |

---

## 2.7 Euthanasie / Wilsverklaring

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-064 | Singleton per eigenaar | POL | `EuthanasieController.cs` | — |
| BR-065 | Eigenaar moet bestaan voor aanmaak | POL | `EuthanasieController.cs` | — |
| BR-066 | Voorwaarden als geneste lijst (cascade create/update/delete) | BIZ | `EuthanasieController.cs` | — |

---

## 2.8 Donorregistratie

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-067 | Singleton per eigenaar | POL | `DonorController.cs` | — |
| BR-068 | Eigenaar moet bestaan voor aanmaak | POL | `DonorController.cs` | — |
| BR-069 | OrgaanKeuzes als geneste lijst (cascade) | BIZ | `DonorController.cs` | — |

---

## 2.9 Digitaal Bezit

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-070 | PlatformNaam verplicht | VAL | `DigitalEstateValidators.cs` | — |
| BR-071 | GewensteActie verplicht | VAL | `DigitalEstateValidators.cs` | — |
| BR-072 | WachtwoordEntry.Naam verplicht (create) | VAL | `DigitalEstateValidators.cs` | — |
| BR-073 | WachtwoordEntry.Wachtwoord verplicht (create) | VAL | `DigitalEstateValidators.cs` | — |
| BR-074 | WachtwoordEntry.Naam verplicht (update) | VAL | `DigitalEstateValidators.cs` | — |
| BR-075 | WalletNaam verplicht | VAL | `DigitalEstateValidators.cs` | — |
| BR-076 | CryptoType verplicht | VAL | `DigitalEstateValidators.cs` | — |
| BR-077 | Wachtwoorden worden versleuteld bij opslag (AES-256-GCM) | POL | `DigitaalBezitController.cs` | — |
| BR-078 | Wachtwoorden worden alleen on-demand ontsleuteld | POL | `DigitaalBezitController.cs` | — |
| BR-079 | CSV import: auto-detectie kolomnamen (5 password managers) | BIZ | `DigitaalBezitController.cs` | — |
| BR-080 | CSV import: regels met leeg wachtwoord worden overgeslagen | BIZ | `DigitaalBezitController.cs` | — |
| BR-081 | Crypto wallet SeedPhrase versleuteld | POL | `DigitaalBezitController.cs` | — |

---

## 2.10 Boedel (Vermogensoverzicht)

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-082 | BankNaam verplicht | VAL | `AssetValidators.cs` | — |
| BR-083 | IBAN verplicht | VAL | `AssetValidators.cs` | — |
| BR-084 | IBAN formaat: `^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$` | VAL | `AssetValidators.cs` | — |
| BR-085 | Omschrijving verplicht (fysiek bezit) | VAL | `AssetValidators.cs` | — |
| BR-086 | Categorie verplicht (fysiek bezit) | VAL | `AssetValidators.cs` | — |
| BR-087 | Geschatte waarde ≥ 0 | PAR | `AssetValidators.cs` | — |
| BR-088 | Verzekeraar verplicht | VAL | `AssetValidators.cs` | — |
| BR-089 | Type verplicht (verzekering) | VAL | `AssetValidators.cs` | — |
| BR-090 | PolisNummer verplicht | VAL | `AssetValidators.cs` | — |
| BR-091 | VerzekerdBedrag ≥ 0 | PAR | `AssetValidators.cs` | — |
| BR-092 | Schuldeiser verplicht | VAL | `AssetValidators.cs` | — |
| BR-093 | Schuld bedrag > 0 (strikt) | PAR | `AssetValidators.cs` | — |
| BR-094 | MaandelijkseAflossing ≥ 0 | PAR | `AssetValidators.cs` | — |
| BR-095 | Financieel overzicht: bruto = bezittingen + saldi + verzekeringen | BIZ | `BoedelController.cs` | 🔴 3× |
| BR-096 | Financieel overzicht: netto = bruto − schulden | BIZ | `BoedelController.cs` | 🔴 3× |
| BR-097 | Eigenaar moet bestaan voor boedel-operaties | POL | `BoedelController.cs` | — |

---

## 2.11 Uitvaart

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-098 | Singleton per eigenaar | POL | `UitvaartController.cs` | — |
| BR-099 | Eigenaar moet bestaan | POL | `UitvaartController.cs` | — |
| BR-100 | CeremonieDetails + Genodigden als geneste lijsten (cascade) | BIZ | `UitvaartController.cs` | — |

---

## 2.12 Documenten

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-101 | Upload max 50 MB | PAR | `DocumentenController.cs` | — |
| BR-102 | Auto-versioning: zelfde naam → zelfde DocumentGroepId | BIZ | `DocumentenController.cs` | — |
| BR-103 | Versienummer auto-increment per groep | BIZ | `DocumentenController.cs` | — |
| BR-104 | Nieuwe naam → nieuwe DocumentGroepId + Versie 1 | BIZ | `DocumentenController.cs` | — |

---

## 2.13 Noodcontacten

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-105 | Eigenaar moet bestaan | POL | `NoodcontactenController.cs` | — |
| BR-106 | Gedeelde noodcontacten: filter op IsGedeeld | BIZ | `NoodcontactenController.cs` | — |
| BR-107 | Import duplicaat-detectie op Naam + Rol (case-insensitive) | BIZ | `NoodcontactenController.cs` | — |

---

## 2.14 Toewijzingen

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-108 | Unieke combinatie ErfgenaamId + EntityType + EntityId | VAL | `ToewijzingenController.cs` | — |
| BR-109 | Geldige EntityTypes: FysiekBezit, Bankrekening, Verzekering, DigitaalAccount, CryptoWallet | VAL | `ToewijzingenController.cs` | — |

---

## 2.15 Shamir Secret Sharing

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-110 | Drempel ≥ 2 | PAR | `ShamirController.cs` | 🔴 2× (controller + service) |
| BR-111 | AantalDelen ≥ Drempel | VAL | `ShamirController.cs` | — |
| BR-112 | Toewijzing op volgorde van stable ID-sortering | BIZ | `ShamirController.cs` | — |
| BR-113 | Regeneratie reset alle bestaande share-toewijzingen | BIZ | `ShamirController.cs` | — |
| BR-114 | Share toekennen: erfgenaam moet ShareIndex hebben | VAL | `ShamirController.cs` | — |

---

## 2.16 Afhandeling

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-115 | Status-enum: Open → InBehandeling → Afgehandeld | POL | `AfhandelingController.cs` | — |
| BR-116 | Status → Afgehandeld: AfgehandeldOp auto-set | BIZ | `AfhandelingController.cs` | — |
| BR-117 | Status terug → AfgehandeldOp auto-clear | BIZ | `AfhandelingController.cs` | — |
| BR-118 | Initialisatie: slechts eenmalig (AnyAsync check) | POL | `AfhandelingController.cs` | — |
| BR-119 | Auto-initialisatie van afhandelingsitems per domein | BIZ | `AfhandelingController.cs` | — |

---

## 2.17 Status & Compleetheid

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-120 | Compleetheidsscoring: 10 domeinen, 0 of 100% per domein | BIZ | `StatusController.cs` | — |
| BR-121 | Totaalscore: gemiddelde van 10 domeinen | BIZ | `StatusController.cs` | — |
| BR-122 | Granulaire compleetheid: veldniveau scoring per domein | BIZ | `StatusController.cs` | — |
| BR-123 | Eigenaar: 8 velden (voornaam, achternaam, ..., notaris) | PAR | `StatusController.cs` | — |
| BR-124 | Testament: 6 velden | PAR | `StatusController.cs` | — |
| BR-125 | Euthanasie: 3 velden | PAR | `StatusController.cs` | — |
| BR-126 | Donor: 3 velden | PAR | `StatusController.cs` | — |
| BR-127 | Digitaal bezit: 3 checks | PAR | `StatusController.cs` | — |
| BR-128 | Boedel: 4 checks | PAR | `StatusController.cs` | — |
| BR-129 | Uitvaart: 3 velden | PAR | `StatusController.cs` | — |
| BR-130 | Erfgenamen: 3 checks | PAR | `StatusController.cs` | — |
| BR-131 | Documenten: 3 checks | PAR | `StatusController.cs` | — |
| BR-132 | Noodcontacten: 3 checks | PAR | `StatusController.cs` | — |

---

## 2.18 Meldingen

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-133 | Geen eigenaar → waarschuwing | CRS | `StatusController.cs` | — |
| BR-134 | Geen testament → info | CRS | `StatusController.cs` | — |
| BR-135 | Geen wilsverklaring → info | CRS | `StatusController.cs` | — |
| BR-136 | Geen donorregistratie → info | CRS | `StatusController.cs` | — |
| BR-137 | Geen digitale accounts → info | CRS | `StatusController.cs` | — |
| BR-138 | Geen boedel-items → info | CRS | `StatusController.cs` | — |
| BR-139 | Geen uitvaartwensen → info | CRS | `StatusController.cs` | — |
| BR-140 | Geen erfgenamen → waarschuwing | CRS | `StatusController.cs` | — |
| BR-141 | Geen noodcontacten → waarschuwing | CRS | `StatusController.cs` | — |
| BR-142 | Geen documenten → info | CRS | `StatusController.cs` | — |
| BR-143 | Backup ouder dan 30 dagen → waarschuwing | CRS | `StatusController.cs` | — |
| BR-144 | Shamir niet ingesteld (erfgenamen zonder shares) → waarschuwing | CRS | `StatusController.cs` | — |
| BR-145 | Niet alle Shamir-shares uitgereikt → waarschuwing | CRS | `StatusController.cs` | — |
| BR-146 | Verlopen documenten → waarschuwing | CRS | `StatusController.cs` | — |
| BR-147 | Documenten verlopen binnen 30 dagen → info | CRS | `StatusController.cs` | — |
| BR-148 | Actualisatie niet bevestigd (>90 dagen per sectie) → info | CRS | `StatusController.cs` | — |

---

## 2.19 Suggesties (cross-referentie)

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-149 | Erfgenaam niet als noodcontact geregistreerd | CRS | `StatusController.cs` | — |
| BR-150 | Vertrouwenspersoon niet als erfgenaam | CRS | `StatusController.cs` | — |
| BR-151 | Notaris in profiel ≠ notaris in testament | CRS | `StatusController.cs` | — |
| BR-152 | Testament-notaris niet als noodcontact | CRS | `StatusController.cs` | — |
| BR-153 | Uitvaartondernemer niet als noodcontact | CRS | `StatusController.cs` | — |
| BR-154 | Begunstigde niet als erfgenaam | CRS | `StatusController.cs` | — |
| BR-155 | Geen huisarts als noodcontact (terwijl erfgenamen bestaan) | CRS | `StatusController.cs` | — |

---

## 2.20 Data Integriteit

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-156 | SHA-256 hash over JSON snapshot van alle data | BIZ | `StatusController.cs` | — |

---

## 2.21 Zoeken

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-157 | Minimale zoektermlengte: 2 tekens | PAR | `ZoekenController.cs` | — |
| BR-158 | Case-insensitive matching | BIZ | `ZoekenController.cs` | — |
| BR-159 | Zoekt in 10 entiteittypen | BIZ | `ZoekenController.cs` | — |
| BR-160 | Wachtwoorden nooit opnemen in zoekresultaten | POL | `ZoekenController.cs` | — |

---

## 2.22 Export

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-161 | 16 PDF-typen beschikbaar | BIZ | `ExportController.cs` | — |
| BR-162 | NUV XML namespace: `urn:nuv:uitvaart:1.0` | PAR | `ExportController.cs` | — |
| BR-163 | NUV: filter uitvaart-gerelateerde verzekeringen op type-keywords | BIZ | `ExportController.cs` | — |
| BR-164 | HTML export: geen wachtwoorden/seed phrases | POL | `ExportController.cs` | — |
| BR-165 | CSV separator: `;` (puntkomma) | PAR | `ExportController.cs` | — |
| BR-166 | CSV: BOM-prefix voor Excel-compatibiliteit | BIZ | `ExportController.cs` | — |

---

## 2.23 Backup & Restore

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-167 | Alleen .zip bestanden geaccepteerd | VAL | `BackupController.cs` | — |
| BR-168 | ZIP moet lumio.db bevatten | VAL | `BackupController.cs` | — |
| BR-169 | Wachtwoord geverifieerd tegen backup-database | POL | `BackupController.cs` | — |
| BR-170 | Bestandsnaam: `lumio-backup-{timestamp}.zip` | PAR | `BackupController.cs` | — |

---

## 2.24 Middleware (Toegangscontrole)

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-171 | Bypass-paden: /api/auth, /api/profielen, /api/status, /api/backup/restore, /swagger | POL | `DatabaseUnlockMiddleware.cs` | — |
| BR-172 | Read-only bypass: /api/export, /api/afhandeling | POL | `DatabaseUnlockMiddleware.cs` | — |
| BR-173 | Geen profiel → 423 Locked | POL | `DatabaseUnlockMiddleware.cs` | — |
| BR-174 | IsFirstRun → 423 Locked met isFirstRun=true | POL | `DatabaseUnlockMiddleware.cs` | — |
| BR-175 | Niet ontgrendeld → 423 Locked | POL | `DatabaseUnlockMiddleware.cs` | — |
| BR-176 | Read-only + schrijfactie naar niet-readonly pad → 403 Forbidden | POL | `DatabaseUnlockMiddleware.cs` | — |

---

## 2.25 Encryptie & Sleutelbeheer

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-177 | AES-256-GCM algoritme | PAR | `EncryptionService.cs` | — |
| BR-178 | Nonce 12 bytes | PAR | `EncryptionService.cs` | — |
| BR-179 | Auth tag 16 bytes | PAR | `EncryptionService.cs` | — |
| BR-180 | PBKDF2 100.000 iteraties | PAR | `EncryptionService.cs` | — |
| BR-181 | PBKDF2 SHA-256 hash | PAR | `EncryptionService.cs` | — |
| BR-182 | Database salt 32 bytes random | PAR | `EncryptionService.cs` | — |
| BR-183 | Legacy fallback salt: "Lumio.FieldEncryption.v1" | PAR | `EncryptionService.cs` | — |

---

## 2.26 Database & Audit

| ID | Regel | Type | Bestand | Duplicaten |
|----|-------|------|---------|------------|
| BR-184 | Auto-audit: Added → "Aangemaakt" | BIZ | `LumioDbContext.cs` | — |
| BR-185 | Auto-audit: Modified → "Gewijzigd" | BIZ | `LumioDbContext.cs` | — |
| BR-186 | Auto-audit: Deleted → "Verwijderd" | BIZ | `LumioDbContext.cs` | — |
| BR-187 | Modified entities: GewijzigdOp = UtcNow | BIZ | `LumioDbContext.cs` | — |
| BR-188 | Cascade delete Eigenaar → 16 kindentiteiten | POL | `LumioDbContext.cs` | — |
| BR-189 | Backkup drempel 30 dagen | PAR | `StatusController.cs` | — |
| BR-190 | Actualisatie drempel 90 dagen | PAR | `StatusController.cs` | — |

---

## 2.27 Samenvatting tellingen

| Categorie | Aantal rules |
|-----------|-------------|
| **PAR** — Parameter/drempelwaarde | 42 |
| **VAL** — Veldvalidatie | 30 |
| **BIZ** — Businesslogica/berekening | 48 |
| **POL** — Beleidsregel/toegangscontrole | 40 |
| **CRS** — Cross-entity check | 30 |
| **TOTAAL** | **190** |

### Duplicaten

| Regel | Aantal kopieën | Bestanden |
|-------|---------------|-----------|
| Wachtwoord min 8 tekens (BR-001) | 3× | AuthValidators, AuthController (2×) |
| Netto nalatenschap (BR-048/095/096) | 3× | BoedelController, ErfgenamenController, StatusController |
| Shamir min drempel (BR-110) | 2× | ShamirController, ShamirService |
