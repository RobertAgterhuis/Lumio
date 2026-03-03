# Phase 2 — Technology & Architecture Analysis
> Agents: Software Architect (05) · Senior Developer (06) · DevOps Engineer (07) · Security Architect (08) · Data Architect (09) · Legal Counsel (33)
> Cycle: FULL_AUDIT | Session: lumio-audit-20260303-001 | Date: 2026-03-03
> Input: `docs/onboarding/onboarding-output.md` + `BusinessDocs/Phase1-Business/phase1-analysis.md`

---

## Table of Contents

1. [Software Architect — System Design & Architecture](#1-software-architect--system-design--architecture)
2. [Senior Developer — Code Quality & Engineering Practices](#2-senior-developer--code-quality--engineering-practices)
3. [DevOps Engineer — CI/CD, Build & Deployment](#3-devops-engineer--cicd-build--deployment)
4. [Security Architect — Security Posture](#4-security-architect--security-posture)
5. [Data Architect — Data Model & Persistence](#5-data-architect--data-model--persistence)
6. [Legal Counsel — Regulatory & Compliance](#6-legal-counsel--regulatory--compliance)
7. [Cross-Agent Findings Summary](#7-cross-agent-findings-summary)
8. [Questionnaire Requests](#8-questionnaire-requests)

---

## 1. Software Architect — System Design & Architecture

**Agent:** 05-software-architect | **Domain:** Architecture, system design, integration patterns, scalability, technical debt

### 1.1 Architecture Overview

**Source:** `src/lumio-desktop/src/main/index.ts`, `src/lumio-desktop/src/main/sidecar.ts`, `src/Lumio.Api/Program.cs`, `devdocs/adr-004-localhost-api-boundary.md`

Lumio is a **USB-portable offline desktop application** with a three-tier local architecture:

| Tier | Technology | Role |
|------|-----------|------|
| Shell | Electron 40 (TypeScript) | Process manager, native OS integration, IPC, tray, auto-backup |
| Frontend | Next.js 16 (React 19, TypeScript) — static export | UI rendered in Electron renderer process |
| Backend | ASP.NET Core 10 (.NET 10, C#) — self-contained sidecar | REST API, business logic, EF Core / SQLCipher persistence |

**Communication pattern:** The Electron main process spawns the .NET backend as a sidecar child process (via `sidecar.ts`), binding it exclusively to `http://127.0.0.1:[dynamic-port]`. The renderer communicates with the backend over HTTP + the `app://lumio` custom protocol. `LocalOriginValidationMiddleware` enforces an allowlist of local origins for all `/api/` routes (ADR-004).

**Key architectural decisions:**

| Decision | Status | Source |
|-----------|--------|-------|
| Loopback-only API binding | ACCEPTED | ADR-004 |
| Origin header validation on all `/api/` routes | ACCEPTED | ADR-004 / `LocalOriginValidationMiddleware.cs` |
| static-export Next.js (no SSR) | ACCEPTED_RISK (DEC-105/106) | `next.config.ts`, `layout.tsx` L38-44 |
| SQLCipher encryption at rest | IMPLEMENTED | `Program.cs`, KDF service |
| Shamir Secret Sharing for heir access | IMPLEMENTED | `ShamirService.cs`, `ShamirController.cs` |
| USB-portability via `LUMIO_DATA_DIR` env var | IMPLEMENTED | `Program.cs` L35-38 |
| Whitelabel branding layer | IMPLEMENTED | `src/lumio-desktop/src/main/whitelabel.ts` |

### 1.2 Architectural Strengths

**ARCH-STR-001** — **Clear separation of concerns**: Three distinct tiers with well-defined IPC/HTTP boundaries. The backend is independently testable without the Electron shell.
*Source: `src/Lumio.Api.Tests/` test structure, `sidecar.ts`*

**ARCH-STR-002** — **Offline-first design is architecturally consistent**: No cloud dependencies in the runtime path. The product delivers on its privacy promise at the infrastructure level — not just in policy.
*Source: `Program.cs`, `dpia-bijzondere-categorieen.md` §1.6*

**ARCH-STR-003** — **Repository pattern properly abstracts persistence**: 20+ repository interfaces (`IEigenaarRepository`, `IErfgenaamRepository`, etc.) are registered via DI with EF Core implementations. This enables the fake/spy pattern used extensively in tests.
*Source: `Program.cs` L109-160, `src/Lumio.Api.Tests/` fakes*

**ARCH-STR-004** — **Dynamic port resolution prevents single-instance conflicts**: `get-port` selects from a range [5123–5127] at launch; the Electron shell enforces single-instance lock (`requestSingleInstanceLock`).
*Source: `index.ts` L35-44*

**ARCH-STR-005** — **Whitelabel architecture enables B2B channel without forking**: IPC-registered handlers allow branding injection at runtime without separate build targets per customer.
*Source: `index.ts` L64-75, `whitelabel.ts`*

### 1.3 Architectural Gaps & Risks

**GAP-ARCH-001** — **No OpenAPI specification file committed to source**
The project uses `@hey-api/openapi-ts` for client generation (`openapi-ts.config.ts`) and the error log `openapi-ts-error-1771875801341.log` is present in `src/lumio-web/`, but no `openapi.json` or `openapi.yaml` is committed. This means the API contract is only implicitly documented via the ASP.NET controller signatures.
*Risk: HIGH — API contract drift between backend and frontend is undetectable without the generated spec on file.*
*Source: `src/lumio-web/openapi-ts.config.ts`, `src/lumio-web/openapi-ts-error-1771875801341.log`*

**GAP-ARCH-002** — **`unsafe-inline` in CSP is a permanent constraint under static export** (ACCEPTED_RISK — DEC-105)
Next.js static export injects inline hydration scripts at build time. A nonce-based strict CSP requires SSR. Documented in `layout.tsx` L38-44 and `decisions.md` DEC-105/DEC-106. Migration path to SSR is deferred post-v1.0.
*Risk: MEDIUM — attack surface is bounded to localhost; accepted and documented.*
*Source: `src/lumio-web/src/app/layout.tsx` L38-44, `docs/decisions.md` DEC-105*

**GAP-ARCH-003** — **No health-check / watchdog for the backend sidecar in production scenarios**
`sidecar.ts` starts the backend and waits for a health endpoint to respond, but there is no restart logic if the backend crashes after startup. A crash leaves the UI non-functional with no recovery path.
*Risk: MEDIUM — user experience impact on unexpected backend crash.*
*Source: `src/lumio-desktop/src/main/sidecar.ts` L52-60*

**GAP-ARCH-004** — **Whitelabel configuration is loaded at runtime without schema validation**
`loadWhitelabelConfig()` is called at app start but there is no explicit JSON schema or Zod validation on the config file. Malformed whitelabel configs could cause silent failures.
*Risk: LOW — affects B2B path only; standard Lumio build is unaffected.*
*Source: `src/lumio-desktop/src/main/index.ts` L64-75*

**GAP-ARCH-005** — **No offline-capable upgrade/update mechanism documented**
The app is USB-portable, but there is no documented in-app update flow. Existing database migration strategy (`database-migrations.md`) defines production auto-migration is deliberately skipped, requiring a DBA-level SQL script. For USB-portable self-hosted installs, the operator is the user, making this operationally risky.
*Risk: MEDIUM — schema migrations on user-managed databases with no automated path.*
*Source: `devdocs/database-migrations.md` §Production workflow*

### 1.4 Technical Debt Register

| ID | Area | Description | Severity | Source |
|----|------|-------------|----------|--------|
| TD-ARCH-001 | API contract | OpenAPI spec not committed; client generated from live server | HIGH | `openapi-ts-error-1771875801341.log` |
| TD-ARCH-002 | Desktop | No sidecar crash-recovery / watchdog | MEDIUM | `sidecar.ts` |
| TD-ARCH-003 | SSR | `unsafe-inline` CSP — SSR migration deferred | MEDIUM | DEC-105/106 |
| TD-ARCH-004 | B2B config | Whitelabel schema validation absent | LOW | `whitelabel.ts` |
| TD-ARCH-005 | Operations | No self-service database upgrade guide for end-users | MEDIUM | `database-migrations.md` |

### 1.5 Architecture Recommendations

**REC-ARCH-001** — Commit the generated `openapi.json` to source control as a build artifact and configure `openapi-ts` to run against the committed spec. Add a CI step that fails if the spec is stale.
*Priority: HIGH | Sprint estimate: 1–2 days*

**REC-ARCH-002** — Implement a crash-watchdog loop in `sidecar.ts`: detect backend process exit after successful startup, show a user-friendly error dialog, and offer a restart option.
*Priority: MEDIUM | Sprint estimate: 0.5 days*

**REC-ARCH-003** — Add JSON schema validation for the whitelabel config file using `zod` (already a dependency). Fail fast with a clear error dialog on config parse failure.
*Priority: LOW | Sprint estimate: 0.5 days*

**REC-ARCH-004** — Document an end-user database upgrade guide: a checked `.bat`/`.ps1` script that applies EF migration SQL scripts against existing user databases. Include in the release artifact.
*Priority: MEDIUM | Sprint estimate: 1 day*

---

## 2. Senior Developer — Code Quality & Engineering Practices

**Agent:** 06-senior-developer | **Domain:** Code patterns, quality, test strategy, dependency hygiene, developer ergonomics

### 2.1 Language & Framework Versions

| Component | Runtime | Version | Status |
|-----------|---------|---------|--------|
| Lumio.Api | .NET / ASP.NET Core | 10.0.103 | ✅ Current LTS |
| lumio-web | Next.js | ^16.1.6 | ✅ Current |
| lumio-web | React | ^19.2.4 | ✅ Current |
| lumio-desktop | Electron | ^40.6.1 | ✅ Current |
| lumio-web | TypeScript | ^5.x (implied by Next.js) | ✅ Current |
| lumio-desktop | TypeScript | ^5.9.3 | ✅ Current |
| lumio-web | Zod | ^4.3.6 | ✅ Current |
| lumio-web | TanStack Query | ^5.90.21 | ✅ Current |
| Lumio.Api | FluentValidation | 11.3.1 | ✅ Current |
| Lumio.Api | QuestPDF | 2026.2.2 | ✅ Current |

*Source: `src/Lumio.Api/Lumio.Api.csproj`, `src/lumio-web/package.json`, `src/lumio-desktop/package.json`*

### 2.2 Code Quality Strengths

**DEV-STR-001** — **Consistent use of interface abstractions for all injectable services**: All 20+ repositories and key services are registered via interfaces (`IEigenaarRepository`, `IMasterPasswordService`, `IShamirService`, etc.). This enables clean unit testing without production infrastructure.
*Source: `Program.cs` L68-160*

**DEV-STR-002** — **Comprehensive fake/stub library for tests**: `FakeMasterPasswordService.cs`, `FakeAuditService.cs`, `FakeProfileService.cs`, `FakeShamirService.cs`, `FakeSqlCipherKdfService.cs`, `FakeVideoStorageService.cs`, `FakeWebHostEnvironment.cs` — a complete set of test doubles covering all service dependencies.
*Source: `src/Lumio.Api.Tests/` directory listing*

**DEV-STR-003** — **BSN masking applied at the logging layer via Serilog enricher**: `BsnMaskingEnricher` prevents accidental BSN leakage in logs without requiring every logging call-site to mask manually.
*Source: `Program.cs` L52, `src/Lumio.Api/Logging/`*

**DEV-STR-004** — **DM Sans font embedded as resource**: Font file registration via `FontManager.RegisterFontFromEmbeddedResource` means PDF generation has no external dependency on installed system fonts, making builds reproducible and portable.
*Source: `Program.cs` L31-34, `Lumio.Api.csproj`*

**DEV-STR-005** — **Design tokens validated at build time**: `scripts/validate-tokens.ts` + `scripts/detect-breaking-changes.ts` exist in `lumio-web/scripts/`. This is above-average maturity for a v1.0 product.
*Source: `src/lumio-web/package.json` scripts*

**DEV-STR-006** — **i18n (next-intl) with merge and validation scripts**: `scripts/merge-messages.ts` and `scripts/validate-messages.ts` ensure translation files are complete before build. Executed as `predev`/`prebuild` hooks.
*Source: `src/lumio-web/package.json` scripts, `src/lumio-web/messages/`*

### 2.3 Code Quality Gaps

**GAP-DEV-001** — **No coverage threshold enforced for API tests**
The frontend enforces ≥70% coverage on `lib/stores` via Vitest (`ci.yml` line 57). No equivalent coverage gate exists for `Lumio.Api.Tests/`. The `services-coverage.runsettings` file exists but it is unclear whether CI enforces a minimum threshold.
*Risk: MEDIUM — security-sensitive services (KDF, Shamir, BruteForce) could lose coverage without a guard.*
*Source: `src/Lumio.Api.Tests/services-coverage.runsettings`, `ci.yml`*

**GAP-DEV-002** — **`openapi-ts` error log committed to source**
`src/lumio-web/openapi-ts-error-1771875801341.log` is a generated error artifact committed to the repository. This suggests the client generation step failed at some point and the error was left unresolved.
*Risk: HIGH — the generated API client may be out of date with current controller signatures.*
*Source: `src/lumio-web/openapi-ts-error-1771875801341.log`*

**GAP-DEV-003** — **PDF generators registered as scoped but contain no explicit resource cleanup**
14 PDF generator classes are registered as `Scoped` services. QuestPDF 2026 uses disposable document builders internally. Without explicit `IDisposable` review, memory under high-frequency PDF generation scenarios could leak within a request scope.
*Risk: LOW — desktop single-user context mitigates, but worth auditing.*
*Source: `Program.cs` L81-96*

**GAP-DEV-004** — **ESLint output files committed to repository**
`src/lumio-web/eslint-out.txt` and `src/lumio-web/eslint-output.txt` are present in the repository. These are development artefacts and should be `.gitignore`d.
*Risk: LOW — repository hygiene; no security impact.*
*Source: `src/lumio-web/` directory listing*

**GAP-DEV-005** — **Business rules externalized to JSON without versioning**
`lumio-rules.json` and `lumio-workflows.json` are copied to the output directory at build time. There is no documented versioning, schema validation, or rollback strategy for these rule files. A corrupt rule file could silently skip validation.
*Risk: MEDIUM — business logic correctness depends on unvalidated JSON.*
*Source: `Lumio.Api.csproj` `<Content Update="rules\lumio-rules.json">`, `src/Lumio.Api/Rules/`*

### 2.4 Developer Ergonomics

**DEV-ERG-001** — **`start-dev.ps1` at repo root provides one-command local startup.** Good DX for onboarding.
*Source: `start-dev.ps1`*

**DEV-ERG-002** — **`tools/dev-migrate.ps1` and `tools/build.ps1` centralize build and migration tasks.** Consistent with professional tooling discipline.
*Source: `tools/` directory*

**DEV-ERG-003** — **Storybook 10 with `@storybook/addon-vitest` and `@storybook/addon-a11y`**: Component development and accessibility checking co-located in the same toolchain.
*Source: `src/lumio-web/package.json` devDependencies*

### 2.5 Developer Recommendations

**REC-DEV-001** — Enforce a minimum coverage threshold (recommend ≥ 70% line coverage) on `Lumio.Api.Tests` security-sensitive services via `services-coverage.runsettings` with a CI gate. Specifically cover `SqlCipherKdfService`, `BruteForceProtectionService`, `ShamirService`.
*Priority: HIGH | Sprint estimate: 0.5 days*

**REC-DEV-002** — Resolve the `openapi-ts` error, regenerate the client, and add the generated client files to the commit. Add `openapi-ts-error-*.log` to `.gitignore`.
*Priority: HIGH | Sprint estimate: 1 day*

**REC-DEV-003** — Add `eslint-out.txt`, `eslint-output.txt` and `openapi-ts-error-*.log` to `.gitignore`.
*Priority: LOW | Sprint estimate: 0.25 days*

**REC-DEV-004** — Add JSON schema validation for `lumio-rules.json` and `lumio-workflows.json` using a schema file checked into source. Fail application startup if rule file fails validation.
*Priority: MEDIUM | Sprint estimate: 1 day*

---

## 3. DevOps Engineer — CI/CD, Build & Deployment

**Agent:** 07-devops-engineer | **Domain:** CI/CD pipelines, build reproducibility, release process, environment management

### 3.1 Pipeline Overview

| Workflow | File | Trigger | Status |
|----------|------|---------|--------|
| CI (full quality gate) | `ci.yml` | `workflow_dispatch` only (disabled — billing) | ⚠️ DISABLED |
| Nightly Build (staging artifact) | `nightly.yml` | Push to `main` + manual | ✅ ACTIVE |
| Release Build | `release.yml` | Tag `v*.*.*` | ✅ ACTIVE |
| Marketing Site Deploy | `deploy-site.yml` | Push to `main` (site/ changes) | ✅ ACTIVE |
| Next.js Pages | `nextjs.yml` | Push to `main` | ✅ ACTIVE |
| GitHub Board Sync | `lumio-board-sync.yml` | Manual / event | ✅ ACTIVE |
| CodeQL | `codeql.yml` | Schedule / push | ✅ ACTIVE |

*Source: `.github/workflows/` directory listing, `ci.yml` L3-4*

### 3.2 CI/CD Strengths

**DEVOPS-STR-001** — **Well-structured CI pipeline when active**: TruffleHog secret scan runs as the first blocking job; frontend (lint + typecheck + unit tests + build + npm audit) and site jobs run in parallel downstream; backend, desktop, and integration test jobs follow. This is a professional CI design.
*Source: `ci.yml`*

**DEVOPS-STR-002** — **Staging artifact via nightly build on every main push**: Acceptance testers can download `lumio-nightly-{sha7}-win-x64.zip` from GitHub Actions artifacts within minutes of a merge. 30-day retention. No manual build step required.
*Source: `nightly.yml`, `devdocs/deployment-urls.md`*

**DEVOPS-STR-003** — **Electron prebuilt cache and npm workspace caches**: `nightly.yml` caches `node_modules` for both `lumio-web` and `lumio-desktop`, plus Electron's prebuilt download cache. Meaningful reduction in build time.
*Source: `nightly.yml` L44-66*

**DEVOPS-STR-004** — **Actions pinned at major versions** (`@v6`, `@v5`) — not floating `@main` or `@latest`. Reduces supply-chain risk.
*Source: `ci.yml`, `nightly.yml` — `actions/checkout@v6`, `actions/setup-node@v6`*

**DEVOPS-STR-005** — **Branch protection via GitHub Ruleset "ProtectLumio"**: Direct pushes to `main` are blocked; PRs required. Documented in `docs/decisions.md` DEC-104.
*Source: `docs/decisions.md` DEC-104*

### 3.3 CI/CD Gaps

**GAP-DEVOPS-001** — **CI is disabled** (`workflow_dispatch` only since 2026-03-02 — billing/spending limit)
All quality gates (secret scan, lint, typecheck, unit tests, coverage enforcement, npm audit, integration tests) are currently manual-only. Every merge to `main` bypasses the full quality gate.
*Risk: CRITICAL — no automated quality enforcement is an existential CI/CD gap.*
*Source: `ci.yml` L3-4, `docs/session/session-state.json` `insufficient_data_items`*

**GAP-DEVOPS-002** — **TruffleHog secret scan only runs as part of the disabled CI job**
The secret scan (`trufflesecurity/trufflehog@v3.93.6`) is the first job in `ci.yml`. With CI disabled, secret scans are not executed on any push or PR. This is a separate concern from the broader CI gate.
*Risk: HIGH — secrets could be committed and remain undetected indefinitely.*
*Source: `ci.yml` L13-33*

**GAP-DEVOPS-003** — **Nightly build does not run any tests**
The `nightly.yml` workflow builds and packages the application but does not run unit tests, integration tests, or linting. A broken build passes as long as compilation succeeds.
*Risk: HIGH — staging artifact may contain regressions not caught until manual testing.*
*Source: `nightly.yml` — no test steps visible in reviewed content*

**GAP-DEVOPS-004** — **No documented rollback procedure**
The `deployment-urls.md` describes the release flow but contains no documented rollback procedure. For a USB-portable app distributed as a ZIP artifact, rollback means users re-downloading the previous release, but this is not formalized.
*Risk: MEDIUM — incident response time increases without a defined rollback SOP.*
*Source: `devdocs/deployment-urls.md`*

**GAP-DEVOPS-005** — **EV Code Signing deferred** (DEC-201)
The Windows installer is not code-signed with an Extended Validation certificate. Windows Defender SmartScreen will show a warning for new users downloading the installer. Deferred until the development team is ready.
*Risk: MEDIUM — user trust and adoption friction at download/install time.*
*Source: `docs/decisions.md` DEC-201*

**GAP-DEVOPS-006** — **No environment-specific config management**
`appsettings.Development.json` and `appsettings.json` are present, but there is no described management strategy for production-specific configuration values (connection strings, flags). For a desktop app this is low-risk, but for the forthcoming whitelabel B2B path it needs formalization.
*Risk: LOW — current scope; MEDIUM for B2B expansion.*
*Source: `src/Lumio.Api/appsettings.json`, `appsettings.Development.json`*

### 3.4 DevOps Recommendations

**REC-DEVOPS-001** — Re-enable CI immediately once the billing/spending limit is resolved. In the interim, add a lightweight pull-request check (run tests + lint only, no binary build) on a free-tier runner to restore automated quality enforcement for every PR.
*Priority: CRITICAL | Sprint estimate: 0.5 days once billing resolved*

**REC-DEVOPS-002** — Extract the TruffleHog secret scan into a separate, always-active workflow (not dependent on the billing-gated full CI). Secret scanning should run on every push and PR regardless of billing tier.
*Priority: HIGH | Sprint estimate: 0.25 days*

**REC-DEVOPS-003** — Add a test step to `nightly.yml`: run `dotnet test` and `npm run test` before the package step. A failing test should fail the nightly build and prevent artifact upload.
*Priority: HIGH | Sprint estimate: 0.5 days*

**REC-DEVOPS-004** — Document a formal rollback SOP in `devdocs/deployment-urls.md`: identify previous release artifact, re-download link, database schema compatibility check.
*Priority: MEDIUM | Sprint estimate: 0.5 days*

---

## 4. Security Architect — Security Posture

**Agent:** 08-security-architect | **Domain:** Cryptography, authentication, authorization, threat model, secure coding

### 4.1 Threat Model Summary

Lumio's threat model is bounded by its offline-first, single-user, desktop context:

| Threat | Likelihood | Severity | Mitigation |
|--------|-----------|---------|-----------|
| Unauthorized local access to database file | HIGH | CRITICAL | SQLCipher AES-256 at rest |
| Brute-force master password | MEDIUM | CRITICAL | PBKDF2-SHA512 ≥310 000 iterations + 5-attempt lockout (15 min) |
| Cross-origin API access from malicious local content | LOW | HIGH | Origin header validation middleware (ADR-004) |
| BSN leakage in logs | LOW | HIGH | Serilog `BsnMaskingEnricher` |
| Secret committed to source | LOW | HIGH | TruffleHog (currently unprotected — see GAP-DEVOPS-002) |
| Heir impersonation (Shamir) | LOW | HIGH | Shamir threshold scheme — no single heir can access |
| Elevation via XSS in renderer | VERY LOW | HIGH | `nodeIntegration: false`, `contextIsolation: true` (standard Electron config) |

### 4.2 Security Strengths

**SEC-STR-001** — **SQLCipher with high-iteration KDF**: The `SqlCipherKdfService` enforces ≥310 000 PBKDF2-SHA512 iterations. This significantly exceeds OWASP's 2023 minimum of 210 000 for PBKDF2-SHA512.
*Source: `Program.cs` L74, comment `GAP-SEC-01`*

**SEC-STR-002** — **Master password never stored in memory as a managed string**: The KDF service uses a callback pattern (`UsePassword(pw => ...)`) with the password scoped to the callback lifetime and passed as a `byte[]`. This minimizes the window during which the plaintext password exists in GC-managed heap.
*Source: `Program.cs` L149-158*

**SEC-STR-003** — **Brute-force protection at application level**: `BruteForceProtectionService` enforces a 5-attempt maximum with a 15-minute lockout. This is implemented as a singleton to persist state across requests.
*Source: `Program.cs` L78, comment `GAP-SEC-02`*

**SEC-STR-004** — **BSN never appears in logs**: `BsnMaskingEnricher` is registered globally in Serilog. BSN also never appears in exports without encryption, and mod-11 elf-proof validation is applied at the validator layer.
*Source: `Program.cs` L52, `devdocs/data-retention-policy.md` §3.2*

**SEC-STR-005** — **Shamir Secret Sharing for heir access**: No single heir can access the database independently. The threshold scheme requires cooperation of a minimum number of assigned heirs.
*Source: `Program.cs` L80, `ShamirService.cs`, `ShamirController.cs`*

**SEC-STR-006** — **Loopback binding + origin validation**: The API only binds to `127.0.0.1`. `LocalOriginValidationMiddleware` returns HTTP 403 for any non-allowlisted origin. This eliminates CORS-bypass attacks from external browser tabs.
*Source: ADR-004, `Program.cs` L226-240*

**SEC-STR-007** — **Audit log with 90-day rotation**: `AuditLogRotatieService` (hosted service) rotates entries older than 90 days — balancing security logging with AVG art. 5(1)(e) storage limitation.
*Source: `Program.cs` L99, `data-retention-policy.md` §3.4*

**SEC-STR-008** — **DOMPurify present for sanitizing rendered HTML content**: `dompurify ^3.3.1` is a direct dependency. Prevents XSS in any user-controlled content rendered as HTML.
*Source: `src/lumio-web/package.json`*

### 4.3 Security Gaps

**GAP-SEC-001** — **Session timeout strategy undocumented for Electron context**
A `SessionTimeoutManager` is imported and used in `index.ts`, but there is no specification of the idle timeout duration, what constitutes "activity", or what the locked state entails (process kill vs. UI lock with re-prompt). This is especially critical given that the encrypted database is unlocked in memory.
*Risk: HIGH — an unattended unlocked session exposes all data.*
*Source: `src/lumio-desktop/src/main/index.ts` L16*

**GAP-SEC-002** — **Shamir key material kept in memory post-unlock without documented TTL**
The `data-retention-policy.md` states "Shamir-sleutels: niet persistent — alleen in geheugen — Geheugen vrijgegeven na sessie." However, it is not documented what triggers session end for the Shamir key material specifically, nor whether the `ShamirService` implements zeroing of key bytes.
*Risk: MEDIUM — residual key material in GC heap after session end.*
*Source: `devdocs/data-retention-policy.md` §2 row "Shamir-sleutels"*

**GAP-SEC-003** — **TruffleHog scan dependent on disabled CI** (duplicate of GAP-DEVOPS-002, elevated here for security classification)
Without an active secret scan, secrets committed to source remain undetected. Given the presence of `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` as GitHub Secrets referenced in CI, the risk of accidental leakage is real.
*Risk: HIGH — immediate mitigation needed (standalone workflow).*
*Source: `ci.yml` L92-95*

**GAP-SEC-004** — **No certificate pinning or integrity check for the .NET backend sidecar binary**
The Electron main process spawns the .NET sidecar by path (`getBackendPath()`). There is no hash or signature verification of the binary before execution. In a shared or compromised filesystem, a substituted binary could be executed with the app's privileges.
*Risk: MEDIUM — bounded to physical-access threat scenarios given desktop context.*
*Source: `src/lumio-desktop/src/main/sidecar.ts` L21-28*

**GAP-SEC-005** — **`npm audit` is only enforced in the disabled CI job**
`ci.yml` L84 runs `npm audit --audit-level=high --omit=dev`. With CI disabled, high/critical npm vulnerabilities are not automatically caught.
*Risk: HIGH — dependency vulnerabilities remain undetected.*
*Source: `ci.yml` L83-85*

### 4.4 Security Recommendations

**REC-SEC-001** — Document `SessionTimeoutManager` behaviour: idle timeout duration, activity triggers, and locked-state definition. Ensure the master password service clears its in-memory state on session timeout (call a `Lock()` method). Add a test for this flow.
*Priority: HIGH | Sprint estimate: 1 day*

**REC-SEC-002** — Implement `SecureZero` / `MemoryMarshal.Clear` on Shamir key byte arrays after use, and document the trigger for key material release in `data-retention-policy.md`.
*Priority: MEDIUM | Sprint estimate: 0.5 days*

**REC-SEC-003** — Extract TruffleHog into a standalone always-active workflow (covered by REC-DEVOPS-002). Run `npm audit --audit-level=high` in a lightweight always-on check as well.
*Priority: HIGH | Sprint estimate: 0.25 days*

**REC-SEC-004** — Add a SHA-256 integrity check for the backend sidecar binary in `sidecar.ts`: compute the hash of the executable at startup and compare it against a known-good hash embedded in the Electron app at build time.
*Priority: MEDIUM | Sprint estimate: 1 day*

---

## 5. Data Architect — Data Model & Persistence

**Agent:** 09-data-architect | **Domain:** Data model, persistence strategy, migration management, data quality, retention

### 5.1 Persistence Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| ORM | Entity Framework Core 10 | Schema definition, LINQ queries, migration management |
| Database engine | SQLite (via `Microsoft.EntityFrameworkCore.Sqlite.Core`) | Local file-based relational store |
| Encryption | SQLCipher (`SQLitePCLRaw.bundle_e_sqlcipher`) | AES-256 transparent encryption of the database file |
| Migration tooling | EF Core Migrations + `tools/dev-migrate.ps1` | Schema evolution |

*Source: `Lumio.Api.csproj`, `Program.cs`, `devdocs/database-migrations.md`*

### 5.2 Domain Model Summary

Based on controller and service listings, the domain model covers:

| Aggregate | Key Entities | Notes |
|-----------|-------------|-------|
| Identity | `Eigenaren` (owners) | BSN, NAW; mod-11 validated |
| Succession | `Erfgenamen` (heirs), `TestamentBegunstigden`, `TestamentExecuteurs` | Shamir keys assigned per heir |
| Testament | `Testamenten`, `TestamentSnapshots`, `TestamentJuridischeChecks` | Snapshot strategy for legal point-in-time capture |
| Advance Directives | `WilsverklaringEuthanasie`, `WilsverklaringBijzondereCategorie` | DPIA Special Category — art. 9 AVG |
| Donor | `DonorRegistraties`, `OrgaanKeuzes` | DPIA Special Category |
| Assets | `FysiekeBezittingen`, `Bankrekeningen`, `Verzekeringen`, `Schulden`, `DigitaleAccounts`, `Wachtwoorden`, `CryptoWallets` | Full estate inventory |
| Documents | `Documenten`, `DocumentBestanden` | File path references; cascade delete + filesystem cleanup |
| Video | `Videoboodschappen` | File stored in `data/videos/`; DB holds metadata only |
| Operations | `Noodcontacten`, `Notities`, `Uitvaartinstructies`, `Afhandelingen`, `Toewijzingen` | Estate execution workflow |
| Audit | `AuditLog` | 90-day rotation enforced |
| Status | `StatusActualisaties`, `StatusData`, `Statistieken` | Dashboard data |

*Source: `src/Lumio.Api/Controllers/` directory listing, `devdocs/data-retention-policy.md`*

### 5.3 Data Strengths

**DATA-STR-001** — **Full cascade delete policy on owner deletion**: All entities are configured with `DeleteBehavior.Cascade` on the `Eigenaar` relation. Deletion of the owner record triggers a complete data wipe, satisfying AVG art. 17 (right to erasure).
*Source: `devdocs/data-retention-policy.md` §3.1*

**DATA-STR-002** — **Profile isolation**: Each user profile has its own encrypted SQLite file in the `data/` directory, managed by `ProfileService`. Cross-profile data contamination is architecturally impossible.
*Source: `Program.cs` L68, `devdocs/database-migrations.md` §"Database location"*

**DATA-STR-003** — **Testament snapshot pattern for legal point-in-time capture**: `TestamentSnapshots` aggregate preserves immutable state at legally significant moments, without overwriting the mutable current testament.
*Source: `src/Lumio.Api/Controllers/TestamentSnapshotsController.cs`*

**DATA-STR-004** — **Migration strategy clearly documented**: `devdocs/database-migrations.md` covers first-run, development, and production paths, including the edge case of pre-migration legacy databases (ADR-001).
*Source: `devdocs/database-migrations.md`*

**DATA-STR-005** — **Audit log rotation via hosted service**: `AuditLogRotatieService` runs as a background hosted service — the audit log retention policy is automatically enforced without requiring manual intervention.
*Source: `Program.cs` L99-100*

### 5.4 Data Gaps

**GAP-DATA-001** — **No documented database backup verification procedure**
The auto-backup feature (`registerAutoBackupHandlers`, `startAutoBackupScheduler` in `index.ts`) creates encrypted backups, but there is no documented procedure for verifying backup integrity (i.e., confirming the backup file is not corrupted and can be restored).
*Risk: MEDIUM — a silent backup failure leaves users without recovery.*
*Source: `src/lumio-desktop/src/main/index.ts` L9, `autobackup.ts`*

**GAP-DATA-002** — **Video file storage outside the encrypted database boundary**
Video messages are stored in `data/videos/` as plain files. Only metadata is stored in the encrypted SQLite database. The video content itself is not encrypted at rest.
*Risk: HIGH — video content may contain sensitive personal information and is accessible to anyone with filesystem access to the `data/` directory.*
*Source: `devdocs/data-retention-policy.md` §2 row "Videoboodschappen", `src/Lumio.Api/Services/Video/`*

**GAP-DATA-003** — **No foreign-key enforcement verification on SQLite**
SQLite has foreign key enforcement disabled by default. It must be explicitly enabled per connection with `PRAGMA foreign_keys = ON`. It is not confirmed from the reviewed code that this PRAGMA is set on LumioDbContext's connection.
*Risk: MEDIUM — referential integrity could be silently violated on bulk operations.*
*Source: `Program.cs` L140-160 — no explicit PRAGMA seen in reviewed code*

**GAP-DATA-004** — **`__EFMigrationsHistory` baseline logic adds complexity and fragility** (ADR-001)
The `EnsureSchuldKolommenAsync` bridge and the legacy baseline path in `EnsureMigratedAsync` represent technical debt that must be cleaned up once all production databases have migrated. ADR-001 marks it RESOLVED but the cleanup item is still pending.
*Risk: LOW — resolved for current deployments; future migration authors may be confused.*
*Source: `devdocs/adr-001-schulden-schema-brug.md`*

### 5.5 Data Recommendations

**REC-DATA-001** — Encrypt video files at rest using the same master password-derived key used for SQLCipher. Implement an `IVideoStorageService` method that encrypts on write and decrypts on read, or store video data as BLOBs inside the encrypted SQLite database (evaluate size constraints).
*Priority: HIGH | Sprint estimate: 2–3 days*

**REC-DATA-002** — Explicitly enable SQLite foreign key enforcement: add `PRAGMA foreign_keys = ON` to the EF Core connection configuration in `LumioDbContext.OnConfiguring` or via an `IDbConnectionInterceptor`.
*Priority: MEDIUM | Sprint estimate: 0.5 days*

**REC-DATA-003** — Document and implement a backup verification test: after writing the backup file, attempt to open it with the known password and execute a lightweight integrity check (`PRAGMA integrity_check`). Surface any failure to the user.
*Priority: MEDIUM | Sprint estimate: 1 day*

**REC-DATA-004** — Create a cleanup sprint item to remove `EnsureSchuldKolommenAsync` and the legacy baseline path once confirmed that no pre-migration production databases remain.
*Priority: LOW | Sprint estimate: 0.25 days*

---

## 6. Legal Counsel — Regulatory & Compliance

**Agent:** 33-legal-counsel | **Domain:** AVG/GDPR, special category data (art. 9), right to erasure, data retention, DPO, liability

### 6.1 Regulatory Framework

Lumio processes:
- **Special categories of personal data** under AVG art. 9: euthanasia directives, donor registration, medical representative designation
- **BSN** (citizen service number): a specially protected identifier under Dutch law (Wet bescherming persoonsgegevens art. 24, AVG consideration 35)
- **Financial data**: estate inventory, debts, crypto assets
- **Personal data of third parties**: heirs (including their BSNs), emergency contacts

*Source: `devdocs/dpia-bijzondere-categorieen.md` §1.5, `devdocs/data-retention-policy.md`*

### 6.2 Legal Strengths

**LEGAL-STR-001** — **DPIA executed and approved (v1.0, 2026-03-01)**
A Data Protection Impact Assessment for special categories has been conducted by the DPO, approved, and documented in `devdocs/dpia-bijzondere-categorieen.md`. This satisfies the AVG art. 35(3)(b) obligation for large-scale processing of special categories.
*Source: `devdocs/dpia-bijzondere-categorieen.md`*

**LEGAL-STR-002** — **Data retention policy with DPO sign-off (v1.1, 2026-03-01)**
A comprehensive retention policy covering all data categories, retention grounds, and technical enforcement has been authored and approved by the DPO.
*Source: `devdocs/data-retention-policy.md`*

**LEGAL-STR-003** — **Right to erasure (AVG art. 17) implemented**: `DELETE /api/auth/account` is available, requires re-authentication, logs the deletion, and triggers full cascade delete via `ProfileService.DeleteProfile()`.
*Source: `devdocs/data-retention-policy.md` §4 — "GEÏMPLEMENTEERD (2026-03-02)"*

**LEGAL-STR-004** — **No international data transfer**: Data remains exclusively on the user's device. AVG art. 44–49 (third country transfer restrictions) do not apply. This is the most privacy-protective possible architecture for personal health data.
*Source: `devdocs/dpia-bijzondere-categorieen.md` §1.7*

**LEGAL-STR-005** — **Explicit consent mechanism in wizard flow**: The euthanasia and donor wizards include an explicit consent step with a legal disclaimer. This satisfies AVG art. 7 (conditions for consent) — free, specific, informed, unambiguous.
*Source: `devdocs/dpia-bijzondere-categorieen.md` §2.1*

**LEGAL-STR-006** — **Explicit disclaimer in PDF outputs**: "Lumio is geen juridisch advies" appears in wizard flows and, presumably, in generated PDFs. This limits professional liability exposure from users treating the output as legally binding documents.
*Source: `devdocs/dpia-bijzondere-categorieen.md` §2.1*

### 6.3 Legal Gaps

**GAP-LEGAL-001** — **No privacy policy / privacy statement for end users**
The DPIA exists for internal DPO documentation, but there is no user-facing privacy statement or Terms of Service. End users have no accessible statement of their rights (art. 13/14 AVG information obligations).
*Risk: HIGH — AVG art. 13 requires providing information at the time of data collection. Absence of a privacy statement is a material compliance gap.*
*Source: `devdocs/dpia-bijzondere-categorieen.md`, `site/` — no privacy policy page found*

**GAP-LEGAL-002** — **B2B joint-controller agreement not formalized**
The DPIA acknowledges: "voor B2B-inzet is de werkgever (als distributeur via het whitelabel-kanaal) gezamenlijk verantwoordelijke en dient een verwerkersovereenkomst of gezamenlijke verwerkersregeling te worden gesloten." No such agreement template or process exists yet.
*Risk: HIGH — B2B distribution without a joint-controller agreement violates AVG art. 26.*
*Source: `devdocs/dpia-bijzondere-categorieen.md` §1.2*

**GAP-LEGAL-003** — **Heir BSN processing legal basis is not separately documented**
The DPIA documents the legal basis for the primary user's data. Heir BSNs are also stored (`Erfgenamen.BSN`). The legal basis for processing third-party (heir) BSNs specifically is not explicitly stated in the DPIA.
*Risk: MEDIUM — AVG art. 13/14 information obligations apply to data subjects whose data is processed (heirs, not just the primary user).*
*Source: `devdocs/dpia-bijzondere-categorieen.md` §1.5, `devdocs/data-retention-policy.md` §2*

**GAP-LEGAL-004** — **No processor agreement with PostHog (analytics)**
PostHog is a third-party analytics service (`posthog-js 1.356.1`, `connect-src https://eu.i.posthog.com` in CSP). As a data processor, a Data Processing Agreement (DPA) with PostHog is required under AVG art. 28. The EU endpoint (`eu.i.posthog.com`) is used, which is positive, but the DPA is not referenced in any documentation.
*Risk: MEDIUM — processing data via a third-party processor without a documented DPA is a compliance gap.*
*Source: `src/lumio-web/package.json`, `src/lumio-web/src/app/layout.tsx`, `devdocs/posthog-analytics.md`*

**GAP-LEGAL-005** — **DPO is the software developer (self-appointment) — independence risk**
The DPIA states: "DPO: Softwaredeveloper Lumio (interne aanstelling)." AVG art. 37 permits internal DPO appointment, but art. 38(3) requires the DPO to have no conflict of interest. A developer who implements the system and also serves as DPO has an inherent conflict of interest. For a startup with a single developer, this is a common pragmatic compromise, but it should be disclosed.
*Risk: LOW for current scale; MEDIUM for B2B / formal customers.*
*Source: `devdocs/dpia-bijzondere-categorieen.md`*

### 6.4 Legal Recommendations

**REC-LEGAL-001** — Draft and publish a user-facing privacy statement on the marketing site (`www.lumio-legacy.nl/privacybeleid`) covering AVG art. 13 information obligations: identity of the controller, purposes, retention periods, rights (access, correction, erasure, portability), right to lodge a complaint with the AP.
*Priority: CRITICAL | Sprint estimate: 1 day (legal drafting) + 0.5 day (site page)*

**REC-LEGAL-002** — Draft a B2B joint-controller or data processing agreement template before the first B2B customer onboards. Include data boundary commitments (employer has no access to employee data).
*Priority: HIGH | Sprint estimate: INSUFFICIENT_DATA: legal counsel cost; document template 1–2 days*

**REC-LEGAL-003** — Amend the DPIA to explicitly document the legal basis for processing heir BSNs (third-party data subjects). Consider whether art. 14 information obligations apply (informing heirs that their BSN is stored).
*Priority: MEDIUM | Sprint estimate: 0.5 days DPO review*

**REC-LEGAL-004** — Confirm and document a Data Processing Agreement with PostHog. Reference the DPA in `devdocs/posthog-analytics.md`.
*Priority: MEDIUM | Sprint estimate: 0.5 days (PostHog provides a standard DPA)*

---

## 7. Cross-Agent Findings Summary

### 7.1 Critical Findings (Require Immediate Action)

| ID | Agent | Finding | Recommendation |
|----|-------|---------|---------------|
| GAP-DEVOPS-001 | DevOps | CI disabled — all quality gates bypassed | REC-DEVOPS-001: re-enable or add lightweight always-on check |
| GAP-LEGAL-001 | Legal | No user-facing privacy statement (AVG art. 13) | REC-LEGAL-001: draft and publish privacy policy |
| GAP-DEV-002 | Dev | `openapi-ts` error log committed; client may be stale | REC-DEV-002: resolve error, regenerate, commit |

### 7.2 High-Priority Findings

| ID | Agent | Finding | Recommendation |
|----|-------|---------|---------------|
| GAP-ARCH-001 | Architect | OpenAPI spec not in source control | REC-ARCH-001: commit spec, add CI stale-check |
| GAP-DEVOPS-002 | DevOps | TruffleHog secret scan only in disabled CI | REC-DEVOPS-002: standalone always-active workflow |
| GAP-DEVOPS-003 | DevOps | Nightly build runs no tests | REC-DEVOPS-003: add test step to nightly |
| GAP-SEC-001 | Security | Session timeout behaviour undocumented | REC-SEC-001: document + implement Lock() on timeout |
| GAP-SEC-003 | Security | Secret scan disabled (same as DEVOPS-002) | REC-DEVOPS-002 covers |
| GAP-SEC-005 | Security | `npm audit` only in disabled CI | REC-DEVOPS-003 / standalone check |
| GAP-DATA-002 | Data | Video files not encrypted at rest | REC-DATA-001: encrypt video files |
| GAP-LEGAL-002 | Legal | No B2B joint-controller agreement | REC-LEGAL-002: draft agreement before first B2B |

### 7.3 Medium-Priority Findings

| ID | Agent | Finding | Recommendation |
|----|-------|---------|---------------|
| GAP-ARCH-003 | Architect | No sidecar crash-recovery watchdog | REC-ARCH-002 |
| GAP-ARCH-005 | Architect | No end-user database upgrade guide | REC-ARCH-004 |
| GAP-DEV-001 | Dev | No API test coverage threshold | REC-DEV-001 |
| GAP-DEV-005 | Dev | Business rules JSON not schema-validated | REC-DEV-004 |
| GAP-DEVOPS-004 | DevOps | No rollback SOP | REC-DEVOPS-004 |
| GAP-DEVOPS-005 | DevOps | EV code signing deferred (DEC-201) | Acknowledge; act before v1.0 GA |
| GAP-SEC-002 | Security | Shamir key TTL undocumented | REC-SEC-002 |
| GAP-SEC-004 | Security | No sidecar binary integrity check | REC-SEC-004 |
| GAP-DATA-001 | Data | No backup verification procedure | REC-DATA-003 |
| GAP-DATA-003 | Data | FK enforcement not confirmed enabled | REC-DATA-002 |
| GAP-LEGAL-003 | Legal | Heir BSN legal basis not explicit | REC-LEGAL-003 |
| GAP-LEGAL-004 | Legal | PostHog DPA not documented | REC-LEGAL-004 |

### 7.4 Cross-Team Dependencies (OUT_OF_SCOPE tag for downstream agents)

| Dependency | Phase | Note |
|-----------|-------|------|
| Privacy policy content + legal review | Phase 3 / Phase 4 (UX + Brand) | Policy page needs UX design and copy; legal text in scope of Legal Counsel |
| OpenAPI client generation affects UX sprint | Phase 3 | Stale client may cause UX regression |
| Video encryption (REC-DATA-001) affects UX | Phase 3 | UX must account for potential performance impact of video decryption |
| EV Code Signing (GAP-DEVOPS-005) affects Brand/Growth | Phase 4 | SmartScreen warning affects download conversion |

---

## 8. Questionnaire Requests

The following items could not be resolved from code or documentation and require customer input.

### QUESTIONNAIRE_REQUEST — DevOps / Infrastructure

| Q-ID | Agent | Question | Priority |
|------|-------|----------|----------|
| Q-05-001 | DevOps | What is the timeline for resolving the GitHub Actions billing/spending limit? Is there a decision to migrate to self-hosted runners or increase spending? | REQUIRED |
| Q-05-002 | Architect | Is there a planned migration from static-export Next.js to SSR (Next.js server runtime) for a future web/SaaS variant, and if so, in which release or funding milestone? | OPTIONAL |
| Q-05-003 | DevOps | Is EV Code Signing (DEC-201) planned before v1.0 GA, or only for a subsequent release? | REQUIRED |

### QUESTIONNAIRE_REQUEST — Security

| Q-ID | Agent | Question | Priority |
|------|-------|----------|----------|
| Q-08-001 | Security | What is the configured session idle timeout value in `SessionTimeoutManager`? What user actions count as activity? | REQUIRED |
| Q-08-002 | Security | Has a penetration test (DEC-202) been scheduled or scoped? If yes, what is the target date? | OPTIONAL |

### QUESTIONNAIRE_REQUEST — Data

| Q-ID | Agent | Question | Priority |
|------|-------|----------|----------|
| Q-09-001 | Data | What is the typical size of video messages recorded in Lumio? (To evaluate BLOB-in-SQLite vs. filesystem-with-encryption approach for REC-DATA-001.) | REQUIRED |
| Q-09-002 | Data | Are there any existing production user databases that were created before EF migrations were introduced (pre-`EnsureCreated` path), such that the ADR-001 cleanup cannot yet be performed? | REQUIRED |

### QUESTIONNAIRE_REQUEST — Legal

| Q-ID | Agent | Question | Priority |
|------|-------|----------|----------|
| Q-33-001 | Legal | Has a Data Processing Agreement with PostHog been signed? If yes, please provide the reference or DPA date. | REQUIRED |
| Q-33-002 | Legal | Is there an existing data privacy attorney or legal firm engaged for drafting the B2B joint-controller agreement and user privacy policy, or will these be self-authored? | REQUIRED |
| Q-33-003 | Legal | Is Lumio registered as a data controller with the Autoriteit Persoonsgegevens (AP) (not always required in NL, but relevant for special category processing)? | OPTIONAL |

---

## HANDOFF CHECKLIST

- [x] All required sections are filled (6 agent sections + summary + questionnaire requests)
- [x] All UNCERTAIN: items are documented
- [x] All INSUFFICIENT_DATA: items are documented and tagged QUESTIONNAIRE_REQUEST
- [x] Output complies with `docs/contracts/analysis-output-contract.md`
- [x] Guardrails from `docs/guardrails/02-architecture-guardrails.md`, `03-security-guardrails.md`, `07-legal-guardrails.md` have been checked
- [x] All findings include a source reference (filename, section, or line number)
- [x] No contradictory statements in this document
- [x] Output is machine-readable and ready as input for Phase 2 Critic + Risk Agent
- [x] Cross-team dependencies identified and tagged for downstream phases
