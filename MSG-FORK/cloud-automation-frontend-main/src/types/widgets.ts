// Widget-centric permission system types
export interface Widget {
  id: string
  name: string
  description: string
  permission: string
  category: string
  thumbnail?: string
  component?: string
}

export interface WidgetPermission {
  permission: string
  name: string
  description: string
  defaultRoles: string[]
  optionalFor?: string[]
}

export interface RoleWidgets {
  default: string[]
  optional: string[]
}

export interface UserWidgetAccess {
  widgetId: string
  access: 'allow' | 'deny'
  source: 'role' | 'override'
  grantedBy?: string
  grantedAt?: string
}

// Widget definitions with their required permissions
export const WIDGET_PERMISSIONS: Record<string, WidgetPermission> = {
  // Executive Widgets
  'executive-summary': {
    permission: 'dashboard.executive.view',
    name: 'Executive Summary Dashboard',
    description: 'High-level company overview and strategic KPIs',
    defaultRoles: ['CEO', 'CFO', 'CTO']
  },
  'company-kpis': {
    permission: 'analytics.overview.view',
    name: 'Company KPIs',
    description: 'Key performance indicators across all departments',
    defaultRoles: ['CEO', 'CFO', 'CTO']
  },
  'cost-analysis': {
    permission: 'financials.costs.view',
    name: 'Cost Analysis Widget',
    description: 'Detailed cost breakdown and optimization insights',
    defaultRoles: ['CFO'],
    optionalFor: ['CEO', 'CTO']
  },
  
  // Product Widgets
  'deployment-metrics': {
    permission: 'deployments.metrics.view',
    name: 'Deployment Metrics',
    description: 'Track deployment frequency, success rate, and performance metrics',
    defaultRoles: ['PO', 'Product Manager']
  },
  'epic-progress': {
    permission: 'jira.epics.view',
    name: 'Epic Progress',
    description: 'Track progress of product epics and initiatives',
    defaultRoles: ['PO', 'Product Manager']
  },
  'story-velocity': {
    permission: 'jira.velocity.view',
    name: 'Story Velocity',
    description: 'Track team velocity and story point completion trends',
    defaultRoles: ['PO', 'Product Manager']
  },
  'release-pipeline': {
    permission: 'releases.pipeline.view',
    name: 'Release Pipeline',
    description: 'Monitor features moving through development stages',
    defaultRoles: ['PO', 'Product Manager']
  },
  'feature-requests': {
    permission: 'features.requests.view',
    name: 'Feature Requests',
    description: 'Track incoming feature requests and their progress',
    defaultRoles: ['PO', 'Product Manager']
  },
  'story-flow': {
    permission: 'jira.stories.manage',
    name: 'Story Flow',
    description: 'User story workflow and completion tracking',
    defaultRoles: ['PO', 'Product Manager']
  },
  'roadmap-timeline': {
    permission: 'roadmap.view',
    name: 'Roadmap Timeline',
    description: 'Product roadmap and feature timeline',
    defaultRoles: ['PO', 'Product Manager'],
    optionalFor: ['CEO', 'CTO']
  },
  'customer-feedback': {
    permission: 'product.features.view',
    name: 'Customer Feedback',
    description: 'Customer feature requests and feedback',
    defaultRoles: ['PO', 'Product Manager'],
    optionalFor: ['CEO']
  },
  
  // Engineering Widgets
  'deployment-success': {
    permission: 'github.deployments.view',
    name: 'Deployment Success',
    description: 'CI/CD pipeline status and deployment metrics',
    defaultRoles: ['CTO', 'Engineer'],
    optionalFor: ['PO']
  },
  'code-quality': {
    permission: 'code.quality.view',
    name: 'Code Quality Metrics',
    description: 'Code coverage, technical debt, and quality scores',
    defaultRoles: ['CTO']
  },
  'team-velocity': {
    permission: 'engineering.velocity.view',
    name: 'Team Velocity',
    description: 'Development team productivity and velocity metrics',
    defaultRoles: ['CTO'],
    optionalFor: ['PO', 'CEO']
  },
  'build-status': {
    permission: 'github.builds.view',
    name: 'Build Status',
    description: 'Current build status and CI/CD health',
    defaultRoles: ['CTO', 'Engineer']
  },
  'my-tasks': {
    permission: 'jira.personal.view',
    name: 'My Tasks',
    description: 'Personal task list and assignments',
    defaultRoles: ['Engineer']
  },
  'my-prs': {
    permission: 'github.personal.view',
    name: 'My Pull Requests',
    description: 'Personal GitHub pull requests and reviews',
    defaultRoles: ['Engineer']
  },
  
  // Finance Widgets
  'budget-overview': {
    permission: 'budget.manage',
    name: 'Budget Overview',
    description: 'Budget tracking and financial planning',
    defaultRoles: ['CFO'],
    optionalFor: ['CEO', 'PO']
  },
  'revenue-tracking': {
    permission: 'financials.revenue.view',
    name: 'Revenue Tracking',
    description: 'Revenue metrics and financial performance',
    defaultRoles: ['CFO'],
    optionalFor: ['CEO']
  },
  'expense-reports': {
    permission: 'financials.expenses.view',
    name: 'Expense Reports',
    description: 'Company expense tracking and analysis',
    defaultRoles: ['CFO']
  },
  
  // Sales Widgets
  'sales-pipeline': {
    permission: 'sales.pipeline.manage',
    name: 'Sales Pipeline',
    description: 'Sales funnel and deal progression tracking',
    defaultRoles: ['Sales Manager'],
    optionalFor: ['CEO', 'PO']
  },
  'customer-health': {
    permission: 'customer.accounts.view',
    name: 'Customer Health',
    description: 'Customer satisfaction and account health metrics',
    defaultRoles: ['Sales Manager'],
    optionalFor: ['PO', 'CEO']
  },
  'lead-status': {
    permission: 'sales.leads.view',
    name: 'Lead Status',
    description: 'Lead generation and conversion tracking',
    defaultRoles: ['Sales Manager']
  }
}

