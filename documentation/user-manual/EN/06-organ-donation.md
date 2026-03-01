# 6 — Organ Donation

This page lets you record your choices regarding organ and tissue donation.

## Donor Choice

Choose your main preference:
- **Yes, I am a donor** — You want to donate organs and tissues
- **No, I am not a donor** — You do not want to donate
- **My next of kin decides** — You leave the decision to your next of kin
- **A specific person decides** — You name a specific person to decide
- **Not yet decided** — You have not yet made a choice

### Decision Maker

If you choose **A specific person decides**, additional fields appear:

| Field | Description |
|-------|-------------|
| Name | Full name of the designated decision-maker |
| Relationship | Relationship with you |
| Phone number | Contact number for the hospital |

> **Important**: The Organ Donation Act (art. 9) requires that your designated decision-maker is directly reachable. Lumio will suggest adding this person as an emergency contact.

## Registration

| Field | Description |
|-------|-------------|
| Registered in the Donor Register | Whether you are registered with the official Donor Register |
| Registration date | When you registered |

## Explanation

A free text field to add additional context to your choice. For example:
- "I only want to donate organs, not tissues"
- "Only if the recipient is a child"

## Organ-Specific Choices

If you choose "Yes", you can specify **per organ or tissue** whether you want to donate it:

| Organ / Tissue | Choice |
|----------------|--------|
| Heart | Yes / No |
| Lungs | Yes / No |
| Liver | Yes / No |
| Kidneys | Yes / No |
| Pancreas | Yes / No |
| Small intestine | Yes / No |
| Corneas | Yes / No |
| Skin | Yes / No |
| Bone tissue | Yes / No |
| Heart valves | Yes / No |
| Blood vessels | Yes / No |

By default, all organs are selected. You can deselect individual organs.

## Link to the Donor Register

The page provides a link to the official **Donor Register** (donorregister.nl) where you can officially register your choice. Lumio itself does not register this with the government; it only records your personal wishes.

## Organ Donation Wizard

The **organ donation wizard** guides you through the choices:
1. Main donor choice (donor yes/no/other)
2. Organ-specific choices (if applicable)
3. Registration data
4. Additional explanation
5. Overview

## Smart Suggestions

Based on your donor registration data, Lumio automatically generates suggestions on the dashboard:

| Trigger | Suggestion | Rule |
|---------|-----------|------|
| Decision-maker designated (\"A specific person decides\") but not listed as emergency contact | Add your designated decision-maker as an emergency contact (Organ Donation Act art. 9) | BR-SUG-23 |
| Donor wish recorded in Lumio but not officially registered with the Donor Register | Register your choice at donorregister.nl for official legal validity | BR-SUG-24 |

> **Tip**: Registering in Lumio and registering with the official Donor Register are two separate actions. Only an official registration with the Donor Register has legal validity in the Netherlands.
