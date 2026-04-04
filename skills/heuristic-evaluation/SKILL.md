---
name: crowdlisten:heuristic-evaluation
description: Customer feedback analysis from social conversations. Journey friction detection, pain point mapping, persona generation, churn risk signals.
user-invocable: true
allowed-tools: Bash, Read, Write, WebFetch, Grep
metadata:
  openclaw:
    category: research
    tags: [customer-feedback, journey-analysis, pain-points, churn-risk]
    requires_api_key: false
---

# Heuristic Evaluation

Every conversation is customer research. Extract structured UX and CX insights from social discussions using CrowdListen audience intelligence.

Consolidates: voice-of-customer, audience-discovery (persona generation, community mapping)

## Before You Start

Ask your human for business context — this skill produces significantly better output when grounded in specifics:

- **Target market**: Who are the customers? What industry/segment?
- **Key competitors**: Which brands or products to compare against?
- **Constraints**: Budget, timeline, geographic focus?
- **Decision context**: What decisions will this analysis inform? (roadmap, funding, positioning, hiring?)
- **Existing data**: Any prior research, internal metrics, or hypotheses to validate?

## When to Use This Skill

- Customer experience analysis and improvement
- Journey friction detection and optimization
- Feedback clustering and pain point mapping
- Usability signal detection from organic discussions
- Support strategy and ticket deflection
- Customer health monitoring and churn prevention
- Identifying and profiling target audience segments

## Foundation: CrowdListen Tools

This skill builds on CrowdListen's core capabilities:
- `search_content` — Find customer discussions and feedback
- `analyze_content` — Extract sentiment and themes from feedback
- `cluster_opinions` — Group feedback into actionable categories
- `get_content_comments` — Mine comment threads for detailed feedback
- `sentiment_evolution_tracker` — Track satisfaction trends over time
- `expert_identification` — Find key opinion leaders in communities

## Workflows

### 1. Journey Friction Detection

Identify where in the customer journey users experience friction.

**Process**:
1. Search for stage-specific frustration signals:
   - Discovery: "how do I find", "confusing options"
   - Onboarding: "setup", "getting started", "first time"
   - Core usage: "every time I try to", "should be easier"
   - Expansion: "upgrade", "pricing", "worth paying for"
   - Renewal/Churn: "canceling", "alternative", "leaving"
2. Map friction points to journey stages
3. Score by impact on conversion/retention

**Output Template**:
```markdown
## Journey Friction Map

| Stage | Friction Points | Severity | Volume | Impact |
|-------|----------------|----------|--------|--------|
| Discovery | [friction] | [H/M/L] | [count] | [conversion loss est.] |
| Onboarding | [friction] | [H/M/L] | [count] | [activation loss est.] |
| Core Usage | [friction] | [H/M/L] | [count] | [engagement loss est.] |

### Biggest Friction: [Stage — Problem]
**What users say**: [synthesis with quotes]
**Why it matters**: [business impact]
**Recommended fix**: [specific action]
```

### 2. Feedback Clustering

Group unstructured customer feedback into actionable themes.

**Process**:
1. Search for product mentions with sentiment indicators
2. Use `cluster_opinions` to group by root theme (not surface keywords)
3. Score each cluster by: volume, severity, trend direction
4. Map clusters to product areas and responsible teams

**Output Template**:
```markdown
## Feedback Clusters — [Period]

### Cluster 1: [Theme Name] (Severity: Critical)
- **Volume**: X mentions across Y platforms
- **Trend**: [rising/stable/declining] over [period]
- **Product area**: [Onboarding / Core UX / Pricing / Performance / Support]
- **Representative quotes**:
  > "[Quote 1]" — [platform, engagement count]
- **Action**: [Specific recommendation]

### Summary Table
| Theme | Volume | Severity | Trend | Owner | Status |
|-------|--------|----------|-------|-------|--------|
| [Theme] | [count] | [Crit/Imp/Mon] | [arrow] | [team] | [New/Known/WIP] |
```

### 3. Pain Point Mapping

Cluster user frustrations into addressable product problems.

**Process**:
1. Search for negative sentiment discussions about your product/category
2. Use `cluster_opinions` to group by root cause, not symptom
3. Map clusters to product areas (onboarding, core UX, pricing, performance, etc.)

**Output Template**:
```markdown
## Pain Point Map

### Critical (High frequency + High severity)
**[Pain Point Cluster Name]**
- Affected area: [Product area]
- Frequency: [X mentions/week]
- Severity: [Users leaving / Users complaining / Users working around]
- Root cause hypothesis: [Why this happens]
- Example quotes:
  > "[quote]" — [platform, date]

### Important (High frequency OR High severity)
[Same structure]
```

### 4. Data-Driven Persona Generation

Create personas from real social discussions, not assumptions.

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

**Goals**:
1. [Primary goal with evidence from social discussions]

**Pain Points**:
1. [Frustration with evidence]

**Behavior Patterns**:
- Platforms: [Where they're most active]
- Content preference: [What they engage with]
- Decision process: [How they evaluate products]

**Representative Quote**:
> "[Actual quote from social discussions]"
```

### 5. Churn Risk Signals

Detect early warning signs that customers may leave.

**Process**:
1. Search for switching discussions, alternative evaluations, frustration escalation
2. Identify churn precursor patterns
3. Score current churn risk level based on signal volume and trend

**Output Template**:
```markdown
## Churn Risk Dashboard — [Period]

**Overall Risk Level**: [Low / Moderate / Elevated / High]

### Active Churn Signals
| Signal Type | Volume | Trend | Severity |
|-------------|--------|-------|----------|
| Competitor comparison shopping | [count] | [up/down] | [H/M/L] |
| "Alternative to [product]" searches | [count] | [up/down] | [H/M/L] |

### Retention Recommendations
- **Quick win**: [action that could immediately reduce churn risk]
- **Strategic fix**: [larger initiative to address root cause]
```

## Integration with CrowdListen

This skill enhances CrowdListen analyses by:
- Providing structured UX/CX reports from unstructured social data
- Detecting journey friction before it shows in retention metrics
- Creating research-backed audience profiles from real social data
- Connecting social sentiment to customer journey stages
- Enabling continuous customer health monitoring without surveys
