# Contract: Tooling
> Versie 1.0 | Definieert welke tools agents mogen gebruiken en hoe tool-beschikbaarheid wordt beheerd

---

## DOEL

Dit contract definieert:
1. Welke tools beschikbaar moeten zijn voor elke fase
2. Hoe agents tool-beschikbaarheid verifiëren en rapporteren
3. Wat agents doen bij ontbrekende of falende tools
4. Verboden toolacties (security en integriteit)

---

## TOOL CATEGORIEËN

### Categorie A: Lezen & Analyseren (vereist voor Fase 1–4)

| Tool | Doel | Minimale versie | Verificatiecommando |
|------|------|----------------|-------------------|
| Bestandssysteem (lees) | Codebase en documentatie inlezen | - | Bestandspad resolveert |
| Git (read-only) | Commit-history, blame, diff | 2.x | `git --version` |
| Grep / zoeken | Patronen detecteren in code | - | Bestandsinhoud doorzoekbaar |

### Categorie B: Schrijven & Opslaan (vereist voor alle fasen)

| Tool | Doel | Minimale versie | Verificatiecommando |
|------|------|----------------|-------------------|
| Bestandssysteem (schrijf) | Output-documenten wegschrijven | - | Schrijfrechten op werkmap |
| JSON validator | Session state en contracten valideren | - | JSON parseert zonder fout |

### Categorie C: Bouwen & Testen (vereist voor Fase 5)

| Tool | Doel | Minimale versie | Verificatiecommando |
|------|------|----------------|-------------------|
| Test-runner | Unittests en integratietests uitvoeren | Projectspecifiek | `[runner] --version` |
| Linter / statische analyse | Code-kwaliteit en stijl controleren | Projectspecifiek | `[linter] --version` |
| Build-tool | Project bouwen en compileren | Projectspecifiek | `[buildtool] --version` |
| Git (schrijf) | Commits, branches, PR's aanmaken | 2.x | `git --version` |

### Categorie D: Optioneel (verhoogt analysekwaliteit)

| Tool | Doel |
|------|------|
| Dependency scanner | Verouderde of kwetsbare dependencies detecteren |
| Code coverage tool | Testdekking meten |
| Performance profiler | Bottlenecks identificeren |
| Accessibility checker | WCAG-compliance valideren |

---

## TOOL-BESCHIKBAARHEID PROTOCOL

### Bij verificatie (Onboarding Agent, verplicht):

```markdown
## TOOLING STATUS RAPPORT
| Tool | Status | Versie | Categorie | Blokkeert |
|------|--------|--------|-----------|-----------|
| Bestandssysteem (lees) | BESCHIKBAAR | - | A | Fase 1–4 + Fase 5 |
| Git (read-only) | BESCHIKBAAR | 2.43.0 | A | Geen (AANBEVOLEN) |
| Bestandssysteem (schrijf) | BESCHIKBAAR | - | B | Alle fasen |
| Test-runner | TOOL_UNAVAILABLE | - | C | Fase 5 |
```

### Status waarden:

| Status | Betekenis | Actie |
|--------|-----------|-------|
| `BESCHIKBAAR` | Tool aanwezig en functioneel | Doorgaan |
| `TOOL_UNAVAILABLE` | Tool niet gevonden | Documenteer, blokkeer afhankelijke fase |
| `TOOL_DEGRADED` | Tool aanwezig maar problemen (verkeerde versie, rechtenprobleem) | Documenteer, escaleer als kritiek |
| `TOOL_UNTESTED` | Niet geverifieerd | Behandel als TOOL_UNAVAILABLE |

---

## FASE-AFHANKELIJKHEID

| Fase | Vereiste categorieën | Fase start als... |
|------|---------------------|-------------------|
| Onboarding | A + B | Altijd (minimumcheck) |
| Fase 1–4 (analyse) | A + B | Alle Categorie A + B BESCHIKBAAR |
| Fase 5 (implementatie) | A + B + C | Alle Categorie A + B + C BESCHIKBAAR |

**TOOLING_GAP voor Categorie C blokkeert Fase 5, maar NIET Fase 1–4.** Dit moet expliciet gedocumenteerd worden in de Onboarding Output zodat de Synthesis Agent een aanbeveling kan opnemen.

---

## VERBODEN TOOLACTIES (ALLE AGENTS, ALTIJD)

1. **VERBOD:** Geen enkel geheim, credential, API-sleutel of wachtwoord lezen, loggen of doorgeven — ook niet tijdelijk in geheugen
2. **VERBOD:** Geen productie-database direct benaderen of mutaties uitvoeren buiten de aangewezen testomgeving
3. **VERBOD:** Geen externe netwerkaanroepen maken buiten de expliciete toolset (geen willekeurige HTTP-calls)
4. **VERBOD:** Geen destructieve git-operaties (`--force push`, `reset --hard` op main/master) zonder expliciete menselijke bevestiging via het Human Escalation Protocol
5. **VERBOD:** Geen binaire bestanden of gegenereerde artefacten committen die niet tot de implementatie behoren
6. **VERBOD:** Geen installatie van nieuwe tools of packages buiten de gedefinieerde toolset zonder `TOOL_INSTALL_REQUEST` escalatie

---

## TOOL_INSTALL_REQUEST PROTOCOL

Als een agent concludeert dat een ontbrekende tool noodzakelijk is voor uitvoering:

```markdown
## TOOL_INSTALL_REQUEST
- Aanvragende agent: [agent naam]
- Tool: [naam + versie]
- Reden: [waarom is deze tool noodzakelijk?]
- Alternatief zonder tool: [of GEEN ALTERNATIEF]
- Risico van niet-installeren: [impact op cyclus]
- Vereiste actie van de gebruiker: [installatie-instructie of goedkeuring]
```

Escaleer naar de gebruiker via het Human Escalation Protocol. Wacht op bevestiging. NOOIT zelfstandig installeren.

---

## TOOL OUTPUT BEWARING

- Alle tool-output die gebruikt wordt als bewijs voor een bevinding MOET geciteerd worden met: tool naam, commando, exacte output-snippet
- Tijdelijke tool-output (bijv. test-logs) worden bewaard in `docs/tool-output/[fase]/[agent]/` voor traceerbaarheid
- Tool-output ouder dan de huidige sessie: markeer als `STALE_OUTPUT: [datum]` — niet gebruiken als primair bewijs
