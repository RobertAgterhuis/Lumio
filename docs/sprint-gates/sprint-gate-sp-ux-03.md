# Sprint Gate — SP-UX-03: Terminologie, IA & Design System

**Sprint ID:** SP-UX-03  
**Branch:** `feature/sp-ux-03-terminology-ia-design`  
**Status:** COMPLETED  
**Datum start:** 2026-03-02  
**PR:** (te bepalen)

---

## Definition of Ready (DoR)

- [x] SP-UX-02 gemerged (pre-condition voldaan — PR #71 / 47bd971)
- [x] Source files volledig gelezen: PasswordStrengthMeter.tsx, IdleWarningDialog.tsx, Sidebar.tsx
- [x] Bestaande Storybook storiestructuur geïnventariseerd (30 stories, ConfirmDeleteDialog als decorator-referentie)
- [x] nl.json + en.json wizard-sleutels geïdentificeerd (3×`wizardStarten` + 1×`sluiten "Wizard sluiten"`)
- [x] Sidebar navGroups gelezen: `groep.hulpmiddelen` heeft 6 items — split tijdlijn/video/export vs. audit-log/instellingen/help
- [x] lumio-board-sync.yml TruffleHog fix gemerged (0ea0dbf)
- [x] Guardrails `docs/guardrails/06-implementation-guardrails.md` van toepassing
- [x] `docs/decisions.md` gecheckt: DEC-101 Chromatic uitgeschakeld, CI-job `if: false`

---

## Geïnjecteerde Lessons Learned

| ID | Label | Impact op sprint |
|----|-------|-----------------|
| LL-SP-UX-02-001 | Gebruik `npm run test:coverage` (unit only) voor CI-pariteit | Coverage check lokaal vóór push |
| LL-SP-UX-02-002 | `catch (e: unknown)` cast vereist voor strict tsc | Geen `.catch((e) => e)` zonder typecast |
| LL-002 | i18n-sleutels simultaan in nl.json + en.json | Elke nl.json wijziging meteen in en.json |

---

## Stories

| Story | Titel | GAP/REC | Prioriteit | SP |
|-------|-------|---------|------------|-----|
| UX-011 | PasswordStrengthMeter + IdleWarningDialog → Storybook | REC-UX-12 | P3 | 1 |
| UX-012 | Terminologie-audit: "Wizard starten" → contextlabels | REC-UX-13 | P3 | 5 |
| UX-013 | Sidebar Hulpmiddelen herstructurering | REC-UX-14 | P3 | 3 |

**Totaal: 9 SP**

---

## Bestanden

| Bestand | Stories | Wijziging |
|---------|---------|-----------|
| `src/lumio-web/src/components/auth/PasswordStrengthMeter.stories.tsx` | UX-011 | Nieuw — 5 stories (Empty/Weak/Medium/Strong/VeryStrong) |
| `src/lumio-web/src/components/layout/IdleWarningDialog.stories.tsx` | UX-011 | Nieuw — 2 stories (Default, LastWarning) |
| `src/lumio-web/messages/nl.json` | UX-012, UX-013 | 3× `wizardStarten` → "Invullen starten"; `"Wizard sluiten"` → "Sluiten"; `groep.beheer` toevoegen |
| `src/lumio-web/messages/en.json` | UX-012, UX-013 | Corresponderende EN-wijzigingen |
| `src/lumio-web/src/components/layout/Sidebar.tsx` | UX-013 | `groep.hulpmiddelen` splitsen in `groep.hulpmiddelen` (tijdlijn/video/export) + `groep.beheer` (audit-log/instellingen/help) |

---

## Acceptatiecriteria

### UX-011 — PasswordStrengthMeter + IdleWarningDialog Storybook
- [ ] `PasswordStrengthMeter.stories.tsx` aanwezig met ≥3 stories (lege staat, zwak wachtwoord, sterk wachtwoord)
- [ ] `IdleWarningDialog.stories.tsx` aanwezig met ≥2 stories (open, laatste waarschuwing)
- [ ] Beide stories bevatten `NextIntlClientProvider` decorator
- [ ] `tags: ["autodocs"]` aanwezig
- [ ] a11y governance parameters aanwezig

### UX-012 — Terminologie-audit
- [ ] Geen user-visible "Wizard starten" of "Wizard Starten" meer in nl.json
- [ ] Geen user-visible "Start wizard" of "Start Wizard" meer in en.json
- [ ] `"Wizard sluiten"` → `"Sluiten"` in nl.json; `"Close wizard"` → `"Close"` in en.json
- [ ] nl.json en en.json pariteit bewaard (LL-002)
- [ ] TypeScript typecheck clean

### UX-013 — Sidebar IA herstructurering
- [ ] Sidebar bevat twee aparte groepen voor voormalige `groep.hulpmiddelen` items
- [ ] Tijdlijn, videoboodschappen, export in functionele tools-groep (`groep.hulpmiddelen`)
- [ ] Audit-log, instellingen, help in beheer-groep (`groep.beheer`)
- [ ] `"beheer"` sleutel present in `nav.groep` (nl.json + en.json)
- [ ] TypeScript typecheck clean

---
