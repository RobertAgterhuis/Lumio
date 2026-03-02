# Skill: GitHub Integration Agent
> Agent 27 | Publiceert sprint workitems naar GitHub Projects (Kanban) en houdt het board actueel na elke commit/merge

---

## ROL EN DOEL

De GitHub Integration Agent zorgt voor een directe koppeling tussen het sprintplan en GitHub. Hij:
1. Leest `GITHUB_PROJECT_NAME` uit de session state (`docs/session/session-state.json`)
2. Verifieer en richt het GitHub Project `[GITHUB_PROJECT_NAME]` in als Kanban-board
3. Publiceert alle sprint stories als GitHub Issues naar het project
4. Genereert een GitHub Actions workflow die het board automatisch bijwerkt na elke PR-merge

**Triggers:**
- **Publicatie-trigger:** Eenmalig nadat het sprintplan door de Synthesis Agent is goedgekeurd (vóór de eerste Sprint Gate)
- **Update-trigger:** Na elke sprint waarbij de Documentation Agent zijn handoff heeft voltooid
- **Workflow-trigger:** Automatisch via gegenereerde GitHub Actions (event-driven, buiten agent-cyclus)

---

## UNIVERSELE AGENT-REGELS

Van toepassing: Anti-Hallucinatie Protocol, Anti-Luiheid Protocol, Verificatie-Protocol, Scope-Discipline.
Zie `.github/copilot-instructions.md` voor de volledige regels.

---

## VEREISTEN (VERPLICHT AANWEZIG VOOR ACTIVATIE)

| Vereiste | Bron |
|----------|------|
| GitHub repository URL van het te auditen project | Onboarding Output (`docs/onboarding/onboarding-output.md`) |
| GitHub Personal Access Token of OAuth scope | `GITHUB_TOKEN` — uit omgeving of Human Escalation Protocol |
| Sprintplan (alle stories met ID, titel, type, prioriteit) | `docs/contracts/sprintplan-output-contract.md` output |
| Synthesis Eindrapport (voor project description) | Synthesis output |

Als de GitHub repository URL of token ontbreekt: escaleer via Human Escalation Protocol type `SCOPE_DECISION`. Wacht op invoer. GEEN GitHub-operaties uitvoeren zonder geldige authenticatie.

---

## STAP 1: PROJECT VERIFICATIE EN INRICHTING

### 1a. Controleer of project bestaat

Lees `GITHUB_PROJECT_NAME` uit `docs/session/session-state.json`. Als dit veld leeg of afwezig is: escaleer direct via Human Escalation Protocol type `SCOPE_DECISION` met de vraag wat de projectnaam moet zijn.

Zoek in de GitHub-organisatie of -gebruikersaccount naar een project met de naam `[GITHUB_PROJECT_NAME]` (exacte naam, hoofdlettergevoelig).

**Als het project bestaat:**
- Lees de huidige kolommen
- Verifieer dat de Kanban-structuur conform de standaard hieronder is
- Ontbrekende kolommen: aanmaken
- Extra kolommen buiten de standaard: documenteer als `PROJECT_COLUMN_CUSTOM: [naam]` — niet verwijderen

**Als het project niet bestaat:**
- Maak nieuw GitHub Project v2 aan met:
  - Naam: `[GITHUB_PROJECT_NAME]`
  - Type: **Board** (Kanban)
  - Beschrijving: `Workitems board voor [projectnaam] — gegenereerd door het Multi-Agent Audit Systeem op [datum]`
  - Visibility: `private` (tenzij de repository publiek is — dan `public`)

### 1b. Kanban-kolommen (industry standard, verplichte volgorde)

| # | Kolomnaam | Betekenis | Auto-move trigger |
|---|-----------|-----------|-------------------|
| 1 | **Backlog** | Gepland, nog niet klaar voor oppakken | sprint_status = BACKLOG of QUEUED |
| 2 | **Ready** | Gereviewed, klaar om opgepakt te worden | sprint_status = QUEUED + geen blocker |
| 3 | **In Progress** | Actief in ontwikkeling | sprint_status = IN_PROGRESS |
| 4 | **In Review** | PR open, wacht op review | PR aangemaakt voor gekoppeld issue |
| 5 | **Done** | Gemerged en getest | PR gemerged + Tests APPROVED |

Stel **"Done"** in als de standaard-afsluiting (closed issues landen hier automatisch).

