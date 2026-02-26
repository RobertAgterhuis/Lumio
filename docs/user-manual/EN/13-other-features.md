# 13 — Other Features

This chapter describes additional features available throughout the application.

## Search (Ctrl+K)

Press **Ctrl+K** to open the **search dialog**. This provides a global search across all your data.

### Search Categories

Search results are grouped into 10 categories:
- Profile data
- Will & beneficiaries
- Advance directive
- Organ donation
- Digital accounts
- Estate items
- Funeral wishes
- Documents
- Heirs
- Emergency contacts

### Features

- **Yellow highlighting** of the search term in results
- **Keyboard navigation** — Use ↑/↓ arrow keys to navigate, Enter to open
- **Quick actions** — Each result has direct actions (e.g., "Open", "Edit")
- **Recent searches** — Your last 5 searches are remembered
- **Category filter** — Click a category to filter results

---

## Export

Export your data in various formats from the **Export** page in the sidebar.

### Full Export Formats

| Format | Description |
|--------|-------------|
| **Complete PDF** | All your data combined into a single formatted, print-ready PDF |
| **Complete package (ZIP)** | All individual exports bundled together as a ZIP archive |
| **JSON** | Machine-readable format for backup or import |
| **XML** | Structured data in XML format |

> **Note**: Video messages are not included in exports.

### NUV Format

Export funeral data in **NUV format** (XML), the Dutch standard for funeral industry software.

### CSV Exports

Export specific data categories as CSV files (e.g., for use in spreadsheets):

- Heirs
- Possessions
- Bank accounts
- Insurance policies
- Debts
- Emergency contacts

### PDF Exports per Domain

Generate individual PDFs for each of the following 14 sections:

| Export | Contents |
|--------|----------|
| Will | Will data, beneficiaries, executors |
| Advance Directive | Euthanasia directive, conditions |
| Organ Donation | Donor choice, organ-specific preferences |
| Digital Assets | Online accounts, passwords, crypto wallets |
| Estate | Possessions, bank accounts, insurance, debts |
| Funeral Wishes | Ceremony details, guests |
| Documents | Document list and metadata |
| Emergency Card | QR-code emergency card for your wallet |
| Will Draft | Concept version of will data |
| Advance Directive (full) | Complete advance directive document |
| Emergency Procedure | Step-by-step instructions for heirs |
| Estate Inventory | Formal estate inventory |
| Executor Report | Report for the estate executor |
| Notary Package | Package prepared for the notary |

### Per-Heir Export

On the **Heirs** page, you can generate a personal export for each individual heir. This export contains only the information relevant to that person and can be shared with them directly.

---

## Timeline

The **timeline** shows the tasks heirs will need to complete after your passing, organized into 4 phases:

| Phase | Description |
|-------|-------------|
| **First 24 hours** | Contacting the doctor, arranging the funeral, notifying relatives |
| **Week 1** | Notary, employer notification, death registration, collecting documents |
| **Month 1** | Insurance, banks, subscriptions, benefits, digital accounts |
| **3+ months** | Inheritance tax, estate division, final administration |

For domains where you have entered data (will, funeral wishes, emergency contacts, etc.), the corresponding steps show whether the information is available.

---

## Activity Log

The **activity log** records all actions within the application.

### Action Types

| Type | Description |
|------|-------------|
| **Created** | Something new has been added |
| **Modified** | Existing data has been changed |
| **Deleted** | Data has been removed |
| **Exported** | Data has been exported |
| **Logged in** | A login has taken place |
| **Locked** | The application has been locked |
| **Backup** | A backup has been made |
| **Password changed** | The master password was changed |

### Features

- Maximum **200 entries** are displayed
- Entries are shown with timestamp and description
- Entries are **color-coded** by type
- You can filter by action type

---

## Settings

Navigate to **Settings** in the sidebar to manage all application settings.

### Preferences (left column)

| Setting | Description |
|---------|-------------|
| **Auto-lock timeout** | Time before auto-lock after inactivity: 1, 2, 5, 10, 15, or 30 minutes, or disabled |
| **Large text** | Enlarges all text for better readability (accessibility feature) |
| **Dashboard layout** | Show or hide individual dashboard widgets and domain cards |
| **Language** | Switch between Dutch and English |
| **Periodic actualization** | Confirm per domain that your data is still current |

### Account & Data (right column)

| Setting | Description |
|---------|-------------|
| **Profiles** | View and delete profiles (maximum 5 profiles) |
| **Change password** | Change your master password, with a password strength indicator |
| **Backup & Restore** | Download an encrypted backup or restore from a backup file |

### Security

The security card shows the active security measures:
- Database encryption (SQLCipher, AES-256)
- Field encryption (AES-256-GCM) for sensitive data
- Local storage only — no internet
- Data integrity signature

### Account Deletion

