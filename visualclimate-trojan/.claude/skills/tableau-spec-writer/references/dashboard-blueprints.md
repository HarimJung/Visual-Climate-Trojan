# Dashboard Blueprints — Reusable Tableau Design Standards

These 3 blueprints are the canonical reference for generating Tableau specs. Every spec MUST follow the relevant blueprint. Changing a country or country-set should require only a filter/parameter change — the structure stays identical.

---

## Data Foundation (Shared Across All 3 Blueprints)

### Data Sources
| Source | Path | Grain |
|---|---|---|
| countries_latest | `data/tableau/countries_latest.csv` | 1 row per country (250 countries, 25 columns) |
| timeseries | `data/tableau/timeseries.csv` | 1 row per country-year-indicator (long format) |

### Relationship
- `countries_latest.ISO3 = timeseries.ISO3` — Left Outer Join

### Shared Dimensions
- `[ISO3]` (String) — join key, filter
- `[country_name]` (String) — label
- `[region]` (String) — peer grouping, filter
- `[income_group]` (String) — peer grouping, filter
- `[year]` (Integer) — time axis (timeseries only)
- `[indicator_code]` (String) — indicator filter (timeseries only)
- `[source]` (String) — source label (timeseries only)

### Shared Measures (countries_latest)
- `[total_ghg]` — MtCO2eq
- `[co2_fossil]` — MtCO2
- `[ghg_per_capita]` — tCO2eq/capita (or use CF01)
- `[ghg_intensity]` — kgCO2eq/USD PPP (or use CF02)
- `[re_share_elec]` — %
- `[fossil_share_pe]` — %
- `[population]` — persons
- `[gdp_ppp]` — USD
- `[ghg_10yr_trend]` — %
- `[ndgain_rank]` — rank (1=best)
- `[ndgain_vuln]` — score 0–1
- `[ndgain_ready]` — score 0–1
- `[nz_year]` — year
- `[data_year]` — data vintage year
- `[source_primary]` — primary source name

### Shared Measure (timeseries)
- `[value]` — numeric value (unit varies by indicator_code)

### Existing Calculated Fields (from calculated-fields.md)

| ID | Name | Formula | Used In |
|---|---|---|---|
| CF01 | GHG Per Capita | `[total_ghg] * 1000000 / [population]` | All 3 dashboards |
| CF02 | GHG Intensity | `[total_ghg] * 1000000000 / [gdp_ppp]` | Overview, Comparison |
| CF03 | GHG Trend Category | `IF [ghg_10yr_trend] < -10 THEN "Rapid Decline" ELSEIF [ghg_10yr_trend] < 0 THEN "Declining" ELSEIF [ghg_10yr_trend] < 5 THEN "Stagnant" ELSEIF [ghg_10yr_trend] < 20 THEN "Rising" ELSE "Rapid Rise" END` | Overview |
| CF04 | NDC Gap (2030) | `[projected_2030] - [ndc_2030_target]` | NDC Gap Tracker |
| CF05 | NDC Gap Severity | `IF [CF04: NDC Gap (2030)] <= 0 THEN "On Track" ELSEIF [CF04: NDC Gap (2030)] / [ndc_2030_target] < 0.1 THEN "Narrow Gap" ELSEIF [CF04: NDC Gap (2030)] / [ndc_2030_target] < 0.3 THEN "Significant Gap" ELSE "Critical Gap" END` | NDC Gap Tracker |
| CF06 | Peer Median GHG/Cap | `{ FIXED [income_group], [region] : MEDIAN([CF01: GHG Per Capita]) }` | Overview, Comparison |
| CF07 | Deviation from Peer | `[CF01: GHG Per Capita] - [CF06: Peer Group Median (GHG Per Capita)]` | Overview |
| CF08 | Net Zero Countdown | `[nz_year] - YEAR(TODAY())` | Overview, NDC Gap |
| CF09 | RE Share Category | `IF [re_share_elec] >= 80 THEN "RE Leader (80%+)" ELSEIF [re_share_elec] >= 50 THEN "Majority RE (50-79%)" ELSEIF [re_share_elec] >= 25 THEN "Growing RE (25-49%)" ELSE "Fossil Dominant (<25%)" END` | Overview, Comparison |
| CF10 | CAT Rating Color | `CASE [cat_rating] WHEN "1.5C_compatible" THEN "#00A67E" WHEN "Almost_sufficient" THEN "#8BC34A" WHEN "Insufficient" THEN "#F59E0B" WHEN "Highly_insufficient" THEN "#E5484D" WHEN "Critically_insufficient" THEN "#7F1D1D" ELSE "#CCCCCC" END` | All 3 dashboards |

