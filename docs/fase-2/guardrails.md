# Guardrails – Fase 2 Techniek & Architectuur – 2026-03-02

## Metadata
- Fase: 2
- Datum: 2026-03-02
- Gebaseerd op: alle Fase 2 analyses + security-handoff-context.md

---

## Guardrail G-TECH-001

### Titel
Geen directe LumioDbContext-injectie in nieuwe controllers

### Scope
- Van toepassing op: alle nieuwe controllers in `src/Lumio.Api/Controllers/`; Implementation Agent (SP-12+)
- Tijdshorizon: Permanent (totdat Application Layer (REC-ARCH-001) volledig is)

### Regel
Mag niet: nieuwe controllers die `LumioDbContext` direct injecteren via constructor. Vereist: gebruik van een IRepository-interface of Application Service als tussenlaag.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-001`. PR/Review Agent blokkeert merge. Escaleer naar Orchestrator.

### Rationale
GAP-ARCH-001: directe DbContext-injectie in 34 controllers veroorzaakt DIP-schending en beperkt testbaarheid. Nieuwe code mag dit patroon niet verergeren.

### Verificatiemethode
CI-script: `grep -rn "LumioDbContext" src/Lumio.Api/Controllers/` — elke nieuwe match in een nieuw bestand dat na SP-11 is gecreëerd = GUARDRAIL_VIOLATION.

---

## Guardrail G-TECH-002

### Titel
CSP unsafe-inline: bilaterale constraint — niet uitbreiden EN niet verwijderen buiten SSR-migratietrack

### Scope
- Van toepassing op: `src/lumio-web/src/app/layout.tsx` en alle andere CSP-definities; Implementation Agent
- Tijdshorizon: Permanent (totdat SSR-migratie (REC-SEC-001/SP-15) is voltooid en nonce-based CSP actief is)

### Regel
**Twee verplichtingen (DEC-105 / SECURITY_FLAG: GAP-ARCH-002):**
1. Mag NIET: aanvullende inline `<script>` of `<style>` tags toevoegen. Mag NIET: `unsafe-inline` ook toevoegen aan `frame-src` of `connect-src`.
2. Mag OOK NIET: de bestaande `unsafe-inline` uit `script-src` verwijderen. Next.js static export vereist `unsafe-inline` voor hydration — verwijdering breekt de app.

De bestaande `unsafe-inline` in `script-src` op layout.tsx L44 is een **harde architectuurconstraint** (niet verwijderbaar zonder SP-15 SSR-migratie). Precies 1 treffer in layout.tsx is vereist.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-002`. PR/Review Agent blokkeert merge. Escaleer naar Security Architect.

### Rationale
SF-001 / A05 Security Misconfiguration. Elke uitbreiding van unsafe-inline vergroot het XSS-aanvalsoppervlak. Verwijdering buiten SSR-track breekt de applicatie volledig (DEC-105).

### Verificatiemethode
CI-script: `grep -c "unsafe-inline" src/lumio-web/src/app/layout.tsx` — mag precies 1 teruggeven. Meer = GUARDRAIL_VIOLATION (uitbreiding). Nul = GUARDRAIL_VIOLATION (verwijdering buiten SSR-track).

---

## Guardrail G-TECH-003

### Titel
Controller-tests vereist voor nieuwe controllers

### Scope
- Van toepassing op: elke nieuwe controller in `src/Lumio.Api/Controllers/`; PR/Review Agent; Implementation Agent
- Tijdshorizon: Permanent

