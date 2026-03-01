# Retentiebeleid – Lumio

**Status:** v1.1 (2026-03-01 – DPO sign-off + DPIA-koppeling)  
**Eigenaar:** Product Owner  
**DPO:** Softwaredeveloper Lumio (interne aanstelling, 2026-03-01)  
**DPO sign-off:** ✅ Goedgekeurd 2026-03-01  
**Laatste update:** 2026-03-01  
**Grondslag:** AVG art. 5 lid 1 sub e (opslagbeperking), art. 9 lid 2 (bijzondere categorieën), GUARD-001  
**DPIA:** `devdocs/dpia-bijzondere-categorieen.md` v1.0 (bijzondere categorieën — gezondheidsgegevens)

---

## 1. Doel

Dit document beschrijft hoe lang Lumio verschillende typen persoonsgegevens bewaart,
op welke rechtsgrond, en hoe verwijdering (recht op vergetelheid) technisch is afgedwongen.

---

## 2. Gegevenscategorieën en bewaartermijnen

| Categorie | Entiteit | Bewaargrond | Bewaartermijn | Verwijdermethode |
|-----------|----------|-------------|---------------|-----------------|
| Eigenaar (persoonsgegevens) | `Eigenaren` | Contractuele noodzaak | Zolang app in gebruik; direct bij verwijdering account | Cascade delete bij profiel-verwijdering |
| BSN | `Eigenaren.BSN`, `Erfgenamen.BSN` | Legitiem belang (juridische documenten) | Gelijk aan eigenaar-entiteit | Cascade delete; nooit in logs, nooit in exports without encryption |
| Testament / wilsverklaring | `Testamenten`, `Wilsverklaringen` | Contractuele noodzaak | Zolang eigenaar actief | Cascade delete |
| Bijzondere categorieën (euthanasie, donor, medisch) | `Wilsverklaringen`, `DonorRegistraties` | AVG art. 9 lid 2 sub a (uitdrukkelijke toestemming) | Zolang eigenaar actief; bij intrekking toestemming direct | Cascade delete; GUARD-001 pre-release check |
| Erfgenamen | `Erfgenamen` | Contractuele noodzaak | Zolang eigenaar actief | Cascade delete |
| Financiële data (boedel, schulden) | `FysiekeBezittingen`, `Bankrekeningen`, `Verzekeringen`, `Schulden` | Contractuele noodzaak | Zolang eigenaar actief | Cascade delete |
| Digitale bezittingen | `DigitaleAccounts`, `Wachtwoorden`, `CryptoWallets` | Contractuele noodzaak | Zolang eigenaar actief | Cascade delete |
| Noodcontacten | `Noodcontacten` | Contractuele noodzaak | Zolang eigenaar actief | Cascade delete |
| Documenten (uploads) | `Documenten` | Contractuele noodzaak | Zolang eigenaar actief; bestandspad op schijf apart verwijderd | Cascade delete + bestandssysteem cleanup |
| Videoboodschappen | `Videoboodschappen` + bestanden | Contractuele noodzaak | Zolang eigenaar actief | Cascade delete + bestandssysteem cleanup |
| Audit log | `AuditLog` | Wettelijke verplichting / beveiligingslogging | **90 dagen**, daarna automatisch gewist | Achtergrondtaak of handmatig (zie §4) |
| Backup (encrypted export) | Lokale bestanden bij gebruiker | Niet van toepassing (buiten app-beheer) | Niet van toepassing | n.v.t. — gebruiker verantwoordelijk |
| Actualisatie-bevestigingen | `ActualisatieBevestigingen` | Functioneel gebruik | Zolang eigenaar actief | Cascade delete |
| Shamir-sleutels | Niet opgeslagen in DB | n.v.t. | Niet persistent — alleen in geheugen | Geheugen vrijgegeven na sessie |

---

## 3. Technische handhaving

### 3.1 Cascade delete
Alle gegevens zijn in EF Core geconfigureerd met `DeleteBehavior.Cascade` op de eigenaar-relatie.  
Verwijdering van de `Eigenaar`-entiteit resulteert in volledige verwijdering van alle gekoppelde data.

