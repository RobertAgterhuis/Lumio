# ADR-004 — Localhost API Security Boundary

**Status:** ACCEPTED — 2026-03-01  
**Auteur:** Implementation Agent (SP-1 T-004)  
**Bevinding:** GAP-ARC-01 (Fase 2, Software Architect)

---

## Context

Lumio API draait embedded in de Electron-desktop applicatie als een lokale HTTP server.
De enige legitieme client is de Electron-renderer (of een lokale browser in development).

Zonder expliciete binding- en origingverificatie is er een risico dat:
- Een website in een andere Electron-window of externe browser de API benadert via `localhost`
- Cross-origin requests van kwaadaardige externe domeinen worden geaccepteerd

## Beslissing

### 1. Loopback binding (reeds aanwezig)

De API bindt uitsluitend aan `http://127.0.0.1:5123` (loopback). Dit is al geconfigureerd
in `Program.cs`:
```csharp
var port = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
    ?? "http://127.0.0.1:5123";
builder.WebHost.UseUrls(port);
```

Externe netwerk-interfaces zijn **niet** gebonden. Toegang van andere machines op het
netwerk is daardoor onmogelijk.

### 2. Origin header validatie (nieuw)

`LocalOriginValidationMiddleware` valideert de `Origin` en `Referer` headers op alle
`/api/` verzoeken.

**Toegestane origins:**
| Origin | Reden |
|---|---|
| Geen header | Directe lokale aanroep (curl, lokale tools) |
| `app://lumio` | Electron custom protocol renderer |
| `http://localhost:*` | Lokale development browser |
| `http://127.0.0.1:*` | Loopback IPv4 |
| `http://[::1]:*` | Loopback IPv6 |
| `file://` | File-based renderer |
| `https://localhost` | Lokale HTTPS development |

Alle overige origins → HTTP 403.

### 3. CORS beperkt tot localhost

CORS beleid is aangepast van `AllowAnyOrigin` naar uitsluitend localhost-origins.

## Gevolgen

- Electron-renderer met `app://lumio` protocol: **geen impact** (toegestaan)
- Development browser op `localhost:3000`: **geen impact** (toegestaan)
- Externe webbrowser die de API benadert: **geblokkeerd** (403)
- Swagger UI (non-API route): **geen impact** (middleware slaat `/api/` check over)

## Alternatieven overwogen

| Alternatief | Afgewezen omdat |
|---|---|
| Client certificate authenticatie | Complexe cert-management, onnodig voor lokale API |
| API key in header | State management vereist, niet nodig voor lokale context |
| Geen origin-validatie | Onvoldoende — CORS alleen is client-side enforcement |

## Referenties

- GAP-ARC-01 in `docs/synthesis/eindrapport-techniek.md`
- `src/Lumio.Api/Middleware/LocalOriginValidationMiddleware.cs`
- `src/Lumio.Api.Tests/Middleware/LocalOriginValidationMiddlewareTests.cs`
