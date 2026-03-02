# Cross-Team Blocker Matrix — Lumio — 2026-03-02
> Synthesis Agent | COMBO_AUDIT: TECHNIEK + UX | Gegenereerd uit Fase 2 + Fase 3

⚠️ **PARTIAL_AUDIT:** Fase 1 (Business) en Fase 4 (Marketing) niet uitgevoerd. Deze matrix dekt uitsluitend TECHNIEK ↔ UX interdependenties.

---

## Leeswijzer

Rijen = team dat geblokkeerd wordt of input nodig heeft.
Kolommen = team dat moet leveren of beslissen.
Cel = beschrijving van de afhankelijkheid + classificatie (BLOKKEREND / ADVISEREND).

---

## Matrix (Hoog-niveau)

| Vragende partij | Van: Techniek/Engineering | Van: UX/Product | Van: Business/Product Owner |
|---|---|---|---|
| **Techniek/Engineering** | — | BLOKKEREND: UX-afstemming session timeout duur + idle warning ontwerp (SP-12) | BLOKKEREND: DPO-beoordeling crash reporting consent (SP-13) |
| **UX/Product** | BLOKKEREND: Electron unlock-scherm aanpassing voor nabestaanden-entry (SP-UX-01) | — | ~~BLOKKEREND: DEC-101 herbeoordeling~~ **VERVALLEN — DEC-101 definitief BESLOTEN** |
| **Business/Product Owner** | ADVISEREND: PostHog EU-datacenter verificatie + DPIA-update (actie vereist van DPO) | ADVISEREND: Shamir UX-testresultaten als release-gate input | — |

---

## Gedetailleerde Blocker Tabel

| Blocker ID | Vragende partij | Blokkerende partij | Beschrijving | Type | Prioriteit | Aanbevolen actie |
|---|---|---|---|---|---|---|
| ~~BLK-001~~ | ~~UX/Product~~ | ~~Engineering~~ | ~~`lumio_partial_activation` PostHog event per wizard-stap (REC-UX-004)~~ | VERVALLEN | — | **VERVALLEN — DEC-102. Geen nieuwe PostHog events.** |
| BLK-002 | UX/Product | Engineering | Unlock-scherm nabestaanden-entry (REC-UXDESIGN-003) vereist Electron main-process aanpassing | BLOKKEREND | HOOG | UX Design levert wireframe SP-UX-01; Engineering implementeert parallel |
| BLK-003 | Engineering | UX/Product | Session auto-lock (REC-SEC-003): idle-timeout duur (bijv. 15 min), warning-dialog tekst, UX-flow na lock vereist UX-beslissing vóór implementatie | BLOKKEREND | HOOG | UX levert specificatie vóór SP-12 sprint-start |
| BLK-004 | Engineering | Business/DPO | Crash reporting (REC-DEVOPS-003): opt-in consent tekst + DPO GDPR-beoordeling — juridisch vereist | BLOKKEREND | HOOG | Business/DPO levert consent-tekst vóór SP-13 |
| ~~BLK-005~~ | ~~Engineering~~ | ~~Business/Product Owner~~ | ~~Penetratietest (REC-SEC-004): opdrachtverlening + budget~~ | VERVALLEN | — | **VERVALLEN — DEC-202. Pentest niet blokkerend; optioneel aan einde dev-cyclus.** |
| ~~BLK-006~~ | ~~UX/Product~~ | ~~Business/Product Owner~~ | ~~DEC-101 (Chromatic) herbeoordeling~~ | VERVALLEN | — | **VERVALLEN — DEC-101 definitief BESLOTEN: geen Chromatic in huidige cyclus.** |
| BLK-007 | Business | Engineering | PostHog EU-datacenter verificatie (REC-DATA-003): technische verificatie datacenter-locatie; DPIA-update door DPO | ADVISEREND | HOOG | Engineering verifieert in SP-11 (1 uur); DPO update DPIA aansluitend |
| BLK-008 | Business | UX/Product | Shamir UX-testresultaten als release-gate: product owner beslist release-go op basis van ≥4/5 testresultaat | ADVISEREND | HOOG | Na SP-UX-01-001 testrapport — product owner beslissingsmoment |

---

## Blocker-status Sprintplan Mapping

| Blocker ID | Sprint | Story | Status |
|---|---|---|---|
| ~~BLK-001~~ | ~~SP-UX-01~~ | ~~SP-UX-01-005~~ | **VERVALLEN — DEC-102** |
| BLK-002 | SP-UX-01 | SP-UX-01-004 | ACTIE VEREIST — wireframe + Electron aanpassing |
| BLK-003 | SP-12 | SP-12-SEC-001 (Fase 2) | ACTIE VEREIST — UX specificatie vóór sprint start |
| BLK-004 | SP-13 | SP-13-OBS-001 (Fase 2) | ACTIE VEREIST — DPO consent tekst |
| ~~BLK-005~~ | ~~SP-14~~ | ~~SP-14-SEC-001~~ | **VERVALLEN — DEC-202 (pentest niet blokkerend)** |
| ~~BLK-006~~ | ~~SP-UX-03~~ | ~~SP-UX-03-002~~ | **VERVALLEN — DEC-101 definitief BESLOTEN** |
| BLK-007 | SP-11 | SP-11-003 (Fase 2) | ADVISEREND — 1-uurs taak |
| BLK-008 | Post SP-UX-01 | Beslissingsmoment | ADVISEREND — release-gate gesprek |

---

## Resolutie-Protocol

Elke BLOKKEREND blocker die niet is opgelost 3 werkdagen vóór sprint-start BLOKKEERT de Sprint Gate en escaleert naar de Orchestrator + Product Owner.
