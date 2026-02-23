# 1 — Architecture

## System Overview

Lumio is an **offline-first desktop application** for managing digital estate. All data stays locally on the user's computer or USB drive. There is no cloud, no server, no account required.

The application consists of three layers:

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Desktop Shell** | Electron 35 | Window, sidecar management, USB portability |
| **Backend API** | .NET 10 (Kestrel) | REST API, domain logic, encryption, PDF export |
| **Frontend** | Next.js 16 (static export) | UI, forms, navigation, i18n |

## Technology Choices

| Component | Choice | Motivation |
|-----------|--------|------------|
| Runtime | .NET 10 (self-contained) | Cross-platform, no installation required |
| Database | SQLite + SQLCipher | Single file, AES-256 full-disk encryption |
| ORM | EF Core 10 | Code-first model, typed queries |
| Frontend framework | Next.js 16 | App Router, static export, Turbopack |
| UI library | React 19 | Component model, hooks, Server Components |
| Styling | Tailwind CSS 4 + CVA | Utility-first, design tokens, variant system |
| State management | Zustand 5 | Minimal, no boilerplate |
| Forms | React Hook Form + Zod 4 | Performant, schema-based validation |
| i18n | next-intl 4 + .resx | Bilingual (NL/EN), frontend + backend |
| Desktop | Electron 35 | Chromium-based, cross-platform |
| Icons | Lucide React | Consistent, lightweight SVG icons |
| PDF | QuestPDF (Community) | .NET-native PDF generation |
| Secret sharing | Shamir's Secret Sharing | Emergency access for heirs |

## Directory Structure

```
lumio/
├── src/
│   ├── Lumio.Api/            # .NET 10 backend
│   │   ├── Controllers/      # 21 REST controllers
│   │   ├── Data/             # DbContext + SQLCipher
│   │   ├── Domain/           # 30 entities (6 aggregates)
│   │   ├── Dtos/             # Request/response records
│   │   ├── Middleware/       # Auth, error handling, RSC rewrite
│   │   ├── Rules/            # Business rules engine + JSON config
│   │   ├── Services/         # Encryption, PDF, audit
│   │   ├── Validators/       # FluentValidation
│   │   └── Resources/        # .resx localization files
│   │
│   ├── lumio-web/            # Next.js 16 frontend
│   │   ├── src/app/          # App Router pages (22 routes)
│   │   ├── src/components/   # UI components (14 groups)
│   │   ├── src/stores/       # Zustand stores (2)
│   │   ├── src/hooks/        # Custom hooks (3)
│   │   ├── src/lib/          # API client, utilities
│   │   ├── src/styles/       # Design tokens (tokens.css)
│   │   └── messages/         # i18n translations (nl.json, en.json)
│   │
│   └── lumio-desktop/        # Electron 35 shell
│       └── src/main/         # Main process (sidecar, window, paths, i18n)
│
├── data/                     # Runtime databases (per profile)
├── tools/                    # Build scripts
├── docs/                     # Documentation
└── Analyse/                  # Design and analysis notes
```

## Communication Pattern

```
User ──► Electron BrowserWindow
                │
                │  HTTP (localhost:5123)
                ▼
          .NET Kestrel ──► SQLCipher DB
                │              (data/{profile}.db)
                │
                ├── DatabaseUnlockMiddleware
                ├── ExceptionHandlingMiddleware
                └── RscRewriteMiddleware
```

All communication goes through **HTTP on localhost**. There is no network traffic to external servers. The Electron main process starts the .NET API as a sidecar process and shuts it down cleanly when the application closes.

## Dataflow

1. User opens Lumio → Electron finds a free port (5123–5127)
2. Electron starts the .NET backend as a child process
3. BrowserWindow loads the statically exported Next.js frontend
4. Frontend communicates via `fetch()` with the local API
5. API validates, processes, and stores data in the encrypted SQLCipher database
6. On close: Electron stops the backend process and cleans up
