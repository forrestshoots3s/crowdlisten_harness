---
name: crowdlisten:competitive-analysis
description: Competitive intelligence through audience perception analysis. Use when comparing brands, products, or competitors in social conversations. Requires CROWDLISTEN_API_KEY.
user-invocable: true
allowed-tools: Bash, Read, Write, WebFetch, Grep
---

# Competitive Analysis

See your market through your audience's eyes using CrowdListen audience intelligence.

Consolidates: competitive-intel, product-signals (competitive gap analysis)

## Before You Start

Ask your human for business context — this skill produces significantly better output when grounded in specifics:

- **Target market**: Who are the customers? What industry/segment?
- **Key competitors**: Which brands or products to compare against?
- **Constraints**: Budget, timeline, geographic focus?
- **Decision context**: What decisions will this analysis inform? (roadmap, funding, positioning, hiring?)
- **Existing data**: Any prior research, internal metrics, or hypotheses to validate?

## When to Use This Skill

- Competitive analysis and positioning strategy
- Market entry and competitive landscape assessment
- Tracking competitor perception changes over time
- Identifying underserved market segments
- Competitive feature gap identification
- Preparing for fundraising, board meetings, or strategic reviews

## Foundation: CrowdListen Tools

This skill builds on CrowdListen's core capabilities:
- `search_content` — Find discussions mentioning competitors
- `analyze_content` — Extract sentiment and themes per competitor
- `cluster_opinions` — Group competitive comparisons by theme
- `cross_platform_synthesis` — Compare perception across platforms
- `sentiment_evolution_tracker` — Track competitive sentiment shifts

## Workflows

### 1. Share of Voice Analysis

Measure how much your audience talks about each competitor.

**Process**:
1. Search for each competitor name + product category keywords
2. Count mentions, normalize by platform (Reddit, Twitter, YouTube, TikTok)
3. Calculate share of voice = competitor_mentions / total_category_mentions
4. Track week-over-week changes

**Output Template**:
```markdown
## Share of Voice Report — [Category]
**Period**: [date range]

| Brand | Mentions | Share of Voice | Sentiment | WoW Change |
|-------|----------|---------------|-----------|------------|
| [Brand A] | [count] | [%] | [+/-/neutral] | [+/- %] |

### Key Findings
- [Brand] dominates conversation because [reason with evidence]
- [Your brand] is [underrepresented/overrepresented] in [platform]
```

### 2. Sentiment Comparison

Side-by-side sentiment analysis across competitors.

**Process**:
1. Analyze sentiment for each competitor across same time period
2. Break down by dimension: product quality, pricing, support, innovation, reliability
3. Identify sentiment drivers (what causes positive/negative perception)

**Output Template**:
```markdown
## Competitive Sentiment Matrix

| Dimension | Your Brand | Competitor A | Competitor B | Leader |
|-----------|-----------|-------------|-------------|--------|
| Product Quality | [score] | [score] | [score] | [who] |
| Pricing | [score] | [score] | [score] | [who] |

### Sentiment Drivers
**What makes [leader] win on [dimension]**:
- [Evidence from social discussions]
- > "[User quote]"
```

### 3. Switching Intent Detection

Identify users actively considering switching between products.

**Process**:
1. Search for "switching from [competitor]", "alternative to [competitor]", "[competitor] vs [competitor]"
2. Analyze the reasons driving consideration
3. Score switching intent: researching → evaluating → decided
4. Identify which direction switching flows (from whom → to whom)

**Output Template**:
```markdown
## Switching Intent Report

### Flow Map
[Competitor A] ──(X users)──> [Competitor B]
[Your Brand]   ──(Z users)──> [Competitor C]

### Why Users Leave [Competitor]
| Reason | Frequency | Intensity | Where They Go |
|--------|-----------|-----------|---------------|
| [Reason] | [count] | [high/med/low] | [destination] |
```

### 4. White Space Identification

Find unmet needs that no competitor addresses.

**Process**:
1. Collect all feature requests, wishlists, and complaints across all competitors
2. Remove features that any existing player already offers
3. Rank remaining needs by demand strength
4. Assess feasibility and strategic fit

**Output Template**:
```markdown
## White Space Opportunities

| Opportunity | Demand Signal | Nearest Competitor | Gap Size | Strategic Fit |
|-------------|--------------|-------------------|----------|---------------|
| [Need] | [evidence] | [who comes closest] | [Large/Medium] | [High/Med/Low] |

### Top White Space: [Opportunity Name]
**What the audience wants**: [synthesis]
**Your path to capture**: [strategic recommendation]
**Evidence base**: [X discussions, Y platforms, Z sentiment score]
```

### 5. Competitive Feature Gap Analysis

Identify what users want from competitors but can't get.

**Process**:
1. Search for "[competitor] missing/lacks/wish/doesn't have"
2. Cross-reference with your own product's capabilities
3. Identify opportunities where you can fill the gap

**Output Template**:
```markdown
## Competitive Gap Opportunities

| Gap | Competitor | User Demand | Your Position | Opportunity |
|-----|-----------|-------------|---------------|-------------|
| [Missing feature] | [Competitor] | [High/Med/Low] | [Have/Partial/Don't have] | [Build/Promote/Ignore] |

### Top Opportunity: [Gap Name]
- **What users are saying**: [synthesis of complaints about competitor]
- **Your advantage**: [why you can/should build this]
```

## Integration with CrowdListen

This skill enhances CrowdListen analyses by:
- Adding competitive context to every audience analysis
- Tracking competitive dynamics over time
- Identifying strategic opportunities from audience perception data
- Providing investor-ready competitive intelligence
- Enabling proactive competitive strategy based on real audience signals
