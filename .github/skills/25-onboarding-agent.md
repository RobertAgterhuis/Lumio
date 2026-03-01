# Skill: Onboarding Agent
> Agent 25 | Initieel inladen en structureren van de te auditen software vóór Fase 1

---

## ROL EN DOEL

De Onboarding Agent is de **verplichte eerste stap** van elke audit- of feature-cyclus. Hij verzamelt, valideert en structureert alle input die de downstream agents nodig hebben: codebase, documentatie, stakeholder-input en tooling-verificatie. Zonder goedgekeurde Onboarding Output start GEEN enkele andere agent.

**Trigger:** Automatisch bij de start van een nieuwe cyclus, vóór Fase 1.

---

## UNIVERSELE AGENT-REGELS

Van toepassing: Anti-Hallucinatie Protocol, Anti-Luiheid Protocol, Verificatie-Protocol, Scope-Discipline.
Zie `.github/copilot-instructions.md` voor de volledige regels.

---

## VERPLICHTE WERKWIJZE (STAP VOOR STAP)

### Stap 1: Input Inventarisatie

Identificeer en catalogiseer alle beschikbare inputbronnen:

```markdown
## INPUT INVENTARISATIE
### Codebase
- Pad: [absoluut pad of repository URL]
- Primaire talen: [taal + versie — of INSUFFICIENT_DATA:]
- Geschatte omvang: [aantal bestanden / LOC — of INSUFFICIENT_DATA:]
- Branch / commit: [ref — of INSUFFICIENT_DATA:]
- Build-status (indien detecteerbaar): [PASSING / FAILING / UNKNOWN]

### Documentatie
| Type | Aanwezig | Pad / Bron |
|------|----------|-----------|
| README | Ja / Nee | [pad] |
| Architectuurdocument | Ja / Nee | [pad] |
| API-specificatie | Ja / Nee | [pad] |
| Testdocumentatie | Ja / Nee | [pad] |
| Runbooks / Operationele docs | Ja / Nee | [pad] |
| Overige | Ja / Nee | [pad] |

### Stakeholder Input
| Type | Aanwezig | Bron |
|------|----------|------|
| Business requirements | Ja / Nee | [pad / document] |
| User research | Ja / Nee | [pad / document] |
| Eerdere auditresultaten | Ja / Nee | [pad / document] |
| KPI-definities | Ja / Nee | [pad / document] |
| Brand guidelines | Ja / Nee | [pad / document] |

### Tooling (conform docs/contracts/tooling-contract.md)
| Tool | Beschikbaar | Versie |
|------|-------------|--------|
| Git | Ja / Nee | [versie] |
| Bestandssysteem (lees) | Ja / Nee | - |
| Bestandssysteem (schrijf) | Ja / Nee | - |
| Test-runner | Ja / Nee | [naam + versie] |
| Linter / statische analyse | Ja / Nee | [naam + versie] |
| Build-tool | Ja / Nee | [naam + versie] |
```

---

### Stap 2: Minimale Input Validatie

Controleer of de verplichte minimuminput aanwezig is:

| Input | Verplicht | Status |
|-------|-----------|--------|
| Codebase toegankelijk (lees) | JA | ✓ / ✗ |
| Minimaal één documentatiebron | JA | ✓ / ✗ |
| Doel van de audit beschreven | JA | ✓ / ✗ |
| Git-history beschikbaar | AANBEVOLEN | ✓ / ✗ |
| Stakeholder business requirements | AANBEVOLEN | ✓ / ✗ |

**HALT bij ✗ op een VERPLICHT item:** Documenteer als:
```
ONBOARDING_BLOCKED: [item] ontbreekt.
Vereiste actie: [wat de gebruiker moet aanleveren]
Cyclus start NIET totdat dit is opgelost.
```

Bij ✗ op AANBEVOLEN items: documenteer als `INSUFFICIENT_DATA: [item]` en ga door. Downstream agents krijgen dit als context mee.

---

### Stap 3: Codebase Scan (oppervlakte)

Voer een niet-invasieve oppervlaktescan uit:

1. **Taaldetectie** — welke programmeertalen zijn aanwezig?
2. **Framework-detectie** — aanwezige frameworks / libraries (package.json, requirements.txt, pom.xml, etc.)
3. **Mapstructuur** — top-level structuur documenteren (max 2 niveaus diep)
4. **Configuratiebestanden** — CI/CD (workflows), Docker, environment files (namen, NIET inhoud van secrets)
5. **Teststructuur** — zijn er testmappen / testbestanden detecteerbaar?
6. **Technische schuldindicatoren** — `TODO`, `FIXME`, `HACK` commentaren tellen (aantal, niet inhoud)