### 3.2 BSN — extra voorzorgen
- BSN wordt uitsluitend opgeslagen in `Eigenaren.BSN` en `Erfgenamen.BSN`
- BSN wordt **nooit** opgenomen in AuditLog entries of Details-velden
- BSN wordt **nooit** in plaintext in logs weggeschreven (Serilog destructuring policy verplicht)
- BSN verschijnt in exports alleen waar functioneel vereist (NUV-XML, encrypted backup)
- BSN validatie: mod-11 elf-proef — geïmplementeerd in `EigenaarUpsertRequestValidator` en `ErfgenaamUpsertRequestValidator`

### 3.3 Bijzondere categorieën (AVG art. 9)
- Euthanasie-wensen, donorregistratie en medische informatie vallen onder AVG art. 9
- Verwerkingsgrondslag: uitdrukkelijke toestemming van de gebruiker (GUARD-001)
- Pre-release checklist vereist bevestiging DPO dat grondslag gedocumenteerd is
- DPO aangesteld per 2026-03-01; DPIA uitgevoerd per 2026-03-01 (zie `devdocs/dpia-bijzondere-categorieen.md`)
- Deze data wordt **niet** gedeeld met derde partijen zonder expliciete toestemming

### 3.4 Audit log rotatie
- Audit log entries ouder dan 90 dagen **moeten** worden gewist
- Implementatie: handmatige of geplande cleanup (TODO: achtergrondtaak in toekomstige sprint)
- Grondslag voor 90 dagen: beveiligingslogging noodzaak vs. opslagbeperking

---

## 4. Rechten van betrokkenen

| Recht | AVG-artikel | Technische implementatie |
|-------|-------------|--------------------------|
| Inzage | Art. 15 | Export via `/api/export/json` of `/api/export/xml` |
| Correctie | Art. 16 | PUT-endpoints op alle entiteiten |
| Verwijdering (vergetelheid) | Art. 17 | Volledig account-delete (cascade) — **TODO: frontend + API endpoint** |
| Dataportabiliteit | Art. 20 | `/api/export/json`, `/api/export/nuv`, `/api/export/backup/encrypted` |
| Beperking verwerking | Art. 18 | Lokale opslag — gebruiker controleert de database |
| Bezwaar | Art. 21 | n.v.t. — verwerkingsgrond is toestemming, geen gerechtvaardigd belang |

> **ACTIE (TODO):** Voeg een explicit `DELETE /api/profiel` endpoint toe in een volgende sprint dat alle eigenaar-data (inclusief bestanden) verwijdert en de database restet. Dit is vereist voor volledig AVG art. 17 compliance.

---

## 5. Versleuteling

| Laag | Methode | Status |
|------|---------|--------|
| Database at rest | SQLCipher (AES-256-CBC) | ✅ Geïmplementeerd |
| Encrypted backup export | AES-256-CBC + PBKDF2-SHA256 (100 000 iteraties) | ✅ Geïmplementeerd (Maand 11) |
| Transport | HTTPS (TLS) | ✅ ASP.NET Core HTTPS redirect actief |
| Master password | `SecureString` migratie vereist | ⚠️ GUARD-002 — nog niet geïmplementeerd |

---

## 6. Derde partijen

Lumio deelt geen persoonsgegevens met derde partijen. De database bevindt zich uitsluitend
op het apparaat van de gebruiker (local-first architectuur).

Uitzonderingen:
- **Analytische events** worden alleen als geanonimiseerde structuur-events gelogd (GUARD-006)
- **Nabestaanden HTML-export** bevat alleen de door de gebruiker geselecteerde subset

---

## 7. Open actiepunten

| ID | Omschrijving | Prioriteit | Sprint |
|----|-------------|-----------|--------|
| RP-001 | `DELETE /api/profiel` endpoint voor volledig recht op vergetelheid | HOOG | Maand 12 of eerder |
| RP-002 | Achtergrondtaak voor automatische AuditLog-rotatie (90 dagen) | MIDDEN | Maand 12 |
| RP-003 | Serilog destructuring policy: BSN en wachtwoorden nooit in logs | HOOG | Direct |
| RP-004 | DPO sign-off op dit document vereist voor productie-release | KRITISCH | Voor release |

---

## 8. Versiebeheer

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| 1.0 | 2026 | Initieel document — Maand 11 Backup + Data governance |
