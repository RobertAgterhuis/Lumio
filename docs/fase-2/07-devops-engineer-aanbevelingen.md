# Aanbevelingen – DevOps & Infrastructure (DevOps Engineer) – 2026-03-02
> DevOps Engineer | Agent 07 | Fase 2

## Metadata
- Agent: DevOps Engineer (07)
- Fase: 2
- Gebaseerd op analyse: `docs/fase-2/07-devops-engineer-analyse.md`
- Datum: 2026-03-02

---

## Aanbeveling REC-DEVOPS-001

### Probleem
Code signing is optioneel geconfigureerd (secrets ontbreken). Unsigned Electron-executables triggeren SmartScreen-waarschuwingen op Windows 10/11 bij eindgebruikers, wat het installatievertrouwen schaadt.  
**Analyse referentie:** GAP-DEVOPS-001

### Oplossing
Activeer code signing door een EV Code Signing Certificate aan te schaffen en de `CSC_LINK` en `CSC_KEY_PASSWORD` GitHub-secrets te configureren. De `release.yml` ondersteunt dit al volledig.

**Implementatie-aanpak:**
1. Schaf een EV (Extended Validation) Code Signing Certificate aan bij een vertrouwde CA (bijv. DigiCert, Sectigo).
2. Sla het P12/PFX-bestand op als GitHub Actions secret `CSC_LINK` (base64-encoded of directe file-path).
3. Sla het wachtwoord op als `CSC_KEY_PASSWORD`.
4. Test op een Windows VM of SmartScreen-melding verdwenen is vóór volgende release.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Positief — minder installatie-afbreuk bij zakelijke gebruikers | IT-afdelingen kunnen unsigned installers blokkeren via Group Policy |
| Risk Reductie | Hoog — EV-certificaat biedt instant SmartScreen-reputatie | UNCERTAIN: exacte verbetering afhankelijk van CA en certificaattype |
| Cost | Negatief — EV-certificaat ~€200-500/jaar | UNCERTAIN: exacte prijs afhankelijk van CA |
| UX | Positief — geen SmartScreen-blokkade bij installatie | Directe impact op first-run experience |

### Risico's van niet uitvoeren
Zakelijke klanten kunnen automatische blokkades hebben op unsigned software via Group Policy of Intune. Reputatieschade bij eindgebruikers die "Onbekende uitgever" zien bij eerste installatie.

### Meetcriterium
- KPI: Code signing geconfigureerd (binair)
- Baseline: Nee
- Target: Ja, elke release-build is gesigneerd
- Meetmethode: Controleer `signtool verify` output in `release.yml`; of SmartScreen-check op testmachine
- Tijdshorizon: SP-11 (certificaat aanvragen + pipeline configureren)

---

## Aanbeveling REC-DEVOPS-002

### Probleem
TruffleHog secret scan is niet beschikbaar in CI (TOOLING_GAP). Accidenteel gecommittede secrets worden pas ontdekt bij code review of incident.  
**Analyse referentie:** GAP-DEVOPS-002, TOOLING_GAP (onboarding-output.md)

### Oplossing
Voeg een GitHub Actions-stap toe die de **open-source TruffleHog GitHub Action** gebruikt voor secret scanning op elke PR. TruffleHog hoeft niet lokaal geïnstalleerd te zijn — de GitHub Action is zelfstandig bruikbaar.

**Implementatie-aanpak:**
1. Voeg een nieuwe job `secret-scan` toe aan `ci.yml`:
```yaml
secret-scan:
  name: Secret scan (TruffleHog)
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
      with:
        fetch-depth: 0
    - name: TruffleHog secret scan
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: ${{ github.event.repository.default_branch }}
        head: HEAD
        extra_args: --only-verified
```
2. Maak dit blokkerend voor PR-merges naar `main`.
3. Verwijder de TOOLING_GAP notitie in `docs/session/session-state.json` en `docs/onboarding/onboarding-output.md` zodra de job actief is.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Neutraal | Geen directe revenue-impact |
| Risk Reductie | Hoog — gecommittede secrets (API keys, wachtwoorden) worden automatisch gedetecteerd | Industry-standaard guardrail |
| Cost | Neutraal — gratis GitHub Action | Geen licentiekosten |
| UX | Neutraal | Geen directe UX-impact |

