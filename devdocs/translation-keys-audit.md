# Translation Keys Audit — Missing & Mismatched Keys

**Date:** 2025-07-15  
**Scope:** `src/lumio-web` — next-intl namespace loading & key accuracy  
**Status:** ACTION REQUIRED

---

## Executive Summary

Two categories of translation issues found:

| Category | Issues | Broken keys |
|---|---|---|
| **A — Namespace loading gaps** | 8 cross-domain issues | ~all keys of 7 namespaces on 14+ pages |
| **B — Translation key mismatches** | 20 keys in `voorbeeldData` | raw key fallback even when namespace is loaded |

**Root cause:** Domain layouts each load exactly one JSON file via `DomainMessagesProvider`, but several shared components use namespaces from *other* JSON files that are never loaded on those routes.

---

## How Namespace Loading Works

```
Root (all pages):  shared.json + ui.json + auth.json + dashboard.json
Per-route:         layout.tsx wraps children in DomainMessagesProvider with ONE domain JSON
```

| Route | JSON loaded | Namespaces provided |
|---|---|---|
| `/testament` | `testament.json` | testament, testamentWizard |
| `/videoboodschappen` | `videoboodschappen.json` | videoboodschappen, voorbeeldData |
| `/noodcontacten` | `noodcontacten.json` | noodcontacten |
| `/boedel` | `boedel.json` | boedel |
| `/erfgenamen` | `erfgenamen.json` | erfgenamen, erfbelasting, nabestaanden |
| `/uitvaart` | `uitvaart.json` | uitvaart, uitvaartWizard, noodkaartQR |
| `/euthanasie` | `euthanasie.json` | euthanasie, euthanasieWizard |
| `/donor` | `donor.json` | donor, donorWizard |
| `/eigenaar` | `eigenaar.json` | eigenaar |
| `/digitaal-bezit` | `digitaal-bezit.json` | digitaalBezit |
| `/documenten` | `documenten.json` | documenten |
| `/instellingen` | `instellingen.json` | instellingen |
| `/export` | `export.json` | exporteren, auditLog, afsluitInstructies |
| `/tijdlijn` | `misc.json` | tijdlijn, interview, wachtwoordGenerator, juridischeCheck, dataHandtekening |
| `/audit-log` | `export.json` | exporteren, auditLog, afsluitInstructies |

---

## Category A: Namespace Loading Gaps

These are components that call `useTranslations("namespace")` for a namespace **not loaded** on the page where the component is rendered. All keys in that namespace appear as raw fallback text.

### A1 — `voorbeeldData` (CRITICAL — 9 pages affected)

| | |
|---|---|
| **Component** | `src/components/VoorbeeldDialog.tsx` → calls `getVoorbeeldData(t)` in `src/lib/voorbeeld-data.ts` |
| **Namespace** | `voorbeeldData` |
| **Lives in** | `videoboodschappen.json` |
| **Loaded on** | `/videoboodschappen` only |
| **Used on** (broken) | `/boedel`, `/uitvaart`, `/testament`, `/noodcontacten`, `/euthanasie`, `/eigenaar`, `/erfgenamen`, `/donor`, `/digitaal-bezit` |
| **Impact** | Every key in the VoorbeeldDialog renders as raw text on 9 pages |

### A2 — `juridischeCheck` (testament page)

| | |
|---|---|
| **Component** | `src/components/testament/JuridischeCheck.tsx` |
| **Namespace** | `juridischeCheck` |
| **Lives in** | `misc.json` |
| **Loaded on** | `/tijdlijn` only |
| **Used on** (broken) | `/testament` |
| **Keys affected** | `titel`, `beschrijving`, `controleUitvoeren`, `foutmelding`, `geenWaarschuwingen`, `geenWaarschuwingenTekst`, `aantalWaarschuwingen`, `ernstHoog`, `ernstMiddel`, `ernstInfo`, `disclaimer`, `controleMislukt` |

### A3 — `dataHandtekening` (instellingen page)

| | |
|---|---|
| **Component** | `src/components/instellingen/DataHandtekening.tsx` |
| **Namespace** | `dataHandtekening` |
| **Lives in** | `misc.json` |
| **Loaded on** | `/tijdlijn` only |
| **Used on** (broken) | `/instellingen` (via `SecurityInfoCard.tsx`) |

### A4 — `wachtwoordGenerator` (digitaal-bezit page)

