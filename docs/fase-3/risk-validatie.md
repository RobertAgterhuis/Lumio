# Risk Validatie – Fase 3 (UX & Product) – 2026-03-02
> Risk Agent | Post-Fase 3 | Risicobeoordeling UX-fase

## Metadata
- Agent: Risk Agent (19)
- Fase: 3 — UX & Product Experience
- Input: Fase 3 output (agents 10–13) + Fase 2 risk-validatie
- Datum: 2026-03-02

---

## Geïdentificeerde Risico's

| ID | Beschrijving | Kans (1-3) | Impact (1-3) | Score | Status |
|---|---|---|---|---|---|
| SYS-RISK-009 | Shamir-reconstructie nabestaanden onbruikbaar — 0/5 testssessies; pre-launch | 3 | 3 | **9 — KRITIEK** | OPEN → SP-UX-01 REC-UX-001 |
| SYS-RISK-UX-001 | Activatieratio <50% door onboarding drop-off (Shamir-stap + uitvaartvolgorde) | 2 | 3 | **6 — HOOG** | OPEN → REC-UX-003+004 |
| SYS-RISK-UX-002 | A11y regressies onbespeurbaar (geen axe-CI op Electron-app) | 3 | 2 | **6 — HOOG** | OPEN → REC-A11Y-001 |
| SYS-RISK-UX-003 | Whitelabel-product visueel broken door 224 raw-color violations | 2 | 3 | **6 — HOOG** | OPEN → REC-UIDESIGN-001 (Fase 2 SP-12–13) |
| SYS-RISK-UX-004 | Screen reader-gebruikers missen statusberichten (aria-live) | 2 | 2 | **4 — MIDDEN** | OPEN → REC-A11Y-002 |

---

## Cross-fase Risicocheck

| Risico | Overlap Fase 2 | Toelichting |
|---|---|---|
| SYS-RISK-009 | SYS-RISK-009 — al aanwezig in Fase 2 security context | UX-fase bevestigt: nog steeds OPEN; SP-UX-01 vereist |
| SYS-RISK-UX-003 (raw colors) | Fase 2: REC-DEV-002 / SP-12–13 | Al opgenomen in Fase 2 sprintplan — geen extra sprint vereist |

---

## Mitigaties Vereist

### SYS-RISK-009 (Score 9 — KRITIEK)
**Mitigation:** REC-UX-001 (Shamir UX-test), REC-UXDESIGN-001 (icoon+copy), REC-UXDESIGN-003 (entry-point nabestaanden)
**Sprint:** SP-UX-01 — alle 3 aanbevelingen GEBLOKKEERD voor v1.0 release

### SYS-RISK-UX-001 (Score 6 — HOOG)
**Mitigation:** REC-UX-003 (wizardvolgorde), REC-UX-004 (partial_activation event)
**Sprint:** SP-UX-01 + SP-UX-02

### SYS-RISK-UX-002 (Score 6 — HOOG)
**Mitigation:** REC-A11Y-001 (axe-CI)
**Sprint:** SP-UX-01

---

## Verdict

**FASE 3: APPROVED (na mitigatie-registratie)**

Alle risico's zijn gekoppeld aan concrete aanbevelingen en sprintactie. Geen nieuwe sprint-splitsing vereist (cf. Fase 2 SYS-RISK-001). SYS-RISK-UX-003 is reeds gedekt in Fase 2 sprintplan.

---

## HANDOFF CHECKLIST — Risk Agent Fase 3
- [x] Alle identified risks voorzien van kans/impact/score
- [x] SYS-RISK-009 als score-9 kritiek bewaard
- [x] Cross-fase overlap gecheckt
- [x] Alle risico's gekoppeld aan REC-NNN
- [x] Verdict: APPROVED
