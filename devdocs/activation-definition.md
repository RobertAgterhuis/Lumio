# Activatiedefinitie — Lumio

> **SP-5-002** | Sprint 5 deliverable: activatieratio meten na launch  
> Gerelateerd: `devdocs/posthog-analytics.md`, `docs/guardrails/00-global-guardrails.md` (GUARD-006)

---

## Definitie: wat is een "geactiveerde" gebruiker?

Een gebruiker is **geactiveerd** wanneer het Lumio-dossier functioneel compleet is — d.w.z. wanneer alle stappen van de OnboardingWizard succesvol zijn voltooid.

### Primaire activatiedrempel (aanbevolen)

**Alle 7 OnboardingWizard-stappen voltooid:**

| Stap-ID | Voorwaarde |
|---|---|
| `profiel` | Eigenaar-record aanwezig (`eigenaar.id` ingesteld) |
| `noodcontacten` | Minimaal 1 noodcontact opgeslagen |
| `testament` | Testament-record aanwezig (`testament.id` ingesteld) |
| `uitvaart` | Uitvaartwensen aanwezig (`uitvaart.id` ingesteld) |
| `erfgenamen` | Minimaal 1 erfgenaam opgeslagen |
| `sleutels` | Minimaal 2 erfgenamen, allen met `heeftShareOntvangen === true` (Shamir SS) |
| `backup` | Geen openstaande backup-melding in `status/meldingen` |

Implementatie: `OnboardingWizard.tsx` — `stappen.every(s => stapStatus[s.id])` wordt `true`.  
API-call: `POST /api/eigenaar/onboarding-voltooid` wordt al aangeroepen op dit moment.

### Alternatieve (lage) activatiedrempel — voor funnel-analyse

Minimaal **3 kernstappen** voltooid (profiel + 2 domein-stappen):
- Gebruik: intermediaire meting om drop-off in de wizard te identificeren
- Eventname: `lumio_partial_activation` (toekomstig, niet geïmplementeerd in sprint 5)

---

## PostHog event: `lumio_activated`

### Wanneer te vuren

- Wanneer alle 7 stappen van de OnboardingWizard voor het eerst voltooid zijn
- Precies 1x per gebruiker (idempotent: bewaken via `instanceof localStorage === "true"` guard die al aanwezig is)
- Vuurpunt: `OnboardingWizard.tsx` — in het `useEffect` waar `allDone === true` + de `api.post("/api/eigenaar/onboarding-voltooid")` aanroep

### Event-definitie

```typescript
posthog.capture("lumio_activated", {
  stappen_voltooid: 7,
  activatie_reden: "onboarding_wizard_compleet",
  // GUARD-006: geen persoonlijke data, geen gezondheidsdata
  // Geen naam, e-mail, BSN, profielID, of inhoud van domeinen
});
```

### GUARD-006 constraints

- **Geen persoonsgevoelige data**: geen naam, e-mail, BSN, geboortedatum, profielID of hash
- **Geen inhoudelijke data**: geen testament-tekst, euthanasie-keuzes, donorregistratie, uitvaartwensen
- **Alleen gedragsdata**: "heeft alle stappen van de wizard voltooid" — geen inhoud
- **Properties beperkt**: uitsluitend `stappen_voltooid` (integer) en `activatie_reden` (enum string)

---

## KPI: Activatieratio

### Definitie

```
activatieratio = (unieke gebruikers met lumio_activated event) / (totaal geregistreerde gebruikers)
```

### Doelstelling Sprint 5

- **Target:** ≥ 50% activatieratio binnen 30 dagen na lancering
- **Meetperiode:** 30 dagen na de eerste publieke release
- **Baseline:** 0% (pre-launch)

### Meting in PostHog

**Insight: "Activatieratio (launch cohort)"**

```
Metric type: Trends
Event: lumio_activated
Aggregation: Unique users (per month)
```

**Funnel voor drop-off analyse:**

```
Stap 1: user_signed_up (of pageview /dashboard)
Stap 2: onboarding_stap_profiel_compleet  ← toekomstig event
Stap 3: onboarding_stap_backup_compleet   ← toekomstig event
Stap 4: lumio_activated
```

> Opmerking: de tussenliggende funnel-events (per stap) zijn nog niet geïmplementeerd. Sprint 5 implementeert alleen `lumio_activated`. Per-stap events zijn opgenomen in de backlog als `SP-5-003` (toekomstige sprint).

### Dashboard-configuratie

PostHog Dashboard: **"Lumio Activatie"**

| Widget | Type | Metric |
|---|---|---|
| Totaal geactiveerde users | Number | `lumio_activated` unique users all time |
| Activatieratio % | Formula | activated / (signed-up cohort) |
| Activatietrend 30d | Line chart | `lumio_activated` per dag |

---

## Implementatielocatie

**Bestand:** `src/lumio-web/src/components/wizard/OnboardingWizard.tsx`

**Locatie in code:** in het `useEffect` dat `allDone` bewaakt (regel ~104):

```typescript
// Bestaand:
void api.post("/api/eigenaar/onboarding-voltooid").catch(() => void 0);

// Toevoegen (na bovenstaande aanroep):
posthog.capture("lumio_activated", {
  stappen_voltooid: 7,
  activatie_reden: "onboarding_wizard_compleet",
});
```

Zie ook: `handleComplete` (regel ~125) — zelfde locatie waarop de API-call wordt gedaan bij handmatige afsluiting.

---

## Vereisten vóór productie-activering

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` ingesteld als GitHub Secret (zie `posthog-analytics.md`)
- [x] DPO-goedkeuring ontvangen — **✅ Goedgekeurd 2026-03-01** (zie `dpia-bijzondere-categorieen.md`)
- [ ] Privacy policy bijgewerkt met analytics disclosure

---

## Openstaande vragen / escalaties

| Code | Type | Vraag | Status |
|---|---|---|---|
| SP5-ACT-001 | `UNCERTAIN:` | Telt een gebruiker die de OnboardingWizard overslaat (handleDontShowAgain) alsnog als geactiveerd als alle 7 domeinen later gevuld zijn? | Aanbeveling: nee — activatie vereist expliciet afronden; separate check wordt niet geïmplementeerd in sprint 5. |
| SP5-ACT-002 | `INSUFFICIENT_DATA:` | Exacte post-launch gebruikersaantallen om ratio te berekenen zijn niet beschikbaar vóór lancering | Baseline staat op 0; KPI wordt na 30d lancering gemeten. |