### Brand Colors

| Purpose | Hex |
|---|---|
| Primary / accent | #0066FF |
| Changer / On Track / positive | #00A67E |
| Starter / Warning / narrow gap | #F59E0B |
| Talker / Bad / significant gap | #E5484D |
| Critical | #7F1D1D |
| Data Missing / Not rated | #CCCCCC |
| Background | #FFFFFF |
| Text primary | #1A1A1A |
| Text secondary | #666666 |

---

# Blueprint 1: Country Overview

## Purpose

Single-country climate profile dashboard. Shows GHG emissions snapshot, energy transition status, policy alignment, and vulnerability — all relative to income-group/region peers.

## Dashboard Size

1200 × 800 pixels (Fixed)

## Required Sheets (9)

| # | Sheet Name | Purpose | Mark Type |
|---|---|---|---|
| 1 | KPI_Total_GHG | Total GHG emissions KPI card | Text |
| 2 | KPI_GHG_Per_Capita | Per capita emissions with peer comparison | Text |
| 3 | KPI_RE_Share | Renewable energy share with category | Text |
| 4 | KPI_Policy_Status | NDC submission + Net Zero + CAT rating | Text |
| 5 | Emissions_Trend_Line | 20-year GHG emissions trend | Line |
| 6 | Peer_Comparison_Bar | Selected country vs peer median across indicators | Bar |
| 7 | Policy_Status_Panel | NDC 3.0, net zero year, legal status, CAT rating | Text / Shape |
| 8 | Vulnerability_Readiness | ND-GAIN vulnerability vs readiness scatter or bar | Circle / Bar |
| 9 | Data_Warning_Panel | Source discrepancies and data quality notes | Text |

## Country Switching Logic

- **Parameter**: `[p_Country]` — String, default "KOR", allowable: All ISO3 codes from countries_latest
- **Filter**: `[ISO3] = [p_Country]` applied to ALL sheets using countries_latest
- **Timeseries filter**: `[ISO3] = [p_Country]` applied to timeseries sheets
- Changing `[p_Country]` updates the entire dashboard — no manual sheet-by-sheet changes

## Sheet Specifications

### Sheet 1: KPI_Total_GHG
- **Mark type**: Text
- **Data source**: countries_latest (filtered by [p_Country])
- **Rows**: (empty)
- **Columns**: (empty)
- **Text**: `SUM([total_ghg])` — Format: `#,##0.0` — Suffix: " MtCO2eq"
- **Color**: Fixed #1A1A1A
- **Tooltip**: `"<country_name>: <SUM(total_ghg)> MtCO2eq (<ATTR(source_primary)>, <ATTR(data_year)>)"`
- **Subtitle text**: "Total GHG Emissions (excl. LULUCF)"
- **Null-handling**: Show "[DATA MISSING]" if NULL — use `IF ISNULL([total_ghg]) THEN "[DATA MISSING]" ELSE STR(ROUND([total_ghg], 1)) + " MtCO2eq" END`

### Sheet 2: KPI_GHG_Per_Capita
- **Mark type**: Text
- **Data source**: countries_latest (filtered by [p_Country])
- **Text**: `[CF01: GHG Per Capita]` — Format: `#,##0.0` — Suffix: " tCO2eq"
- **Secondary text**: Peer median comparison — `"Peer median: " + STR(ROUND([CF06], 1))` + deviation indicator
- **Color**: Conditional — `IF [CF07] > 0 THEN "#E5484D" ELSE "#00A67E" END`
- **Tooltip**: `"<country_name>: <CF01> tCO2eq/capita\nPeer median (<income_group>, <region>): <CF06>\nDeviation: <CF07>"`
- **Null-handling**: "[DATA MISSING]" if NULL

