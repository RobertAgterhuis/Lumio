# Risk Validatie – Fase 2 Techniek & Architectuur – 2026-03-02
> Risk Agent | Agent 19 | Fase 2

---

## Risk Assessment – Software Architect (05)

- **Strategische alignment:** OK — Application Layer aanbeveling is een verlenging van bestaande DDD-structuur; gefaseerde aanpak (SP-12-14) is realistisch
- **Planningsrealisme:** RISICO — REC-ARCH-001 (Application Layer) is een omvangrijke refactor (34+ controllers). SP-12-14 bevat ook andere wijzigingen; capaciteitsrisico als team klein is
- **Compliance:** OK — geen compliance-risico's geïntroduceerd
- **Aanbevelingsrisico's:** RISICO (beperkt) — API versioning (REC-ARCH-003) vereist gecoördineerde frontend+backend release; breaking-change risico bij niet-correcte synchronisatie
- **Totaal risicoprofiel: MEDIUM**

**PLANNING_RISK-001:** Application Layer (REC-ARCH-001) over 3 sprints omvat 34 controllers + unit-test-refactoring. Als teamcapaciteit laag is, kan scope-creep de sprintdoelen bedreigen.  
**Mitigatie:** Begin met de 10 meest-gebruikte controllers (Common + Auth); definieer expliciete cut-off per sprint.

---

## Risk Assessment – Senior Developer (06)

- **Strategische alignment:** OK
- **Planningsrealisme:** OK — controller-tests gefaseerd over SP-11-14; realistisch tempo (≥5 controllers/sprint)
- **Compliance:** OK
- **Aanbevelingsrisico's:** RISICO (laag) — REC-DEV-002 (ESLint bulk-fix) kan styling-regressies introduceren als token-vervangingen incorrect zijn
- **Totaal risicoprofiel: LOW**

---

## Risk Assessment – DevOps Engineer (07)

- **Strategische alignment:** OK — TruffleHog + code signing zijn standaard best practices
- **Planningsrealisme:** OK — TruffleHog (SP-11-001) is minimale effort; code signing (SP-11-002) afhankelijk van extern cert (BLK-11-001)
- **Compliance:** OK
- **Aanbevelingsrisico's:** RISICO — crash reporting (REC-DEVOPS-003) vereist DPO-review VÓÓR activatie; als DPO GO uitblijft blokkeert dit SP-13-002
- **Totaal risicoprofiel: LOW**

---

## Risk Assessment – Security Architect (08)

- **Strategische alignment:** OK — security aanbevelingen consistent met offline-first privacy-first posture
- **Planningsrealisme:** RISICO — CSP SSR-migratie (REC-SEC-001, SP-14-001: 13 story points) is de grootste enkele story in de roadmap. Risico op SP-14 overload.
- **Compliance:** OK — GDPR-maatregelen zijn additioneel, niet conflicterend
- **Aanbevelingsrisico's:** RISICO — SSR-migratie (Next.js static → SSR) kan compatibiliteitsproblemen introduceren met bestaande Electron-renderpatroon. Vereist spike/prototype voordat het als stabiele story wordt gepland.
- **Totaal risicoprofiel: MEDIUM**

**PLANNING_RISK-002:** SP-14-001 (CSP SSR-migratie, 13 SP) in dezelfde sprint als SP-14-003 (Application Layer fase 3, 13 SP) = 26 SP in één sprint. Dit is onrealistisch tenzij het team groot genoeg is.  
**Mitigatie:** Splits SP-14: SP-14a = Application Layer afronden; SP-14b = SSR-migratie als dedicated sprint of spike.

---

## Risk Assessment – Data Architect (09)

- **Strategische alignment:** OK
- **Planningsrealisme:** OK — data woordenboek (SP-12-003) is low-effort ANALYSIS-story; PostHog EU (SP-11-003) is 1u
- **Compliance:** RISICO — UNCERTAIN-DATA-002 (PostHog datacenter) is een potentieel AVG-overtreding. Snel te resolven maar formeel open totdat geverifieerd.
- **Aanbevelingsrisico's:** OK
- **Totaal risicoprofiel: LOW**

---

## Systeemrisico's (Cross-Agent)

| ID | Omschrijving | Agents betrokken | Ernst | Mitigatie |
|---|---|---|---|---|
| SYS-RISK-001 | SP-14 is te vol: SSR-migratie (13 SP) + Application Layer fase 3 (13 SP) + pentest + controller-tests in één sprint | Arch + Security | Hoog | Splits SP-14 in SP-14a (Application Layer) + SP-14b (SSR-spike); verschuif pentest naar pre-release gate |
| SYS-RISK-002 | Application Layer (3 sprints) + controller-tests (SP-11-14) + ESLint fixes + session timeout in parallel → capaciteitsrisico als team < 3 FTE | Senior Dev + Arch | Midden | Teamsamenstellingsdata aanleveren vóór SP-11-planning; prioriteer P1 strict |
| SYS-RISK-003 | next@16.1.6 UNCERTAIN status niet opgelost → bij publicatie als RC met CVEs introduceert dit A06-risico | DevOps + Security | Midden | Oplossen in SP-11-003 extension of dedicated ticket |

---

## Fase Risk Verdict

**Fase 2 Risico: APPROVED (na mitigatie)**

Eerder verdict: NEEDS_REVIEW (SYS-RISK-001: SP-14 overload).

**Mitigatie toegepast (2026-03-02):**
1. ✅ SP-14 gesplitst: SSR-migratie (REC-SEC-001) verplaatst naar nieuw SP-15 (dedicated SSR-sprint). SP-14 nu: Application Layer fase 3 + controller-tests + pentest spike.
2. ⬜ Teamcapaciteit documenteren vóór SP-11-start (Orchestrator actie — OPEN, INSUFFICIENT_DATA).

SYS-RISK-002 en SYS-RISK-003 blijven MEDIUM — op te lossen bij sprint-planning.

**Fase 2 is APPROVED. Fase 3 (UX) kan aanvangen.**

---

## HANDOFF CHECKLIST — Risk Agent Fase 2
- [x] Alle 5 agents + sprintplan + guardrails beoordeeld
- [x] Strategische alignment gecontroleerd
- [x] Implementatiehaalbaarheid beoordeeld
- [x] Compliance risico's gecontroleerd
- [x] Aanbevelingsrisico's beoordeeld
- [x] Systeemrisico's geïdentificeerd
- [x] Risk score per agent bepaald
- [x] Fase risk verdict bepaald (NEEDS_REVIEW)
- [x] Mitigatie-vereisten geformuleerd
