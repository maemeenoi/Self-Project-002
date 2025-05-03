# Data Structure Documentation

This folder contains sample data files used for development, testing, and demonstration purposes in the Cloud & DevOps Solution Accelerator.

## Overview

The data files in this directory provide structured information for:

- Client organization metadata
- Cloud expenditure analysis
- Cloud maturity assessments
- Cost optimization recommendations
- Implementation roadmaps

## File Format

Data is stored in JSON format with a hierarchical structure that powers various components of the application.

## Data Schema

### sample-data.json

This file contains the core data structure used throughout the application, with the following main sections:

#### 1. reportMetadata

Basic information about the report and client organization.

```json
{
  "organizationName": "Cloudy LTD",
  "reportPeriod": "Q1 2025",
  "reportDate": "April 14, 2025",
  "preparedBy": "MakeStuffGo"
}
```

#### 2. executiveSummary

Overview of key findings and recommendations, organized into subtopics.

```json
{
  "title": "Executive Summary",
  "subtopics": [
    {
      "title": "Overview",
      "content": "Text description..."
    },
    {
      "title": "Key Focuses",
      "content": ["Item 1", "Item 2"]
    }
  ]
}
```

#### 3. cloudSpend

Financial analysis of cloud expenditure with breakdown by service and trending data.

```json
{
  "total": 1368390, // Total cloud spend in dollars
  "annualSavingsOpportunity": 431580, // Potential annual savings
  "byService": [
    // Breakdown by service category
    { "name": "Compute", "value": 647500 },
    { "name": "Storage", "value": 312450 }
  ],
  "trends": [
    // Historical and projected spending
    { "name": "Q1 2024", "spend": 162000, "projected": 162000 },
    { "name": "Q2 2025", "spend": null, "projected": 910000 }
  ]
}
```

#### 4. cloudMaturityAssessment

Detailed evaluation of the organization's cloud maturity across multiple dimensions.

```json
{
  "sectionTitle": "02. Cloud Maturity Assessment",
  "overallScore": 3.2, // Overall maturity score (1-5 scale)
  "currentLevel": "Level 3: Established",
  "maturityLevels": [
    // Description of all maturity levels
    {
      "level": "Level 1: Initial",
      "description": "Ad-hoc processes, reactive management"
    }
  ],
  "subtopics": [
    // Detailed assessment sections
    {
      "title": "Dimensional Analysis",
      "content": "Text description...",
      "dimensionalScores": [
        // Radar chart data for each dimension
        { "dimension": "Cost Optimization", "score": 2.7 },
        { "dimension": "Security", "score": 3.8 }
      ]
    },
    {
      "title": "Growth Trajectory & Recommendations",
      "content": "Text description...",
      "shortTermFocus": [
        // Short-term recommendations
        "Item 1",
        "Item 2"
      ],
      "longTermObjectives": [
        // Long-term strategic goals
        "Item 1",
        "Item 2"
      ]
    }
  ]
}
```

#### 5. recommendations

Actionable recommendations and implementation plan.

```json
{
  "sectionTitle": "03. Recommendations & Action Plan",
  "keyRecommendations": [
    // Detailed recommendations
    {
      "title": "Implement Automated Scaling",
      "rationale": "Explanation text...",
      "impact": "15% reduction in compute costs",
      "priority": "Critical"
    }
  ],
  "implementationRoadmap": [
    // Phased implementation timeline
    {
      "phase": "Immediate (0-30 days)",
      "actions": ["Action 1", "Action 2"]
    }
  ],
  "expectedImpact": {
    // Financial and operational benefits
    "annualSavings": 431580,
    "roiPercentage": 320,
    "additionalBenefits": "Text description..."
  },
  "nextSteps": [
    // Initial action items
    "Step 1",
    "Step 2"
  ]
}
```

## Usage

This data structure is consumed by various React components in the application:

1. **Cover Page Component**: Uses reportMetadata
2. **Executive Summary Component**: Uses executiveSummary and cloudSpend
3. **Cloud Maturity Assessment Component**: Uses cloudMaturityAssessment
4. **Recommendations Component**: Uses recommendations

## Data Visualization

The data is structured to work seamlessly with Recharts for visualization including:

- Pie charts for cloud spend distribution by service
- Line charts for trend analysis
- Radar charts for maturity dimensional analysis

## Creating Test Data

When creating additional test data, ensure all required fields are present to avoid component rendering issues. The structure should maintain compatibility with the React components that consume it.

## Best Practices

1. Maintain consistent numerical formatting (no currency symbols in the data)
2. Use null for missing values in trend data rather than omitting fields
3. Ensure all arrays that will be mapped in components have at least one item
4. Keep text content concise for optimal display in the report layouts