### Risico's van niet uitvoeren
Accidenteel gecommittede secrets (PostHog keys, signing certificates, API tokens) wordenniet automatisch gedetecteerd. Blootstelling kan leiden tot ongeautoriseerde toegang of datalekken.

### Meetcriterium
- KPI: TruffleHog secret scan actief in CI (binair)
- Baseline: Nee (TOOLING_GAP)
- Target: Ja, blokkerend op elke PR naar `main`
- Meetmethode: `.github/workflows/ci.yml` bevat `secret-scan` job
- Tijdshorizon: SP-11 (30 minuten implementatie)

---

## Aanbeveling REC-DEVOPS-003

### Probleem
Geen crash reporting of error tracking in productie. Productiefouten zijn alleen inzichtelijk via de lokale logfile van de eindgebruiker, wat proactieve incident-respons onmogelijk maakt.  
**Analyse referentie:** OBSERVABILITY_GAP-001

### Oplossing
Integreer **Sentry** (of vergelijkbaar) voor crash reporting. Voor een offline desktop-app wordt de crash-report bij herstart (of na netwerkherstel) asynchroon verzonden. Bouw opt-in consent in vanwege AVG-verplichtingen.

**Implementatie-aanpak:**
1. Evalueer crash reporting opties die werken zonder permanente internetverbinding: Sentry SDK (buffert crashes lokaal), of een simpeler custom middleware die crashes naar een opt-in endpoint stuurt.
2. Bouw expliciete opt-in consent in de OnboardingWizard (stap 8 of separaat privacy-scherm).
3. DPO-review vereist vóór activatie (GDPR: crash reports kunnen persoonsgegevens bevatten).
4. Configureer Sentry DSN via environment variable, nooit hardcoded.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | Positief — snellere detectie en fix van productiefouten vermindert churn | INSUFFICIENT_DATA: exacte churn-impact niet meetbaar |
| Risk Reductie | Hoog — proactieve productie-monitoring | Zonder crash reporting is elk incident een "black box" |
| Cost | Negatief initieel — Sentry Free plan beschikbaar; Pro ~$26/mnd | UNCERTAIN: volume-afhankelijk |
| UX | Positief — snellere bugfixes door betere herstelbaarheid | Eindgebruiker merkt kortere incidentduur |

### Afhankelijkheden
- Vereist: DPO-review + DPIA-update (bijzondere categorieën AVG)
- Vereist: Opt-in consent UI

### Risico's van niet uitvoeren
Onbekende productiefouten bij eindgebruikers. Team reageert reactief, pas nadat eindgebruikers ondersteuning aanvragen. MTTR (Mean Time to Recovery) onmeetbaar.

### Meetcriterium
- KPI: Crash reporting geconfigureerd met opt-in consent (binair)
- Baseline: Nee
- Target: Ja, actief voor ≥60% van gebruikers (opt-in rate)
- Meetmethode: Sentry dashboard actieve sessies; PostHog consent-event
- Tijdshorizon: SP-13 (na DPO-review)

---

## PRIORITEITENMATRIX

| Aanbeveling ID | Impact | Effort | Prioriteit | Sprint |
|----------------|--------|--------|------------|--------|
| REC-DEVOPS-002 (TruffleHog CI) | Hoog | Laag | P1 | SP-11 (~30 min) |
| REC-DEVOPS-001 (Code signing) | Hoog | Midden | P1 | SP-11 |
| REC-DEVOPS-003 (Crash reporting) | Midden | Hoog | P2 | SP-13 (na DPO) |

---

## HANDOFF CHECKLIST — Aanbevelingen DevOps Engineer
- [x] Alle aanbevelingen verwijzen naar analyse-bevindingen
- [x] Impacts hebben rationale of INSUFFICIENT_DATA markering
- [x] UNCERTAIN items gedocumenteerd
- [x] Meetcriteria SMART
- [x] Prioriteitenmatrix volledig
- [x] Status: READY voor Security Architect