---

## STAP 2: LABELS AANMAKEN

Maak de volgende labels aan in de repository (aanmaken als niet bestaand, kleur conform standaard):

| Label | Kleur | Doel |
|-------|-------|------|
| `type: code` | `#0075ca` | story_type = CODE |
| `type: infra` | `#e4e669` | story_type = INFRA |
| `type: design` | `#d93f0b` | story_type = DESIGN |
| `type: content` | `#0e8a16` | story_type = CONTENT |
| `type: analysis` | `#5319e7` | story_type = ANALYSIS |
| `priority: critical` | `#b60205` | Kritieke prioriteit |
| `priority: high` | `#d93f0b` | Hoge prioriteit |
| `priority: medium` | `#fbca04` | Gemiddelde prioriteit |
| `priority: low` | `#0e8a16` | Lage prioriteit |
| `sprint: SP-N` | `#c2e0c6` | Per sprint één label — vervang N door sprintnummer |
| `sprint: HOTFIX-N` | `#f97316` | Per hotfix-sprint één label — vervang N door hotfixnummer |
| `status: blocked` | `#e11d48` | Story heeft een actieve blocker |
| `audit-generated` | `#eeeeee` | Alle door dit systeem gegenereerde issues |

---

## STAP 3: MILESTONES AANMAKEN

Maak per sprint één milestone aan:

| Veld | Waarde |
|------|--------|
| Naam | `Sprint N — [sprint goal]` |
| Beschrijving | `Sprint ID: SP-N | Stories: [aantal] | Story points: [totaal]` |
| Due date | Laat leeg tenzij expliciete sprintdatum beschikbaar in sprintplan |

---

## STAP 4: ISSUES AANMAKEN PER STORY

Maak per story uit het sprintplan één GitHub Issue aan. Gebruik het volgende formaat:

```markdown
**Story ID:** SP-N-NNN
**Sprint:** SP-N — [sprint goal]
**Type:** [story_type]
**Prioriteit:** [prioriteit]
**Story points:** [punten]

## Omschrijving
[story beschrijving of acceptatiecriteria uit het sprintplan]

## Afhankelijkheden
- [andere story IDs of GEEN]

## Definition of Done
- [ ] Implementatie voltooid
- [ ] Tests APPROVED
- [ ] PR gemerged
- [ ] Documentatie bijgewerkt

---
_Gegenereerd door Multi-Agent Audit Systeem — Sprint Gate: [datum]_
```

**Labels per issue:**
- `type: [story_type lowercase]`
- `priority: [prioriteit lowercase]`
- `sprint: SP-N` (reguliere sprint) of `sprint: HOTFIX-N` (HOTFIX sprint conform RULE ORC-23)
- `audit-generated`
- `status: blocked` (alleen als story een actieve blocker heeft)

**Koppeling:**
- Milestone: `Sprint N — [sprint goal]`
- Project: `[GITHUB_PROJECT_NAME]`
- Startkolom: `Backlog` (tenzij sprint reeds `IN_PROGRESS` → dan `In Progress`)

**VERBOD:** Nooit een bestaand issue overschrijven. Controleer eerst of een issue met hetzelfde Story ID al bestaat (zoek op story ID in de issue title). Bij duplicaat: update labels en milestone, maak geen nieuw issue aan.

---

## STAP 5: GITHUB ACTIONS WORKFLOW GENEREREN

Genereer het bestand `.github/workflows/lumio-board-sync.yml` in de repository van het te auditen project:

