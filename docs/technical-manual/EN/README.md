# Lumio — Technical Manual

> Version: February 2026 — .NET 10 · Next.js 16 · Electron 35

## Purpose

This manual describes the full technical architecture of Lumio: an offline-first desktop application for recording your digital estate. The document is intended for developers who want to understand, maintain, or extend the application.

## Table of Contents

| # | Chapter | Topic |
|---|---------|-------|
| 1 | [Architecture](01-architecture.md) | System overview, layered model, technology choices |
| 2 | [Backend API](02-backend-api.md) | Controllers, middleware, services, routes |
| 3 | [Domain Model & Database](03-domain-model-database.md) | Entities, relationships, SQLCipher, migrations |
| 4 | [Security](04-security.md) | Encryption, Shamir's Secret Sharing, authentication |
| 5 | [Frontend](05-frontend.md) | Next.js, pages, components, stores, hooks |
| 6 | [Design System](06-design-system.md) | Tokens, colors, typography, components, a11y |
| 7 | [Desktop Shell](07-desktop-shell.md) | Electron, sidecar, portable distribution |
| 8 | [Internationalization](08-internationalization.md) | next-intl, .resx, language files |
| 9 | [Build & Deployment](09-build-deployment.md) | Scripts, CI, USB distribution |
| 10 | [Development Environment](10-development-environment.md) | Setup, tooling, Storybook, testing |
| 11 | [Business Rules](11-business-rules.md) | Rule engine, validation, configuration |

## Quick Start

```powershell
# Start development environment (builds everything, starts backend + Storybook)
.\start-dev.ps1

# Production build to USB-ready folder
.\tools\build.ps1
```

## Architecture at a Glance

```
┌───────────────────────────────────────────────┐
│                  Electron 35                   │
│  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Main Process  │  │   BrowserWindow       │  │
│  │ (sidecar)     │  │   (Next.js static)    │  │
│  └──────┬────────┘  └──────────┬────────────┘  │
│         │ start/stop           │ HTTP           │
│  ┌──────▼──────────────────────▼────────────┐  │
│  │          .NET 10 API (Kestrel)           │  │
│  │  ┌───────────┐  ┌──────────────────┐     │  │
│  │  │Controllers│  │ Business Rules   │     │  │
│  │  │Middleware │  │ Engine           │     │  │
│  │  └──────┬────┘  └───────┬─────────┘     │  │
│  │         │               │                │  │
│  │  ┌──────▼───────────────▼───────────┐    │  │
│  │  │  EF Core + SQLCipher (AES-256)   │    │  │
│  │  └──────────────────────────────────┘    │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```
