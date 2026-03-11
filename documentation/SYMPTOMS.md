# Symptoms — Cross-system Compatibility

How HDS symptom items map to external systems and clinical terminologies.

## External Systems Overview

### Apple HealthKit (39 symptom types)

Apple uses a **flat list** of symptom identifiers under `HKCategoryTypeIdentifier`. No sub-categories in the API, but logically groupable by body system.

**Value types:**
- **HKCategoryValueSeverity** (used by 36/39 symptoms): Unspecified (0), NotPresent (1), Mild (2), Moderate (3), Severe (4)
- **HKCategoryValuePresence** (2 symptoms): Present (0), NotPresent (1) — used by `moodChanges`, `sleepChanges`
- **HKCategoryValueAppetiteChanges** (1 symptom): Unspecified (0), NoChange (1), Decreased (2), Increased (3)

**Complete list by body system:**

#### Gastrointestinal (7)
| HealthKit Identifier | Value Type |
|---|---|
| abdominalCramps | Severity |
| bloating | Severity |
| constipation | Severity |
| diarrhea | Severity |
| heartburn | Severity |
| nausea | Severity |
| vomiting | Severity |

#### Respiratory (6)
| HealthKit Identifier | Value Type |
|---|---|
| coughing | Severity |
| runnyNose | Severity |
| shortnessOfBreath | Severity |
| sinusCongestion | Severity |
| soreThroat | Severity |
| wheezing | Severity |

#### Pain (4)
| HealthKit Identifier | Value Type |
|---|---|
| breastPain | Severity |
| chestTightnessOrPain | Severity |
| lowerBackPain | Severity |
| pelvicPain | Severity |

#### Cardiovascular (2)
| HealthKit Identifier | Value Type |
|---|---|
| rapidPoundingOrFlutteringHeartbeat | Severity |
| skippedHeartbeat | Severity |

#### Neurological (4)
| HealthKit Identifier | Value Type |
|---|---|
| dizziness | Severity |
| fainting | Severity |
| headache | Severity |
| memoryLapse | Severity |

#### Constitutional / Whole Body (4)
| HealthKit Identifier | Value Type |
|---|---|
| chills | Severity |
| fatigue | Severity |
| fever | Severity |
| generalizedBodyAche | Severity |

#### Skin & Hair (3)
| HealthKit Identifier | Value Type |
|---|---|
| acne | Severity |
| drySkin | Severity |
| hairLoss | Severity |

#### Sensory (2)
| HealthKit Identifier | Value Type |
|---|---|
| lossOfSmell | Severity |
| lossOfTaste | Severity |

#### Hormonal / Menopause (3)
| HealthKit Identifier | Value Type |
|---|---|
| hotFlashes | Severity |
| nightSweats | Severity |
| vaginalDryness | Severity |

#### Urological (1)
| HealthKit Identifier | Value Type |
|---|---|
| bladderIncontinence | Severity |

#### Behavioral / Mood / Sleep (3)
| HealthKit Identifier | Value Type |
|---|---|
| appetiteChanges | AppetiteChanges (special) |
| moodChanges | Presence |
| sleepChanges | Presence |

**Notes:**
- All symptom types are `HKCategorySample` (categorical over a time interval, not numeric measurements).
- Introduced in iOS 13.6 (26 symptoms) and expanded in iOS 14 (13 more, total 39).

---

### SNOMED CT / HL7 FHIR

**SNOMED CT** organizes symptoms under **404684003 |Clinical finding|**, grouped by body system via the `Finding site` attribute.

| Body System | SNOMED Concept ID | Example symptoms |
|-------------|-------------------|------------------|
| Digestive system | 53619000 | nausea (73879007), bloating (236653009) |
| Nervous system | 118940003 | headache (25064002), dizziness (404640003) |
| Respiratory system | 50043002 | cough, dyspnea, wheezing |
| Musculoskeletal system | 928000 | joint pain, back pain |
| General/constitutional | 162408000 | fatigue (84229001), malaise, fever |

**FHIR modeling:**
- **Observation** (category: `survey` or `symptom`) — for point-in-time patient-reported symptoms
- **Condition** — for persistent/recurring symptoms on a problem list
- **Questionnaire / QuestionnaireResponse** (SDC profile) — for structured symptom diary entries
- Rule of thumb: episodic self-reports → Observation; persistent patterns → Condition

**Relevant code systems:**
- SNOMED CT `Clinical finding` hierarchy — primary coding backbone
- LOINC — for structured questionnaire items
- ICD-10 Chapter R — supplementary grouping (symptoms, signs, abnormal findings)

---