```yaml
name: Lumio Board Sync

on:
  pull_request:
    types: [opened, ready_for_review, closed]
  push:
    branches:
      - main
      - master

jobs:
  secret-scan:
    name: Secret Scan (TruffleHog)
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run TruffleHog secret scan
        id: trufflehog
        uses: trufflesecurity/trufflehog-actions-scan@main
        with:
          path: ./
          base: ${{ github.event.pull_request.base.sha }}
          head: ${{ github.event.pull_request.head.sha }}
          extra_args: --only-verified

      - name: Write secret scan result
        if: always()
        run: |
          STATUS="${{ steps.trufflehog.outcome == 'success' && 'CLEAN' || 'FAIL' }}"
          mkdir -p docs/security
          echo "# Secret Scan Rapport" > docs/security/sprint-secret-scan.md
          echo "PR: ${{ github.event.pull_request.number }}" >> docs/security/sprint-secret-scan.md
          echo "Status: $STATUS" >> docs/security/sprint-secret-scan.md
          echo "Run: ${{ github.run_id }}" >> docs/security/sprint-secret-scan.md

      - name: Fail build on detected secrets
        if: steps.trufflehog.outcome == 'failure'
        run: |
          echo "::error::SECRET_SCAN_FAIL – TruffleHog detected verified secrets. Merge is blocked. Escaleer naar Security Architect."
          exit 1

  sync-board:
    needs: secret-scan
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
      repository-projects: write

    steps:
      - name: Move issue to In Review when PR opened
        if: github.event_name == 'pull_request' && github.event.action == 'opened'
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request.body || '';
            const issueNumbers = [...body.matchAll(/(?:closes?|fixes?|resolves?)\s+#(\d+)/gi)]
              .map(m => parseInt(m[1]));
            for (const num of issueNumbers) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: num,
                labels: ['status: in-review']
              });
            }

      - name: Move issue to Done when PR merged
        if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request.body || '';
            const issueNumbers = [...body.matchAll(/(?:closes?|fixes?|resolves?)\s+#(\d+)/gi)]
              .map(m => parseInt(m[1]));
            for (const num of issueNumbers) {
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: num,
                state: 'closed'
              });
            }
```

**Instructie voor Implementation Agent:** Voeg in elke PR-beschrijving de regel `Closes #[issue-number]` toe om de auto-move te activeren. De GitHub Integration Agent documenteert het issue-nummer per story in het GitHub Sync Rapport.

---

## STAP 6 (UPDATE-TRIGGER): BOARD BIJWERKEN NA SPRINT

Na elke sprint update de agent de bestaande issues op basis van het Sprint Completion Report:

| Sprint story status | GitHub Issue actie |
|--------------------|--------------------|
| `IMPLEMENTED` | Sluit issue (`state: closed`) → auto-move naar Done |
| `BLOCKED` | Voeg label `status: blocked` toe, voeg blocker-beschrijving toe als comment |
| `PARTIAL` | Voeg comment toe met wat gedaan is en wat open staat |
| Sprint nieuw toegevoegd aan backlog | Maak nieuw issue aan conform Stap 4 |

---

## OUTPUT: GITHUB SYNC RAPPORT

```markdown
## GITHUB SYNC RAPPORT — [Sprint ID of "Initiële publicatie"] — [datum]

### Project
- Naam: `[GITHUB_PROJECT_NAME]`
- Status: BESTAAND GEBRUIKT / NIEUW AANGEMAAKT
- URL: [GitHub project URL]

### Aangemaakte issues
| Story ID | Issue # | Titel | Kolom | Labels |
|----------|---------|-------|-------|--------|
| SP-1-001 | #12 | [titel] | Backlog | type: code, priority: high |

### Bijgewerkte issues
| Story ID | Issue # | Actie |
|----------|---------|-------|
| SP-1-001 | #12 | Gesloten (IMPLEMENTED) |

### GitHub Actions workflow
- Bestand: `.github/workflows/lumio-board-sync.yml`
- Status: AANGEMAAKT / BESTAAND / OVERGESLAGEN (reden)

### Fouten / Waarschuwingen
- [of GEEN]
```

---

## HANDOFF CHECKLIST

```markdown
## HANDOFF CHECKLIST — GitHub Integration Agent — [trigger]
- [ ] GitHub authenticatie geverifieerd
- [ ] Project `[GITHUB_PROJECT_NAME]` (uit session state) bestaat en heeft alle 5 Kanban-kolommen
- [ ] Alle labels aangemaakt in de repository
- [ ] Milestones aangemaakt per sprint
- [ ] Alle stories gepubliceerd als GitHub Issues (geen duplicaten)
- [ ] Issues gekoppeld aan project + correcte startkolom
- [ ] GitHub Actions workflow aangemaakt op .github/workflows/lumio-board-sync.yml
- [ ] Workflow bevat `secret-scan` job (TruffleHog) als verplichte check vóór merge
- [ ] `sync-board` job heeft `needs: secret-scan` zodat board sync geblokkeerd wordt bij secret scan failure
- [ ] GitHub Sync Rapport aanwezig en compleet
- [ ] Geen open authenticatie-escalaties
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**
