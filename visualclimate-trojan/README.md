# VisualClimate Trojan

Climate data analysis, report generation, and content engine for [VisualClimate](https://visualclimate.org).

## What This Does

- Reads from existing Supabase (172,121 rows, 250 countries, 61 indicators)
- Adds new data sources (EDGAR, IRENA, CAT, Net Zero Tracker)
- Generates 3 types of climate briefs (Country, Comparison, NDC Gap)
- Designs Tableau dashboard specifications
- Transforms reports into LinkedIn content
- Quality-checks everything before publishing

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/HarimJung/visualclimate-trojan.git
cd visualclimate-trojan
npm install

# 2. Configure environment
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY

# 3. Pull existing data from Supabase
npm run pull                    # All 250 countries (latest values)
npm run pull:country -- KOR     # Single country (full timeseries)

# 4. Start Claude Code
claude
# Claude reads CLAUDE.md automatically

# 5. Generate your first brief
/country-brief KOR

# 6. Quality check
/qa output/KOR-country-brief-2026-04-07.md

# 7. Make LinkedIn content
/repurpose output/KOR-country-brief-2026-04-07.md linkedin-carousel

# 8. Get Tableau specs
/tableau-spec country-overview
```

## Adding New Data

```bash
# Register new indicator codes (EDGAR, IRENA, CAT, etc.)
npm run push:indicators

# Push CSV data to Supabase
# CSV format: ISO3,indicator_code,year,value,source
npm run push:data -- path/to/data.csv
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for full system diagram.

```
Layer 3 — Output: 3 briefs, 3 Tableau dashboards, LinkedIn content
Layer 2 — 10 Claude Skills: Interpret(4) + Generate(3) + Verify(1) + Transform(1) + Tableau(1)
Layer 1 — Foundation: CLAUDE.md, schema.json, source-registry.json, brand-config.md
```

## Skills (10)

| Group | Skill | Trigger |
|-------|-------|---------|
| A: Data Interpretation | schema-explainer | /explain-schema |
| A: Data Interpretation | source-comparator | /compare-sources {topic} |
| A: Data Interpretation | data-quality-checker | /check-quality |
| A: Data Interpretation | indicator-definer | /define {terms} |
| B: Report Generation | country-brief | /country-brief {ISO3} |
| B: Report Generation | comparison-brief | /compare-countries {ISO3s} |
| B: Report Generation | ndc-gap-brief | /ndc-gap {ISO3} |
| C: Verification | qa-checker | /qa {path} |
| D: Content | content-repurposer | /repurpose {path} {format} |
| E: Tableau | tableau-spec-writer | /tableau-spec {type} |

## Data Sources

| Source | Coverage | Supabase Prefix |
|--------|----------|-----------------|
| World Bank WDI | 266 countries, 1960-2024 | WB.* |
| EDGAR | 220 countries, 1970-2024 | EDGAR.* |
| Climate TRACE | 250 countries, 2015-2025 | CTRACE.* |
| Our World in Data | 200 countries, 1750-2024 | OWID.* |
| Ember | 215 countries, 2000-2025 | EMBER.* |
| IRENA | 200 countries, 2000-2024 | IRENA.* |
| ND-GAIN | 181 countries, 1995-2022 | NDGAIN.* |
| Climate Watch | 194 countries | NDC.* |

## File Structure

```
visualclimate-trojan/
├── CLAUDE.md                    # Master rules engine
├── data/
│   ├── schema.json              # 23 indicator definitions
│   ├── source-registry.json     # 8 data source metadata
│   ├── citations.json           # Key reference citations
│   ├── ndc-targets-v2.json      # NDC targets for 20 countries
│   ├── supabase-bridge.md       # Supabase connection guide
│   └── tableau/
│       ├── countries_latest.csv  # Tableau feed (latest)
│       ├── timeseries.csv        # Tableau feed (timeseries)
│       ├── tableau-setup.md      # Tableau connection guide
│       └── calculated-fields.md  # Tableau calc fields
├── .claude/
│   ├── skills/ (10 SKILL.md)    # Claude skill definitions
│   └── agents/engine-director.md # Master orchestrator
├── templates/ (5 templates)      # Report templates
├── output/                       # Generated reports
├── scripts/
│   ├── pull-from-supabase.ts    # ETL: Supabase → CSV
│   └── push-to-supabase.ts     # ETL: CSV → Supabase
├── docs/                        # Architecture docs
├── brand-config.md              # Brand colors/fonts
├── .env.example                 # Environment template
└── package.json                 # Dependencies
```

## Claude vs Tableau

| Claude | Tableau |
|--------|---------|
| Data collection/ETL | Chart rendering |
| Indicator calculation | Dashboard layout |
| Text analysis/interpretation | Interactive filters |
| Report generation (Markdown) | Map visualization |
| QA verification | Timeseries/comparison charts |
| Content transformation | PDF export |
| Tableau formula design | Formula execution |
| CSV generation | CSV reading |

See [docs/claude-vs-tableau.md](docs/claude-vs-tableau.md) for details.
