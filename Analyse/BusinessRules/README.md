# Business Rules Analyse — Lumio

> **Doel:** Analyse van de mogelijkheden om business rules te externaliseren
> uit de .NET-code van Lumio, met een concrete aanbeveling en implementatieplan.

---

## Documenten

| # | Document | Beschrijving |
|---|----------|-------------|
| 1 | [Huidige Situatie](01-huidige-situatie.md) | Architectuuranalyse: thick controller / anemic domain patroon, verdeling van business logica over de codebase, geïdentificeerde problemen |
| 2 | [Inventarisatie Regels](02-inventarisatie-regels.md) | Volledige inventarisatie van alle 190 business rules met unieke BR-ID's, geclassificeerd per type (PAR/VAL/BIZ/POL/CRS) en bronbestand |
| 3 | [Classificatie & Extractie](03-classificatie.md) | Extractiebaarheidsscore (A/B/C/D) per regel op basis van DB-koppeling, state-afhankelijkheid, pure logica en wijzigingsfrequentie |
| 4 | [Opties Analyse](04-opties-analyse.md) | Gedetailleerde evaluatie van 3 opties: Config-driven, DB/metadata-driven en Rule Engine, met codevoorbeelden en vergelijkingstabellen |
| 5 | [Aanbeveling](05-aanbeveling.md) | Concrete aanbeveling: hybride architectuur (Config + Domain Services + optioneel Rule Engine), inclusief regelgroep-toewijzing en beslismatrix |
| 6 | [Referentie-architectuur](06-referentie-architectuur.md) | Implementeerbare architectuurblauwdruk: projectstructuur, Options-modellen, service-interfaces, Facts/Results-pattern, codevoorbeelden en unit tests |
| 7 | [Implementatieplan](07-implementatieplan.md) | Gefaseerd sprintplan (4 sprints), dagplanningen, kwaliteitspoorten, risicomanagement en afhankelijkheden |

---

## Samenvatting

### Bevindingen

- **190 business rules** geïdentificeerd in de Lumio codebase
- **1.583 regels code** (27% van totaal) bevatten business logica
- Alle logica zit in controllers ("thick controller / anemic domain")
- **3 code-duplicaten** gevonden (netto nalatenschap 3×, wachtwoord-lengte 3×, Shamir threshold 2×)
- **57 regels (30%)** zijn direct configureerbaar te maken
- **105 regels (55%)** zijn extraheerbaar naar domain services

### Aanbeveling

**Hybride drielaags model:**

1. **Laag 1 — Configuratie** (JSON + IOptions): 57 regels — parameters, drempels, tarieven
2. **Laag 2 — Domain Services** (C# + DI): 48 regels — berekeningen, validaties, checks
3. **Laag 3 — Rule Engine** (MS RulesEngine, optioneel): 33 regels — meldingen, suggesties

### Planning

| Sprint | Focus | Effort | Regels extern |
|--------|-------|--------|:------------:|
| 1 | Config & Quick Wins | ~3 dagen | 57 (30%) |
| 2 | Domain Services | ~6 dagen | 105 (55%) |
| 3 | Rule Engine (optioneel) | ~3.5 dagen | 138 (72%) |
| 4 | Afronding & Docs | ~2 dagen | — |

**Totaal: ~14 werkdagen** (zonder sprint 3: ~11 werkdagen)

> Na sprint 2 is **~85% van de voordelen** behaald. Sprint 3 is optioneel.

---

## Gerelateerd

- [Business Rules Inventory](../docs/technical-manual/09-business-rules-inventory.md) — Ruwe inventarisatie uit broncode