### Sheet 3: KPI_RE_Share
- **Mark type**: Text
- **Data source**: countries_latest (filtered by [p_Country])
- **Text**: `SUM([re_share_elec])` — Format: `#,##0.0` — Suffix: "%"
- **Secondary text**: `[CF09: RE Share Category]`
- **Color**: Conditional by CF09 — RE Leader=#00A67E, Majority RE=#00A67E, Growing RE=#F59E0B, Fossil Dominant=#E5484D
- **Tooltip**: `"Renewable share of electricity: <SUM(re_share_elec)>%\nCategory: <CF09>"`

### Sheet 4: KPI_Policy_Status
- **Mark type**: Text
- **Data source**: countries_latest (filtered by [p_Country])
- **Text**: Three lines:
  - Line 1: `"NDC 3.0: " + IF [ndc30_submitted] THEN "Submitted ✓" ELSE "Not Submitted" END`
  - Line 2: `"Net Zero: " + STR([nz_year]) + " (" + [nz_legal] + ")"`
  - Line 3: `"CAT: " + [cat_rating]`
- **Color**: CAT rating color from CF10
- **Null-handling**: Show "Not Rated" if cat_rating is NULL, "No Target" if nz_year is NULL

### Sheet 5: Emissions_Trend_Line
- **Mark type**: Line
- **Data source**: timeseries (filtered by [p_Country] AND [indicator_code] = "WB.EN.ATM.GHGT.KT.CE")
- **Columns**: `YEAR([year])` — continuous
- **Rows**: `SUM([value]) / 1000` — (convert kt to Mt) — Format: `#,##0` — Axis title: "MtCO2eq"
- **Filters**:
  - `[ISO3] = [p_Country]`
  - `[indicator_code] = "WB.EN.ATM.GHGT.KT.CE"`
  - `[year] >= YEAR(TODAY()) - 20`
- **Color**: Fixed #0066FF
- **Label**: Show label on last point only — `SUM([value]) / 1000` — Format: `#,##0.0`
- **Tooltip**: `"<country_name> (<year>)\nGHG: <SUM(value)/1000> MtCO2eq\nSource: <ATTR(source)>"`
- **Reference line**:
  - Type: Line
  - Value: Latest year value from countries_latest `[total_ghg]`
  - Style: Dashed, #666666, Width 1
  - Label: "Latest: {value} Mt"
- **Null-handling**: Connect lines across missing years (Analysis → Uncheck "Show empty rows/columns")

### Sheet 6: Peer_Comparison_Bar
- **Mark type**: Bar (horizontal)
- **Data source**: countries_latest
- **Filters**: `[income_group] = {selected country's income_group} AND [region] = {selected country's region}`
  - Use LOD or parameter to pass selected country's group: `{ FIXED : MIN(IF [ISO3] = [p_Country] THEN [income_group] END) }`
- **Rows**: `[country_name]` — sorted by `[CF01: GHG Per Capita]` descending
- **Columns**: `[CF01: GHG Per Capita]`
- **Color**: `IF [ISO3] = [p_Country] THEN "#0066FF" ELSE "#CCCCCC" END`
- **Label**: `[CF01]` — Format: `#,##0.0` on bar end
- **Reference line**:
  - Scope: Entire Table
  - Value: `[CF06: Peer Median]`
  - Style: Dashed, #E5484D, Width 2
  - Label: "Peer Median"
- **Tooltip**: `"<country_name>\nGHG/capita: <CF01> tCO2eq\nPeer median: <CF06>"`
- **Null-handling**: Hide rows where CF01 is NULL

