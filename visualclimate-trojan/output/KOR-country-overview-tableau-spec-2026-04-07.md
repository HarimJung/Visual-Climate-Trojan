# Tableau Dashboard Spec: KOR Country Overview

**Generated**: 2026-04-07
**For**: Harim (Tableau Desktop)

---

## 1. Dashboard Purpose

Allow a user to view South Korea's climate profile at a glance: headline KPIs, emissions trajectory, energy transition status, policy alignment, and positioning relative to peers. Supports switching to any country in the dataset.

## 2. Source Report

- Report path: `output/KOR-country-brief-2026-04-07.md`
- Report type: Country Brief
- Primary grain: country-level (single row per country from `countries_latest.csv`), country-year (from `timeseries.csv`)

## 3. Data Sources

| # | Source Name | File Path | Grain | Notes |
|---|-------------|-----------|-------|-------|
| 1 | Countries Latest | `data/tableau/countries_latest.csv` | 1 row per country (250 countries) | All KPIs, latest year. Primary source for KPI cards and peer comparison. |
| 2 | Timeseries | `data/tableau/timeseries.csv` | 1 row per country-year-indicator | Historical trends. Used for emissions trajectory chart. |
| 3 | NDC Targets | `data/ndc-targets-v2.json` | 1 row per country | NDC 2030/2035 targets, net-zero year, CAT rating. Manual extract to CSV or Tableau JSON connector. |

## 4. Relationships / Joins

| Left Source | Right Source | Key | Relationship Type | Notes |
|-------------|--------------|-----|-------------------|-------|
| Countries Latest | Timeseries | `ISO3 = ISO3` | Left join (1:many) | Countries Latest is anchor; timeseries adds history |
| Countries Latest | NDC Targets | `ISO3 = ISO3` | Left join (1:1) | Adds policy fields to each country row |

## 5. Required Dimensions and Measures

### Dimensions

- `ISO3` (String) — primary key
- `country_name` (String)
- `region` (String)
- `income_group` (String)
- `year` (Integer, from timeseries)
- `indicator_code` (String, from timeseries)
- `cat_rating` (String, from NDC)
- `ndc30_submitted` (Boolean, from NDC)
- `net_zero_legal_status` (String, from NDC)

### Measures

- `total_ghg` (Float, MtCO₂eq)
- `co2_fossil` (Float, MtCO₂)
- `ghg_per_capita` (Float, tCO₂eq/cap)
- `re_share_elec` (Float, %)
- `population` (Integer)
- `gdp_ppp` (Float, USD)
- `ndgain_vuln` (Float, 0–1)
- `ndgain_ready` (Float, 0–1)
- `value` (Float, from timeseries — generic measure column)

## 6. Calculated Fields

| # | Name | Tableau Formula | Return Type | Purpose |
|---|------|-----------------|-------------|---------|
| 1 | CF01: GHG Per Capita | `[total_ghg] * 1000000 / [population]` | Float (tCO₂eq/cap) | KPI card, peer bar chart |
| 2 | CF02: GHG Intensity | `[total_ghg] * 1000000000 / [gdp_ppp]` | Float (kgCO₂eq/USD) | KPI card |
| 3 | CF03: GHG Trend Category | `IF [ghg_10yr_trend] < -10 THEN "Rapid Decline" ELSEIF [ghg_10yr_trend] < 0 THEN "Declining" ELSEIF [ghg_10yr_trend] < 5 THEN "Stagnant" ELSEIF [ghg_10yr_trend] < 20 THEN "Rising" ELSE "Rapid Rise" END` | String | Color encoding on trend |
| 4 | CF08: Net Zero Countdown | `[nz_year] - YEAR(TODAY())` | Integer | KPI card: "X years remaining" |
| 5 | CF09: RE Share Category | `IF [re_share_elec] >= 80 THEN "RE Leader (80%+)" ELSEIF [re_share_elec] >= 50 THEN "Majority RE (50-79%)" ELSEIF [re_share_elec] >= 25 THEN "Growing RE (25-49%)" ELSE "Fossil Dominant (<25%)" END` | String | Color encoding on energy status |
| 6 | CF10: CAT Rating Color | `CASE [cat_rating] WHEN "1.5C_compatible" THEN "#00A67E" WHEN "Almost_sufficient" THEN "#8BC34A" WHEN "Insufficient" THEN "#F59E0B" WHEN "Highly_insufficient" THEN "#E5484D" WHEN "Critically_insufficient" THEN "#7F1D1D" ELSE "#CCCCCC" END` | String (hex) | Color mark on policy badge |
| 7 | Selected Country Flag | `[ISO3] = [p.Country]` | Boolean | Highlight selected country in peer charts |
| 8 | Peer Median GHG/Capita | `{ FIXED [income_group], [region] : MEDIAN([CF01: GHG Per Capita]) }` | Float | Reference line in peer bar |

