---
name: qa-checker
description: Machine-readable quality assurance for generated reports. Produces a structured verdict (PASS/PASS WITH WARNINGS/FAIL) with concrete Required Fixes that the auto-fix stage can consume directly.
---

# QA Checker

## Role in Pipeline

This skill is called AUTOMATICALLY after every report generation. It is NOT a standalone tool — it is Stage 2 of every pipeline. Its output must be machine-readable so that Stage 3 (auto-fix) can parse and execute the Required Fixes.

## Input

A report file path (e.g., `output/KOR-country-brief-2026-04-07.md`)

## Validation Checks (7 mandatory)

### Check 1: Source Citation Completeness

- Scan every numerical value in the report
- Each number MUST have `(Source, Year)` within the same sentence or table cell
- Count: total numbers, cited numbers, uncited numbers
- Status: ✅ if all cited, ⚠️ if 1–3 uncited, 🔴 if >3 uncited

### Check 2: Factual Cross-Check

- For each key claim (total GHG, per capita, RE share, NDC target, etc.):
  - Look up the reference value from: Supabase, `data/ndc-targets-v2.json`, `data/*.json`
  - Compare stated value vs reference value
  - Tolerance: ≤5% difference = ✅, >5% = ⚠️, >20% or completely wrong = 🔴
- Report each checked fact: indicator name, stated value, reference value, difference %

### Check 3: Unit Consistency

- Same indicator MUST use same unit throughout the report
- Verify against `data/schema.json` unit definitions
- MtCO2eq vs ktCO2eq mixing = 🔴
- tCO2eq/capita vs MtCO2eq/capita mixing = 🔴

### Check 4: GWP Consistency

- ALL GHG values must be AR5 basis
- Any AR4 or AR6 reference without conversion note = 🔴
- Check for mixed GWP basis in same table = 🔴

### Check 5: Temporal Alignment

- Values being compared must be from the same year
- Year difference > 2 between compared values = ⚠️
- Year difference > 5 = 🔴

### Check 6: LULUCF Consistency

- No mixing "incl. LULUCF" and "excl. LULUCF" in the same table
- If any value includes LULUCF, it must be labeled "(incl. LULUCF)"
- Mixing without label = 🔴

### Check 7: Completeness

- Count [DATA MISSING] tags — acceptable but must be counted
- Check all required template sections are present
- Missing required section = 🔴

---

## Output Format

The QA report MUST follow this exact structure. Do not deviate.

```markdown
# QA Report: {filename}

**Report path**: {full path}
**QA date**: {YYYY-MM-DD}
**Report type**: {country-brief | comparison-brief | ndc-gap-brief}

## Check Results

| # | Check | Status | Detail |
|---|-------|--------|--------|
| 1 | Source Citations | {✅/⚠️/🔴} | {X} numbers total, {Y} cited, {Z} uncited |
| 2 | Factual Accuracy | {✅/⚠️/🔴} | {summary of cross-check results} |
| 3 | Unit Consistency | {✅/⚠️/🔴} | {detail} |
| 4 | GWP Consistency | {✅/⚠️/🔴} | {detail} |
| 5 | Temporal Alignment | {✅/⚠️/🔴} | Max year gap: {N} |
| 6 | LULUCF Consistency | {✅/🔴} | {detail} |
| 7 | Completeness | {✅/⚠️/🔴} | {N} [DATA MISSING] tags, {M} missing sections |

## Factual Cross-Check Detail

| Indicator | Stated Value | Reference Value | Source | Diff % | Status |
|-----------|-------------|-----------------|--------|--------|--------|
| {indicator} | {stated} | {reference} | {source} | {diff}% | {✅/⚠️/🔴} |

## Verdict

**{PASS / PASS WITH WARNINGS / FAIL}**

## Required Fixes

{Only present if verdict is FAIL or PASS WITH WARNINGS}

Each fix below is a specific, executable instruction. The auto-fix stage will apply these in order.

### Fix {N}: {Category}
- **Location**: {section name or line reference in the report}
- **Current value**: {what the report currently says}
- **Correct value**: {what it should say, with source}
- **Action**: {REPLACE / ADD_CITATION / CONVERT_UNIT / ADD_LABEL / MARK_MISSING}

{Repeat for each required fix}
```

---

## Verdict Rules

### PASS
- All 7 checks are ✅
- Zero 🔴, zero ⚠️

### PASS WITH WARNINGS
- Zero 🔴
- One or more ⚠️
- Required Fixes section lists the warnings but pipeline continues

### FAIL
- One or more 🔴
- Required Fixes section lists all 🔴 items as executable fixes
- Pipeline proceeds to auto-fix (Stage 3)

---

## Auto-Fix Compatibility Rules

The Required Fixes section MUST be specific enough that the auto-fix stage can apply them without human judgment:

1. **REPLACE**: Give exact current text and exact replacement text
2. **ADD_CITATION**: Specify which number and what citation to add — e.g., "Add `(EDGAR 2024)` after `695.3 MtCO2eq`"
3. **CONVERT_UNIT**: Specify the formula — e.g., "Convert 695,300 ktCO2eq to 695.3 MtCO2eq (÷1000)"
4. **ADD_LABEL**: Specify exact label — e.g., "Add `(excl. LULUCF)` after the GHG total"
5. **MARK_MISSING**: Specify what to mark — e.g., "Replace `approximately 45%` with `[DATA MISSING]`"

Do NOT write vague fixes like:
- ❌ "Check the source for this number"
- ❌ "Verify this claim"
- ❌ "Consider updating the citation"

DO write concrete fixes like:
- ✅ "Fix 1: REPLACE — Section 'Key Metrics' — Current: '712.3 MtCO2eq' — Correct: '695.3 MtCO2eq (EDGAR 2024)' — The Supabase value for WB.EN.ATM.GHGT.KT.CE for KOR is 695,300 kt = 695.3 Mt"

---

## Save Location

`output/{report-name}-QA-{YYYY-MM-DD}.md`

Replace `{report-name}` with the base name of the report being checked:
- `KOR-country-brief` → `KOR-country-brief-QA-2026-04-07.md`
- `compare-KOR-JPN-DEU` → `compare-KOR-JPN-DEU-QA-2026-04-07.md`
- `KOR-ndc-gap` → `KOR-ndc-gap-QA-2026-04-07.md`
