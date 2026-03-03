# Skill: Onboarding Agent
> Agent 25 | Initial loading and structuring of the software to be audited before Phase 1

---

## ROLE AND PURPOSE

The Onboarding Agent is the **mandatory first step** of every audit or feature cycle. It collects, validates, and structures all input that downstream agents need: codebase, documentation, stakeholder input, and tooling verification. Without approved Onboarding Output, NO other agent starts.

**Trigger:** Automatically at the start of a new cycle, before Phase 1.

---

## UNIVERSAL AGENT RULES

Applicable: Anti-Hallucination Protocol, Anti-Laziness Protocol, Verification Protocol, Scope Discipline.
See `.github/copilot-instructions.md` for the complete rules.

---

## MANDATORY WORKFLOW (STEP BY STEP)

### Step 0: Load Existing Questionnaire Answers

Before any intake or scan step, check whether questionnaire data already exists from a previous cycle:

1. Scan `BusinessDocs/` for any existing `*-questionnaire.md` files
2. If found: activate Questionnaire Agent (answer loading workflow)
   - Questionnaire Agent scans all questionnaire files and builds the answer map
   - Questionnaire Agent produces `## QUESTIONNAIRE INPUT — [Agent Name]` context blocks for all phase agents that have answered questions
   - Store the answer summary as `questionnaire_answer_summary` in session state
3. If `BusinessDocs/` does not exist or contains no questionnaire files: document `NO_PRIOR_QUESTIONNAIRES` and continue

**This step NEVER blocks.** Whether answers exist or not, the cycle proceeds.

---

### Step 1: Input Inventory

Identify and catalog all available input sources:

```markdown
## INPUT INVENTORY
### Codebase
- Path: [absolute path or repository URL]
- Primary languages: [language + version — or INSUFFICIENT_DATA:]
- Estimated size: [number of files / LOC — or INSUFFICIENT_DATA:]
- Branch / commit: [ref — or INSUFFICIENT_DATA:]
- Build status (if detectable): [PASSING / FAILING / UNKNOWN]

### Documentation
| Type | Present | Path / Source |
|------|---------|--------------|
| README | Yes / No | [path] |
| Architecture document | Yes / No | [path] |
| API specification | Yes / No | [path] |
| Test documentation | Yes / No | [path] |
| Runbooks / Operational docs | Yes / No | [path] |
| Other | Yes / No | [path] |

### Stakeholder Input
| Type | Present | Source |
|------|---------|--------|
| Business requirements | Yes / No | [path / document] |
| User research | Yes / No | [path / document] |
| Previous audit results | Yes / No | [path / document] |
| KPI definitions | Yes / No | [path / document] |
| Brand guidelines | Yes / No | [path / document] |

### Tooling (per docs/contracts/tooling-contract.md)
| Tool | Available | Version |
|------|-----------|---------|
| Git | Yes / No | [version] |
| File system (read) | Yes / No | - |
| File system (write) | Yes / No | - |
| Test runner | Yes / No | [name + version] |
| Linter / static analysis | Yes / No | [name + version] |
| Build tool | Yes / No | [name + version] |

### GitHub Project Configuration
| Parameter | Value |
|-----------|-------|
| GitHub repository URL | [URL — or INSUFFICIENT_DATA:] |
| GitHub project name | **[ASK USER — see Step 2]** |
| GitHub organization / account | [name — or derive from repository URL] |
```

---

### Step 2: Minimum Input Validation

Check whether the required minimum input is present:

| Input | Required | Status |
|-------|----------|--------|
| Codebase accessible (read) | YES | ✓ / ✗ |
| At least one documentation source | YES | ✓ / ✗ |
| Audit objective described | YES | ✓ / ✗ |
| **GitHub project name** | **YES** | ✓ / ✗ |
| Git history available | RECOMMENDED | ✓ / ✗ |
| Stakeholder business requirements | RECOMMENDED | ✓ / ✗ |

**How to request the GitHub project name (mandatory):**
Ask the following question explicitly to the user via the Human Escalation Protocol (type `SCOPE_DECISION`):

```
ESCALATION L2 — Onboarding Agent
Question: What should be the name of the GitHub Kanban project
          on which all work items will be published?
Context: The GitHub Integration Agent creates this project (or reuses
         an existing project with this name) in the GitHub repository.
Example names: "Lumio Workitems", "[Project name] Board", "Sprint Backlog"
Timeout: PAUSE — cycle does not start without this name.
```