| | |
|---|---|
| **Component** | `src/components/PasswordGenerator.tsx` |
| **Namespace** | `wachtwoordGenerator` |
| **Lives in** | `misc.json` |
| **Loaded on** | `/tijdlijn` only |
| **Used on** (broken) | `/digitaal-bezit` (via `AccountDialog.tsx`, `WachtwoordDialog.tsx`) |

### A5 — `interview` (dashboard page)

| | |
|---|---|
| **Component** | `src/components/interview/InterviewWizard.tsx` |
| **Namespace** | `interview` |
| **Lives in** | `misc.json` |
| **Loaded on** | `/tijdlijn` only |
| **Used on** (broken) | `/dashboard` |

### A6 — `nabestaanden` (dashboard page)

| | |
|---|---|
| **Component** | `src/components/nabestaanden/NabestaandenDashboard.tsx` |
| **Namespace** | `nabestaanden` |
| **Lives in** | `erfgenamen.json` |
| **Loaded on** | `/erfgenamen` only |
| **Used on** (broken) | `/dashboard` |

### A7 — `noodkaartQR` (noodcontacten page)

| | |
|---|---|
| **Component** | `src/components/noodcontacten/NoodkaartQR.tsx` |
| **Namespace** | `noodkaartQR` |
| **Lives in** | `uitvaart.json` |
| **Loaded on** | `/uitvaart` only |
| **Used on** (broken) | `/noodcontacten` |

### A8 — `afsluitInstructies` (digitaal-bezit page)

| | |
|---|---|
| **Component** | `src/components/digitaal-bezit/AccountItem.tsx` |
| **Namespace** | `afsluitInstructies` |
| **Lives in** | `export.json` |
| **Loaded on** | `/export`, `/audit-log` only |
| **Used on** (broken) | `/digitaal-bezit` |

---

## Category B: Translation Key Mismatches in `voorbeeldData`

Even when the `voorbeeldData` namespace IS loaded, these keys use **generic names** in code but the JSON has **descriptive names**. Both NL and EN JSON files are affected identically.

### B1 — `testament.secties.begunstigden` (6 keys)

| Code key (in `voorbeeld-data.ts`) | JSON key (in `videoboodschappen.json`) |
|---|---|
| `maria` | `mariaDeVoorbeeldJansen` |
| `mariaWaarde` | `mariaDeVoorbeeldJansenWaarde` |
| `thomas` | `thomasDeVoorbeeld` |
| `thomasWaarde` | `thomasDeVoorbeeldWaarde` |
| `sophie` | `sophieDeVoorbeeld` |
| `sophieWaarde` | `sophieDeVoorbeeldWaarde` |

### B2 — `boedel.secties.fysiekeBezittingen` (4 keys)

| Code key | JSON key |
|---|---|
| `woning` | `woningVoorbeeldstraat` |
| `woningWaarde` | `woningVoorbeeldstraatWaarde` |
| `auto` | `volkswagenId4` |
| `autoWaarde` | `volkswagenId4Waarde` |

> `antiekDressoir`, `antiekDressoirWaarde`, `zonnepanelen`, `zonnepanelenWaarde` **do match** ✅

### B3 — `noodcontacten.secties.contactpersonen` (10 keys)

| Code key | JSON key |
|---|---|
| `maria` | `mariaDeVoorbeeldJansen` |
| `mariaWaarde` | `mariaDeVoorbeeldJansenWaarde` |
| `notaris` | `mrJhBakker` |
| `notarisWaarde` | `mrJhBakkerWaarde` |
| `huisarts` | `drAbSmit` |
| `huisartsWaarde` | `drAbSmitWaarde` |
| `financieelAdviseur` | `janDeVries` |
| `financieelAdviseurWaarde` | `janDeVriesWaarde` |
| `buurman` | `karelJansen` |
| `buurmanWaarde` | `karelJansenWaarde` |

**Total: 20 mismatched keys across 3 sections.**

---

## Namespaces Verified as Correct ✅

These namespaces are loaded correctly on every page that uses them:

