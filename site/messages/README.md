# Vertaalbestanden — Architectuuroverzicht

> **LEES DIT VOORDAT JE EEN VERTAALBESTAND BEWERKT**

---

## Welke bestanden worden geladen op runtime?

De applicatie gebruikt **uitsluitend split per-domain bestanden**:

```
messages/
  nl/              ← ✅ ACTIEF — deze bestanden worden geladen op runtime
    shared.json    ← Root namespace (common, nav, enums, contacts, feedback, errors, wizard, etc.)
    ui.json        ← Root namespace (personSelect, help, hulpteksten, legeStaten)
    auth.json      ← Root namespace (auth + sub-namespaces)
    dashboard.json ← Root namespace (dashboard + sub-namespaces)
    erfgenamen.json ← Domain-specific (geladen per route)
    testament.json  ← Domain-specific
    uitvaart.json   ← Domain-specific
    ... (18 domain files)
  en/              ← ✅ ACTIEF — idem, maar voor Engels
    shared.json
    auth.json
    ...
```

**Er zijn geen monolithic nl.json of en.json bestanden meer.**

---

## Hoe worden de split-bestanden geladen?

### Runtime (next-intl)

- **Root bundle** (`shared`, `auth`, `dashboard`, `ui`) → geladen door `src/i18n/request.ts` via dynamische imports
- **Domain-specifieke bundles** (bijv. `erfgenamen`, `videoboodschappen`) → geladen door `DomainMessagesProvider` in elk domain layout (bijv. `erfgenamen/layout.tsx`)

### Storybook

- **All namespaces** → gemerged door `src/lib/test-utils/storybook-messages.ts` helper
- Storybook stories gebruiken `storybookMessages("nl")` in plaats van monolithic imports

---

## Regel

> **Bewerk uitsluitend `messages/nl/*.json` en `messages/en/*.json`.**  
> Voeg nieuwe algemene keys toe aan `messages/nl/shared.json` (namespace: `common`, `contacts`, etc.)  
> Voeg nieuwe domain-specifieke keys toe aan het bijbehorende domain-bestand (bijv. `messages/nl/erfgenamen.json`)

---

## Nieuwe translation namespace toevoegen

**1. Algemene keys (beschikbaar op elke pagina):**
- Voeg toe aan `messages/nl/shared.json` en `messages/en/shared.json`
- Gebruik bestaande top-level namespaces: `common`, `contacts`, `nav`, `enums`, etc.
- Update comment in `src/i18n/request.ts` om nieuwe namespace te documenteren

**2. Domain-specifieke keys (alleen op specifieke routes):**
- Maak nieuw bestand: `messages/nl/domein.json` en `messages/en/domein.json`
- Importeer in het bijbehorende `app/domein/layout.tsx` via `DomainMessagesProvider`

**3. Voor Storybook:**
- Voeg import toe aan `src/lib/test-utils/storybook-messages.ts` als stories deze namespace nodig hebben

---

## Geschiedenis

**Voor maart 2026:** De applicatie gebruikte monolithic `nl.json` en `en.json` bestanden die automatisch werden gegenereerd door `scripts/merge-messages.ts`. Dit leidde tot verwarring (BUG-I18N-001) omdat developers keys toevoegden aan de monolithic files die in werkelijkheid build artifacts waren en nooit werden geladen.

**DEC-119 (5 maart 2026):** Alle Storybook stories zijn gerefactored om split files te gebruiken via de `storybookMessages()` helper. De monolithic bestanden en het merge-script zijn volledig verwijderd. Er is nu **Single Source of Truth**: alleen de split files bestaan.
