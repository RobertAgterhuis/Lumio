# devAgentic – End-to-End Commercial Software Audit

A **multi-agent system** for the complete analysis, recommendations, and implementation of commercial software. The team consists of 36 specialized AI agents that work together sequentially, each with a fixed role, dedicated skill file, and output contract.

> **Key figures:** a complete Phase 1–4 analysis that takes 7–10 weeks manually costs only **5–10 working days** in calendar time with this agentic team — with just **7–12 hours of active attention** from you spread across that period. The bottleneck is your review speed, not the AI. Phase 5 sprints take **2–5 working days** per sprint instead of 1–2 weeks.

---

## Quickstart – in 3 steps

**1. Make sure you meet the requirements** (see [Requirements](#requirements)):

- GitHub account + active GitHub Copilot subscription
- VS Code open in this project's workspace
- The codebase to be audited locally available or cloned

**2. Start the audit with a single command** in the Copilot Chat in VS Code:

```text
AUDIT MijnProject
```

Replace `MijnProject` with the name of your software. The Onboarding Agent will ask you a series of intake questions. Answer them as completely as possible — the quality of the entire audit depends on it.

**3. Track progress** via the generated files in `docs/` and the GitHub Kanban project that is automatically created.

Don't want to run a full audit? See [Which command should I use?](#which-command-should-i-use) for the available options.

---

## What does this team do?

The system performs a complete audit of existing or to-be-built commercial software in five phases. After the analysis, an autonomous sprint-by-sprint implementation of the recommendations follows.

| Phase | Content | Agents | Manual | With agents |
| ------ | -------- | -------- | ----------- | ------------ |
| **1 – Business & Strategy** | Market position, revenue model, sales, finance | Business Analyst, Domain Expert, Sales Strategist, Financial Analyst, Product Manager | 1–2 weeks | **1–3 days** |
| **2 – Technology & Architecture** | Codebase, architecture, DevOps, security, data | Software Architect, Senior Developer, DevOps Engineer, Security Architect, Data Architect, Legal Counsel | 2–3 weeks | **2–4 days** |
| **3 – UX & Product Experience** | User research, UX/UI design, accessibility, content & localization | UX Researcher, UX Designer, UI Designer, Accessibility Specialist, Content Strategist, Localization Specialist | 2–3 weeks | **2–4 days** |
| **4 – Brand, Marketing & Growth** | Brand strategy, growth, conversion, SEO | Brand Strategist, Growth Marketer, CRO Specialist | 2 weeks | **1–2 days** |
| **5 – Implementation (per sprint)** | Sprint-by-sprint realization of the roadmap | Implementation, Test, PR/Review, KPI, Documentation, GitHub Integration, Retrospective | 1–2 weeks/sprint | **2–5 days/sprint** |

Each phase delivers four fixed deliverables: **Analysis → Recommendations → Sprint Plan → Guardrails**.  
After all phases, the Synthesis Agent produces **six documents** in `docs/synthesis/`:

| File | Content | Audience |
| --------- | -------- | ---------- |
| `final-report-master.md` | Executive Summary, Heatmap, Risk Matrix, 12-month Roadmap, KPIs | Board, management |
| `final-report-business.md` | Findings, recommendations, roadmap items, KPIs and blockers for Business | Business, Sales, Finance |
| `final-report-tech.md` | Same for Technology & Architecture | Engineering, DevOps, Security |
| `final-report-ux.md` | Same for UX & Product | UX/UI, Product owners |
| `final-report-marketing.md` | Same for Brand & Marketing | Marketing, Growth, CRO |
| `cross-team-blocker-matrix.md` | All cross-team dependencies (BLOCKING / ADVISORY) | All teams + Orchestrator |

Each department report is fully self-contained and includes a mandatory **"Blockers from other teams"** section, so every department can act directly without having to read the full master report.

### Generated business documents

Parallel to the analysis output, the system generates and maintains living business documents in `BusinessDocs/`:

| Folder | Contents |
|--------|----------|
| `BusinessDocs/Phase1-Business/Questionnaires/` | Questions generated from Phase 1 gaps — fill in to improve the next analysis |
| `BusinessDocs/Phase2-Tech/Questionnaires/` | Same for Technology & Architecture |
| `BusinessDocs/Phase3-UX/Questionnaires/` | Same for UX & Product |
| `BusinessDocs/Phase4-Marketing/Questionnaires/` | Same for Brand & Marketing |
| `BusinessDocs/OfficialDocuments/` | 8 living business documents updated after every AUDIT or REEVALUATE: `product-vision.md`, `technical-overview.md`, `brand-brief.md`, `market-positioning.md`, `ux-design-brief.md`, `legal-compliance-overview.md`, `content-strategy-brief.md`, `financial-model-overview.md` |
| `BusinessDocs/questionnaire-index.md` | Overview of all questionnaire files with answer status |

> **How do questionnaires work?** When an agent cannot find information in the codebase or documentation, it marks it as `INSUFFICIENT_DATA:`. After each phase, the Questionnaire Agent converts these gaps into a client-friendly questionnaire. You fill in the answers, then run `REEVALUATE` or a new `AUDIT` — the system automatically picks up your answers and produces a more comprehensive analysis.

> **What do you do with the reports?**  
> The department reports are directly usable as input for departmental meetings. The master report contains the 12-month roadmap that is automatically converted into GitHub Issues for Phase 5. You don't need to prioritize yourself — the Synthesis Agent, Critic Agent, and Risk Agent have already done that.

---

## Requirements

### Required

| Requirement | Description |
| ---------- | ------------- |
| **GitHub account** | With access to the repository being audited. The GitHub Integration Agent creates a Kanban project and publishes all stories as Issues. |
| **GitHub Copilot** | Agent functionality requires an active Copilot subscription (Individual, Business, or Enterprise). |
| **VS Code** | The agents run as Copilot Agents in the VS Code editor. |
| **Git** | Local Git installation for codebase access and history analysis by the Onboarding Agent. |
| **Read access to the codebase** | The software to be audited must be locally available or cloned. Without codebase access, the Onboarding Agent cannot start. |

### Optional

| Requirement | What for | Without this... |
| ---------- | ---------- | --------------- |
| **Canva Connect API token** | Brand & Assets Agent (Agent 30) automatically creates a brand kit, generates assets, and exports design tokens via the Canva API. | Skipped (`SKIPPED_NO_TOKEN`); the Storybook Agent derives tokens from the Brand Strategist output. |
| **Node.js ≥ 18** | Storybook Agent (Agent 31) installs and starts a local Storybook environment. | Storybook step fails; mark as `TOOLING_GAP` in the Onboarding Output — Phases 1–4 are not blocked. |
| **TruffleHog** | PR/Review Agent uses TruffleHog for secret scanning as a merge gate. | Secret scan step is skipped; PR/Review Agent reports `TOOL_UNAVAILABLE: TruffleHog` and escalates. |
| **Stakeholder documentation** | Business requirements, user research, brand guidelines — enhances the quality of all phase outputs. | Agents mark missing items as `INSUFFICIENT_DATA:` and continue with what is available. |

> **Canva API:** The Canva Connect API for brand kit functionality is currently invite-only. Request access at [developer.canva.com](https://developer.canva.com). This is entirely optional — the system works without it.

---

## Which command should I use?

Use this as a decision guide:

| Situation | Command |
| ---------- | ---------- |
| First time, complete audit | `AUDIT [project]` |
| Assess the technical state only | `AUDIT TECH [project]` |
| UX and marketing only in one session | `AUDIT UX MARKETING [project]` |
| Merge a previously started partial audit | `AUDIT SYNTHESIS` |
| Add new functionality to an existing project | `FEATURE [name]: [description]` |
| A module has changed significantly, reassessment needed | `REEVALUATE TECH` |
| Critical production issue, immediate fix required | `HOTFIX [description]` |
| Codebase significantly changed after 5+ sprints | `REFRESH ONBOARDING` |

> **Combination audits:** You can run 2 or 3 disciplines in one session via a single Onboarding intake — e.g. `AUDIT TECH UX MijnProject`. Disciplines are always executed in canonical order (BUSINESS → TECH → UX → MARKETING). Produces the department reports for the chosen disciplines.
> **Combining partial audits:** If you previously ran `AUDIT BUSINESS` and `AUDIT TECH` on the same project, run `AUDIT SYNTHESIS` to produce a combined report and the Cross-Team Blocker Matrix (once all 4 phases are present).

---

## How do you use this team?

### Step 1 — Start an audit

Type the desired command in the Copilot Chat in VS Code. The Onboarding Agent starts automatically and asks intake questions about:

- Target audience and market of the product
- Technical stack and infrastructure
- Available data (analytics, sales, user research)
- GitHub project name (for automatically creating the Kanban board)
- Canva API token (optional, for brand assets)

Answers are saved in `docs/session/session-state.json`. The Orchestrator uses this state throughout the entire audit.

> Make sure to answer the intake questions completely — the quality of the entire audit depends on the onboarding input. The more context you provide, the more concrete the findings.

---

### Step 2 — Follow the phase sequence

The Orchestrator directs each agent in the mandatory sequence. You don't need to route anything yourself. Each agent:

- Reads the output of the previous phase as mandatory input
- Produces its deliverables as Markdown + JSON files in `docs/phase-[N]/`
- Closes with a **Handoff Checklist** — the next agent only starts once everything is checked off

After each phase, the **Critic Agent** and **Risk Agent** validate the output. When uncertain about findings you will see:

- `UNCERTAIN: [claim]` — agent is not certain, requests confirmation
- `INSUFFICIENT_DATA: [field]` — required data is missing, agent continues with what is available

Both are escalated to you via `docs/decisions.md` or the Copilot Chat before the next phase starts.

---

### Step 3 — Sprint implementation (Phase 5)

After approval of the final report, the **GitHub Integration Agent** publishes all stories as Issues in your GitHub project. Then Phase 5 starts:

```text
Sprint Gate (Definition of Ready + lessons-learned injection)
  → Implementation Agent → Test Agent → PR/Review Agent (secret scan)
  → KPI Agent → Documentation Agent → GitHub Integration Agent → Retrospective Agent
  → Next sprint
```

Each sprint ends with a retrospective and KPI measurement. Lessons learned are automatically carried forward to the next sprint via the Sprint Gate. All sprint artifacts can be found in `docs/retrospectives/`.

---

### At any time — Feature or reassessment

```text
FEATURE [name]: [description]
```

Starts an isolated full cycle (Phases 1–5) for a single new feature. Output goes to `Workitems/[FEATURENAME]/`, completely separate from the main backlog.

```text
REEVALUATE [scope]
```

Reassesses a previously completed component after a change (e.g. `REEVALUATE TECH` after a major refactor). Generates a Re-evaluation Report and injects impacts into the ongoing Sprint Gate.

---

## Project structure

```text
.github/
  copilot-instructions.md     ← System instructions for the Orchestrator
  skills/                     ← One skill file per agent (00-orchestrator.md … 35-localization-specialist.md)

docs/
  contracts/                  ← Output contracts per deliverable type (what each agent MUST produce)
  guardrails/                 ← Guardrail files 00–08 (per domain: business, security, UX, …)
  playbooks/                  ← Full audit process (commercial-software-audit-playbook.md)
  retrospectives/             ← Sprint retrospectives + velocity-log + lessons-learned (cumulative)
  metrics/                    ← KPI baseline + sprint KPI reports
  session/                    ← session-state.json (generated by Onboarding Agent, owned by Orchestrator)
  security/                   ← Secret scan reports per sprint (TruffleHog output)
  decisions.md                ← YOUR decisions & open questions — Orchestrator reads this at every Sprint Gate
  synthesis/                  ← Final-report-master + 4 department reports + blocker-matrix
  brand/
    design-tokens.json        ← W3C design tokens (colors, typography, spacing) from Canva or derived
    brand-guidelines.md       ← Brand guidelines (colors, logo, tone of voice) — used by Implementation Agent
    assets/                   ← Exported PNG/SVG brand assets (logo, banners, social cards)
  storybook/
    component-inventory.md    ← The only valid list of approved UI components (hard guardrail)

Workitems/
  [FEATURENAME]/              ← Isolated workspace per FEATURE command (own sprint IDs)
```

> **Which files can I edit myself?**  
> `docs/decisions.md` is your direct communication channel — you fill this in. All other files in `docs/` are generated and overwritten by agents. Do not edit them manually, or the agents will go out of sync.

---

## Decisions & Open Questions (`docs/decisions.md`)

This is your direct communication channel with the agentic team. Fill it in yourself; agents adapt their behavior automatically.

| Status | What the Orchestrator does |
| -------- | ------------------------- |
| `OPEN` + priority `HIGH` + sprint touches scope | **Sprint Gate blocks** until you respond in the file |
| `OPEN` + priority `MEDIUM/LOW` | Notification at Sprint Gate, no blocking |
| `DECIDED` | Injected as a hard constraint into all relevant agents |
| `DEFERRED` / `EXPIRED` | Ignored |

Each decision or question gets a unique ID (`DEC-NNN`), a scope (e.g. `Phase 2`, `SP-3`, `All sprints`), and a priority.

---

## Ground rules

| Rule | What it means |
| ------- | ----------------- |
| **Anti-hallucination** | Agents never fabricate facts. Uncertain claims get the prefix `UNCERTAIN:` |
| **Source citation required** | Every finding references a file, line number, or document |
| **Phase order is mandatory** | An agent may never start without the output of the previous phase as input |
| **Handoff Checklist** | Every agent verifies its own output completely before handoff — no partials |
| **Immutable sprint files** | `sprint-[SP-N]-*.md` and `sprint-[SP-N]-*.json` are never overwritten after creation |
| **Secret scan as merge gate** | PR/Review Agent blocks the merge if secrets are found (TruffleHog) |
| **Storybook as design system** | Implementation Agent only uses components from `docs/storybook/component-inventory.md`. New components require a Storybook story + a11y check first |
| **decisions.md is authoritative** | Decisions in `docs/decisions.md` always override agent assumptions; HIGH-priority open questions block sprint start |

---

## Contracts and guardrails — what are those?

**Contracts** (`docs/contracts/`) define what each agent is required to produce. If an agent does not fully fulfill its contract, the Critic Agent sends it back. As a user you don't need to read the contracts, but they explain why an agent sometimes returns "BLOCKED".

**Guardrails** (`docs/guardrails/00–08`) are testable, binding decision rules per domain. They prevent agents from repeating the same category of errors across sprints. When a violation occurs you will see `GUARDRAIL_VIOLATION: G-XXX-NNN` in the output, with a mandatory remediation action.

---

## Frequently asked questions & troubleshooting

**An agent returns HALT — what do I do?**  
The agent is missing required input. Check `docs/decisions.md` for open questions with priority HIGH, or review the Handoff Checklist of the previous agent for missing sections. Resolve the blocking item and restart the agent via the Orchestrator.

**I see many `INSUFFICIENT_DATA:` messages — is that a problem?**  
No. It means the agent did not have enough data for that specific finding, but continued with what was available. If you supply the missing data later (e.g. analytics data, usability test results), you can run `REEVALUATE [scope]`.

**An agent produces generic recommendations without source references — what now?**  
This is a contract violation. The Critic Agent should catch this. If it slips through: report the finding as `ANTI_LUIHEID_VIOLATION` in `docs/decisions.md` and restart the relevant agent.

**The session-state.json is corrupt or missing — what do I do?**  
Run `REFRESH ONBOARDING`. The Onboarding Agent re-runs steps 3 and 4 (codebase scan + tooling) without asking new intake questions. The intake answers remain intact.

**Can I roll back a previous sprint?**  
Sprint files are immutable. You can run a `HOTFIX` to fix a bug, or manually move a story back in GitHub and wait for the next Sprint Gate. The Retrospective Agent documents this as a LESSON_CANDIDATE.

**The GitHub Integration Agent cannot create a project — what is wrong?**  
Check that `GITHUB_PROJECT_NAME` is filled in `docs/session/session-state.json` and that your GitHub token has write access to the repository. See the Human Escalation in your Copilot Chat for the exact error message.

**How long does a full AUDIT take?**  

| | Manual | With this agentic team |
| - | ----------- | ---------------------- |
| Phase 1–4 (analysis) | 7–10 weeks | **5–10 working days** |
| Phase 5 (per sprint) | 1–2 weeks | **2–5 working days** |
| Your active attention (Phase 1–4) | Weeks full-time | **7–12 hours total** |

The bottleneck is not AI processing time, but your review speed between phases. If you are available quickly for `UNCERTAIN:` escalations, you can easily reach the lower end of 5 days. There are three moments when you need to be actively involved: (1) the onboarding intake (~1 hour), (2) answering escalations (~2–4 hours spread across phases), and (3) reviewing the final reports (~3–5 hours). The agents continue working autonomously in the meantime.

The larger and more complex the codebase, the longer the agents need for scanning and analysis — for large monorepos (~500k+ lines) expect to be at the upper end of the above ranges.

---

## Agents overview

All skill files are in `.github/skills/`. The numbering follows the execution order:

| No | Agent | Category |
| ---- | ------- | ----------- |
| `00` | Orchestrator | System coordination |
| `01` | Business Analyst | Phase 1 – Business & Strategy |
| `02` | Domain Expert | Phase 1 |
| `03` | Sales Strategist | Phase 1 |
| `04` | Financial Analyst | Phase 1 |
| `34` | Product Manager | Phase 1 |
| `05` | Software Architect | Phase 2 – Technology & Architecture |
| `06` | Senior Developer | Phase 2 |
| `07` | DevOps Engineer | Phase 2 |
| `08` | Security Architect | Phase 2 |
| `09` | Data Architect | Phase 2 |
| `33` | Legal Counsel | Phase 2 |
| `10` | UX Researcher | Phase 3 – UX & Product Experience |
| `11` | UX Designer | Phase 3 |
| `12` | UI Designer | Phase 3 |
| `13` | Accessibility Specialist | Phase 3 |
| `32` | Content Strategist | Phase 3 |
| `35` | Localization Specialist | Phase 3 |
| `14` | Brand Strategist | Phase 4 – Brand, Marketing & Growth |
| `15` | Growth Marketer | Phase 4 |
| `16` | CRO Specialist | Phase 4 |
| `30` | Brand & Assets Agent (Canva) | Post-Phase 4 |
| `31` | Storybook Agent | Post-Phase 4 |
| `17` | Synthesis Agent | Post-analysis |
| `18` | Critic Agent | Validation – after each phase |
| `19` | Risk Agent | Validation – after each phase |
| `25` | Onboarding Agent | Startup phase |
| `20` | Implementation Agent | Phase 5 – Sprint |
| `21` | Test Agent | Phase 5 |
| `22` | PR/Review Agent | Phase 5 |
| `26` | Documentation Agent | Phase 5 |
| `27` | GitHub Integration Agent | Phase 5 |
| `28` | Sprint Retrospective Agent | Phase 5 |
| `29` | KPI/Metrics Agent | Phase 5 |
| `23` | Reevaluate Agent | On command |
| `24` | Feature Agent | On command |