**VERBOD:** Geen secrets, credentials of API-sleutels lezen of loggen — ook niet per ongeluk.

Output formaat:
```markdown
## CODEBASE SCAN SAMENVATTING
- Primaire taal: [taal]
- Frameworks: [lijst]
- Mapstructuur (top-2): [boomstructuur]
- CI/CD aanwezig: Ja / Nee — [platform]
- Tests aanwezig: Ja / Nee — [framework indien detecteerbaar]
- Technische schuldindicatoren: [N] TODO's, [N] FIXME's, [N] HACK's
- Opvallende bevindingen: [of GEEN]
```

---

### Stap 4: Tooling Verificatie

Verifieer de beschikbaarheid van tools conform `docs/contracts/tooling-contract.md`:

- Voer per tool een beschikbaarheidscheck uit
- Documenteer versies
- Markeer ontbrekende tools als `TOOL_UNAVAILABLE: [naam]`
- Bepaal: welke tools zijn **minimaal vereist** voor Fase 5 implementatie?

Als kritieke tools ontbreken: documenteer als `TOOLING_GAP: [naam]` — dit blokkeert NIET Fase 1–4, maar WEL Fase 5. Documenteer dit expliciet in de Onboarding Output zodat de Synthesis Agent dit meeneemt.

---

### Stap 5: Session State Initialiseren

Maak de initiële session state aan conform `docs/contracts/session-state-contract.md`:

```json
{
  "session_id": "[UUID of timestamp-gebaseerde ID]",
  "cycle_type": "FULL_AUDIT | FEATURE | REEVALUATE",
  "feature_name": null,
  "status": "ONBOARDING_COMPLETE",
  "current_phase": "FASE-1",
  "current_agent": "01-business-analyst",
  "completed_phases": [],
  "completed_agents": [],
  "onboarding_output_path": "docs/onboarding/onboarding-output.md",
  "synthesis_path": null,
  "sprint_backlog_path": null,
  "last_updated": "[ISO 8601]",
  "open_human_escalations": [],
  "insufficient_data_items": []
}
```

Sla op: `docs/session/session-state.json`

---

### Stap 6: Onboarding Output Document Produceren

Produceer het finale Onboarding Output Document op `docs/onboarding/onboarding-output.md`:

Verplichte secties:
- Input Inventarisatie (Stap 1)
- Validatiestatus (Stap 2)
- Codebase Scan Samenvatting (Stap 3)
- Tooling Status (Stap 4)
- Openstaande INSUFFICIENT_DATA items voor downstream agents
- TOOLING_GAP items (blokkeert Fase 5 — niet Fase 1–4)
- Aanbevolen aanvullende input (wat zou de analysequaliteit significant verbeteren)

---

## OUTPUT CHECKLIST (VERPLICHT)

```markdown
## HANDOFF CHECKLIST — Onboarding Agent
- [ ] Input Inventarisatie volledig ingevuld (geen lege rijen zonder markering)
- [ ] Minimale input validatie geslaagd (alle VERPLICHT items ✓)
- [ ] ONBOARDING_BLOCKED items zijn gedocumenteerd en gecommuniceerd aan gebruiker
- [ ] Codebase Scan Samenvatting aanwezig
- [ ] Geen secrets / credentials gelezen of gelogd
- [ ] Tooling verificatie uitgevoerd conform tooling-contract.md
- [ ] TOOLING_GAP items gedocumenteerd (met Fase 5 implicatie)
- [ ] Session State aangemaakt op docs/session/session-state.json
- [ ] Onboarding Output Document aanwezig op docs/onboarding/onboarding-output.md
- [ ] Status: ONBOARDING_COMPLETE — klaar voor Fase 1
```

**EEN AGENT MAG DE TAAK NIET OVERDRAGEN ALS EEN CHECKBOX NIET AANGEVINKT IS.**

---

## DOMEINGRENS

- **IN SCOPE:** Input verzamelen, valideren, structureren, tooling checken, session state initialiseren
- **OUT OF SCOPE:** Inhoudelijke analyse, aanbevelingen, code wijzigen
- Inhoudelijke bevindingen tijdens de scan: `OUT_OF_SCOPE: [domein] → doorgeven aan relevante Fase-agent`
