---
name: crowdlisten:ux-research
description: UX research synthesis — user personas, journey maps, heuristic evaluation (Nielsen's 10), design recommendations. Use when analyzing user behavior or designing experiences.
user-invocable: true
allowed-tools: Bash, Read, Write, WebFetch, Grep
metadata:
  openclaw:
    category: design
    tags: [ux-research, user-personas, journey-maps, heuristic-evaluation]
    requires_api_key: false
---

# UX Researcher & Designer

Comprehensive UX research and design skill for user-centered analysis and design deliverables.

## Before You Start

Ask your human for business context — this skill produces significantly better output when grounded in specifics:

- **Target market**: Who are the customers? What industry/segment?
- **Key competitors**: Which brands or products to compare against?
- **Constraints**: Budget, timeline, geographic focus?
- **Decision context**: What decisions will this analysis inform? (roadmap, funding, positioning, hiring?)
- **Existing data**: Any prior research, internal metrics, or hypotheses to validate?

## Capabilities

This skill enables:
- **Persona Generation**: Research-based user persona creation
- **Journey Mapping**: End-to-end customer journey visualization
- **Usability Analysis**: Heuristic evaluation and UX audits
- **Research Synthesis**: Converting user data into actionable insights
- **Design Recommendations**: Evidence-based UX improvement suggestions

## Core Methods

### User Persona Generation

Create detailed, research-backed user personas:

```markdown
## [Persona Name]
**Role**: Primary/Secondary User Type

### Demographics
- Age, location, occupation
- Technical proficiency
- Relevant background

### Goals & Motivations
- Primary objectives
- Success metrics
- Underlying motivations

### Pain Points & Frustrations
- Current challenges
- Unmet needs
- Friction points

### Behaviors & Patterns
- Usage frequency
- Preferred channels
- Decision-making process

### Quote
> "Representative voice that captures their perspective"

### Scenario
A day-in-the-life narrative showing how they interact with the product/service.
```

### Journey Mapping

Map the complete user experience:

| Stage | Awareness | Consideration | Decision | Onboarding | Usage | Advocacy |
|-------|-----------|---------------|----------|------------|-------|----------|
| **Actions** | What they do | | | | | |
| **Touchpoints** | Where they interact | | | | | |
| **Emotions** | How they feel | | | | | |
| **Pain Points** | Frustrations | | | | | |
| **Opportunities** | Improvements | | | | | |

### Heuristic Evaluation

Apply Nielsen's 10 Usability Heuristics:

1. **Visibility of System Status**
2. **Match Between System and Real World**
3. **User Control and Freedom**
4. **Consistency and Standards**
5. **Error Prevention**
6. **Recognition Rather Than Recall**
7. **Flexibility and Efficiency of Use**
8. **Aesthetic and Minimalist Design**
9. **Help Users Recognize, Diagnose, and Recover from Errors**
10. **Help and Documentation**

## Usage

### Generate User Persona

```python
# Example: Create persona from research data
await generate_persona(
    research_data=user_interview_transcripts,
    persona_type="primary",
    include_scenarios=True,
    format="detailed"  # detailed | summary | visual
)
```

### Create Journey Map

```python
# Example: Map user journey
await create_journey_map(
    persona="Tech-Savvy Startup Founder",
    product="CrowdListen",
    stages=["discovery", "evaluation", "purchase", "onboarding", "daily_use"],
    include_emotions=True,
    identify_moments_of_truth=True
)
```

### Conduct Usability Audit

```python
# Example: Heuristic evaluation
await usability_audit(
    product_screenshots=image_urls,
    user_flows=["signup", "first_analysis", "export_results"],
    heuristics="nielsen_10",
    severity_ratings=True
)
```

### Synthesize Research

```python
# Example: Synthesize user research
await synthesize_research(
    data_sources=[
        {"type": "interviews", "count": 12, "data": transcripts},
        {"type": "surveys", "count": 150, "data": survey_results},
        {"type": "analytics", "data": behavioral_data}
    ],
    outputs=["personas", "journey_map", "opportunity_areas"]
)
```

## Deliverable Templates

### Persona Document
```markdown
# [Name] - [Role]

![Persona Photo Placeholder]

## At a Glance
- **Age**:
- **Location**:
- **Occupation**:
- **Tech Savviness**: [1-5 scale]

## Background
[2-3 sentence background]

## Goals
1.
2.
3.

## Frustrations
1.
2.
3.

## Motivations
-
-

## Preferred Channels
-
-

## Brand Affinities
-
-

## A Day in Their Life
[Narrative scenario]

## Key Quote
> ""
```

### Journey Map Template
```markdown
# Customer Journey Map: [Persona] using [Product]

## Journey Overview
**Goal**:
**Timeline**:
**Channels**:

## Stage-by-Stage Breakdown

### Stage 1: [Name]
- **User Goal**:
- **Actions**:
- **Touchpoints**:
- **Thoughts**:
- **Emotions**: [happy/neutral/frustrated]
- **Pain Points**:
- **Opportunities**:

[Repeat for each stage]

## Key Insights
1.
2.
3.

## Priority Opportunities
| Opportunity | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| | | | |
```

## Integration with CrowdListen

This skill enhances CrowdListen by:
- Creating personas from social listening data
- Mapping user journeys based on community feedback
- Identifying UX pain points from user discussions
- Validating design decisions with community sentiment
- Generating research-backed user experience improvements
