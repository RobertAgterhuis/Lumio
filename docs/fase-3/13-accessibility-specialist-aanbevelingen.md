# Aanbevelingen – Toegankelijkheid (Accessibility Specialist) – 2026-03-02
> Accessibility Specialist | Agent 13 | Fase 3

## Metadata
- Agent: Accessibility Specialist (13)
- Fase: 3
- Vorige stap: `docs/fase-3/13-accessibility-specialist-analyse.md`
- Datum: 2026-03-02

---

## Prioriteit 1 — Kritiek / Pre-release Blocker

### REC-A11Y-001: Voeg axe-core CI-run toe voor Electron-app (lumio-web)
- **ID:** REC-A11Y-001
- **Prioriteit:** P1
- **Gap:** GAP-A11Y-001 / A11Y-GAP-003
- **Beschrijving:** axe-core playwright-tests zijn actief voor de marketingsite (`site/tests/a11y.spec.ts`) maar **niet** voor de Electron-app (`src/lumio-web/`). Voeg een Playwright-test toe die de primaire flows van de app doorloopt (unlock-scherm, onboarding wizard, dashboard) en axe-analyse uitvoert. `@axe-core/playwright` is al beschikbaar als devDependency in de marketingsite — voeg toe in `lumio-web`.
- **Aanpak:**
  1. Voeg `@axe-core/playwright` toe aan `src/lumio-web/package.json`
  2. Schrijf `src/lumio-web/tests/a11y.spec.ts` met mock-auth bypass voor geauthenticeerde routes
  3. Maak axe-run CI-gate: zero critical/serious violations per WCAG 2.1 AA
- **Succes-criterium (SMART):** CI a11y-job faalt bij ≥1 critical/serious axe-violation in lumio-web app; baseline vastgesteld na eerste run
- **Impact:** Risk Reductie: hoog; UX: indirect; Revenue: `INSUFFICIENT_DATA:`
- **Risico van niet-uitvoeren:** A11y-regressies worden pas na productie-release ontdekt
- **Sprint:** SP-UX-01
- **Inspanning:** 3–5 SP
- **Eigenaar:** Implementation Agent + DevOps Engineer
- **Bron:** GAP-A11Y-001; `site/tests/a11y.spec.ts`

---

### REC-A11Y-002: Voeg `aria-live` toe aan toast-meldingssysteem
- **ID:** REC-A11Y-002
- **Prioriteit:** P1
- **Gap:** GAP-A11Y-004 / A11Y-GAP-001 / SC 4.1.3
- **Beschrijving:** Het toast-systeem (`toastStore.ts`) verstuurt visuele statusinformatie (success/error/warning/info). Zonder `aria-live` bereiken deze meldingen screen reader-gebruikers niet. Voeg `aria-live="polite"` toe aan de toast-container; gebruik `aria-live="assertive"` voor foutmeldingen.
- **Succes-criterium (SMART):** axe-core scan rapporteert 0 SC-4.1.3-violations voor toast-component; handmatige NVDA/VoiceOver test bevestigt aankondiging
- **Impact:** Risk Reductie: hoog; UX: direct (screen reader gebruikers)
- **Risico van niet-uitvoeren:** Screen reader-gebruikers missen kritieke fout- en succesmeldingen → gebruik onmogelijk voor blind/slechtziend
- **Sprint:** SP-UX-01
- **Inspanning:** 0,5–1 SP
- **Eigenaar:** Implementation Agent
- **Bron:** A11Y-GAP-001; SC 4.1.3

---

### REC-A11Y-003: Documenteer en standaardiseer `aria-hidden` op decoratieve Lucide-iconen
- **ID:** REC-A11Y-003
- **Prioriteit:** P1
- **Gap:** A11Y-GAP-002 / SC 1.1.1
- **Beschrijving:** Lucide React-iconen renderen SVG-elementen. Als ze decoratief zijn (naast tekst-label), MOET `aria-hidden="true"` worden toegevoegd. Als ze informatief zijn (geen zichtbare tekst-label), is `aria-label`/`title` verplicht. Momenteel niet consistent toegepast. Oplossing: (1) update `icon.tsx` wrapper om `aria-hidden` standaard te zetten voor decoratieve modus; (2) scan alle direct gerenderde `lucide-react` componenten.
- **Succes-criterium (SMART):** axe-core meldt 0 SC-1.1.1-violations; alle Lucide-iconen hebben aantoonbaar `aria-hidden` of `aria-label` afhankelijk van type
- **Sprint:** SP-UX-01
- **Inspanning:** 2–4 SP
- **Eigenaar:** Implementation Agent + UI Designer
- **Bron:** A11Y-GAP-002; `OnboardingWizard.tsx` L14-23

