---
name: schema-explainer
description: Analyzes new datasets and maps columns to our schema.json indicators. Use when onboarding a new data source or when a source updates its column names.
---

# Schema Explainer

## Trigger

/explain-schema

## What This Does

Takes raw CSV column names or first 20 rows, maps them to data/schema.json indicators, flags unmapped columns, detects unit mismatches, and reports missing coverage.

## Input

User pastes: CSV header row, OR first 20 rows, OR column name list

## Process

1. Read data/schema.json to load all 23 indicator definitions
2. For each input column:
   a. Fuzzy-match column name to schema indicator labels
   b. Check value range to infer unit (e.g., 0.1-50 → tCO2eq/capita likely)
   c. If matched: confirm unit compatibility
   d. If not matched: flag as "not in schema — review for addition"
3. Check coverage: which schema indicators have NO matching column
4. Detect missingness pattern: which countries/years have gaps

## Output Format

### Column Mapping

| # | Source Column | Matched Indicator | Schema Code | Unit Match | Missing % | Notes |
|---|---|---|---|---|---|---|
| 1 | {col} | {indicator or "NO MATCH"} | {code} | ✅/⚠️ | {%} | {notes} |

### Coverage Gap

Schema indicators with no matching source column:
- {indicator_1}: Consider source {X}
- {indicator_2}: Not available in this dataset

### Recommended Actions

1. {action 1}
2. {action 2}

## Rules

- Always read data/schema.json first — never guess indicator definitions
- Unit mismatch = ⚠️, not auto-convert. Report and let user decide.
- Never add columns to schema without explicit approval