// Role-based widget configuration
export const ROLE_WIDGETS: Record<string, RoleWidgets> = {
  'Admin': {
    default: [
      'deployment-success',
      'build-status',
      'my-tasks',
      'my-prs'
    ],
    optional: [
      'team-velocity',
      'code-quality',
      'executive-summary',
      'company-kpis'
    ]
  },
  
  'CEO': {
    default: [
      'executive-summary',
      'company-kpis',
      'revenue-tracking',
      'customer-health'
    ],
    optional: [
      'cost-analysis',
      'team-velocity',
      'sales-pipeline',
      'roadmap-timeline',
      'deployment-success',
      'budget-overview'
    ]
  },
  
  'PO': {
    default: [
      'deployment-metrics',
      'epic-progress',
      'story-velocity',
      'release-pipeline',
      'feature-requests'
    ],
    optional: [
      'story-flow',
      'roadmap-timeline',
      'budget-overview',
      'team-velocity',
      'customer-health'
    ]
  },
  
  'CTO': {
    default: [
      'deployment-success',
      'code-quality',
      'team-velocity',
      'build-status'
    ],
    optional: [
      'cost-analysis',
      'roadmap-timeline',
      'company-kpis'
    ]
  },
  
  'Engineer': {
    default: [
      'my-tasks',
      'my-prs',
      'build-status',
      'deployment-success'
    ],
    optional: [
      'team-velocity',
      'code-quality'
    ]
  },
  
  'CFO': {
    default: [
      'cost-analysis',
      'budget-overview',
      'revenue-tracking',
      'expense-reports'
    ],
    optional: [
      'company-kpis',
      'executive-summary'
    ]
  },
  
  'Sales Manager': {
    default: [
      'sales-pipeline',
      'lead-status',
      'customer-health'
    ],
    optional: [
      'revenue-tracking',
      'roadmap-timeline'
    ]
  }
}

// Widget categories for organization
export const WIDGET_CATEGORIES = {
  'executive': 'Executive',
  'product': 'Product Management',
  'engineering': 'Engineering',
  'finance': 'Finance',
  'sales': 'Sales & Marketing',
  'personal': 'Personal'
}

// Get widget category from widget ID
export const getWidgetCategory = (widgetId: string): string => {
  if (widgetId.startsWith('executive-') || widgetId.startsWith('company-')) return 'executive'
  if (widgetId.startsWith('deployment-metrics') || widgetId.startsWith('epic-') || widgetId.startsWith('story-') || widgetId.startsWith('roadmap-') || widgetId.startsWith('feature-') || widgetId.startsWith('release-')) return 'product'
  if (widgetId.startsWith('deployment-') || widgetId.startsWith('code-') || widgetId.startsWith('team-') || widgetId.startsWith('build-')) return 'engineering'
  if (widgetId.startsWith('budget-') || widgetId.startsWith('revenue-') || widgetId.startsWith('cost-') || widgetId.startsWith('expense-')) return 'finance'
  if (widgetId.startsWith('sales-') || widgetId.startsWith('customer-') || widgetId.startsWith('lead-')) return 'sales'
  if (widgetId.startsWith('my-')) return 'personal'
  return 'other'
}
