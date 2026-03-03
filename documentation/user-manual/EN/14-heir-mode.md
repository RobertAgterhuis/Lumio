# 14 — Heir Mode

Heir mode allows heirs to access the Lumio database of a deceased person. This mode is activated using **Shamir emergency codes** (see chapter 11).

## Logging In as an Heir

### Step 1 — Open Lumio

Open Lumio on the device where the profile data is stored (e.g., a USB drive from the deceased).

### Step 2 — Choose "Heir Login"

On the login screen, click **Login as heir** instead of the normal login.

### Step 3 — Enter Emergency Codes

1. Enter the first emergency code
2. Click **Add code** to add the next code
3. Repeat until the minimum number of codes (the threshold) has been entered
4. Click **Unlock**

> **Example**: With a 3-of-5 threshold, at least 3 different codes are required.

If the threshold is met, the database will be unlocked and you enter heir mode.

## Heir Dashboard

In heir mode you see a special **heir dashboard** with 4 phases:

### Phase 1 — Urgent (first 24–48 hours)
- Emergency contact information
- Funeral wishes
- Important documents

### Phase 2 — Week 1
- Notify insurance companies and banks
- Arrange funeral matters
- Access digital accounts

### Phase 3 — Month 1
- Estate settlement
- Tax matters
- Transfer or close accounts

### Phase 4 — Completion
- Divide estate
- Close remaining accounts
- Archiving

Each task has a checkbox to track its completion.

## Read-Only Limitations

In heir mode, 4 restrictions apply:

| Restriction | Description |
|-------------|-------------|
| **No editing** | Data cannot be modified |
| **No deletion** | Nothing can be deleted |
| **No new entries** | No new items can be added |
| **No settings** | Settings cannot be changed |

Heirs can only **view** and **export** data.

## Instruction Card Download

The **Download instruction card** button in the heir dashboard generates a PDF (NL or EN) with immediately usable information:

- **Emergency contacts** — names, phone numbers and email addresses
- **Digital keys** — who holds Shamir key shares and how many are required
- **Steps to take** — a numbered checklist to ensure nothing is missed
- **Lumio backup location** — where the encrypted file is stored

> **Privacy**: the instruction card deliberately contains **no** citizen service numbers (BSN) or medical data. It is intended as a practical overview, not a complete dossier.

The file is saved as `lumio-nabestaanden-instructie.pdf`.

## Completeness Overview

The heir dashboard shows a **completeness overview**: how much of the deceased's profile has been filled in. This helps heirs understand which information is available and where gaps exist.

## Settlement Tracker

The **settlement tracker** is a built-in checklist for the complete estate settlement:
- Organized by phase (see above)
- Checkboxes for each task
- Progress bar per phase
- Overall progress indicator

The tracker helps heirs manage the process systematically and ensure no steps are missed.