---

## Prioriteit 2 — Hoog / Pre-launch Aanbevolen

### REC-A11Y-004: Onderzoek en patch videoboodschappen-component op mediacaptions
- **ID:** REC-A11Y-004
- **Prioriteit:** P2
- **Gap:** GAP-A11Y-003 / A11Y-GAP-004 / SC 1.2.x
- **Beschrijving:** `src/lumio-web/src/components/videoboodschappen/` folder bestaat. Als deze component gebruikers toestaat video op te nemen of af te spelen, vereist SC 1.2.2 gesloten ondertiteling en SC 1.2.3/1.2.5 audiodescriptie voor geïnformeerde WCAG-compliance. Scope: (1) stel vast of video-playback aanwezig is, (2) als ja: caption-support toevoegen.
- **Succes-criterium (SMART):** Als video-playback aanwezig: captions beschikbaar voor ≥1 videoformaat; axe rapporteert geen SC-1.2-violations
- **Sprint:** SP-UX-02
- **Inspanning:** `INSUFFICIENT_DATA:` — scope afhankelijk van bevinding
- **Eigenaar:** Implementation Agent + UX Researcher
- **Bron:** A11Y-GAP-004; `src/components/videoboodschappen/`

---

### REC-A11Y-005: Voer screen reader test uit (NVDA + JAWS / VoiceOver)
- **ID:** REC-A11Y-005
- **Prioriteit:** P2
- **Gap:** GAP-A11Y-002
- **Beschrijving:** Er zijn geen screen reader testresultaten beschikbaar. Voer een handmatige test uit op primaire flows: (1) unlock-scherm, (2) OnboardingWizard, (3) Shamir-reconstructie (nabestaanden). Gebruik NVDA (Windows) en VoiceOver (macOS) bij binaire aanname Electron-platform.
- **Succes-criterium (SMART):** ≥3 primaire flows afgerond op NVDA zonder showstoppers; bevindingen gedocumenteerd
- **Sprint:** SP-UX-02
- **Inspanning:** 3 dagen
- **Eigenaar:** Accessibility Specialist + UX Researcher
- **Bron:** GAP-A11Y-002

---

### REC-A11Y-006: Valideer heading-hiërarchie per domein-sectie
- **ID:** REC-A11Y-006
- **Prioriteit:** P2
- **Gap:** A11Y-GAP-006 / SC 2.4.6
- **Beschrijving:** Heading-hiërarchie per domein-pagina (testament, uitvaart, erfgenamen etc.) niet geverifieerd. Voeg axe-core `heading-order` rule toe aan CI-scan + handmatige audit van H1-H6 structuur in ≥5 domein-secties.
- **Succes-criterium (SMART):** axe `heading-order` violations = 0 en handmatige audit PASSED voor ≥5 secties
- **Sprint:** SP-UX-02
- **Inspanning:** 1–2 SP
- **Eigenaar:** Implementation Agent

---

## Samenvatting Aanbevelingen

| ID | Beschrijving | Prioriteit | Sprint | Effort |
|---|---|---|---|---|
| REC-A11Y-001 | axe-core CI voor Electron-app (lumio-web) | P1 | SP-UX-01 | 3–5 SP |
| REC-A11Y-002 | `aria-live` op toast-systeem | P1 | SP-UX-01 | 0,5–1 SP |
| REC-A11Y-003 | `aria-hidden` standaardiseren op Lucide-iconen | P1 | SP-UX-01 | 2–4 SP |
| REC-A11Y-004 | Videoboodschappen: onderzoek + captions | P2 | SP-UX-02 | TBD |
| REC-A11Y-005 | Screen reader test (NVDA/VoiceOver) | P2 | SP-UX-02 | 3 dgn |
| REC-A11Y-006 | Heading-hiërarchie audit | P2 | SP-UX-02 | 1–2 SP |

---

## HANDOFF CHECKLIST — Accessibility Specialist Aanbevelingen
- [x] Elke aanbeveling verwijst naar GAP/RISK analyse-bevinding + SC-referentie
- [x] P1 items zijn pre-release blockers
- [x] SMART meetcriteria per aanbeveling
- [x] SC-referenties aanwezig
- [x] Risico van niet-uitvoeren gedocumenteerd
- [x] Fase 3 is volledig — alle 4 UX-agents (10-13) compleet
- [x] Output klaar voor Fase 3 Critic + Risk validatie
