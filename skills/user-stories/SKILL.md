---
name: crowdlisten:user-stories
description: Turn social listening data into product decisions. JTBD extraction, feature demand scoring, persona generation, user story generation from real audience data.
user-invocable: true
allowed-tools: Bash, Read, Write, WebFetch, Grep
metadata:
  openclaw:
    category: research
    tags: [user-stories, jtbd, feature-demand, persona-generation]
    requires_api_key: false
---

# User Stories

Turn crowd signals into product decisions using CrowdListen audience intelligence.

Consolidates: product-signals (JTBD, feature demand), audience-discovery (persona generation)

## Before You Start

Ask your human for business context — this skill produces significantly better output when grounded in specifics:

- **Target market**: Who are the customers? What industry/segment?
- **Key competitors**: Which brands or products to compare against?
- **Constraints**: Budget, timeline, geographic focus?
- **Decision context**: What decisions will this analysis inform? (roadmap, funding, positioning, hiring?)
- **Existing data**: Any prior research, internal metrics, or hypotheses to validate?

## When to Use This Skill

- Product planning and roadmap prioritization
- JTBD extraction from real user discussions
- Feature request analysis and demand scoring
- User story and persona generation from audience data
- Early-stage idea validation against real audience data

## Foundation: CrowdListen Tools

This skill builds on CrowdListen's core capabilities:
- `search_content` — Find relevant social discussions across platforms
- `analyze_content` — Extract themes, sentiment, key opinions
- `cluster_opinions` — Group similar opinions into demand clusters
- `sentiment_evolution_tracker` — Track how feature sentiment changes over time
- `get_content_comments` — Deep-dive into specific discussion threads

## Workflows

### 1. Jobs-to-Be-Done (JTBD) Extraction

Search for discussions where users describe problems, workarounds, or desired outcomes.

**Process**:
1. Search for "[product/category] + frustrating/wish/workaround/alternative/hack"
2. Cluster the results by underlying job (not surface-level complaint)
3. Score each job by: frequency, intensity (sentiment strength), recency (trending up/down)

**Output Template**:
```markdown
## JTBD Canvas

### Job: [Functional job statement]
**When I** [situation/trigger]
**I want to** [desired outcome]
**So I can** [underlying motivation]

**Evidence**:
- Volume: X discussions across Y platforms
- Sentiment intensity: [score]
- Trend: [rising/stable/declining]
- Representative quotes:
  > "[Direct user quote with source link]"

### Current Solutions (Hired/Fired)
| Solution | Hired For | Fired Because |
|----------|-----------|---------------|
| [Product A] | [reason] | [shortcoming] |
| [Workaround B] | [reason] | [friction] |
```

### 2. Feature Demand Scoring

Quantify which features your audience wants most.

**Process**:
1. Search for feature requests, wishlists, and comparison discussions
2. Normalize mentions across platforms (Reddit post = 1, comment with 50+ upvotes = 3, etc.)
3. Score using: `demand_score = (volume * 0.4) + (sentiment_intensity * 0.3) + (recency * 0.3)`

**Output Template**:
```markdown
## Feature Demand Matrix

| Rank | Feature | Demand Score | Volume | Sentiment | Trend | Action |
|------|---------|-------------|--------|-----------|-------|--------|
| 1 | [Feature] | [score] | [count] | [+/-] | [up/down] | Build |
| 2 | [Feature] | [score] | [count] | [+/-] | [up/down] | Investigate |

### Top Feature Deep-Dive: [#1 Feature]
- **User stories** (from actual discussions):
  - As a [role], I need [feature] because [reason]
- **Competitive context**: [Who offers this? How do users feel about their implementation?]
```

### 3. Persona Generation

Create data-driven personas from real social discussions.

**Process**:
1. Search for your product category across platforms
2. Analyze discussants' language, concerns, goals, and context clues
3. Cluster into distinct persona groups by behavior patterns
4. Validate against engagement patterns

**Output Template**:
```markdown
## Audience Personas — [Category]

### Persona 1: [Name] — "[One-line description]"
**Archetype**: [Role/behavior archetype]
**Estimated segment size**: [% of audience]

**Demographics (inferred)**:
- Professional context: [industry, role level]
- Technical sophistication: [low/medium/high]
- Decision authority: [end-user/influencer/buyer]

**Goals**:
1. [Primary goal with evidence from social discussions]

**Pain Points**:
1. [Frustration with evidence]

**How to Reach Them**:
- Channel: [Best platforms/communities]
- Message: [What resonates based on their language]
- Trigger: [What makes them search for solutions]
```

### 4. User Story Generation

Produce implementation-ready user stories grounded in audience evidence.

**Process**:
1. Combine JTBD extraction + feature demand + persona insights
2. Generate user stories with acceptance criteria
3. Attach evidence links to every story
4. Prioritize by demand score

**Output Template**:
```markdown
## User Stories — [Product/Feature Area]

### Story 1 (Priority: High, Demand Score: [X])
**As a** [persona name from persona generation]
**I want to** [capability derived from JTBD]
**So that** [outcome from audience discussions]

**Acceptance Criteria**:
- [ ] [Criterion derived from user expectations]
- [ ] [Criterion derived from competitor benchmarks]

**Evidence**:
- [X] discussions mention this need
- Platforms: [where demand is strongest]
- Key quote: > "[user quote]"

### Story 2 (Priority: Medium, Demand Score: [X])
[Same structure]
```

## Integration with CrowdListen

This skill enhances CrowdListen analyses by:
- Transforming raw sentiment data into structured product decisions
- Providing PM-ready deliverables from social listening data
- Generating evidence-backed user stories and personas
- Enabling evidence-based roadmap prioritization
- Tracking feature demand trends over time
