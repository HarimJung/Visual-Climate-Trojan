---
name: data-quality-checker
description: Diagnoses data quality issues using IPCC TCCCA principles (Transparency, Completeness, Consistency, Comparability, Accuracy). Produces issue table + fix recommendations.
---

# Data Quality Checker

## Trigger

/check-quality

## What This Does

Receives raw data (CSV paste or file reference) and checks for 7 categories of issues using IPCC quality principles.

## Input

User pastes data or references a file path.

## Process

1. Unit consistency: same column mixing kt/Mt/Gg?
2. GWP consistency: AR4/AR5/AR6 values mixed?
3. Missing data: by country (rows) and by year (columns)
4. Time series continuity: year-over-year change > ±30% → anomaly
5. Sector classification: IPCC 1996 vs 2006 categories mixed?
6. LULUCF mixed: some rows include, some exclude?
7. Double counting: international bunkers, indirect CO2?

## Output Format

### Issue Table

| # | Issue Type | Location | Severity | TCCCA Principle | Fix |
|---|---|---|---|---|---|
| 1 | {type} | {col/row} | 🔴/🟡/🟢 | {principle} | {fix} |

### Summary

- **Overall Verdict**: {PASS / WARNING / FAIL}
- **Usable rows**: {X} of {Y} ({%})
- **Usable countries**: {X} of {Y}
- **Recommended next step**: {action}

## Severity Scale

- 🔴 Critical: Makes data unusable for comparison (mixed LULUCF, wrong GWP)
- 🟡 Warning: Reducible with documented assumptions (missing years, unit conversion)
- 🟢 Note: Best practice improvement (rounding, label standardization)

## Rules

- Never auto-fix data — only diagnose and recommend
- Reference IPCC TCCCA explicitly for each issue
- If data has < 70% completeness for a country, recommend excluding it
