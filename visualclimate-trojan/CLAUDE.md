# VisualClimate Trojan — CLAUDE.md v1.0 | 2026-04-07
# 이 파일이 프로젝트 내 모든 다른 문서보다 우선합니다.

## 이 프로젝트의 정체

VisualClimate(visualclimate.org)의 데이터 분석·보고서·콘텐츠 엔진.
기존 레포(Climate-RAG-for-ALL)는 웹앱 프론트엔드(Next.js + D3).
이 레포는 그 웹앱의 Supabase 데이터를 읽고, 새 데이터를 추가하고,
보고서를 자동 생성하고, Tableau 대시보드 설계도를 만들고,
LinkedIn 콘텐츠를 뽑아내는 백엔드 엔진.

## 아키텍처 3층 구조

```
Layer 3 — 출력물: 보고서 3종, Tableau 대시보드 3종, LinkedIn 콘텐츠
Layer 2 — Claude 스킬 10개: 해석4 + 생성3 + 검증1 + 변환1 + Tableau1
Layer 1 — 기반 자산: 이 파일, schema.json, source-registry.json, brand-config.md
```

## 데이터 소스 현황

- **기존 Supabase**: 172,121행 | 250국 | 61 지표 | 소스 6개
  - DB: countries(250), indicators(67), country_data(172,121)
  - 접속: .env의 SUPABASE_URL, SUPABASE_SERVICE_KEY
- **기존 레포 data/**: owid-energy-data.csv(9MB), ember-electricity.json(6국),
  climate-trace-ghg.json(6국), ndgain-scores.json, ndc-targets.json(20국, 2030만)
- **기존 레포 public/data/**: kaya/{ISO3}.json(68국), ndc-gap/{ISO3}.json(204국),
  risk-profile-{ISO3}.json(6국만)
- **이 레포에서 추가**: EDGAR, IRENA, NDC 3.0(2035), CAT ratings, Net Zero Tracker

## 기존 Supabase indicator_code 패턴 (반드시 참조)

- WB.* — World Bank WDI (경제, 인구, CO2)
- EMBER.* — Ember 전력 데이터
- OWID.* — Our World in Data 에너지
- NDGAIN.* — ND-GAIN 취약성/준비도
- CTRACE.* — Climate TRACE 부문별 배출 (POWER, TRANSPORTATION 등 9개)
- DERIVED.* — 파생 지표 (CO2_PER_GDP, ENERGY_TRANSITION 등)

Supabase에 새 지표 추가 시 이 패턴을 따를 것.
신규 패턴: EDGAR.*, IRENA.*, NDC.*, CAT.*, NETZERO.*

## 데이터 규칙 (모든 작업에 적용)

### 단위 표준

| 지표 유형 | 단위 | 비고 |
|-----------|------|------|
| GHG 총배출 | MtCO₂eq | 국가 수준 |
| 1인당 배출 | tCO₂eq/capita | |
| 배출 원단위 | kgCO₂eq/USD GDP PPP | 2017 기준 |
| 발전량 | TWh | |
| 1차 에너지 | EJ | |
| 설비 용량 | GW | |
| 재생에너지 비중 | % of total electricity generation | |

### GWP 기준

- 기본: IPCC AR5 (CH₄=28, N₂O=265)
- AR6 소스 → AR5 변환 + 각주 (CH₄: ×28/27.9)
- AR4 이하 → 원본값과 AR5 환산값 병기
- ⚠️ 보고서 내 AR4/AR5/AR6 혼용 절대 금지

### LULUCF

- 기본: 제외 (excluding LULUCF)
- 포함 시 "(incl. LULUCF)" 반드시 명시
- 같은 표에서 포함/제외 혼용 금지

### 출처 표기

- 모든 수치에 (소스명, 연도) 필수
- URL은 데이터 다운로드 직접 페이지
- 형식: (EDGAR 2025, Crippa et al.) 또는 (OWID, GCP 2025)

### 환각 방지

- ⚠️ data/ 또는 Supabase에 없는 수치 → 절대 생성 금지
- 모르면 [DATA MISSING] 표시
- 추정치 → "⚠️ 추정치" + 추정 방법 명시
- "약", "대략", "~" 최소화. 정확한 수치 우선.

### 비교 규칙

- 동일 소스, 동일 GWP, 동일 연도 강제
- 소스 간 수치 차이 > 10% → ⚠️ + 차이 원인 각주

## 보고서 출력 규칙

- 상단 필수: 국가명(영문+한국어), ISO3, Data vintage, Generated date
- templates/ 폴더의 템플릿 반드시 사용
- 출력 경로: output/{ISO3}-{report-type}-{YYYY-MM-DD}.md

## Tableau 연동 규칙

- Claude가 만드는 CSV: data/tableau/countries_latest.csv, timeseries.csv
- 열 이름 고정: ISO3, country_name, year, indicator_code, value, unit, source
- Tableau 계산 필드 설계: data/tableau/calculated-fields.md에 문서화
- 새 대시보드 설계 시: templates/tableau-dashboard-spec.md 템플릿 사용

## Claude가 하는 일 vs Tableau가 하는 일

| Claude | Tableau |
|--------|---------|
| 데이터 수집/정제 (ETL) | 차트 렌더링 |
| 지표 계산/파생 | 대시보드 레이아웃 |
| 텍스트 분석/해석 | 인터랙티브 필터 |
| 보고서 마크다운 생성 | 지도 시각화 |
| QA 검증 | 시계열/비교 차트 |
| 콘텐츠 변환 | PDF 내보내기 |
| Tableau 계산식 설계 | 계산식 실행 |
| CSV 생성 (data/tableau/) | CSV 읽기 (데이터 소스) |

## 프로젝트 파일 맵

| 작업 | 경로 |
|------|------|
| 기반 자산 | CLAUDE.md, data/schema.json, data/source-registry.json |
| 스킬 | .claude/skills/{name}/SKILL.md (10개) |
| 에이전트 | .claude/agents/engine-director.md |
| 보고서 템플릿 | templates/ (5개) |
| 생성된 출력물 | output/ |
| Tableau 피드 | data/tableau/ |
| Supabase 연동 | scripts/pull-from-supabase.ts, push-to-supabase.ts |
| 브랜드 | brand-config.md |
| 문서 | docs/ |

## 금지사항

- 다크 테마/배경 금지 (기존 레포 디자인 시스템 유지)
- data/ 또는 Supabase에 없는 수치 생성 금지
- source-registry.json에 없는 소스 임의 인용 금지
- schema.json에 정의되지 않은 지표를 보고서에 넣지 않음
- 기존 Supabase 테이블 구조(countries, indicators, country_data) 변경 금지
- 기존 indicator_code 패턴 변경 금지 (신규 추가만 허용)

## 토큰 최적화

1. 이 파일의 "프로젝트 파일 맵"을 먼저 확인
2. schema.json → source-registry.json → 해당 국가 데이터 순으로 로드
3. 보고서 생성 시 템플릿 먼저 읽고, 데이터 채우기
4. QA는 보고서 생성 직후 반드시 실행
