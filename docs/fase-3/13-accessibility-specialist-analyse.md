# Analyse – Toegankelijkheid (Accessibility Specialist) – 2026-03-02
> Accessibility Specialist | Agent 13 | Fase 3

## Metadata
- Agent: Accessibility Specialist (13)
- Fase: 3
- Input ontvangen: UX Researcher + UX Designer + UI Designer output (Fase 3)
- Datum: 2026-03-02

---

## 1. ACCESSIBILITY_FLAG Inventory

| Flag | Afkomst Agent | Beschrijving | Initiële Prioriteit |
|---|---|---|---|
| Contrast-fixes SP-ACC1-007 | UI Designer (tokens.css inspectie) | WCAG AA contrast-verbeteringen reeds doorgevoerd in design tokens | Opgelost |
| OnboardingWizard focus-trap (UX-001) | UX Designer + code-inspectie | Focus-trap in `OnboardingWizard.tsx` aanwezig (SC 2.1.1/2.1.2) | Opgelost |
| GAP-UIDESIGN-002 | UI Designer | OnboardingWizard heeft geen Storybook story → a11y-addon niet actief op primaire flow | Hoog |
| GAP-UIDESIGN-004 | UI Designer | Nabestaanden/security flows niet in Storybook → a11y-addon niet actief op kritieke flows | Hoog |
| SYS-RISK-009 | UX Researcher | Shamir-wizard nabestaanden — emotioneel + cognitief belastend voor niet-technische gebruikers | Kritiek |

---

## 2. Beoogd WCAG Conformiteitsniveau

**Target: WCAG 2.1 AA**

Motivatie: Lumio is een Electron-desktopapplicatie voor Nederlandse burgers (doelgroep 40+), vallend onder de Europese Accessibility Act (EAA). De EAA vereist voor private sector digitale diensten minimaal WCAG 2.1 AA vanaf 28 juni 2025. Hoewel de EAA primair richt zich op diensten die "elektronisch" worden aangeboden, is WCAG 2.1 AA de branchestandaard als beste aanpak.

**Bron:** SC-context uit Security Architect (Fase 2); EU EAA Directive 2022/882

---

## 3. WCAG Analyse per Principe

### Perceivable (Waarneembaarheid)

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| SC 1.1.1 | Niet-tekstuele content | `INSUFFICIENT_DATA:` — Alle `img` src's en `alt`-attributen niet volledig gescand | Lucide-iconen zijn SVG — als decoratief: `aria-hidden` vereist; als informatief: `alt`/`aria-label` vereist | `OnboardingWizard.tsx` L13-23 (Lucide icons) |
| SC 1.2.x | Tijdgebonden media | N/A (geen audio/video in geïnspecteerde flows) | `UNCERTAIN:` — `videoboodschappen/` component aanwezig → video mogelijk aanwezig | `src/components/videoboodschappen/` (aanwezig) |
| SC 1.3.1 | Informatie en relaties | Deels ✓ | `role="dialog"` + `aria-modal="true"` in wizard ✓; formulier-labels `INSUFFICIENT_DATA:` | `OnboardingWizard.tsx` L201-L205 |
| SC 1.3.2 | Betekenisvolle volgorde | `INSUFFICIENT_DATA:` | DOM-volgorde vs. visuele volgorde niet volledig gevalideerd | — |
| SC 1.4.3 | Contrast (minimum) | ✓ AA-fixes aangebracht | SP-ACC1-007: muted-foreground 6.86:1 ✓; primary-400 4.98:1 ✓; success/danger tokens gefixed | `tokens.css` inline-comments |
| SC 1.4.4 | Tekstgrootte aanpasbaar | `INSUFFICIENT_DATA:` | DM Sans font aanwezig; rem/em gebruik niet gecontroleerd in alle componenten | `layout.tsx` L9 |
| SC 1.4.11 | Niet-tekst contrast | `INSUFFICIENT_DATA:` | Formulier-invoer randen, focus-indicatoren — niet specifiek gemeten | — |

