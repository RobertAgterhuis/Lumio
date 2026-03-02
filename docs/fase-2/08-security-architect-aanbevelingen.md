# Aanbevelingen – Security (Security Architect) – 2026-03-02
> Security Architect | Agent 08 | Fase 2

## Metadata
- Agent: Security Architect (08)
- Fase: 2
- Gebaseerd op analyse: `docs/fase-2/08-security-architect-analyse.md`
- Datum: 2026-03-02

---

## Aanbeveling REC-SEC-001

> ⚠️ **GECORRIGEERD 2026-03-02 — SECURITY_FLAG: GAP-ARCH-002 — DEC-105**
> `unsafe-inline` in de huidige CSP is een **harde architectuurconstraint**, GEEN actief sprint-target.
> Next.js `output: "export"` (static export) injecteert inline hydration scripts bij build-time.
> **Verwijdering van `unsafe-inline` breekt de applicatie volledig.** Dit is bevestigd door de product owner.
> De `unsafe-inline` MOET aanwezig blijven totdat de volledige SSR-migratie (SP-15, hieronder) is uitgevoerd.
> **Huidige sprintprioriteit: UITGESTELD tot SP-15. Niet uitvoeren vóór SP-15 is gestart.**

### Probleem
CSP `script-src 'unsafe-inline'` is vereist door de statische Next.js export (`output: "export"`), waardoor XSS-aanvallen via inline-scripts niet geblokkeerd worden. De TODO in `layout.tsx:44` bevestigt dit als bekende schuld.  
**Analyse referentie:** A05 Security Misconfiguration, SF-001, GAP-ARCH-002

### Oplossing
Migreer van statische Next.js export naar een **Next.js SSR-modus** (Server-Side Rendering), zodat de API-server per request een nonce kan genereren en `script-src 'nonce-{randomvalue}'` kan toepassen in plaats van `'unsafe-inline'`.

**Implementatie-aanpak:**
1. Verwijder `output: "export"` uit `next.config.ts`.
2. Configureer de .NET API als reverse proxy + nonce-injectie middleware voor Next.js requests.
3. Pas `layout.tsx` aan: verwijder de hardcoded CSP meta-tag en gebruik Next.js `headers()` API met een nonce.
4. Update `ci.yml` frontend-job: verwijder `npm run build` static export stap; vervang door SSR-build validatie.
5. Test alle Electron-renderer routes na migratie.

**Afhankelijkheden:**
- Dit is een architecturale wijziging; vereist REC-ARCH-002 als context.
- Coordinator: Software Architect agent dient mee te worden genomen.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Neutraal | Geen directe impact |
| Risk Reductie | Hoog — elimineert de grootste CSP-zwakte | Nonce-based CSP is de industry-standaard voor Electron-apps met webviews |
| Cost | Negatief — significant architecturaal werk (~30-60 uur) | Statische export naar SSR is een grote migratie |
| UX | Neutraal — geen zichtbare UX-impact | Transparant voor eindgebruiker |

### Risico's van niet uitvoeren
`'unsafe-inline'` staat elk inline script toe te draaien. In combinatie met een XSS-kwetsbaarheid (bijv. via gemanipuleerde gebruikersinvoer die in de DOM terechtkomt) kan een aanvaller willekeurige code uitvoeren in de Electron-renderer—met potentieel toegang tot lokale bestanden via de IPC bridge.

### Meetcriterium
- KPI: CSP bevat geen `'unsafe-inline'` in `script-src` (binair)
- Baseline: `unsafe-inline` aanwezig (`layout.tsx` L44)
- Target: Nonce-based CSP actief voor alle pagina's
- Meetmethode: CSP-header scan via `curl -I` op elke route; CSP-evaluator (Google CSP Evaluator)
- Tijdshorizon: SP-14 (na Application Layer introductie SP-12-14)

---

## Aanbeveling REC-SEC-002

### Probleem
TruffleHog geheime scan ontbreekt volledig in CI/CD. Secrets kunnen ongedetecteerd naar de git-repository worden gepusht.  
**Analyse referentie:** A08, SF-005, GAP-DEVOPS-002, CRITICAL_GAP

### Oplossing
Voeg TruffleHog GitHub Action toe aan `ci.yml` als blokkerende CI-stap. (Zie ook REC-DEVOPS-002 — concrete implementatie staat daar beschreven.)

**Bron-koppeling:** REC-DEVOPS-002 bevat de exacte YAML. Deze aanbeveling herbevestigt de **security-prioriteit**: dit is niet optioneel voor een app die bijzondere persoonsgegevens beheert.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Neutraal | — |
| Risk Reductie | Hoog — gecommittede secrets (DB-wachtwoorden, PostHog keys) automatisch gedetecteerd | GDPR data breach risico gereduceerd |
| Cost | Neutraal — gratis GitHub Action | — |
| UX | Neutraal | — |