### Ovia Health

Ovia tracks **100+ symptoms** across these categories (no public API; reconstructed from research papers and app content):

- **Period-related**: spotting (with color), flow intensity, discharge
- **Physical**: headaches, migraines, cramps, backache, breast tenderness, nausea, bloating, constipation, diarrhea, dizziness, hot flashes, acne, fatigue, mittelschmerz
- **Behavioral**: mood (10+ options), sleep patterns, sex drive, cravings, appetite changes
- **Cervical**: fluid quality/amount, position (height/firmness/opening)
- **Menopause additions**: hot flashes, night sweats, vaginal dryness, mood swings
- **Postpartum additions**: birth recovery, postpartum mood states

Most symptoms recorded as **presence flags** (not severity-graded).

Source: PMC8631160 — "The real-world applications of the symptom tracking functionality available to menstrual health tracking apps" (2021)

---

### Mira

**API structure** (`symptoms` field in daily log):
```json
"symptoms": [
  { "value": "Headache", "level": "Mild" },
  { "value": "Nausea", "level": "Mild" },
  { "value": "Cravings" }
]
```

- `value` (string, required): symptom name
- `level` (string, optional): severity — only "Mild" documented, likely also "Moderate"/"Severe"
- Flat array, no categorization in the API
- API is read-only; no schema enumerating valid values

**Confirmed symptom values from API examples:** Headache, Nausea, Cravings, Cramps, Gas

**Likely additional symptoms** (from app content, not API-confirmed): hot flashes, night sweats, bloating, breast tenderness, back pain, acne, migraines, mood swings, anxiety, depression, joint pain, brain fog, sleep disturbances, vaginal dryness

**Separate Mira daily log fields** (not in `symptoms` array):
- `mood` — e.g. "Excited", "Exhausted"
- `skin` — e.g. "Dry", "Glowing"
- `sex_drive` — e.g. "High"
- `cervical_mucous` — object with `description` and `volume`
- `cervical_position` — object with `height`, `openness`, `texture`

---

## Cross-system Category Alignment

| HDS Category | Apple HealthKit | SNOMED CT Parent | Mira | Ovia |
|---|---|---|---|---|
| Gastrointestinal | 7 symptoms (Severity) | Digestive system (53619000) | Nausea, Gas, Cramps, Cravings | Nausea, bloating, cramps, diarrhea, constipation |
| Pain | 4 symptoms (Severity) | Finding site-based | Headache, Cramps | Headaches, migraines, cramps, backache, breast tenderness |
| Neurological | 4 symptoms (Severity) | Nervous system (118940003) | Headache, Migraines | Dizziness |
| Constitutional | 4 symptoms (Severity) | General symptom (162408000) | — | Fatigue |
| Skin & Hair | 3 symptoms (Severity) | Finding site-based | `skin` field (separate) | Acne |
| Respiratory | 6 symptoms (Severity) | Respiratory system (50043002) | — | — |
| Cardiovascular | 2 symptoms (Severity) | — | — | — |
| Hormonal/Menopause | 3 symptoms (Severity) | — | Hot flashes, night sweats | Hot flashes, night sweats, vaginal dryness |
| Behavioral/Mood | 3 symptoms (Presence/special) | — | `mood`, `sex_drive` fields | Mood (10+ options), sleep, appetite |
| Urological | 1 symptom (Severity) | — | — | — |
| Sensory | 2 symptoms (Severity) | — | — | — |

---

## Design Considerations

### Event type options for symptoms

| Approach | Pros | Cons |
|----------|------|------|
| `activity/plain` (presence + duration) | Simple, matches Ovia/most apps. Duration captures "how long". | No severity. |
| `ratio/proportion` (0-1 scale) | Captures severity. Maps to Apple HealthKit Mild/Moderate/Severe. | More complex. Not all sources provide severity. |
| Both: `activity/plain` as base, extend to `ratio/proportion` later | Start simple, add severity when needed per symptom. | Item version management. |

### Severity mapping (if ratio/proportion is used)

| Apple HealthKit | Ratio value | Label |
|---|---|---|
| NotPresent (1) | 0.0 | None |
| Mild (2) | 0.33 | Mild |
| Moderate (3) | 0.66 | Moderate |
| Severe (4) | 1.0 | Severe |

Mira's `level` field ("Mild", etc.) maps to the same scale.

### Naming conventions

Symptoms use long descriptive IDs for clarity:
- `symptom-gastrointestinal-nausea` (verbose, self-documenting)
- `sym-gi-nausea` (compact, needs legend)
- Decision: TBD based on existing HDS naming conventions
