# Cervical Position — Cross-System Research

## Overview

Cervical position self-assessment is used in fertility awareness methods. All systems that track it agree on **3 dimensions**:

| Dimension | Clinical meaning | Fertility signal |
|-----------|-----------------|-----------------|
| **Height** (position) | How deep/reachable the cervix is | High = fertile |
| **Firmness** (texture) | Tissue firmness on palpation | Soft = fertile |
| **Openness** (os dilation) | Cervical os opening | Open = fertile |

## Value Vocabularies by System

| System | Height | Firmness | Openness | Notes |
|--------|--------|----------|----------|-------|
| **Fertility Friend** | Low, Medium, High | Firm, Medium, Soft | Closed, Medium, Open | 3x3x3, reference standard |
| **Ovia** | Low, Medium, High | Hard, Medium, Soft | Closed, Medium, Open | 3x3x3, uses "Hard" not "Firm" |
| **TCOYF (Weschler)** | Low, High | Firm, Soft | Closed, Open | 2x2x2 binary model |
| **Mira** | "Middle", ? | "Medium", ? | "Closed", ? | Only 1 sample value per dim |
| **Kindara** | height + softness + openness | — | — | Confirmed 3 dimensions |
| **Flo** | educational only (SHOW) | — | — | No structured tracking found |
| **Clue** | — | — | — | Cervical fluid only, no position |
| **Natural Cycles** | — | — | — | Cervical mucus only |
| **Tempdrop** | — | — | — | Cervical mucus only |
| **Apple HealthKit** | **N/A** | **N/A** | **N/A** | No cervical position API |
| **SNOMED/FHIR** | **N/A** | **N/A** | **N/A** | No self-assessed position codes |

## SHOW Mnemonic (Toni Weschler, "Taking Charge of Your Fertility")

Peak fertility = **S**oft, **H**igh, **O**pen, **W**et
Infertile = Firm (like nose tip), Low, Closed, Dry

### Analogies used in education
- **Firm** = tip of your nose; **Soft** = your lips (FF, TCOYF)
- **Hard** = tip of your nose; **Soft** = your lips (Ovia uses "Hard" instead of "Firm")
- Medium firmness = your chin (Ovia)

## Consensus

- **3 dimensions, 3 ordinal levels each** is the most complete model (FF, Ovia)
- Simpler models (TCOYF) use 2 levels (binary fertile/infertile)
- No clinical coding standard exists (not in HealthKit, SNOMED, or FHIR)
- Fertility Friend is the de facto reference for digital charting

## Mira-specific observations

- Mira uses `texture` for what others call `firmness` — same concept
- Mira's `position` field contains height values (e.g. "Middle")
- Mira's "Middle" for height likely = "Medium" in other systems
- Mira daily log fields: `cervical_position.position` (height), `cervical_position.texture` (firmness), `cervical_position.openness`

## HDS Model

Single item `body-vulva-cervix-position` with event type `cervix-position/3d-vectors`.

Scale direction: **0.0 = least fertile, 1.0 = most fertile** (consistent with SHOW mnemonic).

Event content stores all 3 dimensions as an object:
```json
{ "height": 1.0, "firmness": 0.0, "openness": 0.5 }
```

| Dimension | Values | Mapping |
|-----------|--------|---------|
| `height` | Low / Medium / High | 0.0 / 0.5 / 1.0 |
| `firmness` | Firm / Medium / Soft | 0.0 / 0.5 / 1.0 |
| `openness` | Closed / Medium / Open | 0.0 / 0.5 / 1.0 |

Item: `type: composite`, `repeatable: P1D`, partial dimensions allowed (only present fields are stored).
