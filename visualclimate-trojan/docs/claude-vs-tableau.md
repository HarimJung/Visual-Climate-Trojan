# Claude vs Tableau — 역할 분리 명세

## 원칙

Claude는 텍스트·분석·판단을 한다. Tableau는 시각화를 한다.
둘 사이의 데이터 교환은 CSV(data/tableau/)로만 이루어진다.

## Claude가 하는 일

| 영역 | 구체적 작업 | 스킬 |
|------|------------|------|
| 데이터 수집 | Supabase 쿼리, API 호출, CSV 다운로드 | pull-from-supabase.ts |
| 데이터 정제 | 단위 변환, GWP 변환, 결측 처리 | data-quality-checker |
| 데이터 해석 | 스키마 매핑, 소스 비교, 용어 정의 | schema-explainer, source-comparator, indicator-definer |
| 분석 | 추세 계산, 갭 분석, 동료 비교 | country-brief, ndc-gap-brief |
| 보고서 생성 | 마크다운 보고서 작성 | country-brief, comparison-brief, ndc-gap-brief |
| 검증 | 사실 확인, 단위 일관성, 출처 검증 | qa-checker |
| 콘텐츠 변환 | 캐러셀, 텍스트 포스트, 슬라이드 | content-repurposer |
| Tableau 설계 | 대시보드 스펙, 계산식 설계 | tableau-spec-writer |
| CSV 생성 | countries_latest.csv, timeseries.csv | scripts, country-brief |

## Tableau가 하는 일

| 영역 | 구체적 작업 | 입력 |
|------|------------|------|
| CSV 읽기 | data/tableau/*.csv 연결 | Claude가 생성한 CSV |
| 차트 렌더링 | 선, 막대, 파이, 지도, 스캐터 | CSV 데이터 |
| 계산 필드 실행 | calculated-fields.md의 공식 | Claude가 설계한 공식 |
| 대시보드 레이아웃 | 시트 배치, 필터, 파라미터 | Claude의 tableau-spec |
| 인터랙티브 | 필터 액션, 하이라이트, 툴팁 | tableau-spec |
| 내보내기 | PDF, 이미지, Tableau Public | 완성된 대시보드 |

## Claude가 절대 하지 않는 것

- 차트 이미지 직접 생성 (Tableau가 함)
- 대시보드 레이아웃 직접 구현 (설계만 함)
- Tableau 파일(.twbx) 직접 수정

## Tableau가 절대 하지 않는 것

- 데이터 수집/ETL (Claude/스크립트가 함)
- 텍스트 분석/보고서 작성 (Claude가 함)
- 데이터 품질 검증 (Claude가 함)
- 콘텐츠 변환 (Claude가 함)

## 연결 지점 (CSV 규격)

Claude가 이 CSV를 만든다 → Tableau가 이 CSV를 읽는다

- data/tableau/countries_latest.csv: 250행 × 25열 (최신 값)
- data/tableau/timeseries.csv: N행 × 7열 (연도별)
- 열 이름은 schema.json의 tableau_field 값 사용
