# KPI Trend — Lumio

_Laatste update: SP-1 — 2026-03-01_

---

## Samenvatting (SP-1)

- ✅ On Track: **2** KPIs
- ⚠️ At Risk: **1** KPI
- ❌ Off Track: **0** KPIs
- ❓ Insufficient Data: **2** KPIs

---

## KPI Dashboard

| KPI | Categorie | Baseline | Target | SP-1 | Trend |
|-----|-----------|----------|--------|------|-------|
| SQLCipher KDF iteraties | SECURITY | 256.000 | ≥100.000 (audit: ≥310.000) | **312.000** ✅ | ↑ |
| Backend test coverage | KWALITEIT | n.v.t. | ≥70% (SP-3) | 7,3% ⚠️ | — |
| Frontend coverage lib/stores | KWALITEIT | ≥70% | ≥70% | ❓ | — |
| CI pipeline pass rate | TECHNISCH | n.v.t. | ≥95% | ❓ | — |
| Kritieke security findings | SECURITY | n.v.t. | 0 | **0** ✅ | → |

---

## At Risk KPIs (monitoring vereist)

| KPI | Huidige waarde | Target | Sprint-target | Toelichting |
|-----|---------------|--------|---------------|-------------|
| Backend test coverage | 7,3% | ≥70% | SP-3 | Verwachte stijging per sprint. SP-1 voegt 36 tests toe voor nieuwe security-services. Actie in SP-2 en SP-3. |

---

## Off Track KPIs
_Geen off-track KPIs in SP-1._

---

## Trend Historie per KPI

### KPI-SEC-001: SQLCipher KDF iteraties

| Sprint | Waarde | Status | Toelichting |
|--------|--------|--------|-------------|
| SP-1 | 312.000 iter PBKDF2-HMAC-SHA512 | ✅ ON_TRACK | Migratie via SqlCipherKdfService; overschrijdt audit-minimum ≥310.000 |

---

### KPI-QUAL-001: Backend test coverage

| Sprint | Waarde | Status | Toelichting |
|--------|--------|--------|-------------|
| SP-1 | 7,3% | ⚠️ AT_RISK | Eerste meting; sprint-target is SP-3. 167 tests actief. |

---

### KPI-QUAL-002: Frontend coverage lib/stores

| Sprint | Waarde | Status | Toelichting |
|--------|--------|--------|-------------|
| SP-1 | ❓ | INSUFFICIENT_DATA | Geen frontend-wijzigingen in SP-1. |

---

### KPI-OPS-001: CI pipeline pass rate

| Sprint | Waarde | Status | Toelichting |
|--------|--------|--------|-------------|
| SP-1 | ❓ | INSUFFICIENT_DATA | CI run history niet beschikbaar; beschikbaar na eerste merge. |

---

### KPI-SEC-002: Kritieke security findings

| Sprint | Waarde | Status | Toelichting |
|--------|--------|--------|-------------|
| SP-1 | 0 | ✅ ON_TRACK | Nul SECURITY_VIOLATION bevindingen in PR/Review Agent SP-1 review. |
