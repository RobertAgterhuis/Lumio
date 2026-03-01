# 7 — Digital Assets

This page manages your digital presence, divided into 3 tabs.

---

## Tab 1 — Digital Accounts

Record all your online accounts so that heirs know which accounts exist and what should happen to them.

### Fields per Account

| Field | Description |
|-------|-------------|
| Service name | Name of the service (e.g., Gmail, Facebook, Netflix) |
| Category | E.g., Email, Social media, Banking, Shopping, Cloud storage |
| URL | Web address of the service |
| Username | Your username or email |
| Email | Email address linked to the account |
| Phone number | Phone number linked to the account |
| Two-factor auth | Whether 2FA is enabled |
| Closure instructions | What should happen to the account: delete, memorialize, transfer, or keep |

### Category Filter

Use the category filter at the top to quickly find accounts. Categories include:
- Email
- Social media
- Banking
- Shopping
- Cloud storage
- Entertainment
- Work
- Other

### CSV Import

You can import accounts in bulk via a **CSV file**:
1. Click **Import CSV**
2. Select a CSV file with columns: service, category, url, username, email
3. The imported accounts are added to the existing list

---

## Tab 2 — Passwords

Securely store passwords linked to your accounts.

### Fields per Password

| Field | Description |
|-------|-------------|
| Service | The service this password belongs to |
| Username | The corresponding username |
| Password | The password itself |
| Notes | Additional information (e.g., security questions) |

### Visibility Toggle

Passwords are shown as `••••••••` by default. Click the **eye icon** to make them visible.

### Password Generator

Click **Generate password** to create a strong random password. Options:
- Length (8–64 characters)
- Include uppercase letters
- Include numbers
- Include special characters

### Encryption

All passwords are encrypted with **AES-256-GCM** before being stored. They are only decrypted when you explicitly view them.

---

## Tab 3 — Crypto Wallets

Record your cryptocurrency wallets.

### Fields per Wallet

| Field | Description |
|-------|-------------|
| Wallet name | Name or description (e.g., "Bitcoin hardware wallet") |
| Currency | Cryptocurrency type (Bitcoin, Ethereum, etc.) |
| Wallet address | Public wallet address |
| Platform | Exchange or hardware wallet (e.g., Ledger, Coinbase) |
| Notes | Additional information |

### Seed Phrase

> **Important**: Lumio stores no seed phrases or private keys in plain text. Use the **password tab** to store these securely, or record the physical location where they are kept.
