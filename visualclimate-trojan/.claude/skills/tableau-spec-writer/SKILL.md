---
name: tableau-spec-writer
description: Generates implementation-grade Tableau dashboard specifications. Output is a build document that Harim can follow step-by-step in Tableau Desktop — no guessing, no pseudo-code, exact Tableau syntax only.
---

# Tableau Spec Writer

## Role in Pipeline

This skill is called AUTOMATICALLY as Stage 4 of every report pipeline. It transforms a QA-passed report into a complete Tableau implementation document.

## Fixed Dashboard Type Mapping

| Report Type | Dashboard Type | Blueprint Reference |
|---|---|---|
| country-brief | country-overview | dashboard-blueprints.md → Country Overview Blueprint |
| comparison-brief | country-comparison | dashboard-blueprints.md → Country Comparison Blueprint |
| ndc-gap-brief | ndc-gap-tracker | dashboard-blueprints.md → NDC Gap Tracker Blueprint |

## Input

- A QA-passed report file
- The dashboard type (determined by report type — see mapping above)

## Required Reading Before Generation

1. `data/tableau/tableau-setup.md` — CSV structure, data types, Tableau connection info
2. `data/tableau/calculated-fields.md` — existing 10 calculated fields (CF01–CF10) with exact Tableau formulas
3. `brand-config.md` — colors (#0066FF primary, #00A67E changer, #F59E0B starter, #E5484D talker, #7F1D1D critical)
4. `templates/tableau-dashboard-spec.md` — output template (13-section structure)
5. `.claude/skills/tableau-spec-writer/references/dashboard-blueprints.md` — reusable blueprint for the specific dashboard type
6. `data/schema.json` — indicator definitions and Tableau field mappings

## Generation Process

### Step 1: Identify Report Content to Visualize

Read the source report and extract:
- All numerical KPIs → candidates for KPI cards
- Time series data → candidates for line charts
- Peer/country comparisons → candidates for bar charts or dot plots
- Policy/status values → candidates for status panels
- Source discrepancies or warnings → candidates for warning panels
- Gap values (NDC gap reports) → candidates for gap area charts

### Step 2: Map to Blueprint Sheets

Using the relevant blueprint from `dashboard-blueprints.md`, map each report element to a specific sheet. Every sheet in the blueprint MUST appear in the spec.

### Step 3: Write Exact Tableau Specifications

For every field, formula, and sheet instruction, use **exact Tableau Desktop syntax**:

**Calculated fields** — use Tableau formula language:
```
// CORRECT
IF [ghg_10yr_trend] < 0 THEN "Declining"
ELSEIF [ghg_10yr_trend] < 5 THEN "Stagnant"
ELSE "Rising"
END

// WRONG — pseudo-code
if trend < 0: return "Declining"
```

**LOD expressions** — use Tableau FIXED/INCLUDE/EXCLUDE syntax:
```
// CORRECT
{ FIXED [income_group], [region] : MEDIAN([ghg_per_capita]) }

// WRONG — description
"Calculate median per capita for the peer group"
```

**Reference lines** — specify exact configuration:
```
// CORRECT
Reference Line on [value] axis:
  Scope: Per Cell
  Value: Constant = {target_value}
  Line: Dashed, Color #E5484D, Width 2
  Label: "NDC 2030 Target: {value} MtCO2eq"

// WRONG
"Add a reference line for the NDC target"
```

**Filters** — specify exact type and behavior:
```
// CORRECT
Filter: [ISO3]
  Type: Single Value (dropdown)
  Default: "KOR"
  Apply to: All Using This Data Source

// WRONG
"Add a country filter"
```

### Step 4: Ensure Reusability

- ALL country references must use parameters or filters, NEVER hardcoded ISO3 values
- The spec must work for ANY country or country set by changing only the filter/parameter value
- Document what stays fixed vs what changes per country in Section 12 (Reusability Notes)

### Step 5: Fill the Template

Use `templates/tableau-dashboard-spec.md` structure — all 13 sections must be present and filled.

---

## Mandatory Spec Sections (All 13 Required)

### 1. Dashboard Purpose
What the dashboard allows a user to understand. One paragraph.

### 2. Source Report
- Report path
- Report type (country-brief / comparison-brief / ndc-gap-brief)
- Primary grain (country-level / country-year / country-indicator-year)

### 3. Data Sources
Table with: Source Name, File Path, Grain, Notes

### 4. Relationships / Joins
Table with: Left Source, Right Source, Key, Relationship Type, Notes

### 5. Required Dimensions and Measures
Explicit lists — every field used in any sheet must appear here.

### 6. Calculated Fields
Table with: Name, **exact Tableau formula**, Return Type, Purpose.
Reference existing CF01–CF10 from `calculated-fields.md`. Only add NEW calculated fields if the blueprint requires them.

### 7. LOD Expressions
Table with: Name, **exact Tableau LOD formula**, Purpose.

### 8. Sheet Inventory
Table with: Sheet Name, Purpose, Data Source — one row per sheet.

### 9. Detailed Sheet Instructions
For EACH sheet listed in Section 8, provide ALL of the following:

- **Goal**: What this sheet shows
- **Mark type**: Bar / Line / Circle / Text / Square / Map / etc.
- **Rows**: Exact pill placement (e.g., `SUM([total_ghg])`)
- **Columns**: Exact pill placement
- **Filters**: Exact filter configuration
- **Parameters**: Which parameters affect this sheet
- **Color**: Exact field and color mapping (use brand-config hex codes)
- **Size**: Fixed or mapped to field
- **Label**: Exact label configuration (field, format, alignment)
- **Tooltip**: Exact tooltip text with field references — e.g., `"<ISO3>: <SUM(total_ghg)> MtCO2eq (<source_primary>, <data_year>)"`
- **Sort**: Exact sort field and direction
- **Reference line / band**: Exact configuration if applicable
- **Null-handling**: How to handle NULL/missing values (hide, show as zero, show as gray)
- **Notes**: Additional build instructions

### 10. Dashboard Assembly
- Exact dashboard size (width × height in pixels)
- Layout containers: horizontal/vertical, nesting order
- User reading order (left-to-right, top-to-bottom)
- Which sheets are tiled vs floating
- Warning panel behavior (when to show/hide)

### 11. Filters, Parameters, and Actions
- **Global filters**: field, type, default, scope
- **Parameters**: name, data type, allowable values, default
- **Filter actions**: source sheet, target sheet, behavior (select/hover), clearing behavior
- **Highlight actions**: if any
- **URL actions**: if any

### 12. Reusability Notes
- What must remain fixed (layout, calculated fields, sheet structure)
- What changes per country/country-set (filter default, parameter default)
- How to add a new country: step-by-step
- How to refresh data: step-by-step

### 13. Build Checklist
Exact checklist items — the implementer checks each box as they build.

---

## Quality Rules for Generated Specs

1. **No pseudo-code** — every formula must be valid Tableau syntax
2. **No vague instructions** — "add a chart" is not acceptable; specify mark type, rows, columns, filters
3. **Colors must match brand-config.md** — use exact hex codes
4. **Every tooltip must include (Source, Year)** for data credibility
5. **Dashboard size must be exact** (pixels, not "roughly")
6. **Reference existing calculated fields** (CF01–CF10) — don't reinvent
7. **LOD expressions must use Tableau FIXED/INCLUDE/EXCLUDE syntax**
8. **Country switching must work via parameter or filter** — never hardcode ISO3
9. **Null handling must be explicit** for every sheet
10. **Warning/discrepancy panels must have conditional visibility logic**

## Save Location

`output/{name}-{dashboard-type}-tableau-spec-{YYYY-MM-DD}.md`

Examples:
- `output/KOR-country-overview-tableau-spec-2026-04-07.md`
- `output/compare-KOR-JPN-DEU-country-comparison-tableau-spec-2026-04-07.md`
- `output/KOR-ndc-gap-tracker-tableau-spec-2026-04-07.md`