### Meetcriterium
- KPI: TruffleHog job aanwezig en blokkerend in CI (binair)
- Baseline: Nee
- Target: Ja, actief op elke PR
- Meetmethode: `.github/workflows/ci.yml` bevat `secret-scan` job
- Tijdshorizon: SP-11

---

## Aanbeveling REC-SEC-003

### Probleem
`IMasterPasswordService` heeft geen automatische session timeout. Een ontgrendeld Lumio-proces dat onbeheerd achterblijft, blijft toegankelijk totdat het Electron-window handmatig sluit.  
**Analyse referentie:** IAM analyse, GAP-SEC-001

### Oplossing
Implementeer een **inactiviteits-timer** in de Electron-main-process die na X minuten inactiviteit automatisch de `POST /api/setup/lock` aanroept. De timer wordt gereset bij elke muisbeweging of toetsaanslag.

**Implementatie-aanpak:**
1. Voeg inactiviteitsdetectie toe in `lumio-desktop/src/main/` (Electron `powerMonitor` of custom idle timer).
2. Maak de timeout configureerbaar (standaard: 15 minuten, minimum: 5 minuten).
3. Sla de voorkeur op in de profiel-instellingen in SQLite.
4. Toon een duidelijke lock-screen UI bij auto-lock (UX vereiste voor Accessibility).

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | INSUFFICIENT_DATA: | Geen directe impact |
| Risk Reductie | Midden — verkleint window of exposure bij onbeheerd apparaat | Relevant voor shared workstations |
| Cost | Negatief initieel (~8-16 uur implementatie) | — |
| UX | Licht negatief — gebruiker moet opnieuw inloggen na inactiviteit | Verzacht door duidelijke UX-communiatie |

### Meetcriterium
- KPI: Auto-lock functionaliteit aanwezig + configureerbaar (binair)
- Baseline: Nee
- Target: Ja, default 15 minuten, configureerbaar 5-60 min
- Meetmethode: Integratie-test: na X minuten inactiviteit via `POST /api/setup/lock` — DB gelocked
- Tijdshorizon: SP-12

---

## Aanbeveling REC-SEC-004

### Probleem
Geen penetratietest uitgevoerd vóór v1.0 release. De cryptografische implementatie (SQLCipher + PBKDF2 + Shamir) is niet extern gevalideerd.  
**Analyse referentie:** HIGH_PRIORITY_GAP penetratietest

### Oplossing
Laat een **gericht penetratietestonderzoek** uitvoeren vóór de publieke v1.0 release, met focus op: (1) masterpassword-flow en SQLCipher-implementatie, (2) LocalOriginValidation middleware bypass, (3) Shamir key recovery flow, (4) Electron IPC bridge exposure.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Positief — pentest-status is selling point bij zakelijke klanten | Verzekeringsmaatschappijen en zorgaanbieders eisen pentests |
| Risk Reductie | Hoog — onbekende kwetsbaarheden in crypto-implementatie blootgelegd | SQLCipher-misconfigurations zijn moeilijk te detecteren zonder specifieke tooling |
| Cost | Negatief — €3.000-8.000 voor gerichte pentest | INSUFFICIENT_DATA: exacte prijs afhankelijk van scope en leverancier |
| UX | Neutraal | — |

### Meetcriterium
- KPI: Pentest-rapport beschikbaar (< 12 maanden oud) (binair)
- Baseline: Nee
- Target: Pentest-rapport aanwezig in `docs/security/pentest-report-[datum].md` voor v1.0 release
- Meetmethode: Bestandscheck + release-gate in `release.yml`
- Tijdshorizon: SP-14 (vóór v1.0 public release)

---

## PRIORITEITENMATRIX

| Aanbeveling ID | Impact | Effort | Prioriteit | Sprint |
|----------------|--------|--------|------------|--------|
| REC-SEC-002 (TruffleHog CI) | Hoog | Laag | P1 | SP-11 |
| REC-SEC-003 (Session timeout) | Midden | Midden | P1 | SP-12 |
| REC-SEC-001 (CSP unsafe-inline) | Hoog | Hoog | **UITGESTELD (DEC-105) — SP-15 na SSR-migratie** |
| REC-SEC-004 (Pentest) | Hoog | Hoog | P2 | SP-14 (release-gate) |

---

## HANDOFF CHECKLIST — Aanbevelingen Security Architect
- [x] Alle aanbevelingen verwijzen naar analyse-bevindingen (GAP/RISK referenties)
- [x] Impacts hebben rationale of INSUFFICIENT_DATA markering
- [x] Meetcriteria SMART
- [x] Prioriteitenmatrix volledig
- [x] Security Handoff Context aangemaakt (`docs/security/security-handoff-context.md`)
- [x] Status: READY voor Data Architect
