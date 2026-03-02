# Sprint Gate — SP-4: DevOps
**Datum:** 2026-03-02  
**Orchestrator:** Lumio Audit Multi-Agent Systeem  
**Audit scope:** PARTIAL (Fase 2 Techniek — DevOps)  
**Vorige sprint:** SP-3 Dev Kwaliteit — ✅ SPRINT_COMPLETE (PR #56 gemerged in main)

---

## PRE-GATE CHECKS

### ✅ Stap 0: decisions.md — Open HOOG-prioriteit items

| Bevinding | Resultaat |
|---|---|
| Open HOOG items in decisions.md | GEEN — geen open items met directe SP-4 blokkering |
| Sprint Gate geblokkeerd door decisions.md | **NEE** |

---

### ✅ Stap 0B: RULE ORC-13 — GitHub Issues status

| Item | Status |
|---|---|
| GitHub Issues SP-4 aangemaakt | ✅ #19 (T-009) · #20 (T-010) — label `sprint:SP-4`, milestone `SP-4 DevOps` |
| Labels | ✅ type:infra, priority:high/medium, sprint:SP-4, audit-generated |

---

### ✅ Stap 1: SP-1 + SP-2 + SP-3 afhankelijkheidcheck

| Afhankelijkheid | Status |
|---|---|
| SP-1 COMPLETE (Security Critical) | ✅ PR #41 gemerged → main |
| SP-2 COMPLETE (Data Integrity) | ✅ PR #43 gemerged → main |
| SP-3 COMPLETE (Dev Kwaliteit) | ✅ PR #56 gemerged → main — CI foundation vereist voor SP-4 ✅ |
| SP-3 CI-threshold 30→50 + alle jobs enabled | ✅ Bevestigd in main |
| 245/245 tests passing op main | ✅ Bevestigd |
| npm audit 0 vulnerabilities (alle workspaces) | ✅ Bevestigd na security-fix commit 9840a3e |

---

### ✅ Stap 2: Codebase-verificatie per story

#### T-009 — Geautomatiseerde desktop release pipeline

| Bevinding | Bron | Resultaat |
|---|---|---|
| `electron-builder.yml` aanwezig | `src/lumio-desktop/electron-builder.yml` | ✅ BEVESTIGD |
| Huidig target | `target: dir` (USB-portable, unpacked directory) | ✅ |
| Code signing | `signAndEditExecutable: false`, `forceCodeSigning: false` | ⚠️ ZIE OPMERKING |
| `tools/build.ps1` aanwezig | Compileert backend + frontend + electron, Windows only | ✅ BEVESTIGD |
| Bestaande release workflow | GEEN | ⚠️ GAP — te implementeren |
| CI workflow (`ci.yml`) | Builds/tests bij push naar main en PR's — géén tag-trigger | ✅ BEVESTIGD — géén release |
| `publish: null` in electron-builder.yml | Geen auto-update geconfigureerd (USB-portabel design) | ✅ |

**⚠️ OPMERKING T-009 — Code signing vs. USB-portable design:**
> De issue-criteria vermeldt "gesignde Windows installer". De codebase is echter bewust ontworpen als **USB-portable app** (geen installer, geen auto-updater). `signAndEditExecutable: false` is een expliciete ontwerpkeuze.  
>
> **Resolutie (pragmatisch):**
> 1. Release workflow bouwt en zipped de `dir`-output (USB-portable distributable)
> 2. Code signing wordt optioneel geïmplementeerd: als `CSC_LINK` + `CSC_KEY_PASSWORD` secrets aanwezig zijn, ondertekent electron-builder automatisch. Als ze ontbreken, slaagt de build alsnog (USB-portable gebruik vereist geen sign-certificaat).
> 3. `signAndEditExecutable` blijft `false` in `electron-builder.yml` (keuze toekomstige sprint bij commerciële distributie via Microsoft Store of vergelijkbaar).
>
> **Documenteer als OPEN_VRAAG in decisions.md als bij commercialisering een sign-certificaat gewenst is.**

| Criterium | Status |
|---|---|
| Tag-triggered workflow mogelijk | ✅ GitHub Actions ondersteunt `on: push: tags: ['v*.*.*']` |
| Windows runner beschikbaar | ✅ `windows-latest` — vereist voor `win-x64` self-contained .NET publish |
| Build.ps1 kennis | ✅ Volledig gedocumenteerd — workflow voert dezelfde stappen uit |
| GitHub Release creatie | ✅ Via `softprops/action-gh-release` of `gh release create` |
| Secrets (optioneel signing) | `CSC_LINK`, `CSC_KEY_PASSWORD` — workflow negeert graceful als afwezig |

**Fix-strategie T-009:**
```
1. Maak .github/workflows/release.yml aan
2. Trigger: on push tags v*.*.*
3. Runs-on: windows-latest
4. Steps: checkout → .NET 10 setup → Node 22 → npm ci (web + desktop)
          → dotnet publish backend (win-x64 self-contained)
          → next build → dist/frontend
          → npx tsc (desktop) → electron-builder --dir
          → zip dist/Lumio/ → gh release create + upload zip
5. Optioneel: als CSC_LINK secret aanwezig → signing via electron-builder auto-detect
```

---

#### T-010 — Staging / acceptance omgeving opzetten

| Bevinding | Bron | Resultaat |
|---|---|---|
| Type applicatie | USB-portable desktop app (geen web-server) | ✅ |
| Staging via server of URL | N.V.T. — er is geen deployment server | ✅ BEVESTIGD |
| Huidige CI artifact upload | GEEN voor de desktop distributie | ⚠️ GAP — te implementeren |
| `devdocs/deployment-urls.md` | Marketing site gedocumenteerd; desktop ontbreekt | ⚠️ INCOMPLETE |
| GitHub Actions artifacts | Ondersteund — max 90 dagen retentie in free tier | ✅ |

**Opmerking T-010 — definitie van "staging" voor een USB-portable app:**
> Voor een offline desktop app betekent "staging omgeving" het automatisch publiceren van een **nightly development build** bij elke merge naar `main`. Testers kunnen het CI-artifact downloaden en installeren om nieuwe features te accepteren vóór een tagged release.  
> Dit vervangt het concept van een staging server voor desktop software.

| Criterium | Status |
|---|---|
| Nightly build workflow haalbaar | ✅ Zelfde stappen als release.yml maar zonder tag-trigger |
| Artifact upload | ✅ `actions/upload-artifact@v7` — 30 dagen retentie |
| Artifact download URL-patroon | Gedocumenteerd in `devdocs/deployment-urls.md` |
| `devdocs/deployment-urls.md` sectie toevoegen | ✅ Te implementeren |

**Fix-strategie T-010:**
```
1. Maak .github/workflows/nightly.yml aan
2. Trigger: push naar main + workflow_dispatch
3. Builds dezelfde output als release.yml maar zipped als lumio-nightly-{sha}.zip
4. Upload als GitHub Actions artifact (retention: 30 days)
5. Update devdocs/deployment-urls.md met downloadinstructies
```

---

### ✅ Stap 3: Lessons Learned injectie (SP-1 t/m SP-3)

| Lesson | Impact op SP-4 |
|---|---|
| **LL-001:** InMemory provider geen echte transacties | N.v.t. SP-4 (infra, geen tests) |
| **LL-002:** PR base moet `main` zijn | ✅ `feature/sp-4-devops` → `main` |
| **LL-003:** TruffleHog secret scan | ✅ Geen secrets in workflow YAML hardgecoded — gebruik ${{ secrets.* }} |
| **LL-004:** CI jobs uitgeschakeld voorkomen | ✅ Alle jobs enabled na SP-3 |
| **LL-005 (nieuw):** static Next.js export incompatibel met strict CSP nonce-aanpak | ✅ Gedocumenteerd in layout.tsx commentaar — geen impact SP-4 |
| **LL-006 (nieuw):** electron-icon-builder en to-ico brengen kwetsbare chains mee | ✅ Opgelost via pure Buffer implementatie — release workflow gebruikt dezelfde aanpak |

---

### ✅ Stap 4: Definition of Ready per story

#### T-009 — Geautomatiseerde desktop release pipeline

| Criterium | Status |
|---|---|
| Probleem duidelijk omschreven | ✅ Geen tag-triggered release workflow aanwezig |
| Fix-strategie concreet | ✅ release.yml met Windows runner + zip + GitHub Release create |
| Acceptatiecriteria meetbaar | ✅ Tag v0.1.0 pushen → workflow draait → release aanwezig op GitHub |
| Signing conflict opgelost | ✅ Optioneel via secrets — geen blokkering zonder cert |
| Platform-dependency | ✅ `windows-latest` runner voor win-x64 build |
| TruffleHog clean | ✅ Geen secrets in workflow code |
| Story Points | **5** (medium: nieuwe workflow, zip stap, GH release, optioneel signing) |

**Verdict T-009: ✅ READY**

---

#### T-010 — Staging / acceptance omgeving opzetten

| Criterium | Status |
|---|---|
| Probleem duidelijk omschreven | ✅ Geen CI-artifact voor desktop distributable — testers kunnen niet accepteren |
| Fix-strategie concreet | ✅ nightly.yml + artifact upload + deployment-urls.md update |
| Acceptatiecriteria meetbaar | ✅ Push naar main → artifact verschijnt in Actions tab |
| Cross-story afhankelijkheid | ✅ T-010 bouwt op dezelfde build-stappen als T-009 — parallel uitvoerbaar |
| `devdocs/deployment-urls.md` scope | ✅ Sectie toevoegen voor desktop distributable |
| Story Points | **3** (klein: nightly.yml is variant van release.yml + docs update) |

**Verdict T-010: ✅ READY**

---

## SP-4 SPRINT OVERVIEW

| Story ID | Titel | Issue | Prioriteit | SP | Afhankelijk van |
|---|---|---|---|---|---|
| T-009 | Geautomatiseerde desktop release pipeline | #19 | 🟠 high | 5 | SP-3 CI foundation ✅ |
| T-010 | Staging / acceptance omgeving opzetten | #20 | 🟡 medium | 3 | T-009 (gedeelde build-logica) |

**Totaal:** 8 story points  
**Uitvoering:** T-009 eerst (bevat herbruikbare build-steps) → T-010 hergebruikt de stappen  
**Branch:** `feature/sp-4-devops` (af te splitsen vanuit `main`)

---

## IMPLEMENTATIEPLAN SP-4

### Fase A: `feature/sp-4-devops` branch aanmaken

### Fase B: T-009 — `.github/workflows/release.yml`
```
Trigger: push tags v*.*.*
Runner: windows-latest
Steps:
  1. checkout (fetch-depth 0 voor changelog)
  2. setup dotnet 10.0.x
  3. setup node 22 + cache npm
  4. npm ci lumio-web
  5. npm ci lumio-desktop
  6. dotnet publish Lumio.Api --runtime win-x64 --self-contained true → dist/backend
  7. npx next build (lumio-web) → копir out/ → dist/frontend
  8. npx tsc (lumio-desktop)
  9. CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --dir
  10. Compress dist/Lumio/ → lumio-{tag}-win-x64.zip
  11. gh release create {tag} lumio-{tag}-win-x64.zip
      --title "Lumio {tag}"
      --generate-notes (auto-changelog uit commits)
```

### Fase C: T-010 — `.github/workflows/nightly.yml`
```
Trigger: push main + workflow_dispatch
Runner: windows-latest
Steps: zelfde als release.yml stappen 1-10
Output naam: lumio-nightly-{sha7}.zip
Upload: actions/upload-artifact (retention 30 days)
```

### Fase D: `devdocs/deployment-urls.md` updaten
- Sectie "Desktop Distributable" toevoegen
- Artifact download URL-patroon documenteren
- Instructie voor tagged release download

### Fase E: PR aanmaken → CI → merge
---

## RISICO-REGISTER SP-4

| ID | Risico | Kans | Impact | Mitigatie |
|---|---|---|---|---|
| R-SP4-01 | Windows runner build tijd > 60 min (dotnet publish self-contained + electron) | Middel | Laag | `continue-on-error: false`; monitor eerste run; caching van npm en dotnet packages |
| R-SP4-02 | .NET 10.0.x niet beschikbaar op windows-latest runner | Laag | Hoog | `setup-dotnet@v5` met `dotnet-version: "10.0.x"` — nuget feed bevat 10.0.x preview |
| R-SP4-03 | electron-builder faalt zonder Electron prebuilt cache | Middel | Middel | `ELECTRON_CACHE` env var naar `~/.cache/electron` — github caches dit automatisch via actions/cache |
| R-SP4-04 | Zip bestand te groot voor GitHub Release (100MB limiet per asset) | Laag | Middel | Monitor build size; evt. split backend/frontend als aparte assets |
| R-SP4-05 | `gh release create` vereist `contents: write` permission | Laag | Hoog | Expliciete `permissions: contents: write` in workflow YAML |

---

## SPRINT GATE VERDICT

| Check | Status |
|---|---|
| decisions.md — geen HOOG blokkering | ✅ PASS |
| SP-3 COMPLETE | ✅ PASS |
| GitHub Issues aangemaakt (#19, #20) | ✅ PASS |
| T-009 Definition of Ready | ✅ PASS |
| T-010 Definition of Ready | ✅ PASS |
| Security (0 npm audit vulnerabilities) | ✅ PASS |
| Alle CI jobs enabled | ✅ PASS |

**SPRINT GATE SP-4: ✅ OPEN — IMPLEMENTEER**
