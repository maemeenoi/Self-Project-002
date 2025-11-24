/**
 * Credential Validation Utilities
 * 
 * Helper functions to validate integration credentials and provide
 * user-friendly error messages when credentials are missing.
 */

// Error types for different credential requirements
export enum CredentialErrorType {
  JIRA_MISSING = 'JIRA_MISSING',
  GITHUB_MISSING = 'GITHUB_MISSING',
  AWS_MISSING = 'AWS_MISSING',
  AZURE_MISSING = 'AZURE_MISSING',
  GCP_MISSING = 'GCP_MISSING',
  GENERAL_MISSING = 'GENERAL_MISSING'
}

export interface CredentialError {
  type: CredentialErrorType;
  title: string;
  message: string;
  actionText: string;
  actionUrl: string;
}

/**
 * Parse credential error messages and return structured error information
 */
export function parseCredentialError(error: Error): CredentialError {
  const errorMessage = error.message;
  
  if (errorMessage.includes('CREDENTIALS_REQUIRED')) {
    // Extract the specific error details
    if (errorMessage.includes('Jira')) {
      return {
        type: CredentialErrorType.JIRA_MISSING,
        title: 'Jira Integration Required',
        message: 'To display Jira data, please configure your Jira integration with your instance URL, email, and API token.',
        actionText: 'Configure Jira Integration',
        actionUrl: '/admin/integrations?tab=jira'
      };
    }
    
    if (errorMessage.includes('GitHub')) {
      return {
        type: CredentialErrorType.GITHUB_MISSING,
        title: 'GitHub Integration Required',
        message: 'To display GitHub data, please configure your GitHub integration with a valid personal access token.',
        actionText: 'Configure GitHub Integration',
        actionUrl: '/admin/integrations?tab=github'
      };
    }
    
    if (errorMessage.includes('AWS')) {
      return {
        type: CredentialErrorType.AWS_MISSING,
        title: 'AWS Integration Required',
        message: 'To display AWS cost data, please configure your AWS integration with access keys and billing permissions.',
        actionText: 'Configure AWS Integration',
        actionUrl: '/admin/integrations?tab=aws'
      };
    }
    
    if (errorMessage.includes('Azure')) {
      return {
        type: CredentialErrorType.AZURE_MISSING,
        title: 'Azure Integration Required',
        message: 'To display Azure cost data, please configure your Azure integration with service principal credentials.',
        actionText: 'Configure Azure Integration',
        actionUrl: '/admin/integrations?tab=azure'
      };
    }
    
    if (errorMessage.includes('cloud') || errorMessage.includes('cost')) {
      return {
        type: CredentialErrorType.GENERAL_MISSING,
        title: 'Cloud Integration Required',
        message: 'To display cost and billing data, please configure your cloud provider integrations (AWS, Azure, or GCP).',
        actionText: 'Configure Cloud Integrations',
        actionUrl: '/admin/integrations'
      };
    }
    
    // Default credential error
    return {
      type: CredentialErrorType.GENERAL_MISSING,
      title: 'Integration Setup Required',
      message: 'To display this data, please configure the required integrations with valid credentials.',
      actionText: 'Configure Integrations',
      actionUrl: '/admin/integrations'
    };
  }
  
  // Non-credential error
  return {
    type: CredentialErrorType.GENERAL_MISSING,
    title: 'Service Unavailable',
    message: error.message || 'Unable to connect to the backend service. Please try again later.',
    actionText: 'Retry',
    actionUrl: window.location.href
  };
}

/**
 * Check if error is a credential requirement error
 */
export function isCredentialError(error: Error): boolean {
  return error.message.includes('CREDENTIALS_REQUIRED');
}

/**
 * Get user-friendly message for integration setup
 */
export function getIntegrationSetupMessage(integrationType: string): string {
  const messages: Record<string, string> = {
    jira: 'Configure your Jira instance URL, email, and API token to start syncing issues and project data.',
    github: 'Configure your GitHub personal access token to sync repository data, pull requests, and deployments.',
    aws: 'Configure your AWS access keys and enable billing permissions to track cloud costs and usage.',
    azure: 'Configure your Azure service principal to access billing and resource data.',
    gcp: 'Configure your Google Cloud service account to access billing and resource information.',
  };
  
  return messages[integrationType.toLowerCase()] || 'Configure your integration credentials to access this data.';
}

/**
 * Validate individual credential objects
 */
export function validateCredentials(credentials: any, integrationType: string): void {
  if (!credentials || Object.keys(credentials).length === 0) {
    throw new Error(`CREDENTIALS_REQUIRED: ${integrationType} integration credentials are missing. Please configure your ${integrationType} integration in the admin panel.`);
  }
  
  // Specific validation based on integration type
  switch (integrationType.toLowerCase()) {
    case 'jira':
      if (!credentials.jira_url || !credentials.jira_email || !credentials.jira_token) {
        throw new Error('CREDENTIALS_REQUIRED: Jira integration requires URL, email, and API token. Please complete your Jira configuration.');
      }
      break;
      
    case 'github':
      if (!credentials.github_token) {
        throw new Error('CREDENTIALS_REQUIRED: GitHub integration requires a personal access token. Please configure your GitHub integration.');
      }
      break;
      
    case 'aws':
      if (!credentials.access_key_id || !credentials.secret_access_key) {
        throw new Error('CREDENTIALS_REQUIRED: AWS integration requires access key ID and secret access key. Please configure your AWS integration.');
      }
      break;
      
    case 'azure':
      if (!credentials.client_id || !credentials.client_secret || !credentials.tenant_id) {
        throw new Error('CREDENTIALS_REQUIRED: Azure integration requires client ID, client secret, and tenant ID. Please configure your Azure integration.');
      }
      break;
  }
}

export default {
  parseCredentialError,
  isCredentialError,
  getIntegrationSetupMessage,
  validateCredentials,
  CredentialErrorType
};