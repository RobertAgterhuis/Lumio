# Partner Starter Template

Dit is de startsconfiguratie voor een nieuwe Lumio whitelabel-partner.

## Gebruik

1. Kopieer deze map naar `tools/whitelabel/configs/<uw-slug>/`
2. Voeg uw logo toe als `logo.svg` in die map
3. Vul alle waarden in `whitelabel.json` in (zie tabel hieronder)
4. Valideer: `ajv validate -s ../../schema.json -d whitelabel.json`
5. Build: `.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\<slug>"`

## Velden

| Veld | Beschrijving | Voorbeeld |
|------|-------------|-----------|
| `companyName` | Volledige organisatienaam | `"ACME B.V."` |
| `productName` | Productnaam in de app en taakbalk | `"ACME Nalatenschap"` |
| `appId` | Unieke reverse-domain ID | `"com.acme.nalatenschap"` |
| `colors.primaryBase` | Hoofdkleur (knoppen, highlights) | `"#0066CC"` |
| `colors.primaryLight` | Lichte variant (+15–20% helderheid) | `"#3385D6"` |
| `colors.primaryDark` | Donkere variant (−15–20% helderheid) | `"#004E9A"` |
| `colors.primaryForeground` | Tekstkleur op primaire achtergrond | `"#FFFFFF"` |
| `colors.accentBase` | Accentkleur; mag gelijk zijn aan primary | `"#0066CC"` |
| `colors.accentLight` | Lichte accentvariant | `"#3385D6"` |
| `colors.accentDark` | Donkere accentvariant | `"#004E9A"` |
| `colors.accentForeground` | Tekst op accentkleur | `"#FFFFFF"` |
| `titleBarColor` | Achtergrondkleur OS-titelbalk | `"#0066CC"` |
| `titleBarSymbolColor` | Kleur min/max/sluit-knoppen | `"#FFFFFF"` |
| `splashColor` | Achtergrondkleur splash-scherm | `"#004E9A"` |
| `logo.file` | Bestandsnaam van het logo | `"logo.svg"` |
| `logo.height` | Hoogte in pixels (16–128) | `48` |
| `logo.opacity` | Doorzichtigheid (0.0–1.0) | `0.9` |
| `logo.showOnSplash` | Logo tonen op splash-scherm | `true` |
| `logo.useAsAppIcon` | Logo gebruiken als Windows-icoon | `true` |
| `dashboardMessage` | Optioneel bericht op dashboard | `"Aangeboden door..."` |

## WCAG-eis

Uw `primaryBase` kleur moet **minimaal 4.5:1 contrast** hebben ten opzichte van `primaryForeground`.  
Check: [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)

## Niet aanpassen

- Verwijder geen `$schema` of `schemaVersion` velden
- Gebruik uitsluitend hex-kleurwaarden (bijv. `#0066CC`, niet `rgb(...)`)
- `appId` moet uniek zijn — overleg met Lumio

## Meer informatie

- Volledig governance kader: `../BRAND-GOVERNANCE.md`
- Technische engine-documentatie: `../README.md`
- Onboarding handleiding: `../PARTNER-ONBOARDING.md`
- Referentie-implementatie (werkt): `../example-corp/`
