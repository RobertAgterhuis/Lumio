# 5 — Advance Directive & Euthanasia

This page lets you record your wishes regarding euthanasia and advance directives.

## Euthanasia Wish

Record your basic wish:
- **Yes** — You want euthanasia to be a possibility under certain conditions
- **No** — You do not want euthanasia
- **Not yet decided** — You have not yet made a choice

## GP Data

| Field | Description |
|-------|-------------|
| GP name | Name of your general practitioner |
| Practice | Name of the practice |
| Phone number | Phone number of the practice |
| Email | Email address |

> **Tip**: Your GP is important because they are often involved in the euthanasia process.

## Representative

Designate a person who can speak on your behalf if you are no longer able to do so:

| Field | Description |
|-------|-------------|
| Name | Name of the representative |
| Relationship | Relationship with you |
| Phone number | Phone number |
| Email | Email address |
| Address | Address of the representative |

## Second Representative

You can optionally designate a **second representative** as backup. The same fields apply. Having a second representative ensures that someone is always reachable when medical decisions need to be made.

## Dementia Clause

A specific section for a **dementia clause**:
- **Active** — You want euthanasia to be possible in the case of advanced dementia
- **Inactive** — You have not recorded a dementia clause

You can add additional notes with conditions, such as:
- "When I no longer recognize my family"
- "When I need 24-hour nursing care"

## Treatment Prohibition

Record which treatments you wish to **refuse**:
- Resuscitation
- Artificial ventilation
- Artificial hydration and nutrition
- Transfer to ICU

Per treatment you can indicate:
- **Refuse** — You do not want this treatment
- **Allow** — You do want this treatment
- **No preference** — You leave this decision to others

## Additional Wishes

A free text field for additional wishes or instructions that do not fall in the categories above.

## Date of Signing

Record the date on which you recorded or signed these wishes. This is important for the validity of the advance directive.

## Advance Directive Wizard

The **advance directive wizard** guides you through all steps:
1. Euthanasia wish (yes/no/undecided)
2. GP data
3. Representative
4. Dementia clause and treatment prohibitions
5. Additional wishes
6. Date of signing and overview

## Smart Suggestions

Based on your advance directive data, Lumio automatically generates suggestions on the dashboard:

| Trigger | Suggestion | Rule |
|---------|-----------|------|
| Representative (or second representative) not listed as emergency contact | Add your representative as an emergency contact — required for immediate reachability (KNMG Guideline 2022) | BR-SUG-20 |
| Advance directive is older than 5 years | Reconfirm your advance directive — the NVVE recommends doing this at least every 5 years | BR-SUG-21 |
| GP named in advance directive not listed as emergency contact | Add your GP as an emergency contact with role ‘Huisarts’ | BR-SUG-22 |

> **Tip**: Your GP and representatives must be directly reachable in medical emergencies. Keeping them as emergency contacts ensures Lumio can signal if contact details are missing.