| Namespace | JSON file | Loaded globally or on correct route |
|---|---|---|
| `common`, `nav`, `enums`, `feedback`, `errors`, `idle`, `verwijderBevestiging`, `sectieNotitie`, `domainStatus`, `search`, `shortcuts`, `wizard` | `shared.json` | ✅ Global (root) |
| `personSelect`, `help`, `hulpteksten`, `legeStaten`, `aria` | `ui.json` | ✅ Global (root) |
| `auth` (+ sub-namespaces) | `auth.json` | ✅ Global (root) |
| `dashboard` (+ sub-namespaces) | `dashboard.json` | ✅ Global (root) |
| `testament`, `testamentWizard` | `testament.json` | ✅ `/testament` |
| `boedel` | `boedel.json` | ✅ `/boedel` |
| `erfgenamen`, `erfbelasting` | `erfgenamen.json` | ✅ `/erfgenamen` |
| `uitvaart`, `uitvaartWizard` | `uitvaart.json` | ✅ `/uitvaart` |
| `euthanasie`, `euthanasieWizard` | `euthanasie.json` | ✅ `/euthanasie` |
| `donor`, `donorWizard` | `donor.json` | ✅ `/donor` |
| `eigenaar` | `eigenaar.json` | ✅ `/eigenaar` |
| `digitaalBezit` | `digitaal-bezit.json` | ✅ `/digitaal-bezit` |
| `documenten` | `documenten.json` | ✅ `/documenten` |
| `instellingen` | `instellingen.json` | ✅ `/instellingen` |
| `exporteren`, `auditLog` | `export.json` | ✅ `/export`, `/audit-log` |
| `tijdlijn` | `misc.json` | ✅ `/tijdlijn` |
| `videoboodschappen` | `videoboodschappen.json` | ✅ `/videoboodschappen` |

---

## Recommended Fixes

### Fix 1 — Resolve namespace loading gaps (Category A)

**Option A (recommended): Add secondary imports to domain layouts.**

Each domain layout that uses a cross-domain component should also import & merge the required namespace file. The `DomainMessagesProvider` already does `{ ...parentMessages, ...domainMessages }`, so we can spread multiple files:

```tsx
// Example: testament/layout.tsx — needs misc.json for juridischeCheck + videoboodschappen.json for voorbeeldData
import nlTestament from "@messages/nl/testament.json";
import enTestament from "@messages/en/testament.json";
import nlMisc from "@messages/nl/misc.json";
import enMisc from "@messages/en/misc.json";
import nlVideo from "@messages/nl/videoboodschappen.json";
import enVideo from "@messages/en/videoboodschappen.json";

const MESSAGES = {
  nl: { ...nlTestament, ...nlMisc, ...nlVideo } as AbstractIntlMessages,
  en: { ...enTestament, ...enMisc, ...enVideo } as AbstractIntlMessages,
};
```

**Specific imports needed per layout:**

| Layout file | Currently loads | Must also load |
|---|---|---|
| `testament/layout.tsx` | `testament.json` | `misc.json` (juridischeCheck), `videoboodschappen.json` (voorbeeldData) |
| `boedel/layout.tsx` | `boedel.json` | `videoboodschappen.json` (voorbeeldData) |
| `uitvaart/layout.tsx` | `uitvaart.json` | `videoboodschappen.json` (voorbeeldData) |
| `noodcontacten/layout.tsx` | `noodcontacten.json` | `uitvaart.json` (noodkaartQR), `videoboodschappen.json` (voorbeeldData) |
| `euthanasie/layout.tsx` | `euthanasie.json` | `videoboodschappen.json` (voorbeeldData) |
| `eigenaar/layout.tsx` | `eigenaar.json` | `videoboodschappen.json` (voorbeeldData) |
| `erfgenamen/layout.tsx` | `erfgenamen.json` | `videoboodschappen.json` (voorbeeldData) |
| `donor/layout.tsx` | `donor.json` | `videoboodschappen.json` (voorbeeldData) |
| `digitaal-bezit/layout.tsx` | `digitaal-bezit.json` | `misc.json` (wachtwoordGenerator), `export.json` (afsluitInstructies), `videoboodschappen.json` (voorbeeldData) |
| `instellingen/layout.tsx` | `instellingen.json` | `misc.json` (dataHandtekening) |

**For dashboard** (`/dashboard` is NOT a domain route — it uses root messages only):
- `nabestaanden` (from `erfgenamen.json`) and `interview` (from `misc.json`) are used on the dashboard page
- Either add a `dashboard/layout.tsx` with `DomainMessagesProvider` loading `erfgenamen.json` + `misc.json`, or move these namespaces to root messages

**Option B (alternative): Move cross-domain namespaces to root messages.**

Namespaces used on 3+ routes could be promoted to root:
- `voorbeeldData` → used on 9 domain pages → strong candidate for root
- `misc.json` namespaces → used on 4 different routes → consider moving to root

This trades bundle size for simplicity.

### Fix 2 — Fix key mismatches in `voorbeeldData` (Category B)

**Option A (recommended): Update `voorbeeld-data.ts` to use the JSON key names.**

