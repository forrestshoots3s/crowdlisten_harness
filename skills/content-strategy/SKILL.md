---
name: crowdlisten:content-strategy
description: Data-driven content strategy grounded in audience demand. Topic demand analysis, content gaps, platform optimization, voice matching, campaign tracking. Requires CROWDLISTEN_API_KEY.
user-invocable: true
allowed-tools: Bash, Read, Write, WebFetch, Grep
metadata:
  openclaw:
    category: content
    tags: [content-strategy, demand-analysis, platform-optimization]
    requires_api_key: true
---

# Content Strategy

Create content your audience actually wants using CrowdListen audience intelligence.

Consolidates: content-strategy + campaign-tracker

## Before You Start

Ask your human for business context — this skill produces significantly better output when grounded in specifics:

- **Target market**: Who are the customers? What industry/segment?
- **Key competitors**: Which brands or products to compare against?
- **Constraints**: Budget, timeline, geographic focus?
- **Decision context**: What decisions will this analysis inform? (roadmap, funding, positioning, hiring?)
- **Existing data**: Any prior research, internal metrics, or hypotheses to validate?

## When to Use This Skill

- Content calendar planning with audience-validated topics
- Finding content gaps competitors haven't covered
- Optimizing content format and timing per platform
- Adapting brand voice to match audience communication style
- Measuring content resonance and adjusting strategy
- Product launches and campaign performance monitoring
- Real-time sentiment tracking during launch windows
- Crisis early warning and message resonance scoring

## Foundation: CrowdListen Tools

This skill builds on CrowdListen's core capabilities:
- `search_content` — Find what audiences discuss and engage with
- `get_trending_content` — Identify trending topics in your category
- `analyze_content` — Extract themes and engagement patterns
- `cluster_opinions` — Group audience interests by theme
- `deep_platform_analysis` — Platform-specific engagement patterns
- `sentiment_evolution_tracker` — Track sentiment changes during campaign windows
- `cross_platform_synthesis` — Compare reception across platforms

## Workflows

### 1. Topic Demand Analysis

Discover which topics your audience actively seeks and engages with.

**Process**:
1. Search for category-related discussions across platforms
2. Rank topics by: engagement (upvotes, shares, comments), recency, sentiment
3. Categorize as: evergreen (stable demand), trending (rising), declining (falling)
4. Cross-reference with competitor content output

**Output Template**:
```markdown
## Topic Demand Report — [Category]

### High-Demand Topics
| Rank | Topic | Engagement | Platforms | Type | Competitor Coverage |
|------|-------|-----------|-----------|------|-------------------|
| 1 | [Topic] | [score] | [platforms] | [Evergreen/Trending] | [Saturated/Moderate/Low] |
| 2 | [Topic] | [score] | [platforms] | [Evergreen/Trending] | [Saturated/Moderate/Low] |

### Recommended Content Calendar (Next 4 Weeks)
| Week | Topic | Format | Platform | Rationale |
|------|-------|--------|----------|-----------|
| 1 | [Topic] | [Blog/Video/Thread] | [Platform] | [Why now, audience evidence] |
| 2 | [Topic] | [Blog/Video/Thread] | [Platform] | [Why now, audience evidence] |
```

### 2. Content Gap Finder

Identify topics your audience discusses but no brand adequately covers.

**Process**:
1. Map audience discussion topics vs. existing brand content (yours + competitors)
2. Find high-engagement topics with low brand content coverage
3. Score each gap by: demand strength, competitive emptiness, brand fit

**Output Template**:
```markdown
## Content Gaps — [Category]

| Gap Topic | Audience Demand | Brand Coverage | Opportunity Score |
|-----------|----------------|---------------|------------------|
| [Topic] | [High/Med] | [None/Minimal] | [score] |

### Top Gap: [Topic]
**What audiences are saying**: [synthesis from social discussions]
**Why no brand covers this**: [hypothesis]
**Your angle**: [how to approach this uniquely]
**Suggested format**: [best format based on platform engagement data]
**Expected performance**: [engagement estimate based on similar content]
```

### 3. Platform Format Optimization

Determine which content formats perform best per platform for your audience.

