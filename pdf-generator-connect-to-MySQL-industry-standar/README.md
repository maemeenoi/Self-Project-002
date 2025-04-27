# Cloud Cost Assessment Accelerator

A web application for generating comprehensive cloud cost analysis and optimization reports for clients. This tool visualizes cloud spending patterns, assesses cloud maturity levels, and provides actionable recommendations for cost optimization.

<img src="./public/report_review.png" alt="drawing" width="200" hight='200'/>

## Features

- **Professional Report Generation**: Create comprehensive PDF reports with consistent branding and detailed analysis
- **Cloud Spend Visualization**: Break down cloud costs by service, visualize spending trends over time
- **Maturity Assessment**: Evaluate client's cloud maturity level based on industry-standard frameworks
- **Cost Optimization Recommendations**: Provide prioritized, actionable recommendations for reducing cloud costs
- **Implementation Roadmap**: Present a phased approach to implementing cost optimization strategies

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/cloud-assessment-accelerator.git
cd cloud-assessment-accelerator
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser to see the application first page.

## Usage

### Generating Reports

1. The main page displays a sample report for a fictional company
2. Click the "Generate PDF Report" button to create a downloadable PDF version
3. Browse different sections of the report using the navigation tabs

### Customizing Client Data

To use the application with your own client data:

1. Create a new data file in `src/data/` based on the `mvp-sample-data.js` structure
2. Import and use your data file in the application

Example data structure:

```javascript
export const clientData = {
  reportMetadata: {
    organizationName: "Client Name",
    reportPeriod: "Q1 2025",
    reportDate: "April 14, 2025",
  },
  cloudSpend: {
    total: 1368390,
    annualSavingsOpportunity: 431580,
    byService: [
      { name: "Compute", value: 647500 },
      { name: "Storage", value: 312450 },
      // ...
    ],
    // ...
  },
  // ...
}
```

## Project Structure

```
cloud-assessment-accelerator/
├── public/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.js
│   │   └── page.js
│   ├── assests/
│   │   ├── wireframes/
│   │   │   ├── Wireframe.pdf
│   ├── components/
│   │   ├── report/
│   │   │   ├── CloudCostDashboard.jsx
│   │   │   ├── MVPCloudMaturityAssessment.jsx
│   │   │   ├── MVPCover.jsx
│   │   │   ├── MVPExecutiveSummary.jsx
│   │   │   ├── MVPMaturityTable.jsx
│   │   │   ├── MVPRecommendationsActionPlan.jsx
│   │   │   └── ReportGenerator.jsx
│   │   └── ui/
│   └── data/
│       └── sampleData.js
└── package.json
```

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **Recharts**: Composable charting library built on React components
- **jsPDF**: Client-side JavaScript PDF generation
- **html2canvas-pro**: Captures DOM nodes containing SVG and Canvas elements
- **Tailwind CSS**: Utility-first CSS framework

## Customization

### Styling and Branding

- Modify the color schemes in the components to match client branding
- Update the SVG logo in the MVPCover component
- Customize report sections in the ReportGenerator component

### Adding New Components

1. Create new component files in the `src/components/report/` directory
2. Update the ReportGenerator.jsx file to include your new components
3. Add appropriate data structures to your client data files

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Acknowledgments

- Based on the Continuous Delivery Capability Assessment methodology
- Cloud maturity model adapted from industry standards
- Visualization components built with Recharts
