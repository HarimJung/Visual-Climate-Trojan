---
name: comparison-brief
description: Full pipeline executor — generates a Country Comparison Brief for 2-5 countries, runs QA with auto-fix, then produces a country-comparison Tableau spec. Never stops after just the report.
---

# Comparison Brief Pipeline

## Trigger

User requests a comparison brief for 2–5 ISO3 codes.

## THIS IS A PIPELINE, NOT JUST A REPORT GENERATOR

This skill executes 4 stages automatically. Do NOT stop after generating the report.

```
Stage 1: Data Load + Report Generation
Stage 2: QA Validation
Stage 3: Auto-Fix (if QA FAIL) + QA Retry (max 1)
Stage 4: Tableau Spec Generation (country-comparison)
```

---

## Stage 1: Data Load + Report Generation

### 1.1 Data Loading

For EACH ISO3 code, load data using the same sequence as country-brief:
1. Read `data/schema.json` — indicator definitions
2. Query Supabase: latest values for each ISO3
3. Read `data/ndc-targets-v2.json` — NDC targets for each country
4. Read `data/source-registry.json` — source citations

### 1.2 Data Processing

1. Auto-detect comparison type:
   - All same region → "Regional Comparison"
   - All same income_group → "Peer Comparison"
   - Mixed → "Cross-Category Comparison"
2. Build comparison table: 8 core indicators × N countries
   - `total_ghg`, `ghg_per_capita`, `ghg_intensity`, `re_share_elec`
   - `ndc30_submitted`, `nz_year`, `ndgain_rank`, `ghg_10yr_trend`
3. If ANY country has [DATA MISSING] for an indicator → exclude that indicator from comparison rankings (still show it in table with [DATA MISSING])
4. Normalize each indicator to z-scores for spread analysis
5. Find top 3 largest differences (highest z-score spread across countries)
6. Find common challenges: indicators where ALL countries are worse than global median
7. All values: same source + same year + same GWP (AR5)
8. Cross-check any indicator where sources differ > 10% → ⚠️ footnote

### 1.3 Report Writing

1. Read `templates/comparison-brief.md`
2. Fill all sections:
   - Comparison type header
   - Comparison table (8 indicators × N countries)
   - Top 3 differences with analysis
   - Common challenges
   - Implications paragraph (100 words max)
3. Every number: (Source, Year) citation

### 1.4 Save Report

- Path: `output/compare-{ISO3s joined by -}-{YYYY-MM-DD}.md`
  - Example: `output/compare-KOR-JPN-DEU-2026-04-07.md`

---

## Stage 2: QA Validation

Immediately after saving the report, run QA.

1. Follow `.claude/skills/qa-checker/SKILL.md`
2. Validate the report file from Stage 1
3. Save: `output/compare-{ISO3s}-QA-{YYYY-MM-DD}.md`
4. Read verdict:
   - **PASS** or **PASS WITH WARNINGS** → Stage 4
   - **FAIL** → Stage 3

---

## Stage 3: Auto-Fix + QA Retry

Only if Stage 2 verdict is FAIL.

1. Read `## Required Fixes` from QA report
2. Apply each fix to the report
3. Overwrite report file
4. Re-run QA → overwrite QA file
5. If still FAIL → add `## Unresolved Blockers` → STOP pipeline

---

## Stage 4: Tableau Spec Generation

Only after QA PASS or PASS WITH WARNINGS.

1. Read `.claude/skills/tableau-spec-writer/SKILL.md`
2. Read `.claude/skills/tableau-spec-writer/references/dashboard-blueprints.md` → **Country Comparison Blueprint**
3. Read `templates/tableau-dashboard-spec.md`
4. Read `data/tableau/calculated-fields.md`
5. Read `brand-config.md`
6. Generate country-comparison Tableau spec:
   - Comparison KPI matrix → highlight table
   - Per-capita ranking → bar comparison
   - Trend comparison → multi-line chart
   - Policy comparison → status panel
   - Divergence highlight → annotated chart
7. Country inclusion via parameter/filter logic — NOT hardcoded
8. Save: `output/compare-{ISO3s}-country-comparison-tableau-spec-{YYYY-MM-DD}.md`

---

## Pipeline Complete

```
Pipeline complete. 3 files generated:
1. Report:      output/compare-{ISO3s}-{YYYY-MM-DD}.md
2. QA:          output/compare-{ISO3s}-QA-{YYYY-MM-DD}.md
3. Tableau spec: output/compare-{ISO3s}-country-comparison-tableau-spec-{YYYY-MM-DD}.md
```

## Rules

- Minimum 2, maximum 5 countries
- If any country has [DATA MISSING] for an indicator, exclude from comparison ranking
- All values: same source + same year + same GWP (AR5)
- Tableau spec must support country switching via parameters — not hardcoded to specific ISO3s
