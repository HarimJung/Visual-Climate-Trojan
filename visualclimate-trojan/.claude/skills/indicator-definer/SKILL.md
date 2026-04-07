---
name: indicator-definer
description: Defines climate/ESG indicators using IPCC/UNFCCC/GHG Protocol official definitions. Produces term cards + comparison table + usage checklist.
---

# Indicator Definer

## Trigger

/define {term group}

## What This Does

Takes a group of related or confused terms (e.g., "GHG Intensity vs Carbon Intensity vs Emission Factor") and produces precise definitions, comparisons, and usage checklist.

## Input

Term group as quoted string.

## Process

1. For each term:
   a. Official definition (IPCC/UNFCCC/GHG Protocol source)
   b. One-line plain English explanation
   c. Unit
   d. Use context (when/where this term appears)
   e. Common confusion point
   f. Real numeric example with source+year
2. Comparison table across all terms
3. Usage checklist: what to verify when using these terms in a report

## Output Format

### Term Card: {Term 1}

| Field | Detail |
|-------|--------|
| Official Name | {name} |
| Definition | {IPCC/UNFCCC definition} |
| Source | {reference} |
| Unit | {unit} |
| Use Context | {context} |
| ⚠️ Confusion | {what people mix up} |
| Example | {country}: {value} {unit} ({source}, {year}) |

### Comparison Table

| Term | Definition (short) | Unit | Typical Use | Watch Out |
|------|-------------------|------|-------------|-----------|

### Usage Checklist

When writing a report with these terms:
- [ ] GWP basis stated (AR4/AR5/AR6)
- [ ] Scope boundary clear (Scope 1/2/3, national/territorial)
- [ ] Base year explicitly mentioned
- [ ] LULUCF inclusion/exclusion stated
- [ ] Source + vintage year cited for every number

## Rules

- All definitions must cite IPCC/UNFCCC/GHG Protocol — no Wikipedia-level definitions
- Examples must use real numbers from data/ or Supabase — never fabricate
- If a term has different meanings in different frameworks, list ALL meanings