At the bottom of Settings you can **permanently delete your account**. All data is irrecoverably removed. This requires password confirmation and an explicit confirmation dialog.

---

## Video Messages

Lumio includes a dedicated **Video Messages** page where you can record or upload personal video messages for your heirs. See [chapter 15 — Video Messages](15-video-messages.md) for full details.

---

## Theme Toggle

Switch between **light mode** and **dark mode** using the sun/moon icon in the application header. The selected theme is saved automatically.

---

## Notifications & Feedback

Lumio provides visual feedback for actions through **toast messages** — small notifications that appear briefly in the bottom-right corner of the screen.

### Toast Types

| Type | Example |
|------|---------|
| **Success** (green) | "Changes saved", "Backup created" |
| **Error** (red) | "Could not save data", "Invalid input" |
| **Warning** (amber) | "Please review your input" |
| **Info** (blue) | "Item updated" |

Toast messages disappear automatically after a few seconds. You can also click the **×** to close them immediately.


### Search Categories

Search results are grouped into 10 categories:
- Profile data
- Will & beneficiaries
- Advance directive
- Organ donation
- Digital accounts
- Estate items
- Funeral wishes
- Documents
- Heirs
- Emergency contacts

### Features

- **Yellow highlighting** of the search term in results
- **Keyboard navigation** — Use ↑/↓ arrow keys to navigate, Enter to open
- **Quick actions** — Each result has direct actions (e.g., "Open", "Edit")
- **Recent searches** — Your last 5 searches are remembered
- **Category filter** — Click a category to filter results

---

## Export

Export your data in various formats.

### Full Export Formats

| Format | Description |
|--------|-------------|
| **PDF** | Complete overview of all data, formatted and print-ready |
| **HTML** | Digital version that can be opened in a browser |
| **JSON** | Machine-readable format (for backup or import) |
| **Encrypted backup** | Complete database backup, encrypted |

### CSV Exports

Export specific data as CSV files (e.g., for spreadsheets):
- Digital accounts
- Possessions
- Bank accounts
- Insurance policies
- Debts
- Emergency contacts

### PDF Exports per Domain

Generate separate PDFs for each domain (14 options):
- My Profile
- Will
- Advance Directive
- Organ Donation
- Digital Accounts
- Passwords
- Crypto Wallets
- Possessions
- Bank Accounts
- Insurance Policies
- Debts
- Funeral Wishes
- Heirs
- Emergency Contacts

### NUV Format

Export in **NUV format** (Nabestaanden Uitvaart Voorbereiding — Survivor Funeral Preparation) for compatibility with funeral directors.

---

## Timeline

The **timeline** shows important events organized into 4 phases:

| Phase | Description |
|-------|-------------|
| **Immediate** | Tasks for the first 24–48 hours |
| **Week 1** | Tasks for the first week |
| **Month 1** | Tasks for the first month |
| **Completion** | Long-term settlement tasks |

Each phase contains concrete action items with checkboxes.

---

## Activity Log

The **activity log** records all actions within the application.

### Action Types

| Type | Description |
|------|-------------|
| **Created** | Something new has been added |
| **Modified** | Existing data has been changed |
| **Deleted** | Data has been removed |
| **Exported** | Data has been exported |
| **Logged in** | A login has taken place |
| **Locked** | The application has been locked |
| **Backup** | A backup has been made |

### Features

- Maximum **200 entries** are displayed
- Entries are shown with timestamp and description
- Entries are **color-coded** by type
- You can filter by type

---

## Settings

Settings are divided into 3 sections.

### 1. Preferences

| Setting | Description |
|---------|-------------|
| Language | Choose between Dutch and English |
| Dashboard sections | Show or hide sections |
| Date format | DD-MM-YYYY or YYYY-MM-DD |
| Currency | EUR (default) |

### 2. Account & Data

| Setting | Description |
|---------|-------------|
| Change password | Change your master password |
| Example data | Load or remove example data |
| Delete profile | Permanently delete the current profile |
| Backup | Create or restore a backup |

### 3. Security

| Setting | Description |
|---------|-------------|
| Auto-lock timeout | Time before auto-lock (default: 5 minutes) |
| Clipboard clearing | Automatically clear clipboard after copying passwords |
| Session duration | Maximum session length |

---

## Theme Toggle

Switch between **light mode** and **dark mode** using the sun/moon icon in the application header. The selected theme is saved per profile.

---

## Notifications & Feedback

Lumio provides visual feedback for actions through **toast messages** — small notifications that appear briefly in the bottom-right corner of the screen.

### Toast Types

| Type | Example |
|------|---------|
| **Success** (green) | "Changes saved", "Backup created" |
| **Error** (red) | "Could not save data", "Invalid input" |
| **Warning** (amber) | "Please review your input" |
| **Info** (blue) | "Update available" |

Toast messages disappear automatically after a few seconds. You can also click the **×** to close them immediately.
