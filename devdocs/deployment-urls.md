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