### Regel
Vereist: elke nieuwe controller (nieuw bestand) MOET een bijbehorend testbestand hebben in `src/Lumio.Api.Tests/Controllers/` vóór merge naar main.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-003`. PR/Review Agent blokkeert merge.

### Rationale
GAP-DEV-001: 12% controller-testdekking. Nieuwe controllers zonder tests vergroot het ongeteste oppervlak verder.

### Verificatiemethode
PR/Review Agent: controleer of voor elk nieuw `*Controller.cs` een `*ControllerTests.cs` aanwezig is.

---

## Guardrail G-TECH-004

### Titel
ESLint design-system violations niet laten groeien

### Scope
- Van toepassing op: `src/lumio-web/src/` — alle componenten; Implementation Agent
- Tijdshorizon: Tot einde SP-13 (daarna: 0 allowed)

### Regel
Mag niet: het aantal `design-system/no-raw-colors` ESLint-overtredingen boven de baseline van 224 laten stijgen. Nieuwe bestanden mogen geen raw-color-klassen bevatten.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-004`. PR/Review Agent blokkeert merge als lint-count > 224.

### Rationale
GAP-DEV-002: 224 bestaande violations. Voorkomen dat de schuld verder groeit terwijl we de backlog opruimen.

### Verificatiemethode
CI `npm run lint` output: tel `design-system/no-raw-colors` errors. Meer dan 224 (huidige baseline) = GUARDRAIL_VIOLATION.

---

## Guardrail G-TECH-005

### Titel
Masterpassword mag niet als managed string worden opgeslagen

### Scope
- Van toepassing op: alle C# code in `src/Lumio.Api/`; Implementation Agent
- Tijdshorizon: Permanent

### Regel
Mag niet: het masterpassword opslaan als `string` buiten de `UsePassword()` callback-scope. Vereist: uitsluitend het `UsePassword(pw => { ... })`-patroon gebruiken voor elke cryptografische operatie.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-005`. CI GUARD-002 check blokkeert build.

### Rationale
IMPL-CONSTRAINT-005 / A02 Cryptographic Failures. SQLCipher-wachtwoord als managed .NET string = risico op geheugendump.

### Verificatiemethode
CI GUARD-002: `grep -r "string? CurrentPassword"` in C# sources = 0 matches. Aanvullend: code review checklist.

---

## Guardrail G-TECH-006

### Titel
API versioning verplicht voor nieuwe endpoints na SP-11

### Scope
- Van toepassing op: alle nieuwe of gewijzigde API-routes na SP-11; Implementation Agent
- Tijdshorizon: Na voltooiing SP-11-004

### Regel
Vereist: alle nieuwe API-endpoints MOETEN de prefix `/api/v1/` hanteren. Mag niet: nieuwe routes zonder versie-prefix naar main mergen nadat SP-11-004 is geimplementeerd.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-006`. PR/Review Agent blokkeert merge.

### Rationale
GAP-ARCH-003: geen API-versisstrategie. Consistente versioning voorkomt breaking changes voor toekomstige whitelabel-clients.

### Verificatiemethode
Code review: controleer route-attributen op aanwezigheid van `/api/v1/` prefix.

---

## Guardrail G-TECH-007

### Titel
TruffleHog secret scan als verplichte PR-gate

### Scope
- Van toepassing op: alle PRs naar main; vanaf SP-11-001
- Tijdshorizon: Permanent

### Regel
Mag niet: PR mergen naar main als TruffleHog job niet geslaagd is. Vereist: `secret-scan` job in `ci.yml` als required status check in branch protection settings.

### Schending Actie
Markeer als `GUARDRAIL_VIOLATION: G-TECH-007`. PR/Review Agent blokkeert merge.

### Rationale
IMPL-CONSTRAINT-003 / A08 Software/Data Integrity. App verwerkt bijzondere persoonsgegevens; accidenteel gecommittede secrets zijn een GDPR-datalek.

### Verificatiemethode
GitHub branch protection: `secret-scan` als required status; controleer bij elke sprint-review.

---

## HANDOFF CHECKLIST — Guardrails Fase 2
- [x] Alle guardrails testbaar geformuleerd
- [x] Schending-actie aanwezig per guardrail
- [x] Scope en tijdshorizon per guardrail gedocumenteerd
- [x] Rationale verwijst naar GAP/RISK/IMPL-CONSTRAINT
- [x] Verificatiemethode aanwezig per guardrail
- [x] Status: READY voor Critic validatie
