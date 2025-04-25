# Components Documentation

This directory contains React components used throughout the Cloud & DevOps Solution Accelerator application. The components are organized by their purpose and functionality.

## Directory Structure

```
components/
├── report/         # Report-specific components
├── ui/             # Reusable UI components
└── README.md       # This documentation file
```

## Report Components

The `report/` directory contains components specifically designed for generating and displaying cloud cost efficiency reports. These components work together to create comprehensive, visually appealing reports that present cloud spending analysis and recommendations.

### Key Report Components

- **CoverPage**: Creates the report cover with client information and visual elements
- **TableOfContents**: Generates a structured table of contents for the report
- **ExecutiveSummary**: Displays key findings, metrics, and charts summarizing cloud spend
- **CloudMaturityAssessment**: Shows cloud maturity evaluation with radar charts and recommendations
- **RecommendationsAndActionPlan**: Presents prioritized recommendations and implementation roadmap
- **ReportGenerator**: Orchestrates the PDF generation process from the individual components

### Common Report Component Features

- Consistent layout and styling across report sections
- Integration with data visualization libraries (Recharts)
- Responsive design for proper rendering in PDF format
- Parameterized content based on client data

## UI Components

The `ui/` directory contains reusable user interface components that can be used across multiple parts of the application. These are more generic and not specific to the report generation functionality.

### Planned UI Components

- **Button**: Customizable button components with various styles and states
- **Card**: Container components for displaying grouped information
- **Chart**: Reusable chart components (pie, line, bar, radar)
- **DataTable**: Tabular data display with sorting and filtering capabilities
- **Dropdown**: Selection components for user input
- **Modal**: Overlay dialog components for focused interactions
- **Navigation**: Components for application navigation
- **Notification**: Alert and message display components

## Component Design Principles

1. **Modularity**: Components are designed to be self-contained and reusable
2. **Separation of Concerns**: Clear distinction between data, presentation, and behavior
3. **Consistency**: Uniform styling and interaction patterns
4. **Accessibility**: Components follow accessibility best practices
5. **Performance**: Optimized rendering and minimal re-renders

## Usage Example

```jsx
import React, { useState } from 'react';
import ReportGenerator from './report/ReportGenerator';
import Button from './ui/Button';

const ReportPage = ({ clientData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  return (
    <div className="container">
      <h1>Cloud Cost Efficiency Report</h1>
      
      <Button 
        variant="primary"
        onClick={() => setIsGenerating(true)}
      >
        Generate Report
      </Button>
      
      {isGenerating && (
        <ReportGenerator
          clientData={clientData}
          onComplete={() => setIsGenerating(false)}
        />
      )}
    </div>
  );
};
```

## Development Guidelines

1. **Component Structure**:
   - Each component should be in its own file
   - Include PropTypes for type checking
   - Use functional components with hooks rather than class components

2. **Styling**:
   - Use Tailwind CSS for styling
   - Follow the project's style guide for consistent visual design
   - Use responsive design principles

3. **Documentation**:
   - Include JSDoc comments for component props and functions
   - Add explanatory comments for complex logic
   - Keep this README updated with new components

4. **Testing**:
   - Create unit tests for components using Jest and React Testing Library
   - Test different states and edge cases
   - Ensure accessibility testing is performed

## Dependencies

The components in this directory rely on the following key libraries:

- React (v18+)
- Recharts for data visualization
- html2canvas-pro and jsPDF for PDF generation
- Tailwind CSS for styling

## Best Practices

1. Keep components focused and single-purpose
2. Lift state up when needed to avoid prop drilling
3. Use composition over inheritance
4. Consider memoization for performance optimization using React.memo and useMemo
5. Follow consistent naming conventions
6. Break large components into smaller, more manageable pieces
