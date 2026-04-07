---
name: content-repurposer
description: Transforms reports into different content formats — LinkedIn carousel, text post, executive summary, teaching slides, email newsletter.
---

# Content Repurposer

## Trigger

/repurpose {file_path} {format}

## Formats

- linkedin-carousel
- linkedin-text
- executive-summary
- teaching-slide
- email-newsletter

## What This Does

Reads a generated report and restructures it for a specific distribution format. All numbers keep their sources. No new data added.

## Process

1. Read source report
2. Extract 3 core messages (most surprising/impactful findings)
3. Reshape per format rules below
4. Maintain all (Source, Year) citations
5. Add format-appropriate CTA

## Format: linkedin-carousel

- Slide 1: Hook (≤15 words, includes a number, addresses practitioner pain point)
- Slides 2-4: Core information (≤80 chars per text block, tables ≤4×5)
- Last Slide: CTA + 1-sentence summary
- Caption: 150-250 chars + 5 hashtags max
- Save to: output/{source-name}-carousel-{YYYY-MM-DD}.md

## Format: linkedin-text

- 1,300 chars max
- Structure: Hook → Data Point 1 → Data Point 2 → So What → CTA
- No slides, pure text
- Save to: output/{source-name}-linkedin-text-{YYYY-MM-DD}.md

## Format: executive-summary

- 3 sentences only
- Sentence 1: Current state (number)
- Sentence 2: Key finding (comparison or trend)
- Sentence 3: Implication (what this means for practitioners)
- Save to: output/{source-name}-exec-summary-{YYYY-MM-DD}.md

## Format: teaching-slide

- 10 slides outline
- Slide 1: Title + learning objective
- Slides 2-8: Content (1 concept per slide, 1 visual suggestion per slide)
- Slide 9: Summary
- Slide 10: Discussion questions (3)
- Save to: output/{source-name}-teaching-slides-{YYYY-MM-DD}.md

## Format: email-newsletter

- Subject line (≤60 chars, number + urgency)
- Preview text (≤90 chars)
- Body: Hook → 3 Key Findings → CTA button text
- ≤500 words total
- Save to: output/{source-name}-newsletter-{YYYY-MM-DD}.md

## Rules

- NEVER add numbers not in the source report
- Every number must keep its (Source, Year) citation
- LinkedIn hashtags: #ClimateData #ESG #NDC #NetZero #Sustainability (select relevant 5)