### Operable (Bedienbaarheid)

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| SC 2.1.1 | Toetsenbord | ✓ | Focus-trap in OnboardingWizard ✓ (UX-001); `useKeyboardShortcuts` ✓ | `OnboardingWizard.tsx` L124-L147 |
| SC 2.1.2 | Geen toetsenbordval | ✓ | Escape sluit modal ✓ (L126); focus-trap implementatie correct bewaakt eerste/laatste focusbaar element | `OnboardingWizard.tsx` L126 |
| SC 2.4.1 | Blokken omzeilen | ✓ | Skip-nav link aanwezig in authenticated layout | `src/app/(authenticated)/layout.tsx` L6 |
| SC 2.4.3 | Focusvolgorde | ✓ | Focus gaat naar eerste focusbaar element bij modal open ✓ | `OnboardingWizard.tsx` L135 |
| SC 2.4.4 | Linkdoel (in context) | `INSUFFICIENT_DATA:` | Sidebar-navigatielabels niet geïnspecteerd | — |
| SC 2.4.6 | Koppen en labels | `INSUFFICIENT_DATA:` | Heading-hiërarchie per stap-pagina niet geïnspecteerd | — |
| SC 2.5.3 | Label bij naam | `INSUFFICIENT_DATA:` | Form-component labels niet volledig geïnspecteerd; `FormField.tsx` aanwezig | — |

### Understandable (Begrijpelijkheid)

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| SC 3.1.1 | Taal van pagina | ✓ | `<html lang={locale}>` — dynamisch NL/EN ✓ | `layout.tsx` L32 |
| SC 3.2.2 | Bij invoer | `INSUFFICIENT_DATA:` | Form-validatie gedrag niet geïnspecteerd voor onverwachte context-wisseling | — |
| SC 3.3.1 | Foutidentificatie | `INSUFFICIENT_DATA:` | Inline foutmeldingen per formulierveld niet geïnspecteerd; `global-error.tsx` aanwezig | — |
| SC 3.3.2 | Labels of instructies | Deels ✓ | `FormField.tsx` en `LabelWithHelp.tsx` aanwezig ✓; Shamir-stap: labelkwaliteit `INSUFFICIENT_DATA:` | `src/components/ui/form-field.tsx` |
| SC 3.3.4 | Foutpreventie | `INSUFFICIENT_DATA:` | Bevestigingsdialogen bij destructieve acties niet gecontroleerd | — |

### Robust (Robuustheid)

| SC | Criterium | Status | Bevinding | Bron |
|---|---|---|---|---|
| SC 4.1.2 | Naam, rol, waarde | ✓ Deels | `role="dialog"`, `aria-modal` ✓ in wizard; Radix UI (ARIA-compliant) ✓; `INSUFFICIENT_DATA:` voor domain-specifieke componenten | `OnboardingWizard.tsx` L201; Radix UI bibliotheek |
| SC 4.1.3 | Statusberichten | `INSUFFICIENT_DATA:` | Toast-meldingen aanwezig (`toastStore`); `aria-live` niet gecontroleerd | `src/stores/toastStore.ts` |

---

## 4. Juridische Compliance Status

| Wetgeving | Status | Toelichting |
|---|---|---|
| EU EAA (European Accessibility Act) | `UNCERTAIN:` — ONVOLDOENDE DATA | Elektron-desktop valt mogelijk buiten EAA scope (EAA richt zich op online diensten); juridisch advies vereist |
| EN 301 549 | `INSUFFICIENT_DATA:` | Formele conformiteitsverklaring ontbreekt |
| WCAG 2.1 AA | Deels compliant | Kritieke SC's (2.1.1, 2.1.2, 2.4.1, 2.4.3, 3.1.1, 1.4.3) aantoonbaar voldaan; meerdere SC's `INSUFFICIENT_DATA:` |