## 7. LOD Expressions

| # | Name | Tableau Formula | Purpose |
|---|------|-----------------|---------|
| 1 | Peer Median GHG/Capita | `{ FIXED [income_group], [region] : MEDIAN([CF01: GHG Per Capita]) }` | Reference line: peer median on bar chart |
| 2 | Peer Median RE Share | `{ FIXED [income_group], [region] : MEDIAN([re_share_elec]) }` | Reference line: peer median on RE chart |
| 3 | Peer Median GHG Intensity | `{ FIXED [income_group], [region] : MEDIAN([CF02: GHG Intensity]) }` | Reference line on intensity comparison |

## 8. Sheet Inventory

| # | Sheet Name | Purpose | Data Source |
|---|------------|---------|-------------|
| 1 | KPI Cards | 6 headline numbers | Countries Latest |
| 2 | Emissions Trend | 10-year line chart | Timeseries |
| 3 | Energy Mix Gauge | RE share vs fossil | Countries Latest |
| 4 | Peer Comparison Bars | Bar chart vs 3 peers + median | Countries Latest |
| 5 | Policy Status Panel | NDC / Net-zero / CAT text badges | Countries Latest + NDC Targets |

## 9. Detailed Sheet Instructions

### Sheet 1: KPI Cards

- **Goal**: Display 6 headline KPIs for the selected country in a single row of large-number tiles
- **Mark type**: Text
- **Rows**: —
- **Columns**: 6 placeholder columns (one per KPI)
- **Filters**: `[ISO3] = [p.Country]` (parameter-driven)
- **Parameters**: `p.Country` (String, default "KOR")
- **Color**: Each KPI label uses neutral `#4A4A6A`; value color conditional:
  - GHG trend: `#00A67E` if negative, `#E5484D` if positive
  - RE share: `#E5484D` if <25%, `#F59E0B` if 25–50%, `#00A67E` if ≥50%
  - CAT rating: per CF10 hex mapping
- **Size**: KPI value = Inter Bold 24pt; label = Inter Regular 10pt; unit = JetBrains Mono 9pt
- **Label**: `{value} {unit}` centered in each tile
- **Tooltip**: `{indicator_label}: {value} {unit} | Source: {source} ({year})`
- **Sort**: Fixed order: Total GHG → GHG/Capita → RE Share → GHG Trend → Net-Zero Countdown → CAT Rating
- **Reference line / band**: None
- **Null-handling**: If value is NULL, display `[DATA MISSING]` in `#CCCCCC`
- **Notes**: KPI values to display:
  1. Total GHG: `624.2 MtCO₂eq`
  2. GHG/Capita: `12.2 tCO₂eq`
  3. RE Share: `9.0%`
  4. 10yr Trend: `−5.6%`
  5. Net-Zero Countdown: `24 years` (2050 − 2026)
  6. CAT Rating: `Highly Insufficient` (colored `#E5484D`)

### Sheet 2: Emissions Trend

- **Goal**: Show 10-year emissions trajectory (2013–2023) as a line, with NDC 2030 target as reference
- **Mark type**: Line + Circle (dual axis)
- **Rows**: `SUM([value])` (filtered to indicator_code = total GHG)
- **Columns**: `[year]`
- **Filters**: `[ISO3] = [p.Country]`, `[indicator_code] = "WB.EN.ATM.GHGT.KT.CE"` (or equivalent timeseries code)
- **Parameters**: `p.Country`
- **Color**: Line = `#0066FF` (Primary); Circle marks = `#0066FF`
- **Size**: Line = 2px; Circle = 6px for latest year, 4px for others
- **Label**: Latest year value only: `{value} MtCO₂eq` in Inter Bold 11pt
- **Tooltip**:
  ```
  {country_name} — {year}
  Total GHG: {value} MtCO₂eq (excl. LULUCF)
  Source: {source}
  ```
- **Sort**: Year ascending
- **Reference line / band**:
  - Constant line at 436.6 MtCO₂eq (NDC 2030 target), dashed, `#00A67E`, label "NDC 2030: 436.6 Mt"
  - Constant line at 727.6 MtCO₂eq (2018 baseline), dotted, `#8888A0`, label "2018 baseline: 727.6 Mt"
- **Null-handling**: Connect NULL gaps with dotted line
- **Notes**: If timeseries data is sparse, show available years only. Y-axis range: 0 to max(value) × 1.1.

### Sheet 3: Energy Mix Gauge

