# Tableau 연결 설계도

## 데이터 소스 연결

### 소스 1: countries_latest.csv

- 경로: data/tableau/countries_latest.csv
- 연결: Text file (CSV)
- 갱신: Claude가 /country-brief 또는 /tableau-refresh 실행 시 자동 갱신
- 역할: 모든 대시보드의 기본 데이터

### 소스 2: timeseries.csv

- 경로: data/tableau/timeseries.csv
- 연결: Text file (CSV)
- 역할: 시계열 차트용

### 관계(Relationship)

- countries_latest.csv ↔ timeseries.csv: ISO3 = ISO3

## 대시보드 3종 설계

### Dashboard 1: Country Overview

- 용도: 단일 국가의 기후 현황 한눈에 보기
- 필터: 국가 선택 (Quick Filter, dropdown)
- 시트 구성:
  1. KPI 카드 4개 (총배출, 1인당, 재생에너지%, ND-GAIN 순위)
  2. 배출 추이 선 그래프 (timeseries, 최근 20년)
  3. 섹터별 파이/도넛 차트
  4. 에너지 믹스 수평 막대
  5. NDC 상태 텍스트 박스
- 크기: 1200 × 800

### Dashboard 2: Country Comparison

- 용도: 2-5개국 비교
- 필터: 파라미터 5개 (Country1~5)
- 시트 구성:
  1. 비교표 (Highlight Table)
  2. 범프 차트 (지표별 순위)
  3. 레이더/거미줄 차트 (다각형 — Tableau에서는 custom polygon)
  4. 1인당 배출 수평 막대 비교
- 크기: 1400 × 900

### Dashboard 3: NDC Gap Tracker

- 용도: NDC 목표 vs 실제 궤적 갭 시각화
- 필터: 국가 선택
- 시트 구성:
  1. 이중 축 선 차트: 실제 배출(실선) + 투영(점선) + 목표선(빨간 기준선)
  2. 갭 영역 (reference band or area between lines)
  3. 갭 등급 색상 KPI
  4. 연간 필요 감축률 막대
- 크기: 1200 × 700

## CSV 열 규격

### countries_latest.csv

```
ISO3,country_name,region,income_group,population,gdp_ppp,total_ghg,co2_fossil,ghg_per_capita,ghg_intensity,re_share_elec,fossil_share_pe,sector_energy_pct,sector_industry_pct,sector_agriculture_pct,sector_waste_pct,ghg_10yr_trend,ndgain_rank,ndgain_vuln,ndgain_ready,ndc30_submitted,nz_year,nz_legal,cat_rating,data_year,source_primary
```

### timeseries.csv

```
ISO3,country_name,year,indicator_code,value,unit,source
```

## Tableau 데이터 타입 매핑

| CSV 열 | Tableau 타입 | 역할 |
|---------|-------------|------|
| ISO3 | String (Dimension) | 조인 키, 필터 |
| country_name | String (Dimension) | 라벨 |
| region | String (Dimension) | 필터, 색상 |
| income_group | String (Dimension) | 필터, 색상 |
| year | Integer (Dimension) | 시간 축 |
| population | Number (Measure) | 계산 |
| total_ghg | Number (Measure) | 핵심 지표 |
| ndc30_submitted | Boolean (Dimension) | 색상/형태 |
| cat_rating | String (Dimension) | 색상 |