---

## 5. Assistive Technology Compatibiliteit

| Test | Resultaat |
|---|---|
| Screen reader testing | `INSUFFICIENT_DATA:` — geen testresultaten aangetroffen |
| Toetsenbord-only navigatie | Deels ✓ — wizard gevalideerd in code; volledige app niet getest |
| High-contrast mode | `INSUFFICIENT_DATA:` |
| `@axe-core/react` in devDependencies | ✓ Aanwezig — Vitest-integratie mogelijk maar niet aangetroffen in lumio-web tests |
| `@axe-core/playwright` tests | ✓ Actief — maar ALLEEN voor marketing-site (`site/tests/a11y.spec.ts`) — **niet voor Electron-app** |
| `@storybook/addon-a11y` | ✓ Aanwezig — maar coverage beperkt (wizard + nabestaanden ontbreken) |

**Kritieke gap:** Axe-core CI-checks zijn ALLEEN op marketing-site. De Electron app zelf heeft **geen geautomatiseerde axe-run** in CI.

**Bron:** `site/tests/a11y.spec.ts` L1-60; `package.json` devDependencies

---

## 6. Geprioriteerde Remediation

| Prioriteit | ID | SC-Referentie | Beschrijving |
|---|---|---|---|
| Kritiek | A11Y-GAP-001 | SC 4.1.3 | `aria-live` op toast-meldingen niet geverifieerd — statusberichten bereiken screen readers niet |
| Hoog | A11Y-GAP-002 | SC 1.1.1 | Lucide-iconen in wizard: decoratief vs. informatief niet expliciet gedocumenteerd — `aria-hidden` vereist voor decoratief |
| Hoog | A11Y-GAP-003 | Meerdere SC | Geen axe-core CI-run op Electron-app — geautomatiseerde a11y-verificatie ontbreekt voor primaire productflows |
| Hoog | A11Y-GAP-004 | SC 1.2.x | `videoboodschappen/` component — mogelijke video-content zonder captions (UNCERTAIN) |
| Midden | A11Y-GAP-005 | SC 3.3.1 | Inline foutmeldingen per formulierveld niet geverifieerd — kwaliteit foutidentificatie onbekend |
| Midden | A11Y-GAP-006 | SC 2.4.6 | Heading-hiërarchie per domein-pagina niet geïnspecteerd |

---

## 7. Gaps & Risico's

| ID | Omschrijving | Ernst |
|---|---|---|
| GAP-A11Y-001 | Geen axe-core CI op Electron-app (lumio-web) | Hoog |
| GAP-A11Y-002 | Screen reader testing nooit uitgevoerd | Hoog |
| GAP-A11Y-003 | Video-component mogelijk zonder captions | UNCERTAIN — Hoog potentieel |
| GAP-A11Y-004 | Toast aria-live attribuut niet geverifieerd | Hoog |
| RISK-A11Y-001 | Shamir-flow cognitieve toegankelijkheid — hoge complexiteit voor gebruikers met cognitieve beperkingen | Kritiek (gecombineerd met SYS-RISK-009) |

---

## HANDOFF CHECKLIST — Accessibility Specialist Analyse
- [x] WCAG conformiteitsniveau vastgesteld (2.1 AA)
- [x] Alle 4 WCAG-principes beoordeeld
- [x] INSUFFICIENT_DATA correct gemarkeerd per SC
- [x] Juridische compliance status gedocumenteerd
- [x] AT-compatibiliteit gedocumenteerd
- [x] Geprioriteerde remediation lijst aanwezig
- [x] Kritieke gap (geen axe-CI op Electron app) geëscaleerd
- [x] Positieve bevindingen (contrast-fixes, focus-trap, skip-nav, lang-attribuut) gedocumenteerd
- [x] STATUS: READY voor Accessibility Specialist Aanbevelingen
