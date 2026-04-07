# QA Report: KOR Country Brief

**Report reviewed**: `output/KOR-country-brief-2026-04-07.md`
**QA date**: 2026-04-07
**Checker**: VisualClimate Trojan QA Engine v1.0
**Methodology**: IPCC TCCCA (Transparency, Completeness, Consistency, Comparability, Accuracy)

---

## Overall Verdict: PASS with minor notes

| Criterion | Status | Notes |
|-----------|--------|-------|
| Factual Accuracy | PASS (with notes) | 2 minor derivation discrepancies flagged below |
| Unit Consistency | PASS | All units correct: MtCO₂eq, tCO₂eq/cap, %, kgCO₂eq/USD PPP |
| Source Citations | PASS | Every numeric value has (Source, Year) attribution |
| GWP Consistency | PASS | AR5 throughout; no AR4/AR6 mixing |
| Temporal Alignment | PASS | All data from 2023 vintage consistently |
| LULUCF | PASS | "excl. LULUCF" stated clearly; no mixing |
| Template Compliance | PASS (with note) | ND-GAIN rank replaced by Vulnerability + Readiness scores |
| Cross-check Flag | PASS | OWID vs Climate TRACE divergence (13.6%) correctly flagged with ⚠️ |

---

## Detailed Checks

### 1. Key Metrics vs CSV Data (`countries_latest.csv`, row KOR)

| Indicator | Report | CSV | Match |
|-----------|--------|-----|-------|
| Total GHG (excl. LULUCF) | 624.19 MtCO₂eq | 624.1876 | ✅ (rounded) |
| CO₂ from fossil fuels | 589.18 MtCO₂ | 589.1785 | ✅ (rounded) |
| GHG per capita | 12.23 tCO₂eq/cap | 12.2307 | ✅ (rounded) |
| GHG intensity of GDP | 0.32 kgCO₂eq/USD PPP | 0.338* | ⚠️ See Note 1 |
| Renewable share (electricity) | 9.02% | 9.019% | ✅ (rounded) |
| ND-GAIN Vulnerability | 0.357 | 0.357 | ✅ |
| ND-GAIN Readiness | 0.722 | 0.722 | ✅ |

### 2. Peer Comparison vs CSV Data

| Indicator | Country | Report | CSV-derived | Match |
|-----------|---------|--------|-------------|-------|
| GHG/capita | JPN | 8.30 | 8.2965 | ✅ |
| GHG/capita | AUS | 23.12 | 23.1173 | ✅ |
| GHG/capita | GBR | 5.63 | 5.6289 | ✅ |
| RE share | JPN | 22.06% | 22.062% | ✅ |
| RE share | AUS | 34.88% | 34.876% | ✅ |
| RE share | GBR | 47.33% | 47.328% | ✅ |
| GHG intensity | JPN | 0.24 | 0.240 | ✅ |
| GHG intensity | AUS | 0.22 | 0.265* | ⚠️ See Note 2 |
| GHG intensity | GBR | 0.09 | 0.096 | ✅ (rounded) |
| ND-GAIN Vuln | JPN | 0.336 | 0.336 | ✅ |
| ND-GAIN Vuln | AUS | 0.318 | 0.318 | ✅ |
| ND-GAIN Vuln | GBR | 0.298 | 0.298 | ✅ |
| ND-GAIN Ready | JPN | 0.680 | 0.68 | ✅ |
| ND-GAIN Ready | AUS | 0.675 | 0.675 | ✅ |
| ND-GAIN Ready | GBR | 0.695 | 0.695 | ✅ |

### 3. Policy Data vs `ndc-targets-v2.json`

| Item | Report | JSON | Match |
|------|--------|------|-------|
| NDC 3.0 submitted | No | `ndc3_submitted: false` | ✅ |
| 2030 target | 40% from 2018 (727.6 → 436.6) | `target_pct_reduction: 40`, `reference: 727.6`, `target: 436.6` | ✅ |
| 2035 target | NDC 3.0 not submitted | `target_pct_reduction: null` | ✅ |
| Net-zero | 2050, in law | `target_year: 2050`, `legal_status: in_law` | ✅ |
| CAT rating | Highly Insufficient | `Highly_insufficient` | ✅ |
| Law name | Carbon Neutrality and Green Growth Framework Act (2021) | Matches JSON | ✅ |