- **Goal**: Show RE share as a bullet/bar chart comparing to peer median and 100% target
- **Mark type**: Stacked bar (horizontal)
- **Rows**: `[country_name]` (single row for selected country)
- **Columns**: `[re_share_elec]`
- **Filters**: `[ISO3] = [p.Country]`
- **Parameters**: `p.Country`
- **Color**: RE portion = `#00A67E`; Fossil portion (100 − RE) = `#E5E7EB` (border gray)
- **Size**: Bar height = 40px
- **Label**: `{re_share_elec}% renewable` on RE segment, right-aligned
- **Tooltip**:
  ```
  {country_name}: {re_share_elec}% renewable electricity
  Category: {CF09: RE Share Category}
  Peer median: {Peer Median RE Share}%
  Source: Ember ({data_year})
  ```
- **Sort**: —
- **Reference line / band**:
  - Vertical reference line at peer median RE share, dashed, `#4A4A6A`, label "Peer median: {value}%"
  - Band: 0–25% faintly shaded `#FEE2E2` ("Fossil Dominant zone")
- **Null-handling**: If `re_share_elec` is NULL, show full bar in `#CCCCCC` with `[DATA MISSING]`
- **Notes**: X-axis fixed 0–100%.

### Sheet 4: Peer Comparison Bars

- **Goal**: Horizontal grouped bar chart comparing KOR vs 3 peers (JPN, AUS, GBR) on 3 indicators
- **Mark type**: Bar (horizontal)
- **Rows**: `[country_name]` (4 countries), `[Indicator]` (using a parameter or sheet selector for GHG/capita, RE share, GHG intensity)
- **Columns**: `[value]`
- **Filters**: `[ISO3] IN ("KOR", "JPN", "AUS", "GBR")`; show all 4 always regardless of parameter
- **Parameters**: `p.PeerIndicator` (String; allowed values: "GHG per capita", "RE share", "GHG intensity"); default "GHG per capita"
- **Color**: Selected country (KOR) = `#0066FF`; Peers = `#E5E7EB` (light gray); bar that is worst = `#E5484D` accent
- **Size**: Bar height = 30px per country
- **Label**: `{value}` at end of each bar, Inter Regular 10pt
- **Tooltip**:
  ```
  {country_name}: {value} {unit}
  Peer median: {peer_median} {unit}
  Source: {source} ({year})
  ```
- **Sort**: Value descending (highest bar on top)
- **Reference line / band**: Vertical reference line at peer median value, dashed, `#4A4A6A`
- **Null-handling**: If peer data missing, show `[DATA MISSING]` text in bar slot
- **Notes**: When `p.PeerIndicator` changes, the measure and axis label must update dynamically. Consider using a parameter-driven calculated field: `CASE [p.PeerIndicator] WHEN "GHG per capita" THEN [CF01] WHEN "RE share" THEN [re_share_elec] WHEN "GHG intensity" THEN [CF02] END`

### Sheet 5: Policy Status Panel

- **Goal**: Text-based summary of NDC, net-zero, and CAT status in a clean card layout
- **Mark type**: Text (no chart marks)
- **Rows**: 5 rows (one per policy item)
- **Columns**: `[Item]`, `[Status]`
- **Filters**: `[ISO3] = [p.Country]`
- **Parameters**: `p.Country`
- **Color**:
  - CAT Rating text: colored per CF10
  - Net-zero status: `#00A67E` if `in_law`, `#F59E0B` if `in_policy`, `#8888A0` if `pledge` or `none`
  - NDC 3.0 submitted: `#00A67E` if Yes, `#E5484D` if No
- **Size**: Item label = Inter Regular 10pt `#4A4A6A`; Status value = Inter Bold 11pt `#1A1A2E`
- **Label**: 5 items:
  1. NDC 3.0 Submitted: No
  2. 2030 Target: 40% reduction from 2018 (436.6 MtCO₂eq)
  3. 2035 Target: Not yet submitted
  4. Net-Zero: 2050 (in law)
  5. CAT Rating: Highly Insufficient
- **Tooltip**: `{item}: {status} | Source: {source}`
- **Sort**: Fixed order as listed
- **Reference line / band**: None
- **Null-handling**: If any policy field is NULL, display "Not available" in `#CCCCCC`
- **Notes**: This sheet is essentially a formatted text table, not a chart. Consider using a Worksheet with custom shapes or a Web Page object if rich formatting is needed.

## 10. Dashboard Assembly