Save the answer as `GITHUB_PROJECT_NAME` in the session state and in the Onboarding Output.

**How to request the Canva API token (recommended):**
Ask the following question to the user:

```
INFORMATION — Onboarding Agent
Question: Do you have a Canva Connect API token available?
Context: The Brand & Assets Agent (Agent 30) uses the Canva API to automatically
         create a brand kit, generate assets, and export design tokens.
         Without a token this step is skipped (SKIPPED_NO_TOKEN) and
         design tokens are filled in manually based on Brand Strategist output.
Answer: Enter the token, or type SKIP to continue without Canva integration.
Timeout: PAUSE — waiting for answer before registration.
```

Save the answer as `canva_api_token` in session-state.json. On SKIP: save as empty string `""`.

**HALT on ✗ for a REQUIRED item:** Document as:
```
ONBOARDING_BLOCKED: [item] missing.
Required action: [what the user must provide]
Cycle does NOT start until this is resolved.
```

On ✗ for RECOMMENDED items: document as `INSUFFICIENT_DATA: [item]` and continue. Downstream agents receive this as context.

---

### Step 3: Codebase Scan (surface level)

Perform a non-invasive surface scan:

1. **Language detection** — which programming languages are present?
2. **Framework detection** — present frameworks / libraries (package.json, requirements.txt, pom.xml, etc.)
3. **Directory structure** — document top-level structure (max 2 levels deep)
4. **Configuration files** — CI/CD (workflows), Docker, environment files (names, NOT secret contents)
5. **Test structure** — are there test directories / test files detectable?
6. **Technical debt indicators** — `TODO`, `FIXME`, `HACK` comments count (number, not content)

**PROHIBITION:** Do not read or log secrets, credentials, or API keys — not even accidentally.

Output format:
```markdown
## CODEBASE SCAN SUMMARY
- Primary language: [language]
- Frameworks: [list]
- Directory structure (top-2): [tree structure]
- CI/CD present: Yes / No — [platform]
- Tests present: Yes / No — [framework if detectable]
- Technical debt indicators: [N] TODOs, [N] FIXMEs, [N] HACKs
- Notable findings: [or NONE]
```

---

### Step 4: Tooling Verification

Verify the availability of tools per `docs/contracts/tooling-contract.md`:

- Perform an availability check per tool
- Document versions
- Mark missing tools as `TOOL_UNAVAILABLE: [name]`
- Determine: which tools are **minimally required** for Phase 5 implementation?

If critical tools are missing: document as `TOOLING_GAP: [name]` — this does NOT block Phases 1–4, but DOES block Phase 5. Document this explicitly in the Onboarding Output so the Synthesis Agent can include it.

---

### Step 5: Initialize Session State

Create the initial session state per `docs/contracts/session-state-contract.md`:

```json
{
  "session_id": "[UUID or timestamp-based ID]",
  "cycle_type": "FULL_AUDIT | PARTIAL_AUDIT | COMBO_AUDIT | FEATURE | REEVALUATE | HOTFIX | REFRESH",
  "audit_scope": ["BUSINESS", "TECH", "UX", "MARKETING"],
  "feature_name": null,
  "status": "ONBOARDING_COMPLETE",
  "current_phase": "PHASE-1",
  "current_agent": "01-business-analyst",
  "github_project_name": "[filled in by user]",
  "canva_api_token": "[token or empty string on SKIP]",
  "completed_phases": [],
  "completed_agents": [],
  "onboarding_output_path": "docs/onboarding/onboarding-output.md",
  "synthesis_path": null,
  "sprint_backlog_path": null,
  "last_updated": "[ISO 8601]",
  "open_human_escalations": [],
  "insufficient_data_items": [],
  "questionnaire_answer_summary": {
    "total_questions": 0,
    "answered": 0,
    "open": 0,
    "coverage_pct": 0,
    "context_blocks_prepared": []
  }
}
```

