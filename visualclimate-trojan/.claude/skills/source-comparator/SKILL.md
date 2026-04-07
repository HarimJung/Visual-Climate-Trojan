---
name: source-comparator
description: Compares 2-4 climate data sources on a topic using source-registry.json metadata. Produces comparison table + practical recommendations.
---

# Source Comparator

## Trigger

/compare-sources {topic}

## What This Does

For a given topic (e.g., "GHG emissions", "renewable energy", "vulnerability"), pulls relevant sources from data/source-registry.json and produces a structured comparison.

## Input

Topic keyword: "GHG emissions", "energy", "vulnerability", "NDC policy", etc.

## Process

1. Load data/source-registry.json
2. Filter sources relevant to topic
3. For each source, extract these 17 fields:
   full_name, publisher, url_data, underlying_sources (if secondary),
   methodology, gwp, gases, sectors, coverage_countries, coverage_years,
   time_resolution, spatial_resolution, update_frequency, format,
   license, strengths, limitations
4. Generate comparison table (sources × key fields)
5. Explain WHY numbers differ between sources (methodology, scope, GWP)
6. Recommend: which source for which use case

## Output Format

### Source Cards

**{Source 1 Name}**

| Field | Detail |
|-------|--------|
| Publisher | {publisher} |
| URL | {url_data} |
... (all 17 fields)

### Comparison Table

| Field | {Source1} | {Source2} | {Source3} |
|-------|-----------|-----------|-----------|
| Countries | ... | ... | ... |
... (key differentiators)

### Why Numbers Differ

{1 paragraph explaining methodology/scope/GWP differences}

### Practical Recommendation

- For NDC reporting: use {X} because...
- For ESG disclosure: use {Y} because...
- For academic research: use {Z} because...

## Rules

- ONLY use sources from data/source-registry.json — never invent sources
- All URLs must be direct data download pages, not homepages
- If a field is unknown, mark as "⚠️ Verify at {url}"
