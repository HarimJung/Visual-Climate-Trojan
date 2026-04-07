# Tableau Calculated Fields 전체 목록

## 파생 지표 (Calculated Fields)

### CF01: GHG Per Capita

```
[total_ghg] * 1000000 / [population]
```

- 단위: tCO2eq/capita
- 용도: KPI 카드, 비교 막대, 스캐터

### CF02: GHG Intensity of GDP

```
[total_ghg] * 1000000000 / [gdp_ppp]
```

- 단위: kgCO2eq/USD PPP
- 용도: 효율성 비교

### CF03: GHG Trend Category

```
IF [ghg_10yr_trend] < -10 THEN "Rapid Decline"
ELSEIF [ghg_10yr_trend] < 0 THEN "Declining"
ELSEIF [ghg_10yr_trend] < 5 THEN "Stagnant"
ELSEIF [ghg_10yr_trend] < 20 THEN "Rising"
ELSE "Rapid Rise"
END
```

- 용도: 색상 인코딩, 필터

### CF04: NDC Gap (2030)

```
// timeseries에서 투영값 필요 — country_latest의 ndc_2030_target과 비교
// 이 필드는 NDC Gap Dashboard 전용
[projected_2030] - [ndc_2030_target]
```

### CF05: NDC Gap Severity

```
IF [CF04: NDC Gap (2030)] <= 0 THEN "On Track"
ELSEIF [CF04: NDC Gap (2030)] / [ndc_2030_target] < 0.1 THEN "Narrow Gap"
ELSEIF [CF04: NDC Gap (2030)] / [ndc_2030_target] < 0.3 THEN "Significant Gap"
ELSE "Critical Gap"
END
```

- 색상: On Track=#00A67E, Narrow=#F59E0B, Significant=#E5484D, Critical=#7F1D1D

### CF06: Peer Group Median (GHG Per Capita)

```
// LOD 표현식
{ FIXED [income_group], [region] : MEDIAN([CF01: GHG Per Capita]) }
```

- 용도: Country Brief의 동료 비교

### CF07: Deviation from Peer Median

```
[CF01: GHG Per Capita] - [CF06: Peer Group Median (GHG Per Capita)]
```

- 양수 = 동료 그룹보다 높은 배출 (주의점)
- 음수 = 동료 그룹보다 낮은 배출 (강점)

### CF08: Net Zero Countdown

```
[nz_year] - YEAR(TODAY())
```

- 용도: "X년 남음" 표시

### CF09: RE Share Category

```
IF [re_share_elec] >= 80 THEN "RE Leader (80%+)"
ELSEIF [re_share_elec] >= 50 THEN "Majority RE (50-79%)"
ELSEIF [re_share_elec] >= 25 THEN "Growing RE (25-49%)"
ELSE "Fossil Dominant (<25%)"
END
```

### CF10: CAT Rating Color

```
CASE [cat_rating]
  WHEN "1.5C_compatible" THEN "#00A67E"
  WHEN "Almost_sufficient" THEN "#8BC34A"
  WHEN "Insufficient" THEN "#F59E0B"
  WHEN "Highly_insufficient" THEN "#E5484D"
  WHEN "Critically_insufficient" THEN "#7F1D1D"
  ELSE "#CCCCCC"
END
```

## 색상 팔레트 (brand-config.md 참조)

| 용도 | 색상 |
|------|------|
| Changer | #00A67E |
| Starter | #F59E0B |
| Talker | #E5484D |
| Primary | #0066FF |
| On Track | #00A67E |
| Narrow Gap | #F59E0B |
| Significant Gap | #E5484D |
| Critical Gap | #7F1D1D |
| Data Missing | #CCCCCC |

## 대시보드별 사용 필드

### Dashboard 1: Country Overview

- CF01 (GHG/capita), CF03 (Trend Category), CF08 (NZ Countdown), CF09 (RE Category)

### Dashboard 2: Country Comparison

- CF01, CF02, CF06, CF07, CF09, CF10

### Dashboard 3: NDC Gap Tracker

- CF04, CF05, CF08