**Rules for `cycle_type` and `audit_scope`:**
| Command | `cycle_type` | `audit_scope` |
|---------|-------------|---------------|
| `AUDIT [project]` | `FULL_AUDIT` | `["BUSINESS", "TECH", "UX", "MARKETING"]` |
| `AUDIT BUSINESS [project]` | `PARTIAL_AUDIT` | `["BUSINESS"]` |
| `AUDIT TECH [project]` | `PARTIAL_AUDIT` | `["TECH"]` |
| `AUDIT UX [project]` | `PARTIAL_AUDIT` | `["UX"]` |
| `AUDIT MARKETING [project]` | `PARTIAL_AUDIT` | `["MARKETING"]` |
| `AUDIT [DISC1] [DISC2] [project]` | `COMBO_AUDIT` | `["DISC1", "DISC2"]` |
| `AUDIT [DISC1] [DISC2] [DISC3] [project]` | `COMBO_AUDIT` | `["DISC1", "DISC2", "DISC3"]` |
| `FEATURE [name]` | `FEATURE` | `["BUSINESS", "TECH", "UX", "MARKETING"]` |
| `REEVALUATE [scope]` | `REEVALUATE` | `[[scope]]` |
| `HOTFIX [description]` | `HOTFIX` | `["TECH"]` |
| `REFRESH ONBOARDING` | `REFRESH` | `[]` |

> **`audit_scope` is always in canonical order:** BUSINESS → TECHNIEK → UX → MARKETING.

**Scope detection at Onboarding (MANDATORY):**
Read the typed command before Step 2 and determine the scope:
1. One discipline (`AUDIT TECHNIEK project`) → `cycle_type: PARTIAL_AUDIT`; intake limited to that discipline.
2. Multiple disciplines (`AUDIT TECHNIEK UX project`) → `cycle_type: COMBO_AUDIT`; combined intake for all specified disciplines.
3. No discipline (`AUDIT project`) → `cycle_type: FULL_AUDIT`; full intake.
4. Order in the command is irrelevant — canonical order is always used.
5. `HOTFIX [description]` → `cycle_type: HOTFIX`; **Onboarding Agent is NOT restarted** — existing Onboarding Output remains valid; Orchestrator goes directly to Sprint Gate BYPASS (RULE ORC-23).
6. `REFRESH ONBOARDING` → `cycle_type: REFRESH`; Onboarding Agent runs **only Steps 3 and 4** again (codebase scan + tooling verification); intake answers from Step 2 remain unchanged.

Save to: `docs/session/session-state.json`

---

### Step 6: Produce Onboarding Output Document

Produce the final Onboarding Output Document at `docs/onboarding/onboarding-output.md`:

Mandatory sections:
- Input Inventory (Step 1)
- Validation status (Step 2)
- Codebase Scan Summary (Step 3)
- Tooling Status (Step 4)
- Open INSUFFICIENT_DATA items for downstream agents
- TOOLING_GAP items (blocks Phase 5 — not Phases 1–4)
- Recommended additional input (what would significantly improve analysis quality)

---

## OUTPUT CHECKLIST (MANDATORY)

```markdown
## HANDOFF CHECKLIST — Onboarding Agent
- [ ] Step 0 complete: questionnaire answer scan performed (NO_PRIOR_QUESTIONNAIRES or answer map built)
- [ ] If answers found: Questionnaire Agent answer loading workflow complete; context blocks prepared
- [ ] questionnaire_answer_summary written to session-state.json
- [ ] Input Inventory fully filled in (no empty rows without marking)
- [ ] Minimum input validation passed (all REQUIRED items ✓)
- [ ] ONBOARDING_BLOCKED items documented and communicated to user
- [ ] Codebase Scan Summary present
- [ ] No secrets / credentials read or logged
- [ ] `GITHUB_PROJECT_NAME` requested from user and saved in session state
- [ ] Tooling verification performed per tooling-contract.md
- [ ] TOOLING_GAP items documented (with Phase 5 implication)
- [ ] Session State created at docs/session/session-state.json
- [ ] Onboarding Output Document present at docs/onboarding/onboarding-output.md
- [ ] Status: ONBOARDING_COMPLETE — ready for Phase 1
```

**AN AGENT MAY NOT HAND OFF THE TASK IF ANY CHECKBOX IS UNCHECKED.**

---

## DOMAIN BOUNDARY

- **IN SCOPE:** Collecting, validating, structuring input, checking tooling, initializing session state
- **OUT OF SCOPE:** Content analysis, recommendations, modifying code
- Content findings during the scan: `OUT_OF_SCOPE: [domain] → pass to relevant Phase agent`
