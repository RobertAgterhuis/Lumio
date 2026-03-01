# PostHog Analytics — Setup & Activatie

> **SP-7-002** | Compliance-gating: DPO-toets vereist vóór activering (zie `dpia-bijzondere-categorieen.md`)

---

## Status

| Omgeving | Status |
|---|---|
| Development (lokaal) | Standaard uitgeschakeld (`NEXT_PUBLIC_POSTHOG_KEY` leeg) |
| CI/CD Build | Optioneel — wordt geactiveerd via GitHub Secret |
| Productie | Vereist instellen GitHub Secret + DPO-goedkeuring |

---

## Werking

De `PostHogProvider` in `src/lumio-web/src/components/providers/PostHogProvider.tsx` initialiseert PostHog **alleen** als `NEXT_PUBLIC_POSTHOG_KEY` is ingesteld en niet leeg is.  
Als de key ontbreekt, zijn alle analytics-aanroepen no-ops. De applicatie werkt volledig zonder PostHog.

**GUARD-006 constraints (altijd van toepassing):**
- Auto-capture is uitgeschakeld (`autocapture: false`)
- Geen session recording (`disable_session_recording: true`)
- Nooit gevoelige data (gezondheid, financieel, passwords) in events
- Alleen expliciete `posthog.capture(...)` aanroepen zijn toegestaan

---

## Lokale activering (ontwikkeling)

1. Kopieer `.env.example` naar `.env.local`:
   ```bash
   cp src/lumio-web/.env.example src/lumio-web/.env.local
   ```
2. Vul de PostHog project API key in:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```
3. Start de dev server — PostHog wordt nu geïnitialiseerd.

> Voor EU-regio datahosting: gebruik `https://eu.i.posthog.com` als host.

---

## CI/CD activering (GitHub Actions)

De CI-workflow (`ci.yml`) geeft de secrets door aan de Next.js build als ze zijn ingesteld:

```yaml
- name: Build
  env:
    NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}
    NEXT_PUBLIC_POSTHOG_HOST: ${{ secrets.NEXT_PUBLIC_POSTHOG_HOST }}
  run: npm run build
```

### GitHub Secrets instellen

1. Ga naar **GitHub → Repository → Settings → Secrets and variables → Actions**
2. Voeg toe:
   - `NEXT_PUBLIC_POSTHOG_KEY` — jouw PostHog project API key
   - `NEXT_PUBLIC_POSTHOG_HOST` — bijv. `https://eu.i.posthog.com`

Als de secret **niet** is ingesteld, bouwt de CI zonder analytics (build slaagt altijd).

---

## Productie (Electron packaging)

Bij het bouwen van de Electron-distributie via `tools/build.ps1`:

1. Stel de env-variabelen in vóór het buildproces:
   ```powershell
   $env:NEXT_PUBLIC_POSTHOG_KEY = "phc_xxxx"
   $env:NEXT_PUBLIC_POSTHOG_HOST = "https://eu.i.posthog.com"
   .\tools\build.ps1
   ```
2. De Next.js static export bakt de key in het bundle. **Let op**: de key wordt zichtbaar in de client-bundle — gebruik altijd een write-only project key zonder admin-rechten.

---

## DPO-toets vereiste

Zie `devdocs/dpia-bijzondere-categorieen.md`. Vóór productie-activering moet:
- [x] DPO DPIA goedkeuring ontvangen — **✅ Goedgekeurd 2026-03-01** (COMPLIANCE_RISK-GROWTH-001 GESLOTEN)
- [ ] Privacy policy bijgewerkt met analytics disclosure
- [ ] Opt-out mechanisme geïmplementeerd (of expliciete toestemming) — `respect_dnt: true` actief; UI opt-out nog te documenteren