### Sheet 7: Policy_Status_Panel
- **Mark type**: Text / Shape
- **Data source**: countries_latest (filtered by [p_Country])
- **Layout**: Vertical list of policy indicators
- **Content**:
  - Row 1: NDC 3.0 submission status → green check (#00A67E) or red X (#E5484D)
  - Row 2: Net Zero target year + legal status → `STR([nz_year]) + " | " + [nz_legal]`
  - Row 3: CAT rating → colored by CF10
  - Row 4: Net Zero countdown → CF08 → `STR([CF08]) + " years remaining"`
- **Null-handling**: Show "Not Rated" / "No Target" for NULL values

### Sheet 8: Vulnerability_Readiness
- **Mark type**: Circle (scatter) or paired horizontal bar
- **Data source**: countries_latest
- **Option A (Scatter)**:
  - Columns: `[ndgain_ready]` — Axis: "Readiness (0–1)"
  - Rows: `[ndgain_vuln]` — Axis: "Vulnerability (0–1)" — Reversed
  - Color: `IF [ISO3] = [p_Country] THEN "#0066FF" ELSE "#CCCCCC" END`
  - Size: `IF [ISO3] = [p_Country] THEN 200 ELSE 50 END`
  - Label: Show only for [p_Country] — `[country_name]`
  - Filter: Same income_group + region peers
  - Reference lines: Median Vulnerability (horizontal dashed), Median Readiness (vertical dashed)
- **Tooltip**: `"<country_name>\nVulnerability: <ndgain_vuln>\nReadiness: <ndgain_ready>\nRank: <ndgain_rank>"`

### Sheet 9: Data_Warning_Panel
- **Mark type**: Text
- **Data source**: countries_latest (filtered by [p_Country])
- **Visibility**: Show ONLY if there are discrepancies or data quality issues
- **Content**: Dynamic text showing:
  - Source discrepancies (if EDGAR vs Climate TRACE > 10%)
  - Data vintage note
  - [DATA MISSING] indicators list
- **Calculated field for visibility**:
  ```
  [Has_Warning] =
  IF ISNULL([total_ghg]) OR ISNULL([re_share_elec]) OR ISNULL([ndgain_rank])
  THEN TRUE
  ELSE FALSE
  END
  ```
- **Color**: Text #666666, background #FFF3CD (light yellow)
- **Null-handling**: If no warnings, show "✓ All data checks passed"

## Dashboard Layout

```
┌─────────────────────────────────────────────┐
│ Title: "{country_name} Climate Overview"     │
│ Subtitle: "Data vintage: {data_year}"        │
├───────────┬───────────┬──────────┬──────────┤
│ KPI_Total │ KPI_Per   │ KPI_RE   │ KPI_     │
│ _GHG      │ _Capita   │ _Share   │ Policy   │
├───────────┴───────────┴──────────┴──────────┤
│ Emissions_Trend_Line                         │
├──────────────────────┬──────────────────────┤
│ Peer_Comparison_Bar  │ Policy_Status_Panel  │
├──────────────────────┤ + Vulnerability_     │
│ Data_Warning_Panel   │   Readiness          │
└──────────────────────┴──────────────────────┘
```

- All tiled (no floating elements)
- KPI band: 4 equal-width cells in horizontal container
- Main chart area: 60% width left, 40% width right
- Warning panel: bottom-left, collapses if no warnings

## Reusability Rules

- **Fixed**: Layout, all 9 sheets, all calculated fields, color scheme, tooltip templates
- **Variable**: `[p_Country]` parameter value only
- **To switch country**: Change `[p_Country]` parameter → entire dashboard updates
- **To add data**: Re-run `pull-from-supabase.ts` → refresh Tableau extract

---

# Blueprint 2: Country Comparison

## Purpose

Side-by-side comparison of 2–5 countries across all core indicators. Highlights key differences and common challenges.

## Dashboard Size

1400 × 900 pixels (Fixed)

## Required Sheets (6)

| # | Sheet Name | Purpose | Mark Type |
|---|---|---|---|
| 1 | Comparison_KPI_Table | 8 indicators × N countries highlight table | Square (heat map) |
| 2 | Per_Capita_Bar_Comparison | Per capita emissions bar comparison | Bar |
| 3 | Trend_Comparison_Line | GHG trend overlay for all selected countries | Line |
| 4 | Renewable_Comparison | RE share bar or bullet comparison | Bar |
| 5 | Policy_Status_Comparison | NDC / Net Zero / CAT side by side | Text |
| 6 | Divergence_Highlight | Top 3 biggest differences annotated | Bar |

## Country Selection Logic

Use 5 string parameters to allow flexible 2–5 country selection:

```
[p_Country1] — String, default "KOR"
[p_Country2] — String, default "JPN"
[p_Country3] — String, default "" (empty = exclude)
[p_Country4] — String, default "" (empty = exclude)
[p_Country5] — String, default "" (empty = exclude)
```

Master filter calculated field:
```
[Is_Selected_Country] =
[ISO3] = [p_Country1]
OR [ISO3] = [p_Country2]
OR ([p_Country3] != "" AND [ISO3] = [p_Country3])
OR ([p_Country4] != "" AND [ISO3] = [p_Country4])
OR ([p_Country5] != "" AND [ISO3] = [p_Country5])
```

Apply `[Is_Selected_Country] = TRUE` filter to ALL sheets.

## Additional Calculated Fields

| # | Name | Formula | Purpose |
|---|---|---|---|
| CC01 | Is_Selected_Country | (see above) | Master filter |
| CC02 | Country Count | `{ FIXED : COUNTD(IF [Is_Selected_Country] THEN [ISO3] END) }` | Validate 2–5 selected |
| CC03 | Indicator Rank | `RANK_UNIQUE(SUM([value]), 'desc')` | Per-indicator ranking |
| CC04 | Max Spread | `WINDOW_MAX(SUM([value])) - WINDOW_MIN(SUM([value]))` | Divergence detection |

## Sheet Specifications

### Sheet 1: Comparison_KPI_Table
- **Mark type**: Square (highlight table / heat map)
- **Rows**: `[country_name]` (filtered by Is_Selected_Country)
- **Columns**: Indicator names (8 core indicators)
- **Implementation**: Use countries_latest, pivot or create 8 separate columns
  - Approach: Place `[country_name]` on Rows. Create a calculated field for each indicator to normalize to z-score:
    ```
    [Z_Total_GHG] = (SUM([total_ghg]) - WINDOW_AVG(SUM([total_ghg]))) / WINDOW_STDEV(SUM([total_ghg]))
    ```
  - Repeat for: total_ghg, ghg_per_capita, ghg_intensity, re_share_elec, ghg_10yr_trend, ndgain_rank, nz_year
  - Or use Measure Names/Measure Values with a filter on the 8 indicators
- **Color**: Diverging palette — low (green #00A67E) to high (red #E5484D) per column, centered at 0
- **Label**: Show actual value (not z-score) — Format per indicator unit
- **Tooltip**: `"<country_name>\n<Measure Names>: <Measure Values> <unit>\nRank: <CC03>"`
- **Sort**: Rows sorted by `[total_ghg]` descending

### Sheet 2: Per_Capita_Bar_Comparison
- **Mark type**: Bar (horizontal)
- **Rows**: `[country_name]`
- **Columns**: `[CF01: GHG Per Capita]`
- **Filter**: `[Is_Selected_Country] = TRUE`
- **Color**: Assign distinct color per country — Country1=#0066FF, Country2=#00A67E, Country3=#F59E0B, Country4=#E5484D, Country5=#7F1D1D
- **Label**: `[CF01]` Format `#,##0.0` + " tCO2eq" on bar end
- **Sort**: `[CF01]` descending
- **Reference line**: Global median per capita (all 250 countries)
  ```
  { FIXED : MEDIAN([CF01: GHG Per Capita]) }
  ```
  Style: Dashed, #666666, Width 1, Label "Global Median"
- **Tooltip**: `"<country_name>\nGHG/capita: <CF01> tCO2eq\nGlobal median: <global_median>"`

### Sheet 3: Trend_Comparison_Line
- **Mark type**: Line
- **Data source**: timeseries
- **Columns**: `YEAR([year])` continuous
- **Rows**: `SUM([value]) / 1000` — Axis: "MtCO2eq"
- **Color**: `[country_name]` — same color assignment as Sheet 2
- **Filter**: `[Is_Selected_Country] = TRUE AND [indicator_code] = "WB.EN.ATM.GHGT.KT.CE" AND [year] >= 2000`
- **Label**: Last point only — `[country_name]` + value
- **Tooltip**: `"<country_name> (<year>)\nGHG: <SUM(value)/1000> MtCO2eq\nSource: <ATTR(source)>"`

### Sheet 4: Renewable_Comparison
- **Mark type**: Bar (horizontal)
- **Rows**: `[country_name]`
- **Columns**: `SUM([re_share_elec])`
- **Filter**: `[Is_Selected_Country] = TRUE`
- **Color**: CF09 category colors — RE Leader=#00A67E, Growing=#F59E0B, Fossil Dominant=#E5484D
- **Label**: `SUM([re_share_elec])` Format `#,##0.0` + "%"
- **Reference line**: 50% mark — Dashed, #666666, Label "50% threshold"
- **Sort**: `[re_share_elec]` descending
- **Tooltip**: `"<country_name>\nRE share: <re_share_elec>%\nCategory: <CF09>"`

### Sheet 5: Policy_Status_Comparison
- **Mark type**: Text
- **Rows**: `[country_name]`
- **Columns**: 4 policy fields as separate columns (NDC 3.0, Net Zero Year, NZ Legal, CAT Rating)
- **Implementation**: Use Measure Names/Values filtered to policy indicators, or 4 text marks side by side
- **Color**: CAT rating colored by CF10; NDC submitted = green/red; NZ legal = graduated
- **Null-handling**: "Not Rated" for NULL CAT, "No Target" for NULL NZ

### Sheet 6: Divergence_Highlight
- **Mark type**: Bar (horizontal, diverging from center)
- **Purpose**: Show the top 3 indicators with largest spread between selected countries
- **Rows**: Top 3 indicator names by spread
- **Columns**: Spread value (max - min across selected countries)
- **Color**: Fixed #0066FF
- **Label**: Spread value + unit
- **Annotation**: Text annotation on each bar — "Highest: {country} ({value}) | Lowest: {country} ({value})"
- **Sort**: Spread descending (largest divergence first)

## Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│ Title: "Country Comparison: {Country1} vs ..."    │
│ Parameters: [p_Country1] [p_Country2] [p_C3] ... │
├──────────────────────────────────────────────────┤
│ Comparison_KPI_Table (full width)                 │
├────────────────────────┬─────────────────────────┤
│ Per_Capita_Bar         │ Trend_Comparison_Line    │
├────────────────────────┼─────────────────────────┤
│ Renewable_Comparison   │ Policy_Status_Comparison │
├────────────────────────┴─────────────────────────┤
│ Divergence_Highlight (full width)                 │
└──────────────────────────────────────────────────┘
```

## Reusability Rules

- **Fixed**: Layout, all 6 sheets, calculated fields, color assignment logic
- **Variable**: 5 country parameters only
- **To change countries**: Update [p_Country1]–[p_Country5] → all sheets update
- Empty parameters (Country3–5) automatically excluded via [Is_Selected_Country] logic

---

# Blueprint 3: NDC Gap Tracker

## Purpose

Single-country NDC gap analysis dashboard. Shows actual emissions vs projected pathway vs NDC target, gap severity, required reduction rate, and risk factors.

## Dashboard Size

1200 × 700 pixels (Fixed)

## Required Sheets (6)

| # | Sheet Name | Purpose | Mark Type |
|---|---|---|---|
| 1 | Actual_vs_Target_Line | Actual trend + projected + NDC target line | Line + Reference |
| 2 | Gap_Value_Card | Gap in MtCO2eq between projected and target | Text |
| 3 | Gap_Severity_Card | On Track / Narrow / Significant / Critical | Text |
| 4 | Required_Reduction_Card | Annual reduction needed to meet target | Text |
| 5 | Projection_Method_Note | Methodology and confidence statement | Text |
| 6 | Risk_Warnings_Panel | Key risks and data caveats | Text |

## Country Switching Logic

- **Parameter**: `[p_Country]` — String, default "KOR"
- **Filter**: `[ISO3] = [p_Country]` on ALL sheets

## Additional Calculated Fields

| # | Name | Formula | Purpose |
|---|---|---|---|
| NG01 | Projected Value | `IF [year] > [Latest_Actual_Year] THEN [Latest_Value] + ([Trend_Slope] * ([year] - [Latest_Actual_Year])) END` | Linear projection for future years |
| NG02 | Latest Actual Year | `{ FIXED [ISO3] : MAX(IF NOT ISNULL([value]) AND [indicator_code] = "WB.EN.ATM.GHGT.KT.CE" THEN [year] END) }` | Find most recent data year |
| NG03 | Latest Actual Value | `{ FIXED [ISO3] : MAX(IF [year] = [NG02: Latest Actual Year] AND [indicator_code] = "WB.EN.ATM.GHGT.KT.CE" THEN [value] END) } / 1000` | Latest emissions in Mt |
| NG04 | Trend Slope | `(Value at NG02 - Value at NG02-5) / 5` — implement as: `{ FIXED [ISO3] : (MAX(IF [year] = [NG02] THEN [value] END) - MAX(IF [year] = [NG02] - 5 THEN [value] END)) / 5 } / 1000` | 5-year linear trend in Mt/year |
| NG05 | NDC 2030 Target | From countries_latest `[ndc_2030_target]` — numeric MtCO2eq if available | Target reference line value |
| NG06 | Gap Value 2030 | `[Projected at 2030] - [NG05: NDC 2030 Target]` | Absolute gap |
| NG07 | Gap Percent | `[NG06] / [NG05] * 100` | Percentage gap for severity |
| NG08 | Required Annual Reduction | `([NG03: Latest Actual Value] - [NG05]) / (2030 - [NG02: Latest Actual Year])` | Mt/year needed |
| NG09 | Line Type | `IF [year] <= [NG02] THEN "Actual" ELSE "Projected" END` | Distinguish solid vs dashed line |

## Sheet Specifications

### Sheet 1: Actual_vs_Target_Line
- **Mark type**: Line
- **Data source**: timeseries (filtered by [p_Country] AND indicator WB.EN.ATM.GHGT.KT.CE)
- **Columns**: `YEAR([year])` continuous — Range: 2010 to 2035
- **Rows**: `SUM([value]) / 1000` — Axis: "MtCO2eq"
- **Color / Path**: `[NG09: Line Type]` — Actual=#0066FF (solid), Projected=#0066FF (dashed)
  - In Tableau: use dual axis or path shelf to differentiate line style
  - Actual line: solid, width 3
  - Projected line: dashed (custom shape or secondary axis), width 2
- **Reference line — NDC 2030 Target**:
  - Type: Constant Line
  - Value: `[NG05: NDC 2030 Target]` (from countries_latest)
  - Scope: Entire Table
  - Style: Solid, #E5484D, Width 2
  - Label: `"NDC 2030 Target: " + STR([NG05]) + " MtCO2eq"`
- **Reference band — Gap Area** (between projected line and target at 2030):
  - Type: Band
  - From: `[NG05]` (target)
  - To: Projected value at 2030
  - Fill: Light red (#FECACA), Border: None
  - Label: `"Gap: " + STR(ROUND([NG06], 1)) + " MtCO2eq"`
- **Tooltip**: `"<country_name> (<year>)\nEmissions: <SUM(value)/1000> MtCO2eq\nType: <NG09>\nSource: <ATTR(source)>"`
- **Null-handling**: Connect across missing years for actual line

### Sheet 2: Gap_Value_Card
- **Mark type**: Text
- **Text**: `[NG06: Gap Value 2030]` — Format: `+#,##0.0;-#,##0.0` — Suffix: " MtCO2eq"
- **Color**: `IF [NG06] <= 0 THEN "#00A67E" ELSEIF [NG06] / [NG05] < 0.1 THEN "#F59E0B" ELSEIF [NG06] / [NG05] < 0.3 THEN "#E5484D" ELSE "#7F1D1D" END`
- **Subtitle**: "Gap to NDC 2030 Target"
- **Null-handling**: "[NDC TARGET NOT AVAILABLE]" if NG05 is NULL

### Sheet 3: Gap_Severity_Card
- **Mark type**: Text
- **Text**: `[CF05: NDC Gap Severity]`
- **Color**: On Track=#00A67E, Narrow Gap=#F59E0B, Significant Gap=#E5484D, Critical Gap=#7F1D1D
- **Font size**: Large (20pt+)
- **Subtitle**: Severity explanation text — e.g., "Policy acceleration can close the gap"
  ```
  IF [CF05] = "On Track" THEN "Emissions projected to meet or beat target"
  ELSEIF [CF05] = "Narrow Gap" THEN "Policy acceleration can close the gap"
  ELSEIF [CF05] = "Significant Gap" THEN "Major policy shift needed"
  ELSE "Structural transformation required"
  END
  ```

### Sheet 4: Required_Reduction_Card
- **Mark type**: Text
- **Text**: `[NG08: Required Annual Reduction]` — Format: `#,##0.0` — Suffix: " MtCO2eq/year"
- **Secondary text**: `"From " + STR([NG02]) + " to 2030 (" + STR(2030 - [NG02]) + " years remaining)"`
- **Color**: `IF [NG08] < 0 THEN "#00A67E" ELSE "#E5484D" END` (negative = already declining enough)
- **Null-handling**: "[INSUFFICIENT DATA]" if < 5 years of timeseries

### Sheet 5: Projection_Method_Note
- **Mark type**: Text (static annotation)
- **Content**:
  ```
  "Projection method: 5-year linear trend extrapolation
  Based on: {NG02-5} to {NG02} emissions data
  Confidence: {HIGH if ≥10yr data / MEDIUM if 5-9yr / LOW if <5yr}
  Note: Linear projection does not account for policy changes after {NG02}"
  ```
- **Color**: #666666, Font size 10pt

### Sheet 6: Risk_Warnings_Panel
- **Mark type**: Text
- **Content**: Dynamic list of risks from the report:
  - Data vintage warning if data_year < current_year - 2
  - Projection confidence warning if < 5 years data
  - BAU/intensity target uncertainty if applicable
  - Source discrepancy if EDGAR vs CT > 10%
- **Color**: Text #1A1A1A, Background #FFF3CD
- **Null-handling**: Show "✓ No significant risks identified" if none apply

## Dashboard Layout

```
┌──────────────────────────────────────────────┐
│ Title: "{country_name} NDC Gap Analysis"      │
│ Parameter: [p_Country]                        │
├──────────┬──────────┬───────────────────────┤
│ Gap_Value│ Gap_     │ Required_Reduction     │
│ _Card    │ Severity │ _Card                  │
├──────────┴──────────┴───────────────────────┤
│ Actual_vs_Target_Line (full width)           │
├─────────────────────┬───────────────────────┤
│ Projection_Method   │ Risk_Warnings_Panel   │
│ _Note               │                       │
└─────────────────────┴───────────────────────┘
```

## Reusability Rules

- **Fixed**: Layout, all 6 sheets, calculated fields, gap severity logic, color scheme
- **Variable**: `[p_Country]` parameter value, NDC target reference line value (auto-updates from data)
- **To switch country**: Change `[p_Country]` → entire dashboard updates including target line
- **NDC target values come from data** (countries_latest or ndc-targets-v2.json via CSV) — not hardcoded
- Works for any country that has: (1) emissions timeseries, (2) NDC target in ndc-targets-v2.json