**Process**:
1. Analyze engagement patterns by content format across platforms
2. Compare: long-form vs. short-form, visual vs. text, educational vs. entertaining
3. Identify platform-specific winning patterns

**Output Template**:
```markdown
## Format Performance by Platform

| Platform | Top Format | Engagement Rate | Audience Preference | Your Current Mix |
|----------|-----------|-----------------|--------------------|-----------------|
| Reddit | [format] | [score] | [what they respond to] | [what you post] |
| Twitter/X | [format] | [score] | [what they respond to] | [what you post] |
| YouTube | [format] | [score] | [what they respond to] | [what you post] |
| TikTok | [format] | [score] | [what they respond to] | [what you post] |

### Optimization Recommendations
- **Start doing**: [format/platform combination not currently used]
- **Do more of**: [format/platform that's working but underinvested]
- **Stop doing**: [format/platform that's underperforming]
```

### 4. Voice & Tone Matching

Adapt brand voice to match how your audience actually communicates.

**Process**:
1. Analyze language patterns in high-engagement audience discussions
2. Extract: vocabulary, sentence structure, formality level, humor usage, emoji patterns
3. Compare with current brand voice
4. Generate voice guide that bridges brand identity and audience expectations

**Output Template**:
```markdown
## Audience Voice Profile

### How Your Audience Talks
- **Formality**: [Casual / Semi-formal / Professional]
- **Tone**: [Irreverent / Thoughtful / Urgent / Playful]
- **Vocabulary**: [Technical / Accessible / Slang-heavy]
- **Sentence length**: [Short punchy / Medium / Long analytical]
- **Common phrases**: "[phrase 1]", "[phrase 2]", "[phrase 3]"

### Voice Gap Analysis
| Dimension | Your Brand | Your Audience | Gap |
|-----------|-----------|---------------|-----|
| Formality | [level] | [level] | [match/mismatch] |
| Jargon use | [level] | [level] | [match/mismatch] |
| Humor | [level] | [level] | [match/mismatch] |

### Recommended Voice Adjustments
- [Specific adjustment with before/after example]
- [Specific adjustment with before/after example]
```

### 5. Campaign Tracking

Monitor real-time audience reaction during a campaign or launch window.

**Process**:
1. Define tracking window (pre-launch, launch day, post-launch)
2. Search for campaign-related keywords, hashtags, product mentions
3. Track sentiment at regular intervals (hourly during launch, daily after)
4. Identify sentiment inflection points and their causes

**Output Template**:
```markdown
## Launch Tracker — [Campaign Name]

### Sentiment Timeline
| Time | Sentiment | Volume | Key Driver |
|------|-----------|--------|-----------|
| Pre-launch | [score] | [count] | [anticipation/skepticism/neutral] |
| Launch +1h | [score] | [count] | [initial reactions] |
| Launch +24h | [score] | [count] | [settling sentiment] |

### Overall Reception
- **Net sentiment**: [positive/negative/mixed]
- **Volume vs. expectation**: [above/at/below] baseline
- **Surprise reactions**: [anything unexpected]
```

### 6. Message Resonance Scoring

Evaluate which campaign messages land and which fall flat.

**Process**:
1. Identify distinct messages/claims in the campaign
2. Search for audience reactions to each specific message
3. Score resonance: echoed > engaged > ignored > rejected

**Output Template**:
```markdown
## Message Resonance — [Campaign Name]

| Message | Resonance | Echo Rate | Sentiment | Verdict |
|---------|-----------|-----------|-----------|---------|
| "[Message 1]" | [Echoed/Engaged/Ignored/Rejected] | [%] | [+/-] | [Keep/Refine/Drop] |

### Strongest Message: "[Message]"
**Why it resonates**: [analysis with audience quotes]
**Amplification opportunity**: [how to lean in]
```

## Integration with CrowdListen

This skill enhances CrowdListen analyses by:
- Transforming audience insights into actionable content plans
- Validating content ideas against real audience demand data
- Optimizing content distribution based on platform behavior patterns
- Aligning brand voice with audience expectations
- Measuring content strategy effectiveness through ongoing audience monitoring
- Providing real-time campaign intelligence during critical launch windows
- Enabling rapid response to negative sentiment shifts
