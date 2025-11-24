// Helper functions for permission management
// Moved from API route to fix Next.js build error

interface PermissionSettings {
  github: {
    repositories: Array<{
      name: string
      owner: string
      allowedRoles: string[]
      isProductRelevant: boolean
    }>
  }
  jira: {
    projects: Array<{
      key: string
      name: string
      allowedRoles: string[]
      isProductRelevant: boolean
    }>
  }
}

// Mock admin-controlled permissions
const mockPermissions: PermissionSettings = {
  github: {
    repositories: [
      // Core Product Repositories - Product Owner Accessible
      {
        name: 'cloud-automation-frontend',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'cloud-automation-backend',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'cloud-automation-aiservices',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'makestuffgo-cloud-platform',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'admin'],
        isProductRelevant: true
      },
      
      // Assessment & FinOps Tools - Product Relevant
      {
        name: 'assessment_accelerator',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'finops-survey-genius',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'Prototype_Assessment_Tool',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'admin'],
        isProductRelevant: true
      },
      
      // Development Tools & Utilities - Product Owner needs visibility
      {
        name: 'mySQLtoSQL_App',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'focus_converter',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'terraform_example_hubbplatform',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      
      // DevOps & Infrastructure - Critical for product delivery
      {
        name: 'cloud-automation-pipelines',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'harness-db-devops',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'devops_micro_demo',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      
      // Demo & Development Playgrounds - Product Owner needs to track all development
      {
        name: 'codespace-demo',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'cushla_playground',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'sophia_playground',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'admin'],
        isProductRelevant: true
      },
      {
        name: 'jade_playground',
        owner: 'LetsMakeStuffGo',
        allowedRoles: ['product-owner', 'admin'],
        isProductRelevant: true
      }
    ]
  },
  jira: {
    projects: [
      // Real Jira Projects - Based on actual working API calls
      {
        key: 'MCP',
        name: 'MSG - Cloud Platform',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        key: 'FINOPZ',
        name: 'FinOps Assessment Project',
        allowedRoles: ['product-owner', 'cto', 'admin'],
        isProductRelevant: true
      },
      {
        key: 'CAR',
        name: 'Cloud_Automation_Recommendation',
        allowedRoles: ['product-owner', 'cto', 'engineer', 'admin'],
        isProductRelevant: true
      },
      {
        key: 'GTMP',
        name: 'Go-to-Market Plan',
        allowedRoles: ['product-owner', 'admin'],
        isProductRelevant: true
      }
    ]
  }
}

// Helper functions to filter permissions by role
export function getRepositoryPermissions(organizationId: string, role: string) {
  return mockPermissions.github.repositories.filter(repo => 
    repo.allowedRoles.includes(role)
    // Product Owners now have access to ALL repositories they're allowed for
    // This gives them complete visibility into the product ecosystem
  )
}

export function getJiraProjectPermissions(organizationId: string, role: string) {
  return mockPermissions.jira.projects.filter(project => 
    project.allowedRoles.includes(role) && 
    (role === 'product-owner' ? project.isProductRelevant : true)
  )
}

export async function getAdminToken(organizationId: string, service: 'github' | 'jira') {
  // In production, this would securely retrieve admin-stored tokens
  // from encrypted database storage
  return `mock-${service}-token-for-${organizationId}`
}
