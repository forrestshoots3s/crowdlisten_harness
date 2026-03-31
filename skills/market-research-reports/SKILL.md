---
name: crowdlisten:market-research
description: Generate comprehensive market research reports with Porter's Five Forces, PESTLE, SWOT, TAM/SAM/SOM, BCG Matrix. Use for market analysis, competitive landscape, industry trends.
user-invocable: true
allowed-tools: Bash, Read, Write, WebFetch, Grep
---

# Market Research Reports

Generate comprehensive, analyst-grade market research reports using established strategic frameworks and methodologies.

## Before You Start

Ask your human for business context — this skill produces significantly better output when grounded in specifics:

- **Target market**: Who are the customers? What industry/segment?
- **Key competitors**: Which brands or products to compare against?
- **Constraints**: Budget, timeline, geographic focus?
- **Decision context**: What decisions will this analysis inform? (roadmap, funding, positioning, hiring?)
- **Existing data**: Any prior research, internal metrics, or hypotheses to validate?

## Capabilities

This skill enables generation of:
- **Comprehensive Market Analysis**: 50+ page detailed reports
- **Strategic Framework Application**: Porter's Five Forces, PESTLE, SWOT, BCG Matrix
- **Market Sizing**: TAM/SAM/SOM calculations with methodology
- **Competitive Intelligence**: Competitor profiling and positioning analysis
- **Trend Analysis**: Industry trends, growth drivers, and future outlook

## Core Frameworks

### Porter's Five Forces
Analyze competitive intensity and attractiveness of a market:
1. **Threat of New Entrants**: Barriers to entry, capital requirements
2. **Bargaining Power of Suppliers**: Supplier concentration, switching costs
3. **Bargaining Power of Buyers**: Buyer concentration, price sensitivity
4. **Threat of Substitutes**: Alternative products, switching costs
5. **Competitive Rivalry**: Number of competitors, industry growth rate

### PESTLE Analysis
Macro-environmental factors affecting the market:
- **Political**: Government policies, trade regulations, political stability
- **Economic**: GDP growth, inflation, exchange rates, unemployment
- **Social**: Demographics, cultural trends, consumer behavior
- **Technological**: Innovation, R&D, automation, digital transformation
- **Legal**: Regulatory frameworks, compliance requirements, IP laws
- **Environmental**: Sustainability, climate impact, environmental regulations

### SWOT Analysis
Internal and external factor assessment:
- **Strengths**: Internal capabilities and competitive advantages
- **Weaknesses**: Internal limitations and areas for improvement
- **Opportunities**: External favorable conditions and growth potential
- **Threats**: External challenges and competitive risks

### TAM/SAM/SOM Market Sizing
- **Total Addressable Market (TAM)**: Total market demand
- **Serviceable Addressable Market (SAM)**: Portion you can target
- **Serviceable Obtainable Market (SOM)**: Realistic market capture

### BCG Growth-Share Matrix
Portfolio analysis for multi-product/segment evaluation:
- **Stars**: High growth, high market share
- **Cash Cows**: Low growth, high market share
- **Question Marks**: High growth, low market share
- **Dogs**: Low growth, low market share

## Report Structure

### Standard Market Research Report

```markdown
# [Industry/Market] Research Report

## Executive Summary
- Key findings
- Market size and growth
- Critical success factors
- Strategic recommendations

## Market Overview
- Market definition and scope
- Historical development
- Current state of the market

## Market Size & Forecast
- TAM/SAM/SOM analysis
- Growth projections (5-year)
- Regional breakdown

## Industry Analysis
### Porter's Five Forces
[Detailed analysis of each force]

### PESTLE Analysis
[Macro-environmental factors]

## Competitive Landscape
- Major players and market share
- Competitive positioning map
- Competitor profiles

## Customer Analysis
- Customer segments
- Buying behavior
- Unmet needs

## Trends & Drivers
- Key market trends
- Growth drivers
- Inhibitors and challenges

## SWOT Analysis
[Internal/external factors]

## Strategic Recommendations
- Market entry strategies
- Competitive positioning
- Investment priorities

## Appendix
- Data sources
- Methodology
- Definitions
```

## Usage

### Generate Market Research Report

```python
# Example: Request a market research report
await generate_market_report(
    industry="Electric Vehicle Charging Infrastructure",
    geography="North America",
    depth="comprehensive",  # comprehensive | executive | segment
    frameworks=["porters", "pestle", "swot", "tam_sam_som"]
)
```

### Analyze Competitive Landscape

```python
# Example: Competitive analysis
await analyze_competitors(
    market="SaaS Project Management Tools",
    competitors=["Asana", "Monday.com", "Notion", "ClickUp"],
    dimensions=["pricing", "features", "market_position", "growth"]
)
```

### Market Sizing

```python
# Example: Calculate TAM/SAM/SOM
await calculate_market_size(
    product="AI-powered Customer Service Platform",
    target_segment="Mid-market B2B SaaS",
    geography="Global",
    methodology="bottom_up"  # bottom_up | top_down | value_based
)
```

## Output Quality Standards

1. **Data-Driven**: All claims supported by data sources
2. **Cited Sources**: Academic, industry reports, and primary research
3. **Actionable Insights**: Strategic recommendations with clear rationale
4. **Visual Support**: Charts, graphs, and matrices where applicable
5. **Professional Format**: Executive-ready presentation quality

## Integration with CrowdListen

This skill enhances CrowdListen analyses by:
- Providing market context for social listening insights
- Connecting community sentiment to industry trends
- Enabling competitive intelligence from social data
- Supporting strategic decision-making with comprehensive research
