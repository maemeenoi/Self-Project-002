'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { integrationApi, IntegrationStatus, IntegrationConfig } from '@/services/integration-api';
import GitHubConfigModal from '@/components/integrations/GitHubConfigModal';
import JiraConfigModal from '@/components/integrations/JiraConfigModal';
import CloudProviderConfigModal from '@/components/integrations/CloudProviderConfigModal';

interface Integration {
  id: 'github' | 'jira' | 'azure' | 'aws' | 'gcp';
  name: string;
  description: string;
  category: string;
  icon: JSX.Element;
  configured: boolean;
  lastSync?: string;
  lastSyncStatus?: string;
  recordsCount?: number;
  errorMessage?: string;
}

/**
 * Icon Attribution:
 * Jira icon by Icons8 - https://icons8.com/icon/88A2TjSK5Rmi/jira
 * Azure icon by Icons8 - https://icons8.com/icon/VLKafOkk3sBX/azure  
 * Amazon AWS icon by Icons8 - https://icons8.com/icon/AtEKkdldZfri/amazon-aws
 * Google Cloud icon by Icons8 - https://icons8.com/icon/WHRLQdbEXQ16/google-cloud
 */

// Icon components for professional logos
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const JiraIcon = ({ className }: { className?: string }) => (
  <img 
    src="/icons8-jira-50.png" 
    alt="Jira" 
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const AzureIcon = ({ className }: { className?: string }) => (
  <img 
    src="/icons8-azure-96.png" 
    alt="Azure" 
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const AWSIcon = ({ className }: { className?: string }) => (
  <img 
    src="/icons8-amazon-aws-96.png" 
    alt="Amazon AWS" 
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

const GCPIcon = ({ className }: { className?: string }) => (
  <img 
    src="/icons8-google-cloud-96.png" 
    alt="Google Cloud" 
    className={className}
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
);

// Focus on GitHub and Jira integrations for data pipeline
const AVAILABLE_INTEGRATIONS: Omit<Integration, 'configured' | 'lastSync' | 'lastSyncStatus' | 'recordsCount' | 'errorMessage'>[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync repositories, issues, pull requests, and commits to analyze development workflow metrics.',
    category: 'Development',
    icon: <GitHubIcon className="w-full h-full" />
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Import projects, issues, sprints, and story points to track project management and delivery metrics.',
    category: 'Project Management',
    icon: <JiraIcon className="w-full h-full" />
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Configure Azure subscription credentials to import cost and billing data.',
    category: 'Cloud Provider',
    icon: <AzureIcon className="w-full h-full" />
  },
  {
    id: 'aws',
    name: 'Amazon AWS',
    description: 'Set up AWS access keys to sync cost explorer and billing data.',
    category: 'Cloud Provider',
    icon: <AWSIcon className="w-full h-full" />
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    description: 'Connect GCP service account to analyze cloud spend and usage.',
    category: 'Cloud Provider',
    icon: <GCPIcon className="w-full h-full" />
  }
];

interface CloudProvider {
  id: 'azure' | 'aws' | 'gcp';
  name: string;
  description: string;
  icon: string;
  configured: boolean;
  credentials?: {
    subscriptionId?: string;
    tenantId?: string;
    clientId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    projectId?: string;
    serviceAccountEmail?: string;
  };
}

const CLOUD_PROVIDERS: Omit<CloudProvider, 'configured' | 'credentials'>[] = [
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Configure Azure subscription credentials to import cost and billing data.',
    icon: 'AZ'
  },
  {
    id: 'aws',
    name: 'Amazon AWS',
    description: 'Set up AWS access keys to sync cost explorer and billing data.',
    icon: 'AWS'
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    description: 'Connect GCP service account to analyze cloud spend and usage.',
    icon: 'GCP'
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIntegrations, setLoadingIntegrations] = useState<Set<string>>(new Set());
  const [showConfigModal, setShowConfigModal] = useState<string | null>(null);
  const [showCloudConfigModal, setShowCloudConfigModal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load integrations status on component mount
  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  const loadIntegrationsStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statusList = await integrationApi.getAllIntegrationsStatus();
      
      // Map available integrations with their status
      const integrationsWithStatus = AVAILABLE_INTEGRATIONS.map(availableIntegration => {
        const status = statusList.find(s => s.integration_type === availableIntegration.id);
        return {
          ...availableIntegration,
          configured: status?.configured || false,
          lastSync: status?.last_sync,
          lastSyncStatus: status?.last_sync_status,
          recordsCount: status?.records_count,
          errorMessage: status?.error_message
        };
      });
      
      setIntegrations(integrationsWithStatus);
    } catch (err) {
      console.error('Failed to load integrations status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
      
      // Fallback to showing available integrations without status
      const fallbackIntegrations = AVAILABLE_INTEGRATIONS.map(integration => ({
        ...integration,
        configured: false
      }));
      setIntegrations(fallbackIntegrations);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncIntegration = async (integrationId: 'github' | 'jira' | 'azure' | 'aws' | 'gcp') => {
    // Cloud providers don't support manual sync - they work on scheduled imports
    if (integrationId === 'azure' || integrationId === 'aws' || integrationId === 'gcp') {
      setShowCloudConfigModal(integrationId);
      return;
    }

    // For GitHub and Jira - if not configured, open config modal
    if (!integrations.find(i => i.id === integrationId)?.configured) {
      setShowConfigModal(integrationId);
      return;
    }

    // For configured GitHub and Jira - perform sync operation
    setLoadingIntegrations(prev => new Set([...prev, integrationId]));
    
    try {
      const response = await integrationApi.syncIntegrationByType(integrationId);
      if (response.success) {
        // Reload status after starting sync
        await loadIntegrationsStatus();
      } else {
        setError(`Failed to start ${integrationId} sync: ${response.message}`);
      }
    } catch (err) {
      console.error(`Failed to sync ${integrationId}:`, err);
      setError(err instanceof Error ? err.message : `Failed to sync ${integrationId}`);
    } finally {
      setLoadingIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }
  };

  const configuredCount = integrations.filter(i => i.configured).length;
  const totalCount = integrations.length;

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['Client Admin']}>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrations</h1>
              <p className="text-gray-600">Connect your development tools and cloud providers to sync workflow and cost data</p>
            </div>
            
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading integrations...</div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['Client Admin']}> 
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Integrations</h1>
            <p className="text-gray-600">Connect your development tools and cloud providers to sync workflow and cost data</p>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 text-sm">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Header Stats */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-6">
                <div className="text-3xl font-bold text-blue-700 mb-1">{totalCount}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-6">
                <div className="text-3xl font-bold text-blue-700 mb-1">{configuredCount}</div>
                <div className="text-sm text-gray-600">Configured</div>
              </div>
              <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-6">
                <div className="text-3xl font-bold text-blue-700 mb-1">{totalCount - configuredCount}</div>
                <div className="text-sm text-gray-600">Not Configured</div>
              </div>
              <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-6">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {integrations.reduce((sum, i) => sum + (i.recordsCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
            </div>
          </section>

          {/* Integrations by Category */}
          
          {/* Workflow & Development Section */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Workflow & Development</h2>
              <p className="text-gray-600">Connect development and project management tools to analyze workflow metrics and productivity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.filter(integration => integration.category === 'Development' || integration.category === 'Project Management').map(integration => (
                <div 
                  key={integration.id} 
                  className={`bg-white rounded-lg border-2 p-6 ${
                    integration.configured 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        integration.configured 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}>
                        <div className="w-7 h-7">
                          {integration.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <span className="text-xs text-gray-500 font-medium">{integration.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        integration.configured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {integration.configured ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                  </div>
                
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                {/* Integration Status */}
                {integration.configured && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-500">Last Sync</div>
                        <div className="font-medium">
                          {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Records</div>
                        <div className="font-medium">{integration.recordsCount || 0}</div>
                      </div>
                    </div>
                    {integration.lastSyncStatus && (
                      <div className="mt-2">
                        <div className="text-gray-500 text-xs">Status</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          integration.lastSyncStatus === 'success' ? 'bg-green-100 text-green-800' :
                          integration.lastSyncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {integration.lastSyncStatus}
                        </span>
                      </div>
                    )}
                    {integration.errorMessage && (
                      <div className="mt-2 text-xs text-red-600">{integration.errorMessage}</div>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncIntegration(integration.id)}
                    disabled={loadingIntegrations.has(integration.id)}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
                      integration.configured
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingIntegrations.has(integration.id) 
                      ? 'Syncing...' 
                      : integration.configured 
                        ? 'Sync Now' 
                        : 'Configure'
                    }
                  </button>
                  {integration.configured && (
                    <button
                      onClick={() => {
                        if (integration.id === 'github' || integration.id === 'jira') {
                          setShowConfigModal(integration.id);
                        } else {
                          setShowCloudConfigModal(integration.id);
                        }
                      }}
                      className="px-4 py-2 border border-green-200 rounded text-sm font-medium text-gray-700 hover:bg-green-50"
                    >
                      Settings
                    </button>
                  )}
                </div>
              </div>
              ))}
            </div>
          </section>

          {/* Cloud Providers Section */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Cloud Providers</h2>
              <p className="text-gray-600">Configure cloud provider credentials to import cost and billing data for FinOps analysis.</p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-gray-400">*</span> Cost data is imported automatically by scheduled processes. Manual sync is not required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.filter(integration => integration.category === 'Cloud Provider').map(integration => (
                <div 
                  key={integration.id} 
                  className={`bg-white rounded-lg border-2 p-6 ${
                    integration.configured 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        integration.configured 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}>
                        <div className="w-7 h-7">
                          {integration.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <span className="text-xs text-gray-500 font-medium">{integration.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      integration.configured 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {integration.configured ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                {/* Cloud Provider Status - Same format as GitHub/Jira */}
                {integration.configured && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-500">Last Import</div>
                        <div className="font-medium">
                          {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Records</div>
                        <div className="font-medium">{integration.recordsCount || 0}</div>
                      </div>
                    </div>
                    {integration.lastSyncStatus && (
                      <div className="mt-2">
                        <div className="text-gray-500 text-xs">Status</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          integration.lastSyncStatus === 'success' ? 'bg-green-100 text-green-800' :
                          integration.lastSyncStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {integration.lastSyncStatus}
                        </span>
                      </div>
                    )}
                    {integration.errorMessage && (
                      <div className="mt-2 text-xs text-red-600">{integration.errorMessage}</div>
                    )}
                  </div>
                )}
                
                {/* Single Action Button */}
                <div className="flex">
                  <button
                    onClick={() => handleSyncIntegration(integration.id)}
                    disabled={loadingIntegrations.has(integration.id)}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
                      integration.configured
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {integration.configured ? 'Manage' : 'Configure'}
                  </button>
                </div>
              </div>
              ))}
            </div>
          </section>

          {/* Configuration Modals */}
          <GitHubConfigModal
            isOpen={showConfigModal === 'github'}
            onClose={() => setShowConfigModal(null)}
            onSuccess={() => loadIntegrationsStatus()}
          />
          
          <JiraConfigModal
            isOpen={showConfigModal === 'jira'}
            onClose={() => setShowConfigModal(null)}
            onSuccess={() => loadIntegrationsStatus()}
          />

          <CloudProviderConfigModal
            isOpen={showCloudConfigModal !== null}
            onClose={() => setShowCloudConfigModal(null)}
            onSuccess={() => loadIntegrationsStatus()}
            providerId={showCloudConfigModal as 'azure' | 'aws' | 'gcp' | null}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}