# VisualClimate Trojan — System Architecture

## 두 레포 관계

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ Climate-RAG-for-ALL          │    │ visualclimate-trojan         │
│ (웹앱 프론트엔드)              │    │ (분석·보고서·콘텐츠 엔진)      │
│                              │    │                              │
│ Next.js + D3 + Vercel        │    │ Claude Code + Tableau        │
│ visualclimate.org            │    │ reports + dashboards         │
│                              │    │                              │
│ Supabase ←── READ ──→        │←──→│ READ + WRITE                 │
│ 172,121 rows                 │    │ +EDGAR, IRENA, NDC3.0        │
│ 250 countries                │    │ +CAT, Net Zero Tracker       │
│ 61 indicators                │    │                              │
└──────────────────────────────┘    └──────────────────────────────┘
         │                                    │
         ↓                                    ↓
   웹 대시보드                          보고서 3종 (MD/PDF)
   D3 차트                              Tableau 대시보드 3종
   포스터 PNG                           LinkedIn 콘텐츠
                                        교육용 슬라이드
                                        이메일 뉴스레터
```

## 데이터 흐름

```
Supabase (172,121행)
        ↓ pull-from-supabase.ts
data/tableau/countries_latest.csv + timeseries.csv
        ↓
Claude Skills (country-brief, comparison, ndc-gap)
        ↓
output/*.md (보고서)
        ↓ qa-checker
output/*.md (검증됨)
        ↓ content-repurposer
output/*-carousel.md, *-linkedin.md, etc.

동시에:
data/tableau/*.csv → Tableau Desktop → 대시보드 3종
tableau-spec-writer → 대시보드 설계도 → Harim이 Tableau에서 구현
```

## Layer 구조

| Layer | 구성 요소 | 역할 |
|-------|----------|------|
| Layer 1: 기반 자산 | CLAUDE.md, schema.json, source-registry.json, citations.json, brand-config.md | 모든 작업의 규칙과 데이터 정의 |
| Layer 2: Claude 스킬 | 10개 스킬 (A1-A4, B1-B3, C1, D1, E1) | 데이터를 분석하고 보고서를 생성 |
| Layer 3: 출력물 | 보고서 3종, Tableau 3종, LinkedIn 콘텐츠 | 사용자에게 전달되는 최종 결과물 |

## 스킬 분류

### A: Data Interpretation (해석)

- A1: schema-explainer — 새 데이터셋 컬럼을 스키마에 매핑
- A2: source-comparator — 소스 간 비교 분석
- A3: data-quality-checker — IPCC TCCCA 기준 품질 검증
- A4: indicator-definer — 기후 지표 정의 + 비교

### B: Report Generation (생성)

- B1: country-brief — 국가별 기후 브리프 (핵심 제품)
- B2: comparison-brief — 2-5개국 비교 브리프
- B3: ndc-gap-brief — NDC 갭 분석 브리프

### C: Verification (검증)

- C1: qa-checker — 생성된 보고서 품질 검증

### D: Content (변환)

- D1: content-repurposer — 보고서 → LinkedIn/슬라이드/뉴스레터 변환

### E: Tableau (시각화 설계)

- E1: tableau-spec-writer — Tableau 대시보드 설계도 생성
