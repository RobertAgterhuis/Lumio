# Fase 5 — Backlog

Deferred sprint items. Entries here zijn bewust uitgesteld; ze zijn niet vergeten.

---

## SP-S4-PLQ — Plausible.io op marketing site
**Origineel gepland:** Sprint 4 (Roadmap Q2)
**Uitgesteld op:** 2026-03-01
**Reden:** Bewust gedeferred door producteigenaar — overige Sprint 4 items gaan door.
**Scope:**
- `<Script>` tag voor `https://plausible.io/js/plausible.js` in `site/src/app/layout.tsx`
- `data-domain="lumio.app"` instellen
- Privacy policy bijwerken (vermelding Plausible als privacy-vriendelijke analytics)
- Plausible account aanmaken + domein registreren
- KPI-target: analytics live ✅

**Blocker:** Plausible account aanmaken is een PO-actie (externe service).
**Aanbeveling:** Oppakken in Sprint 5 of als hotfix zodra PO account heeft aangemaakt.
**Geschatte SP:** 1–2 SP
**Afhankelijkheid:** Plausible account + domein configuratie

---

## SP-CRO1-001 — Checkout via Odoo
**Origineel gepland:** Sprint 1
**Uitgesteld op:** Sprint 1 (EXTERN_BLOCKED, nog steeds open)
**Reden:** Odoo account + configuratie vereist — PO actie nog niet afgerond.
**Scope:**
- Odoo checkout URL of hosted payment link voor €125 licentie aanvragen bij PO
- `BUY_CONSUMER_HREF` in `site/src/lib/constants.ts` bijwerken naar Odoo URL
- `BUY_CONSUMER_MAILTO` vervangen door Odoo payment link
- AVG Art.13 tekst op checkout-pagina valideren
- KPI-target: Checkout completion rate ≥65%

**Blocker:** Odoo account + configuratie niet beschikbaar. PO actie vereist:
  1. Odoo-omgeving inrichten
  2. Checkout URL of hosted payment link aanleveren voor €125 licentie
  3. AVG Art.13 informatieplicht op checkout-pagina

**Aanbevelen actie:** Zodra Odoo-URL beschikbaar: 1 regel in `constants.ts` → direct live.
**Geschatte SP:** 2 SP (na PO levering)

---
