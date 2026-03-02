# Aanbevelingen – UI Design (UI Designer) – 2026-03-02
> UI Designer | Agent 12 | Fase 3

## Metadata
- Agent: UI Designer (12)
- Fase: 3
- Vorige stap: `docs/fase-3/12-ui-designer-analyse.md`
- Datum: 2026-03-02

---

## Prioriteit 1 — Kritiek

### REC-UIDESIGN-001: Herstel 224 `design-system/no-raw-colors` violations
- **ID:** REC-UIDESIGN-001
- **Prioriteit:** P1
- **Gap:** GAP-UIDESIGN-001 / RISK-UIDESIGN-001
- **Beschrijving:** 224 componenten gebruiken raw hex-kleurwaarden in plaats van design-tokens. Dit blokkeert: (1) donker-modus correctheid, (2) whitelabel-functionaliteit, (3) toekomstige merkwijzigingen. Bekende aanpak: iteratieve vervangingsrun (`grep -r "text-\[#" --include="*.tsx"`) per domeinmap.
- **Aanpak per batch (conform Fase 2 sprintplan REC-DEV-002):**
  - Sprint SP-12: Eerste 50% violations (domein-componenten met hoogste gebruiksfrequentie)
  - Sprint SP-13: Resterende 50%
  - ESLint-run na elke batch: nul nieuwe violations
- **Succes-criterium (SMART):** ESLint `no-raw-colors` violations = 0 na sprint SP-13; baseline is 224 (vastgesteld)
- **Impact:** Risk Reductie: hoog (whitelabel-blocker); UX: midden; Brand: hoog
- **Risico van niet-uitvoeren:** Whitelabel-product levert visuele inconsistentie → merkschadelijke productleveringen
- **Sprint:** SP-12 (50%) + SP-13 (50%) — conform bestaand Fase 2 sprintplan
- **Inspanning:** 8–16 SP (conform Fase 2 REC-DEV-002 estimate, team-afhankelijk)
- **Bron:** `eslint-out.txt`; GAP-UIDESIGN-001

---

## Prioriteit 2 — Hoog

### REC-UIDESIGN-002: Voeg OnboardingWizard Storybook-story toe
- **ID:** REC-UIDESIGN-002
- **Prioriteit:** P2
- **Gap:** GAP-UIDESIGN-002
- **Beschrijving:** De primaire onboarding-flow (`OnboardingWizard.tsx`, 331 regels) heeft geen Storybook-story. Dit is de meest gebruikt user-interactie bij eerste gebruik. Voeg een story toe met mock-data voor alle 7 stap-staten (0/7 t/m 7/7 voltooid) inclusief accessibility-annotaties.
- **Succes-criterium (SMART):** Story aanwezig met ≥3 story-varianten (empty, partial, complete) + a11y-addon check PASSED
- **Sprint:** SP-UX-01
- **Inspanning:** 1–2 SP
- **Eigenaar:** UI Designer + Implementation Agent
- **Bron:** `OnboardingWizard.tsx`; GAP-UIDESIGN-002

---

### REC-UIDESIGN-003: Documenteer Nabestaanden + Security componenten in Storybook
- **ID:** REC-UIDESIGN-003
- **Prioriteit:** P2
- **Gap:** GAP-UIDESIGN-004
- **Beschrijving:** De `nabestaanden/` en `security/` componenten zijn niet in Storybook gedocumenteerd. Dit zijn risico-kritieke flows (Shamir-reconstructie). Storybook-documentatie maakt: (1) isolated testing mogelijk, (2) a11y-audit door Accessibility Specialist tractatie, (3) regression-detectie.
- **Succes-criterium (SMART):** ShamirDialog en nabestaanden-entry component beschikbaar in Storybook met ≥2 varianten
- **Sprint:** SP-UX-02
- **Inspanning:** 2–3 SP
- **Eigenaar:** UI Designer + Implementation Agent
- **Bron:** GAP-UIDESIGN-004; SYS-RISK-009

---

### REC-UIDESIGN-004: Heractiveeer Chromatic visual regression testing (beslissing DEC-101 herbeoordelen)
- **ID:** REC-UIDESIGN-004
- **Prioriteit:** P2
- **Gap:** GAP-UIDESIGN-003
- **Beschrijving:** Chromatic is uitgeschakeld (DEC-101). Zonder visual regression testing kan een designtoken-wijziging stille regressies introduceren. Herbeoordeel DEC-101: als kostenbezwaar is, onderzoek self-hosted alternatief (reg.ci, lost-pixel, backstop.js). Anders: activeer Chromatic met free tier voor critical stories only.
- **Succes-criterium (SMART):** Visual regression CI-check actief op ≥10 kritieke stories (incl. OnboardingWizard, Button, Alert)
- **Sprint:** SP-UX-02
- **Inspanning:** 2–4 SP (afhankelijk van Chromatic vs. alternatief keuze)
- **Eigenaar:** DevOps Engineer + UI Designer
- **Bron:** GAP-UIDESIGN-003; `chromatic.config.json` (DEC-101)

---

## Samenvatting Aanbevelingen

| ID | Beschrijving | Prioriteit | Sprint | Effort |
|---|---|---|---|---|
| REC-UIDESIGN-001 | 224 raw-color violations herstellen | P1 | SP-12+SP-13 | 8–16 SP |
| REC-UIDESIGN-002 | OnboardingWizard Storybook-story | P2 | SP-UX-01 | 1–2 SP |
| REC-UIDESIGN-003 | Nabestaanden/Security in Storybook | P2 | SP-UX-02 | 2–3 SP |
| REC-UIDESIGN-004 | Visual regression testing (Chromatic/alternatief) | P2 | SP-UX-02 | 2–4 SP |

---

## HANDOFF CHECKLIST — UI Designer Aanbevelingen
- [x] Elke aanbeveling verwijst naar GAP/RISK analyse-bevinding
- [x] P1 item (224 violations) sluit aan op Fase 2 sprintplan (REC-DEV-002)
- [x] SMART meetcriteria per aanbeveling
- [x] Risico van niet-uitvoeren gedocumenteerd
- [x] Whitelabel-risico geëscaleerd
- [x] Output klaar als input voor Accessibility Specialist (13)
