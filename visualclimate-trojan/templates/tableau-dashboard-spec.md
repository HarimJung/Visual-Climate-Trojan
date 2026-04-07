# Tableau Dashboard Spec: {DASHBOARD_NAME}

**Generated**: {YYYY-MM-DD}
**For**: Harim (Tableau Desktop)
**Dashboard type**: {country-overview / country-comparison / ndc-gap-tracker}
**Source blueprint**: dashboard-blueprints.md → {Blueprint Name}

---

## 1. Dashboard Purpose

{One paragraph: what this dashboard allows a user to understand, compare, or monitor. Be specific — not "shows climate data" but "allows the user to assess a single country's GHG emissions profile, energy transition progress, policy alignment, and vulnerability relative to income-group/region peers."}

## 2. Source Report

- **Report path**: `output/{report-filename}.md`
- **Report type**: {country-brief / comparison-brief / ndc-gap-brief}
- **Primary grain**: {country-level / country-year / country-indicator-year}
- **Countries covered**: {ISO3 list}
- **Data vintage**: {latest year in the data}

## 3. Data Sources

| # | Source Name | File Path | Grain | Key Columns | Notes |
|---|------------|-----------|-------|-------------|-------|
| 1 | countries_latest | `data/tableau/countries_latest.csv` | 1 row per country | ISO3, country_name, 23 indicator fields | Snapshot of latest values |
| 2 | timeseries | `data/tableau/timeseries.csv` | 1 row per country-year-indicator | ISO3, country_name, year, indicator_code, value, unit, source | Long format for trend charts |
| {N} | {additional if needed} | {path} | {grain} | {keys} | {notes} |

## 4. Relationships / Joins

| Left Source | Right Source | Join Key | Relationship Type | Cardinality | Notes |
|------------|-------------|----------|-------------------|-------------|-------|
| countries_latest | timeseries | ISO3 = ISO3 | Left Outer | 1:Many | countries_latest is the primary; timeseries extends for trend sheets |
| {additional if needed} | | | | | |

## 5. Required Dimensions and Measures

### Dimensions
{List every dimension field used in any sheet. Include source table.}

- `[ISO3]` — countries_latest — country identifier, join key, filter
- `[country_name]` — countries_latest — display label
- `[region]` — countries_latest — peer group filter
- `[income_group]` — countries_latest — peer group filter
- `[year]` — timeseries — time axis
- `[indicator_code]` — timeseries — indicator filter
- `[source]` — timeseries — source label for tooltips
- {additional as needed}

### Measures
{List every measure field. Include source table and unit.}

- `[total_ghg]` — countries_latest — MtCO2eq
- `[ghg_per_capita]` — countries_latest — tCO2eq/capita (or calculated CF01)
- `[re_share_elec]` — countries_latest — %
- `[value]` — timeseries — varies by indicator_code
- {additional as needed}

## 6. Calculated Fields

Reference existing fields from `data/tableau/calculated-fields.md` first. Only define NEW calculated fields here.

| # | Name | Tableau Formula | Return Type | Purpose |
|---|------|-----------------|-------------|---------|
| CF01 | GHG Per Capita | `[total_ghg] * 1000000 / [population]` | Float | Per capita KPI (existing) |
| {N} | {New Field Name} | `{exact Tableau formula}` | {String/Float/Integer/Boolean} | {purpose} |

**Rule**: Every formula must be valid Tableau Desktop syntax. No pseudo-code.

## 7. LOD Expressions

| # | Name | Tableau Formula | Purpose |
|---|------|-----------------|---------|
| LOD01 | Peer Median GHG Per Capita | `{ FIXED [income_group], [region] : MEDIAN([CF01: GHG Per Capita]) }` | Peer comparison baseline (existing CF06) |
| {N} | {Name} | `{ FIXED/INCLUDE/EXCLUDE [...] : AGG([...]) }` | {purpose} |

## 8. Sheet Inventory

| # | Sheet Name | Purpose | Mark Type | Data Source |
|---|-----------|---------|-----------|-------------|
| {1} | {Sheet_Name} | {what it shows} | {Bar/Line/Text/Circle/Square} | {countries_latest / timeseries / blend} |
| {2} | {Sheet_Name} | {what it shows} | {mark type} | {data source} |
{Repeat for all sheets}

## 9. Detailed Sheet Instructions

{Repeat the block below for EVERY sheet in Section 8. Do NOT skip any sheet.}

### Sheet: {SHEET_NAME}

- **Goal**: {What this sheet communicates in one sentence}
- **Mark type**: {Bar / Line / Circle / Text / Square / Shape / Polygon / Map}
- **Rows**: {Exact pills — e.g., `SUM([total_ghg])`, `[country_name]`}
- **Columns**: {Exact pills — e.g., `YEAR([year])`, `[indicator_code]`}
- **Filters**:
  - `[ISO3]`: {Single Value Dropdown / Multiple Values / Wildcard} — Default: {value} — Scope: {All Using This Data Source / This Sheet Only}
  - {additional filters}
- **Parameters**:
  - `[p_Country]`: {String, list of ISO3 codes, default "KOR"} — used for {purpose}
  - {additional parameters}
