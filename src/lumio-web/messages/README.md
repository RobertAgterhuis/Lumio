# Vertaalbestanden — Architectuuroverzicht

> **LEES DIT VOORDAT JE EEN VERTAALBESTAND BEWERKT**

---

## Welke bestanden worden geladen op runtime?

De applicatie gebruikt **split per-domain bestanden**:

```
messages/
  nl/              ← ✅ ACTIEF — deze bestanden worden geladen op runtime
    shared.json
    auth.json
    dashboard.json
    erfgenamen.json
    videoboodschappen.json
    ... (één bestand per domein)
  en/              ← ✅ ACTIEF — idem, maar voor Engels
    shared.json
    auth.json
    ...
  nl.json          ← ❌ NIET ACTIEF — legacy referentiebestand, wordt NIET geladen
  en.json          ← ❌ NIET ACTIEF — legacy referentiebestand, wordt NIET geladen
```

## Hoe worden de split-bestanden geladen?

- **Root bundle** (`shared`, `auth`, `dashboard`, `ui`) → geladen door `LocaleProvider.tsx` via dynamische imports.
- **Domeinspecifieke bundles** (bijv. `erfgenamen`, `videoboodschappen`) → geladen door `DomainMessagesProvider` in elk domeinlayout (bijv. `erfgenamen/layout.tsx`).

## Regel

> **Bewerk uitsluitend `messages/nl/*.json` en `messages/en/*.json`.**  
> Wijzigingen in `messages/nl.json` of `messages/en.json` hebben **geen enkel effect** op de applicatie.

## Achtergrond

`messages/nl.json` en `messages/en.json` zijn legacy monolithische bestanden die als referentie zijn blijven staan. Ze zijn de bron geweest voor de initiële splitsing naar per-domain bestanden. Ze worden **niet** geïmporteerd door `next-intl` of enige component in de applicatie.

**LESSON_CANDIDATE-001 (Sprint 1 Retrospective):** Een eerdere sessie bewerkte per ongeluk de monolithische bestanden, wat resulteerde in ontbrekende vertalingen in de UI. Dit README-bestand is toegevoegd om herhaling te voorkomen.
