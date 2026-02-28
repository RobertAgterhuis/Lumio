# 11 — Heirs & Emergency Codes

This page manages your heirs, assigns estate items, and provides tools for inheritance tax estimation and Shamir emergency codes.

## Heir Details

Add heirs with the following details:

| Field | Description |
|-------|-------------|
| First name | First name of the heir |
| Last name | Last name |
| Date of birth | Date of birth |
| Relationship | Child, Partner, Sibling, Parent, Grandchild, Organization, Other |
| BSN | Citizen service number (optional) |
| Phone number | Phone number |
| Email | Email address |
| Address | Street, house number, postal code, city |
| Share | Percentage of the estate |
| Role | Executor, Trustee, Beneficiary |
| Notes | Additional information |

## Assignments

Assign specific estate items to heirs. Assignments are organized into 5 categories:

| Category | What can be assigned |
|----------|---------------------|
| **Possessions** | Items from the Estate section |
| **Bank accounts** | Bank accounts (after settlement) |
| **Insurance** | Insurance policy payouts |
| **Digital accounts** | Online accounts and their access |
| **Special bequests** | Specific items or amounts |

Per assignment you indicate:
- Which item it concerns
- Which heir receives it
- Any conditions

## Inheritance Tax Calculator

The built-in **tax calculator** provides an estimate of the inheritance tax per heir:
- Enter the total estate value (or use the automatically calculated value from the Estate page)
- The calculator uses the current Dutch tax rates and exemptions
- Results are shown per heir, based on their relationship and share

> **Note**: This is an estimate only. Consult a tax advisor for exact amounts.

## Shamir Emergency Codes

Shamir emergency codes allow heirs to access the encrypted Lumio database in an emergency. This uses the **Shamir Secret Sharing** method.

### Creating Emergency Codes

1. Go to the **Shamir** section
2. Click **Generate emergency codes**
3. Set the **threshold** — the minimum number of codes needed to unlock (e.g., 3 out of 5)
4. Set the **total number of codes** to generate
5. Click **Generate**

### Distributing Codes

Each generated code is unique. Distribute them to trusted persons:
- Print the codes and give them physically
- Each person receives exactly 1 code
- No single code is sufficient on its own

### How It Works

Example with a **3-of-5** threshold:
- 5 codes are generated and distributed to 5 different people
- If you pass away, at least 3 of these people must combine their codes
- With 3 codes entered, the database can be unlocked
- With only 1 or 2 codes, access remains impossible

> **Security**: The Shamir method is mathematically proven. With fewer codes than the threshold, no information about the secret is revealed.

## Per-Heir Export

For each heir, you can generate a personal export containing:
- Their assigned items
- Relevant documents
- Contact information
- Instructions

Export formats:
- **PDF** — Formatted document
- **HTML** — Digital version