- **Color**:
  - Field: {field name or "Fixed"}
  - Palette: {Custom — list exact hex codes}
  - Mapping: {value → color for each category, using brand-config.md hex codes}
- **Size**: {Fixed / Mapped to [field] — range min–max}
- **Label**:
  - Show: {Yes/No}
  - Field: {field and format — e.g., `SUM([total_ghg])` format `#,##0.0`}
  - Alignment: {center / left / right}
  - Font: {size, color}
- **Tooltip**:
  ```
  {Exact tooltip template with Tableau field references}
  Example:
  <country_name> (<ISO3>)
  Total GHG: <SUM(total_ghg)> MtCO2eq
  Source: <ATTR(source_primary)>, <ATTR(data_year)>
  ```
- **Sort**: {Field: [field], Direction: Ascending/Descending} or {Manual: [list order]}
- **Reference line / band**:
  - {Type: Line/Band}
  - {Scope: Per Cell / Per Pane / Entire Table}
  - {Value: Constant / Field — exact value or formula}
  - {Formatting: Color hex, Line style Solid/Dashed, Width}
  - {Label text}
- **Null-handling**: {Hide null rows/columns / Show as 0 / Show as gray / ZN() wrap — specify which}
- **Notes**: {Additional build instructions, edge cases, formatting details}

---

{Repeat the above block for each sheet}

---

## 10. Dashboard Assembly

- **Dashboard size**: {width} × {height} pixels (Fixed Size)
- **Device layout**: Desktop only / Desktop + Tablet
- **Layout structure**:
  ```
  {ASCII diagram of container nesting}
  Example:
  ┌─────────────────────────────────────┐
  │ Horizontal: Title Bar               │
  ├──────────┬──────────────────────────┤
  │ KPI Band │ KPI Band (4 cards)       │
  ├──────────┴──────────────────────────┤
  │ Vertical: Main Charts               │
  │  ├─ Emissions Trend Line            │
  │  ├─ Peer Comparison Bar             │
  ├─────────────────────────────────────┤
  │ Horizontal: Bottom Row              │
  │  ├─ Policy Panel  │ Warning Panel   │
  └─────────────────────────────────────┘
  ```
- **Container logic**: {Tiled vs Floating for each section}
- **User reading order**: {Top-left → right → next row → etc.}
- **Warning panel behavior**: {Show if [has_discrepancy] = TRUE, otherwise collapse/hide}
- **Background color**: White (#FFFFFF)
- **Padding**: {outer padding, inner padding in pixels}

## 11. Filters, Parameters, and Actions

### Global Filters
| Filter Field | Type | Default | Scope | Notes |
|-------------|------|---------|-------|-------|
| {[ISO3]} | {Single Value Dropdown} | {KOR} | {All Using This Data Source} | {Main country selector} |
| {additional} | | | | |

### Parameters
| Parameter Name | Data Type | Allowable Values | Default | Used By |
|---------------|-----------|-----------------|---------|---------|
| {[p_Country]} | {String} | {List / All} | {KOR} | {Sheets X, Y, Z} |
| {additional} | | | | |

### Filter Actions
| Action Name | Source Sheet | Target Sheet(s) | Trigger | Fields | Clearing |
|------------|------------|-----------------|---------|--------|----------|
| {Country Select} | {Sheet_A} | {All} | {Select} | {ISO3} | {Show all values} |

### Highlight Actions
| Action Name | Source | Target | Trigger | Fields |
|------------|--------|--------|---------|--------|
| {if any} | | | | |

### URL Actions
| Action Name | Source | URL Template | Fields |
|------------|--------|-------------|--------|
| {if any} | | | |

## 12. Reusability Notes

### What stays fixed (do NOT change per country)
- {Dashboard layout and container structure}
- {All calculated fields (CF01–CF10 + any new ones)}
- {LOD expressions}
- {Sheet structure (mark types, rows, columns)}
- {Color palettes and brand colors}
- {Tooltip templates}

### What changes per country / country-set
- {Filter/parameter default value}
- {Dashboard title text}
- {Reference line values (e.g., NDC target for specific country)}

### How to switch countries
1. {Change [p_Country] parameter to new ISO3}
2. {Or change [ISO3] filter default}
3. {All sheets update automatically}

### How to refresh data
1. {Re-run `scripts/pull-from-supabase.ts` to update CSVs}
2. {In Tableau: Data → Refresh All Extracts}
3. {Verify data vintage in tooltips}

## 13. Build Checklist

- [ ] Data sources connected: countries_latest.csv + timeseries.csv
- [ ] Relationship configured: ISO3 = ISO3
- [ ] All calculated fields created (list each by name)
- [ ] All LOD expressions created (list each by name)
- [ ] All sheets built (list each by name)
- [ ] All tooltips include (Source, Year)
- [ ] All colors match brand-config.md hex codes
- [ ] Global filter configured and scoped
- [ ] Parameters created and connected
- [ ] Filter/highlight actions configured
- [ ] Country switching tested (change filter → all sheets update)
- [ ] Null values handled (no blank cards or broken charts)
- [ ] Warning panel shows/hides correctly
- [ ] Dashboard size matches spec
- [ ] Final visual review: fonts, alignment, spacing
