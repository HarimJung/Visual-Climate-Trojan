---
name: ndc-gap-brief
description: Full pipeline executor — generates an NDC Gap Brief, runs QA with auto-fix, then produces an ndc-gap-tracker Tableau spec. Never stops after just the report.
---

# NDC Gap Brief Pipeline

## Trigger

User requests an NDC gap analysis for a single ISO3 code.

## THIS IS A PIPELINE, NOT JUST A REPORT GENERATOR

This skill executes 4 stages automatically. Do NOT stop after generating the report.

```
Stage 1: Data Load + Report Generation
Stage 2: QA Validation
Stage 3: Auto-Fix (if QA FAIL) + QA Retry (max 1)
Stage 4: Tableau Spec Generation (ndc-gap-tracker)
```

---

## Stage 1: Data Load + Report Generation

### 1.1 Data Loading

1. Read `data/ndc-targets-v2.json` → NDC 2030/2035 targets for this country
2. Query Supabase → historical emissions timeseries (`WB.EN.ATM.GHGT.KT.CE`, convert kt → Mt ÷ 1000)
3. If exists: `public/data/ndc-gap/{ISO3}.json` → existing gap analysis
4. Read `data/schema.json` → unit/conversion rules
5. Read `data/source-registry.json` → source citations

### 1.2 Data Processing

1. **Load NDC target**:
   - Determine target type: absolute / intensity / BAU%
   - Get reference year, reference emissions, target emissions
   - Distinguish conditional vs unconditional
   - Use LOWER bound of NDC ranges (conservative)

2. **Load emission timeseries** (minimum 5 recent years)
   - If < 5 years available → mark analysis as "LOW CONFIDENCE"

3. **Calculate 5-year linear trend** (least squares regression)

4. **Project to 2030 and 2035**

5. **Calculate gap**:
   - Absolute targets: `gap = projected - target`
   - Intensity targets: convert using GDP projection (or note [GDP PROJECTION NEEDED])
   - BAU targets: note that BAU baseline uncertainty makes gap approximate

6. **Assign gap severity**:
   - On Track: projected ≤ target
   - Narrow Gap (<10%): `gap / target < 0.1` — policy acceleration can close
   - Significant Gap (10–30%): `gap / target` between 0.1 and 0.3 — major policy shift needed
   - Critical Gap (>30%): `gap / target > 0.3` — structural transformation needed

7. **Calculate required annual reduction rate**: `(current - target) / years_remaining`

8. **Identify 3 risks/watchpoints**

### 1.3 Report Writing

1. Read `templates/ndc-gap-brief.md`
2. Fill all sections:
   - NDC targets (2030 + 2035, conditional/unconditional)
   - Actual trajectory (timeseries + trend)
   - Gap analysis (gap value, severity, required reduction)
   - Risks & watchpoints
3. Every number: (Source, Year)
4. For intensity/BAU targets: clearly state assumption limitations

### 1.4 Save Report

- Path: `output/{ISO3}-ndc-gap-{YYYY-MM-DD}.md`

---

## Stage 2: QA Validation

Immediately after saving the report, run QA.

1. Follow `.claude/skills/qa-checker/SKILL.md`
2. Validate the report
3. Save: `output/{ISO3}-ndc-gap-QA-{YYYY-MM-DD}.md`
4. Read verdict:
   - **PASS** or **PASS WITH WARNINGS** → Stage 4
   - **FAIL** → Stage 3

---

## Stage 3: Auto-Fix + QA Retry

Only if Stage 2 verdict is FAIL.

1. Read `## Required Fixes` from QA report
2. Apply each fix
3. Overwrite report
4. Re-run QA → overwrite QA file
5. If still FAIL → add `## Unresolved Blockers` → STOP pipeline

---

## Stage 4: Tableau Spec Generation

Only after QA PASS or PASS WITH WARNINGS.

1. Read `.claude/skills/tableau-spec-writer/SKILL.md`
2. Read `.claude/skills/tableau-spec-writer/references/dashboard-blueprints.md` → **NDC Gap Tracker Blueprint**
3. Read `templates/tableau-dashboard-spec.md`
4. Read `data/tableau/calculated-fields.md`
5. Read `brand-config.md`
6. Generate ndc-gap-tracker Tableau spec:
   - Actual emissions trend → line chart (solid)
   - Projected pathway → line chart (dashed)
   - Target line → reference line
   - Gap area → reference band between projected and target
   - Gap severity → KPI card with severity color
   - Required annual reduction → KPI card
   - Risk/warning panel → text sheet
7. Country switching via parameter — NOT hardcoded
8. Save: `output/{ISO3}-ndc-gap-tracker-tableau-spec-{YYYY-MM-DD}.md`

---

## Pipeline Complete

```
Pipeline complete. 3 files generated:
1. Report:      output/{ISO3}-ndc-gap-{YYYY-MM-DD}.md
2. QA:          output/{ISO3}-ndc-gap-QA-{YYYY-MM-DD}.md
3. Tableau spec: output/{ISO3}-ndc-gap-tracker-tableau-spec-{YYYY-MM-DD}.md
```

## Rules

- For intensity/BAU targets, clearly state assumption limitations
- Use LOWER bound of NDC ranges (conservative)
- If < 5 years of emission data → mark as "LOW CONFIDENCE"
- Always include both 2030 and 2035 analysis (2035 may be [NDC 3.0 NOT SUBMITTED])
- Tableau spec must support country switching via parameters
