---
name: country-brief
description: Full pipeline executor — generates a Country Climate Brief, runs QA with auto-fix, then produces a country-overview Tableau spec. Never stops after just the report.
---

# Country Brief Pipeline

## Trigger

User requests a country brief for any ISO3 code.

## THIS IS A PIPELINE, NOT JUST A REPORT GENERATOR

This skill executes 4 stages automatically. Do NOT stop after generating the report.

```
Stage 1: Data Load + Report Generation
Stage 2: QA Validation
Stage 3: Auto-Fix (if QA FAIL) + QA Retry (max 1)
Stage 4: Tableau Spec Generation (country-overview)
```

---

## Stage 1: Data Load + Report Generation

### 1.1 Data Loading Sequence

1. Read `data/schema.json` — know all 23 indicators and their units/sources/conversions
2. Query Supabase: latest values for this ISO3 (using `supabase_code` mappings from schema.json)
3. Read `data/ndc-targets-v2.json` — NDC 2030 + 2035 + net zero targets
4. Read `data/source-registry.json` — for accurate source citations
5. If country exists in supplementary files:
   - `public/data/kaya/{ISO3}.json` — Kaya decomposition
   - `public/data/ndc-gap/{ISO3}.json` — NDC gap analysis
   - `data/climate-trace-ghg.json` — sector breakdown
   - `data/ndgain-scores.json` — vulnerability scores

### 1.2 Data Processing

1. Verify each indicator: has source? has year? Missing → [DATA MISSING]
2. Unit conversions per schema.json:
   - WB GHG: kt → Mt (÷ 1000)
   - Per capita: `total_ghg * 1e6 / population` → tCO2eq/capita
   - Intensity: `total_ghg * 1e9 / gdp_ppp` → kgCO2eq/USD PPP
   - 10yr trend: `((latest / 10yr_prior) - 1) × 100` → %
3. Cross-check: if EDGAR and Climate TRACE differ > 10% → add ⚠️ footnote with both values
4. Identify peer group:
   - Same `income_group` + same `region` from Supabase `countries` table
   - Top 3 peers by population (excluding this country)
   - Retrieve their indicator values for comparison
5. Auto-derive strengths (better than peer median) and watchpoints (worse than peer median)

### 1.3 Report Writing

1. Read `templates/country-brief.md`
2. Write Executive Summary: 4 sentences, 80 words max
3. Fill all template sections with data
4. Every number gets `(Source, Year)` citation
5. All comparisons: same source, same GWP (AR5), same year

### 1.4 Save Report

- Path: `output/{ISO3}-country-brief-{YYYY-MM-DD}.md`
- Update `data/tableau/countries_latest.csv` with this country's latest row

---

## Stage 2: QA Validation

Immediately after saving the report, run QA. Do NOT wait for user input.

1. Read `.claude/skills/qa-checker/SKILL.md` for validation rules
2. Validate the report file from Stage 1
3. Save QA result: `output/{ISO3}-country-brief-QA-{YYYY-MM-DD}.md`
4. Read the `## Verdict` line:
   - **PASS** → go to Stage 4
   - **PASS WITH WARNINGS** → go to Stage 4
   - **FAIL** → go to Stage 3

---

## Stage 3: Auto-Fix + QA Retry

Only executed if Stage 2 verdict is FAIL.

1. Read `## Required Fixes` section from QA report
2. Apply each fix to the report file:
   - Wrong number → replace with source-verified value
   - Missing citation → add (Source, Year)
   - Unit mismatch → convert per schema.json
   - GWP inconsistency → convert to AR5
   - LULUCF mixing → separate or label
   - Missing data → mark [DATA MISSING]
3. Save corrected report (overwrite same path)
4. Re-run QA validation → overwrite QA file
5. Check verdict again:
   - **PASS** or **PASS WITH WARNINGS** → go to Stage 4
   - **FAIL** → add `## Unresolved Blockers` section to QA report listing remaining issues → STOP pipeline (do NOT generate Tableau spec)

---

## Stage 4: Tableau Spec Generation

Only executed after QA PASS or PASS WITH WARNINGS.

1. Read `.claude/skills/tableau-spec-writer/SKILL.md`
2. Read `.claude/skills/tableau-spec-writer/references/dashboard-blueprints.md` → **Country Overview Blueprint**
3. Read `templates/tableau-dashboard-spec.md` for output structure
4. Read `data/tableau/calculated-fields.md` for existing calculated fields
5. Read `brand-config.md` for colors/fonts
6. Generate a complete country-overview Tableau spec using the report's data and analysis
7. Transform key report findings into Tableau objects:
   - Total GHG → KPI card
   - 10-year trend → line chart
   - Peer comparison → comparison bar
   - Policy status → status panel
   - Source discrepancy → warning panel
8. Save: `output/{ISO3}-country-overview-tableau-spec-{YYYY-MM-DD}.md`

---

## Pipeline Complete

After Stage 4, confirm to the user:

```
Pipeline complete. 3 files generated:
1. Report:      output/{ISO3}-country-brief-{YYYY-MM-DD}.md
2. QA:          output/{ISO3}-country-brief-QA-{YYYY-MM-DD}.md
3. Tableau spec: output/{ISO3}-country-overview-tableau-spec-{YYYY-MM-DD}.md
```

## Rules

- NO invented numbers. Missing data → [DATA MISSING]
- Cross-check: EDGAR vs Climate TRACE > 10% → ⚠️ + footnote
- All comparisons: same source, same GWP, same year
- Peer comparison: use Supabase income_group + region
- Update Tableau CSV after every brief generation
