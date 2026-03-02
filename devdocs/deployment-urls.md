# Deployment URLs

## Marketing Site (site/)

| Omgeving | URL | Status |
|----------|-----|--------|
| Productie (custom domain) | https://www.lumio-legacy.nl | ✅ CNAME-bestand aanwezig — DNS instellen bij registrar (zie hieronder) |
| GitHub Pages (fallback) | https://\<org\>.github.io/\<repo\>/ | Actief na eerste deploy-run |

### Hoe deployen

De marketing-site wordt automatisch uitgerold via `.github/workflows/deploy-site.yml` bij elke push naar `main` die bestanden in `site/` raakt.

**Eenmalige GitHub-repo setup:**
1. Ga naar `Settings → Pages → Source` → kies **"GitHub Actions"**
2. Na de eerste workflow-run is de site live op de GitHub Pages URL hierboven

**Custom domain (lumio-legacy.nl) instellen:**

Stap 1 — eenmalige repo-instelling (nog te doen):
1. Ga naar `Settings → Pages → Custom domain` → vul in: `www.lumio-legacy.nl`

Stap 2 — DNS bij registrar (domein: `lumio-legacy.nl`):
- Record type: `CNAME`
- Naam / Host: `www`
- Waarde / Target: `<org>.github.io`

Stap 3:
3. Wacht op DNS-propagatie (max. 24u); GitHub toont "✓ DNS check successful"
4. Vink **"Enforce HTTPS"** aan zodra het certificaat is uitgerold

> De `site/public/CNAME` is reeds aanwezig in de repo (`www.lumio-legacy.nl`). GitHub Pages leest dit bestand automatisch — Stap 1 (repo-instelling) vullt GUI enkel voor bevestiging.

### Google indexering

- `site/public/robots.txt` — staat alle crawlers toe, verwijst naar `sitemap.xml`
- `site/public/sitemap.xml` — vermeldt alle 8 pagina’s van `www.lumio-legacy.nl`
- `site/public/CNAME` — bevat `www.lumio-legacy.nl` (GitHub Pages lees dit automatisch)
- Voeg na livegang de site toe aan [Google Search Console](https://search.console.google.com) en dien de sitemap-URL in: `https://www.lumio-legacy.nl/sitemap.xml`

### Canonical domein beslissing

Het canonieke domein is **`https://www.lumio-legacy.nl`** (www-subdomain).

- `site/next.config.ts` is geconfigureerd met `trailingSlash: true` en `output: "export"` — statische export geschikt voor elke CDN of Pages-host.
- Alle sitemap-URLs en robots.txt verwijzen naar `https://www.lumio-legacy.nl/`.

### STATUS: DNS PROPAGATIE AFWACHTEN

Domein `lumio-legacy.nl` is geregistreerd. Resterende acties:
1. ~~Domeinregistratie `lumio-legacy.nl`~~ — ✅ GEREED
2. ~~CNAME-bestand in repo~~ — ✅ GEREED (`site/public/CNAME`)
3. GitHub Pages custom domain instellen in repo-Settings (eenmalig, GUI)
4. DNS bij registrar instellen: `CNAME www → <org>.github.io`
5. DNS-propagatie afwachten (max. 24u)
6. "Enforce HTTPS" activeren na certificaat-uitrol

Na stap 4–6 is `https://www.lumio-legacy.nl` live en kan Google Search Console worden ingesteld.

---

## Desktop Distributable (src/lumio-desktop/)

Lumio is een **USB-portable desktopapplicatie**. Er is geen server-deployment; distributie gaat via ZIP-bestand op USB-stick of directe download.

### Omgevingen

| Omgeving | Type | Workflow | Beschikbaar |
|----------|------|----------|-------------|
| **Staging / acceptatietest** | CI artifact (nightly build) | `.github/workflows/nightly.yml` | Bij elke push naar `main` — 30 dagen |
| **Productierelease** | GitHub Release + ZIP asset | `.github/workflows/release.yml` | Bij versietag `v*.*.*` — permanent |

---

### Staging build downloaden (acceptatietest)

1. Ga naar **[Actions → Nightly Build](https://github.com/RobertAgterhuis/Lumio/actions/workflows/nightly.yml)**
2. Klik op de meest recente geslaagde workflow-run
3. Scroll naar **Artifacts** onderaan de pagina
4. Download `lumio-nightly-{sha}-win-x64.zip`
5. Pak uit naar een map of USB-stick
6. Start `win-unpacked\Lumio.exe`

> Nightly artifacts zijn 30 dagen beschikbaar. Meld bevindingen via GitHub Issues met label `staging-feedback`.

**URL-patroon:**  
`https://github.com/RobertAgterhuis/Lumio/actions/workflows/nightly.yml`

---

### Productierelease downloaden

1. Ga naar **[Releases](https://github.com/RobertAgterhuis/Lumio/releases)**
2. Klik op de gewenste versie (bijv. `v1.0.0`)
3. Download `lumio-v1.0.0-win-x64.zip`
4. Pak uit naar een map of USB-stick
5. Start `win-unpacked\Lumio.exe`

**URL-patroon:**  
`https://github.com/RobertAgterhuis/Lumio/releases/tag/v{versie}`

---

### Nieuwe versie uitbrengen

```bash
# 1. Zorg dat alle wijzigingen in main zijn gemerged
# 2. Maak een versietag aan (semantic versioning)
git tag v1.0.0
git push origin v1.0.0
# 3. release.yml triggert automatisch → GitHub Release wordt aangemaakt
```

De workflow:
- Bouwt backend (.NET 10, win-x64 self-contained)
- Bouwt frontend (Next.js static export)
- Pakt Electron shell in (`electron-builder --dir`)
- Zipped de volledige distributable als `lumio-{tag}-win-x64.zip`
- Publiceert GitHub Release met auto-gegenereerde changelog

**Optioneel code-signing:** voeg `CSC_LINK` (base64-geëncodeerde `.p12`) en `CSC_KEY_PASSWORD` toe als GitHub Secrets (Settings → Secrets and variables → Actions). Ontbreken ze, dan slaagt de build alsnog (USB-portable gebruik vereist geen OS-certificaat).

---

### STATUS: PIPELINE ACTIEF

- ✅ `nightly.yml` — actief bij elke push naar `main`
- ✅ `release.yml` — actief bij versietags `v*.*.*`
- ⏳ Eerste release: maak tag `v0.1.0` aan wanneer SP-4 gemerged is