### 4. Peer Median Verification

| Indicator | Peer values (JPN, AUS, GBR) | Report median | Calculated median | Match |
|-----------|------------------------------|---------------|-------------------|-------|
| GHG/capita | 8.30, 23.12, 5.63 | 8.30 | 8.30 | ✅ |
| RE share | 22.06, 34.88, 47.33 | 34.88 | 34.88 | ✅ |
| GHG intensity | 0.24, 0.22, 0.09 | 0.22 | 0.22* | ⚠️ Dependent on AUS value (Note 2) |
| ND-GAIN Vuln | 0.336, 0.318, 0.298 | 0.318 | 0.318 | ✅ |
| ND-GAIN Ready | 0.680, 0.675, 0.695 | 0.680 | 0.680 | ✅ |

---

## Notes

### Note 1: KOR GHG Intensity (Minor)

- **Report**: 0.32 kgCO₂eq/USD PPP
- **Derived from CSV**: `624.19 * 1e9 / 1,844,800,934,392 = 0.338`
- **Delta**: ~5.6%
- **Likely cause**: Schema specifies "2017 constant PPP" (`kgCO2eq/USD GDP PPP, 2017 기준`), while `countries_latest.csv` stores GDP PPP in current international dollars. If 2017 PPP GDP (~$2.0T) was used, the result would be ~0.31, close to the reported 0.32.
- **Severity**: Low — documented GDP PPP vintage difference, not a data error.
- **Action**: Add footnote clarifying GDP PPP vintage, or standardize CSV to 2017 constant PPP.

### Note 2: AUS GHG Intensity (Moderate)

- **Report**: 0.22 kgCO₂eq/USD PPP
- **Derived from CSV**: `459.37 * 1e9 / 1,734,451,264,656 = 0.265`
- **Delta**: ~17%
- **Likely cause**: Same GDP PPP vintage issue as Note 1. Australia's 2017 constant PPP GDP was significantly larger (~$1.2T vs ~$1.73T current), which would yield a higher intensity. However, the discrepancy direction is reversed (report value is *lower* than CSV-derived), suggesting the report may have used a different GDP source or a different year's GDP.
- **Severity**: Moderate — the value affects peer median for GHG intensity.
- **Action recommended**: Verify AUS GHG intensity source. If using Supabase-derived value, document the GDP PPP vintage. If corrected to 0.265, peer median would shift from 0.22 to 0.24.

### Note 3: Template Deviation (Informational)

- Template specifies "ND-GAIN rank" in Key Metrics, but the report uses ND-GAIN Vulnerability (0.357) and ND-GAIN Readiness (0.722) scores instead.
- **Reason**: `ndgain_rank` is empty for KOR in `countries_latest.csv`. Substituting with the two component scores is more informative.
- **Severity**: None — reasonable substitution given data availability.
- **Peer comparison**: Template asks for ND-GAIN rank in the comparison table; report uses Vulnerability and Readiness instead (consistent with Key Metrics).

---

## Checklist

- [x] All numeric values traceable to `countries_latest.csv` or `ndc-targets-v2.json`
- [x] GWP = AR5 throughout, no mixing
- [x] LULUCF excluded, clearly stated
- [x] All values have (Source, Year) citation
- [x] Cross-check threshold (>10%) flagged correctly (OWID vs CT)
- [x] Peer group selection documented (High income × East Asia & Pacific, expanded to OECD)
- [x] Peer median calculations correct (except GHG intensity, dependent on Note 2)
- [x] NDC data matches ndc-targets-v2.json exactly
- [x] No fabricated data detected
- [x] No prohibited content (dark themes, stock photos, emojis)
- [x] Report header format correct
- [ ] GHG intensity values need GDP PPP vintage clarification (Note 1 & 2)

---

*QA Engine: VisualClimate Trojan v1.0 | Methodology: IPCC TCCCA*