- **Layout structure**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Title: Country Climate Overview                    [p.Country] │
│  Subtitle: {country_name} ({ISO3}) | Data vintage: 2023        │
├─────────────────────────────────────────────────────────────────┤
│  Sheet 1: KPI Cards (6 tiles across full width)                 │
│  (1200 × 120 px)                                                │
├──────────────────────────────┬──────────────────────────────────┤
│  Sheet 2: Emissions Trend    │  Sheet 3: Energy Mix Gauge       │
│  (600 × 300 px)              │  (600 × 300 px)                  │
├──────────────────────────────┼──────────────────────────────────┤
│  Sheet 4: Peer Comparison    │  Sheet 5: Policy Status Panel    │
│  (600 × 300 px)              │  (600 × 300 px)                  │
├─────────────────────────────────────────────────────────────────┤
│  Footer: "VisualClimate" | Source citations (9pt #8888A0)       │
└─────────────────────────────────────────────────────────────────┘
```

- **Container logic**:
  - Outer: Vertical container (full dashboard)
  - Row 1: Horizontal container → Title text (left) + Parameter dropdown (right)
  - Row 2: Horizontal container → 6 KPI card sheets (equal width)
  - Row 3: Horizontal container → Emissions Trend (50%) + Energy Mix (50%)
  - Row 4: Horizontal container → Peer Comparison (50%) + Policy Panel (50%)
  - Row 5: Horizontal container → Footer text

- **User reading order**: Top → Bottom, Left → Right. KPIs first (snapshot), then trends (context), then comparison (positioning), then policy (status).

- **State logic**:
  - Default state: `p.Country = "KOR"`
  - On parameter change: All 5 sheets refresh to new country
  - If country has no timeseries data: Sheet 2 shows "No timeseries data available" message

- **Warning panel behavior**:
  - If any KPI is `[DATA MISSING]`, show a thin amber banner below KPI row: "⚠ Some indicators are unavailable for this country"
  - If CAT rating is NULL (country not rated by CAT), show "Not rated by CAT" in `#CCCCCC`

## 11. Filters, Parameters, and Actions

- **Global filters**:
  - `p.Country` parameter drives all 5 sheets via `[ISO3] = [p.Country]` filter
  - No dashboard-level filters beyond the country parameter

- **Parameters**:

| Parameter | Data Type | Default | Allowable Values | Display |
|-----------|-----------|---------|------------------|---------|
| p.Country | String | KOR | All 250 ISO3 codes from countries_latest.csv | Dropdown (searchable) |
| p.PeerIndicator | String | GHG per capita | "GHG per capita", "RE share", "GHG intensity" | Radio buttons |

- **Filter actions**:
  - Click on any peer bar in Sheet 4 → Navigates `p.Country` to that peer's ISO3 (enables drill-through to any peer)

- **Highlight actions**:
  - Hover on KPI card → Highlights corresponding value in peer comparison if applicable

- **URL actions**:
  - Click on CAT Rating text → Opens `https://climateactiontracker.org/countries/{country_slug}/`
  - Click on "NDC" text → Opens `https://www.climatewatchdata.org/ndcs/country/{ISO3}`

## 12. Reusability Notes

- **How the same dashboard supports additional countries**: Change `p.Country` parameter. All 250 countries in `countries_latest.csv` are supported. Peer comparison automatically recalculates based on `income_group` and `region` LOD expressions.
- **What must remain fixed**:
  - Column names in CSV files (`ISO3`, `total_ghg`, `re_share_elec`, etc.)
  - Calculated field formulas (CF01–CF10)
  - Color encoding mapping (brand-config.md)
  - Dashboard layout structure
- **What can change safely**:
  - Default country parameter value
  - Peer indicator options (can add more)
  - Timeseries date range (automatically adapts)
  - Footer source citation text
  - Number of peer countries shown (currently hardcoded to 3 for the brief; LOD-based peers work for any group size)

## 13. Build Checklist

- [ ] Data sources connected (`countries_latest.csv`, `timeseries.csv`, NDC targets)
- [ ] Relationships configured (ISO3 joins)
- [ ] Calculated fields created (CF01, CF02, CF03, CF08, CF09, CF10, Selected Country Flag, Peer Medians)
- [ ] LOD expressions created (Peer Median GHG/Capita, RE Share, GHG Intensity)
- [ ] Parameters created (`p.Country`, `p.PeerIndicator`)
- [ ] Sheet 1: KPI Cards built and formatted
- [ ] Sheet 2: Emissions Trend line chart with NDC reference lines
- [ ] Sheet 3: Energy Mix gauge bar with peer median reference
- [ ] Sheet 4: Peer Comparison bars with dynamic indicator switching
- [ ] Sheet 5: Policy Status Panel with color-coded text
- [ ] Dashboard assembled in correct layout
- [ ] Tooltips validated (all show source + year)
- [ ] Filters and actions validated (parameter drives all sheets)
- [ ] Country switching works (tested with KOR, USA, DEU, BGD)
- [ ] [DATA MISSING] warnings display correctly for incomplete countries
- [ ] URL actions open correct external pages
- [ ] Font/color compliance with brand-config.md verified
- [ ] Footer with VisualClimate attribution added

---

*Reference: `data/tableau/calculated-fields.md`, `brand-config.md`, `data/schema.json`*
*Source Report: `output/KOR-country-brief-2026-04-07.md`*
*QA Report: `output/KOR-country-brief-QA-2026-04-07.md` — PASS*
