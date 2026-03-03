# Heading-Hiërarchie Audit — SP-UX-02-006

**Datum:** 2026-03-04  
**Auditor:** Implementation Agent (SP-UX-02)  
**Context:** REC-A11Y-006 — axe `heading-order` rule + handmatige inspectie  
**WCAG-referentie:** Technique H69 (Providing heading elements at the beginning of each section of content)  
**Scope:** 5 primaire secties van de lumio-web applicatie

---

## Methodologie

1. **Geautomatiseerd:** Scan van alle `.tsx`-bestanden in `src/lumio-web/src/` op heading-elementen (h1–h6)
2. **Handmatig:** Visuele inspectie van DOM-volgorde per sectie op basis van broncode
3. **Axe configuratie:** `heading-order` rule ingeschakeld in `.storybook/preview.ts`

---

## Resultaten per sectie

### Sectie 1 — Onboarding Wizard

| Component | Regel | Huidig niveau | Verwacht | Status |
|---|---|---|---|---|
| `WizardShell.tsx:92` | Shell wrapper | h2 | h2 (dialoog-context) | ✅ OK |
| `OnboardingWizardModal.tsx:97` | Modal title | h2 | h2 (dialoog-context) | ✅ OK |

**Bevinding:** Wizard is een modaal venster. Modaal-headings mogen h2 zijn (de achterliggende pagina heeft de h1). Geen schending van heading-order.

---

### Sectie 2 — Dashboard

| Component | Regel | Huidig niveau | Verwacht | Status |
|---|---|---|---|---|
| `dashboard/page.tsx:317` | Paginatitel | h1 | h1 | ✅ OK |
| `dashboard/page.tsx:342` | Sectietitel | h2 | h2 | ✅ OK |
| `StatistiekenWidget.tsx:151` | Widget-titel | h2 | h2 | ✅ OK |
| `VoortgangGranulair.tsx:41` | Widget-titel | h2 | h2 | ✅ OK |

**Bevinding:** Perfecte heading-hiërarchie. Geen schendingen.

---

### Sectie 3 — Profiel (eigenaar)

| Component | Regel | Oud niveau | Nieuw niveau | Status |
|---|---|---|---|---|
| `eigenaar/page.tsx:269` | Paginatitel | h1 | h1 | ✅ OK |
| `eigenaar/page.tsx:296` | Profielfoto-kaart | **h3** | **h2** | ✅ GEFIXED (SP-UX-02-006) |
| `eigenaar/page.tsx:367` | Persoonsgegevens-kaart | **h3** | **h2** | ✅ GEFIXED (SP-UX-02-006) |
| `eigenaar/page.tsx:473` | Burgerlijke Staat-kaart | **h3** | **h2** | ✅ GEFIXED (SP-UX-02-006) |
| `eigenaar/page.tsx:528` | Identificatie-kaart | **h3** | **h2** | ✅ GEFIXED (SP-UX-02-006) |
| `eigenaar/page.tsx:586` | Notaris-kaart | **h3** | **h2** | ✅ GEFIXED (SP-UX-02-006) |

**Bevinding vóór fix:** h1 → h3 is een schending van `heading-order` (axe: "Heading levels should only increase by one"). Vijf kaart-sectietitels sloegen h2 over.  
**Fix:** Alle 5 secties gewijzigd van `<h3>` naar `<h2>` in commit `[zie commit hash]`.

---

### Sectie 4 — Nabestaanden

| Component | Regel | Huidig niveau | Verwacht | Status |
|---|---|---|---|---|
| `NabestaandenDashboard.tsx:291` | Paginatitel | h1 | h1 | ✅ OK |
| `NabestaandenDashboard.tsx:346` | Sectietitel | h2 | h2 | ✅ OK |
| `NabestaandenDashboard.tsx:373` | Fase-heading | h2 `id={fase-h-...}` | h2 | ✅ OK |

**Bevinding:** Korrekte heading-hiërarchie. Geen schendingen.

---

### Sectie 5 — Videoboodschappen

| Component | Regel | Huidig niveau | Verwacht | Status |
|---|---|---|---|---|
| `videoboodschappen/page.tsx:175` | Paginatitel | h1 | h1 | ✅ OK |

**Bevinding:** Enkel een h1 aanwezig op de pagina. Geen subsectie-headings — acceptabel zolang de pagina-structuur geen subheadings vereist.

---

## Sidebar — Aanvullende bevinding (buiten de 5 secties)

| Component | Regel | Huidig niveau | Aanbeveling | Status |
|---|---|---|---|---|
| `Sidebar.tsx:133` | App-branding "Lumio" | h1 | Gebruik `<p>` of `<span>` | ✅ GEFIXED (SP-UX-03-002, DEC-107) |
| `Sidebar.tsx:150` | Navigatiegroepen | h2 (inside `<nav>`) | h2 is OK binnen nav-sectioning | ✅ OK |

**Bevinding:** De Sidebar rendert `<h1>Lumio</h1>` als app-branding. Elke authenticated pagina bevat daardoor twee h1-elementen (sidebar + pagina-content). Dit schendt de `page-has-heading-one` best-practice (niet hetezlfde als `heading-order`). Actie vereist als apart issue.

**Escalatie:** Aangemaakt als follow-up item — zie [#SIDEBAR-H1-TODO] in docs/decisions.md.

---

## Wijzigingen uitgevoerd (SP-UX-02-006)

| Bestand | Type wijziging | Beschrijving |
|---|---|---|
| `src/lumio-web/src/app/(authenticated)/eigenaar/page.tsx` | Fix | 5× h3 → h2 (card-sectietitels) |
| `src/lumio-web/.storybook/preview.ts` | Config | `heading-order` axe-rule expliciet ingeschakeld |

---

## Openstaande items (out-of-scope)

De volgende patronen zijn ook gevonden in andere pagina's maar vallen buiten de 5 gedefinieerde secties:

| Pagina | Schending | Aanbeveling |
|---|---|---|
| `boedel/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `donor/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `documenten/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `erfgenamen/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `euthanasie/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `export/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `noodcontacten/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |
| `uitvaart/page.tsx` | h1 → h3 | h3 → h2 | ✅ GEFIXED (SP-UX-03-002) |

**Aanbeveling:** Aanmaken van SP-UX-03 story "Heading-hiërarchie systeembrede fix" voor alle resterende pagina's. Schatting: 1–2 SP.

---

## Conclusie

- **5 van 5 geselecteerde secties** geïnspecteerd
- **1 sectie (profiel)** had 5 schendingen → **alle 5 gefixed**
- **4 secties** hadden geen schendingen
- Axe `heading-order` geconfigureerd in Storybook
- Systeembrede fix van overige pagina's aanbevolen in SP-UX-03