Change the 20 mismatched keys in `voorbeeld-data.ts` to match the existing JSON:

```typescript
// testament.secties.begunstigden — BEFORE → AFTER
t("testament.secties.begunstigden.maria")      → t("testament.secties.begunstigden.mariaDeVoorbeeldJansen")
t("testament.secties.begunstigden.mariaWaarde") → t("testament.secties.begunstigden.mariaDeVoorbeeldJansenWaarde")
// ... (full list in Category B section above)

// boedel.secties.fysiekeBezittingen — BEFORE → AFTER
t("boedel.secties.fysiekeBezittingen.woning")      → t("boedel.secties.fysiekeBezittingen.woningVoorbeeldstraat")
t("boedel.secties.fysiekeBezittingen.woningWaarde") → t("boedel.secties.fysiekeBezittingen.woningVoorbeeldstraatWaarde")
t("boedel.secties.fysiekeBezittingen.auto")         → t("boedel.secties.fysiekeBezittingen.volkswagenId4")
t("boedel.secties.fysiekeBezittingen.autoWaarde")   → t("boedel.secties.fysiekeBezittingen.volkswagenId4Waarde")

// noodcontacten.secties.contactpersonen — BEFORE → AFTER
t("noodcontacten.secties.contactpersonen.maria")                → t("noodcontacten.secties.contactpersonen.mariaDeVoorbeeldJansen")
t("noodcontacten.secties.contactpersonen.mariaWaarde")          → t("noodcontacten.secties.contactpersonen.mariaDeVoorbeeldJansenWaarde")
t("noodcontacten.secties.contactpersonen.notaris")              → t("noodcontacten.secties.contactpersonen.mrJhBakker")
t("noodcontacten.secties.contactpersonen.notarisWaarde")        → t("noodcontacten.secties.contactpersonen.mrJhBakkerWaarde")
t("noodcontacten.secties.contactpersonen.huisarts")             → t("noodcontacten.secties.contactpersonen.drAbSmit")
t("noodcontacten.secties.contactpersonen.huisartsWaarde")       → t("noodcontacten.secties.contactpersonen.drAbSmitWaarde")
t("noodcontacten.secties.contactpersonen.financieelAdviseur")   → t("noodcontacten.secties.contactpersonen.janDeVries")
t("noodcontacten.secties.contactpersonen.financieelAdviseurWaarde") → t("noodcontacten.secties.contactpersonen.janDeVriesWaarde")
t("noodcontacten.secties.contactpersonen.buurman")              → t("noodcontacten.secties.contactpersonen.karelJansen")
t("noodcontacten.secties.contactpersonen.buurmanWaarde")        → t("noodcontacten.secties.contactpersonen.karelJansenWaarde")
```

**Option B: Update JSON keys to match the code (simpler keys).**

This is also valid but requires changing both NL and EN JSON files (40 key renames across 2 files). The JSON descriptive names are arguably better for readability, so Option A is preferred.

---

## Files to Modify

| Priority | File | Change |
|---|---|---|
| P0 | `src/lib/voorbeeld-data.ts` | Fix 20 mismatched keys (Category B) |
| P0 | `src/app/(authenticated)/testament/layout.tsx` | Add `misc.json` + `videoboodschappen.json` imports |
| P0 | `src/app/(authenticated)/boedel/layout.tsx` | Add `videoboodschappen.json` import |
| P0 | `src/app/(authenticated)/uitvaart/layout.tsx` | Add `videoboodschappen.json` import |
| P0 | `src/app/(authenticated)/noodcontacten/layout.tsx` | Add `uitvaart.json` + `videoboodschappen.json` imports |
| P0 | `src/app/(authenticated)/euthanasie/layout.tsx` | Add `videoboodschappen.json` import |
| P0 | `src/app/(authenticated)/eigenaar/layout.tsx` | Add `videoboodschappen.json` import |
| P0 | `src/app/(authenticated)/erfgenamen/layout.tsx` | Add `videoboodschappen.json` import |
| P0 | `src/app/(authenticated)/donor/layout.tsx` | Add `videoboodschappen.json` import |
| P0 | `src/app/(authenticated)/digitaal-bezit/layout.tsx` | Add `misc.json` + `export.json` + `videoboodschappen.json` imports |
| P0 | `src/app/(authenticated)/instellingen/layout.tsx` | Add `misc.json` import |
| P1 | `src/app/(authenticated)/dashboard/` | Add layout.tsx with `erfgenamen.json` + `misc.json` for nabestaanden + interview |
