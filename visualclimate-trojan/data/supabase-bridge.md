# Supabase Bridge — 기존 DB 연결 가이드

## 기존 Supabase 정보

- Project: VisualClimate (Climate-RAG-for-ALL 레포에서 생성)
- Tables: countries (250), indicators (67), country_data (172,121)
- Connection: .env의 SUPABASE_URL + SUPABASE_SERVICE_KEY

## 읽기 — 기존 데이터 가져오기

### 국가 메타데이터

```sql
SELECT iso3, name, region, sub_region, income_group, population
FROM countries
ORDER BY name;
```

### 특정 국가의 모든 지표 (최신 연도)

```sql
SELECT cd.indicator_code, cd.year, cd.value, cd.source, i.name, i.unit
FROM country_data cd
JOIN indicators i ON cd.indicator_code = i.code
WHERE cd.country_iso3 = '{ISO3}'
  AND cd.year = (
    SELECT MAX(year) FROM country_data
    WHERE country_iso3 = cd.country_iso3
      AND indicator_code = cd.indicator_code
  )
ORDER BY i.category, i.code;
```

### 시계열 (특정 국가 + 특정 지표)

```sql
SELECT year, value, source
FROM country_data
WHERE country_iso3 = '{ISO3}'
  AND indicator_code = '{CODE}'
ORDER BY year;
```

## schema.json 지표와 Supabase 코드 매핑

| schema indicator | supabase_code | 변환 |
|-----------------|---------------|------|
| total_ghg_excl_lulucf | WB.EN.ATM.GHGT.KT.CE | ÷1000 (kt→Mt) |
| co2_fossil | WB.EN.ATM.CO2E.KT | ÷1000 (kt→Mt) |
| ghg_per_capita | WB.EN.ATM.CO2E.PC | CO2 only, not full GHG |
| population | WB.SP.POP.TOTL | 직접 사용 |
| gdp_ppp | WB.NY.GDP.MKTP.PP.CD | 직접 사용 |
| renewable_share | WB.EG.FEC.RNEW.ZS | Final energy, not elec |
| ndgain_rank | NDGAIN.RANK | 직접 사용 |
| ndgain_vulnerability | NDGAIN.VULNERABILITY | 직접 사용 |
| ndgain_readiness | NDGAIN.READINESS | 직접 사용 |
| sector_* | CTRACE.* | 직접 사용 |

## 쓰기 — 새 데이터 추가

### 새 지표 등록 (indicators 테이블)

```sql
INSERT INTO indicators (source, code, name, unit, category, domain)
VALUES
  ('EDGAR', 'EDGAR.GHG.TOTAL', 'Total GHG excl. LULUCF (EDGAR)', 'MtCO2eq', 'emissions', 'emissions'),
  ('EDGAR', 'EDGAR.CH4.TOTAL', 'Total CH4 (EDGAR)', 'MtCO2eq', 'emissions', 'emissions'),
  ('IRENA', 'IRENA.RE.CAPACITY', 'Renewable energy capacity', 'GW', 'energy', 'energy'),
  ('IRENA', 'IRENA.RE.SHARE.ELEC', 'RE share of electricity', '%', 'energy', 'energy'),
  ('CAT', 'CAT.RATING', 'CAT overall rating', 'text', 'policy', 'policy'),
  ('NETZERO', 'NETZERO.YEAR', 'Net-zero target year', 'year', 'policy', 'policy'),
  ('NDC', 'NDC.3.SUBMITTED', 'NDC 3.0 submitted', 'boolean', 'policy', 'policy')
ON CONFLICT (code) DO NOTHING;
```

### 데이터 추가 (country_data 테이블)

```sql
INSERT INTO country_data (country_iso3, indicator_code, year, value, source)
VALUES ('{ISO3}', '{CODE}', {YEAR}, {VALUE}, '{SOURCE}')
ON CONFLICT DO NOTHING;
```

## 주의사항

- 기존 테이블 구조 절대 변경 금지
- 기존 indicator_code 절대 변경 금지
- INSERT만 허용, UPDATE/DELETE는 명시적 승인 후에만
- 새 indicator_code는 반드시 EDGAR.*, IRENA.*, CAT.*, NETZERO.*, NDC.* 패턴
