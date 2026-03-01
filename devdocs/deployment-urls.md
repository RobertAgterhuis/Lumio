# Deployment URLs

## Marketing Site (site/)

| Omgeving | URL | Status |
|----------|-----|--------|
| Productie (custom domain) | https://www.lumio.nl | PENDING — domein configuratie vereist |
| GitHub Pages (fallback) | https://\<org\>.github.io/\<repo\>/ | Actief na eerste deploy-run |

### Hoe deployen

De marketing-site wordt automatisch uitgerold via `.github/workflows/deploy-site.yml` bij elke push naar `main` die bestanden in `site/` raakt.

**Eenmalige GitHub-repo setup:**
1. Ga naar `Settings → Pages → Source` → kies **"GitHub Actions"**
2. Na de eerste workflow-run is de site live op de GitHub Pages URL hierboven

**Custom domain (lumio.nl) instellen:**
1. Ga naar `Settings → Pages → Custom domain` → vul in: `www.lumio.nl`
2. Stel DNS in bij je registrar:
   - Type: `CNAME`
   - Naam: `www`
   - Waarde: `<org>.github.io`
3. Wacht op DNS-propagatie (max. 24u); GitHub toont "✓ DNS check successful"
4. Vink **"Enforce HTTPS"** aan zodra het certificaat is uitgerold

### Google indexering

- `site/public/robots.txt` — staat alle crawlers toe, verwijst naar `sitemap.xml`
- `site/public/sitemap.xml` — vermeldt alle 8 pagina's van `www.lumio.nl`
- Voeg na livegang de site toe aan [Google Search Console](https://search.console.google.com) en dien de sitemap-URL in: `https://www.lumio.nl/sitemap.xml`

### Canonical domein beslissing

Het canonieke domein is **`https://www.lumio.nl`** (www-subdomain).

- `site/next.config.ts` is geconfigureerd met `trailingSlash: true` en `output: "export"` — statische export geschikt voor elke CDN of Pages-host.
- Alle sitemap-URLs en robots.txt verwijzen naar `https://www.lumio.nl/`.

### BLOCKED: EXTERN

Live URL verificatie en Google indexeringscheck (SP-6-005) zijn extern afhankelijk van:
1. Domeinregistratie `lumio.nl` (OI-002 — INSUFFICIENT_DATA)
2. GitHub Pages-activering (eenmalige repo-instelling)
3. DNS-propagatie na CNAME-instelling

De deployment-infrastructuur (workflow + robots.txt + sitemap.xml) is volledig aanwezig.
