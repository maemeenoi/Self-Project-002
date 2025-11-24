'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { integrationApi } from '@/services/integration-api';

interface CloudProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerId: 'azure' | 'aws' | 'gcp' | null;
}

interface AzureCredentials {
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

interface GCPCredentials {
  projectId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

export default function CloudProviderConfigModal({
  isOpen,
  onClose,
  onSuccess,
  providerId
}: CloudProviderConfigModalProps) {
  const [azureCredentials, setAzureCredentials] = useState<AzureCredentials>({
    subscriptionId: '',
    tenantId: '',
    clientId: '',
    clientSecret: ''
  });

  const [awsCredentials, setAWSCredentials] = useState<AWSCredentials>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  });

  const [gcpCredentials, setGCPCredentials] = useState<GCPCredentials>({
    projectId: '',
    serviceAccountEmail: '',
    privateKey: ''
  });

  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      // In a real app, load existing credentials from API
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!providerId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare integration data based on provider type
      let integrationName = '';
      let configJson = {};
      let secretsJson = {};

      switch (providerId) {
        case 'azure':
          integrationName = `Azure Integration - ${azureCredentials.subscriptionId}`;
          configJson = {
            subscription_id: azureCredentials.subscriptionId
          };
          secretsJson = {
            client_id: azureCredentials.clientId,
            client_secret: azureCredentials.clientSecret,
            tenant_id: azureCredentials.tenantId
          };
          break;
        
        case 'aws':
          integrationName = `AWS Integration - ${awsCredentials.region}`;
          configJson = {
            region: awsCredentials.region
          };
          secretsJson = {
            aws_access_key_id: awsCredentials.accessKeyId,
            aws_secret_access_key: awsCredentials.secretAccessKey
          };
          break;
        
        case 'gcp':
          integrationName = `GCP Integration - ${gcpCredentials.projectId}`;
          configJson = {
            project_id: gcpCredentials.projectId
          };
          secretsJson = {
            client_email: gcpCredentials.serviceAccountEmail,
            private_key: gcpCredentials.privateKey
          };
          break;
      }

      // Call the backend API to create the integration
      await integrationApi.createIntegration({
        integration_type: providerId,
        integration_name: integrationName,
        config_json: configJson,
        secrets_json: secretsJson,
        is_active: true
      }, true); // Enable trigger_sync for cloud providers to start financial data ingestion
      
      setSuccess(`${getProviderName()} credentials saved successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to save credentials. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!providerId) return;

    setTestingConnection(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare test credentials based on provider type
      let testConfig = {};

      switch (providerId) {
        case 'azure':
          testConfig = {
            subscription_id: azureCredentials.subscriptionId,
            client_id: azureCredentials.clientId,
            client_secret: azureCredentials.clientSecret,
            tenant_id: azureCredentials.tenantId
          };
          break;
        
        case 'aws':
          testConfig = {
            aws_access_key_id: awsCredentials.accessKeyId,
            aws_secret_access_key: awsCredentials.secretAccessKey,
            region: awsCredentials.region
          };
          break;
        
        case 'gcp':
          testConfig = {
            project_id: gcpCredentials.projectId,
            client_email: gcpCredentials.serviceAccountEmail,
            private_key: gcpCredentials.privateKey
          };
          break;
      }

      // Call the backend API to test credentials
      const result = await integrationApi.testIntegrationCredentials(testConfig);
      
      if (result.success) {
        setSuccess('Connection test successful!');
      } else {
        setError(`Connection test failed: ${result.message}`);
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Connection test failed. Please check your credentials.');
    } finally {
      setTestingConnection(false);
    }
  };

  const getProviderName = () => {
    switch (providerId) {
      case 'azure': return 'Microsoft Azure';
      case 'aws': return 'Amazon AWS';
      case 'gcp': return 'Google Cloud Platform';
      default: return '';
    }
  };

  const isFormValid = () => {
    switch (providerId) {
      case 'azure':
        return azureCredentials.subscriptionId && azureCredentials.tenantId && 
               azureCredentials.clientId && azureCredentials.clientSecret;
      case 'aws':
        return awsCredentials.accessKeyId && awsCredentials.secretAccessKey;
      case 'gcp':
        return gcpCredentials.projectId && gcpCredentials.serviceAccountEmail && 
               gcpCredentials.privateKey;
      default:
        return false;
    }
  };

  if (!isOpen || !providerId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configure {getProviderName()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter your cloud provider credentials to enable cost data import
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Azure Configuration */}
          {providerId === 'azure' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={azureCredentials.subscriptionId}
                  onChange={(e) => setAzureCredentials(prev => ({ ...prev, subscriptionId: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={azureCredentials.tenantId}
                  onChange={(e) => setAzureCredentials(prev => ({ ...prev, tenantId: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={azureCredentials.clientId}
                  onChange={(e) => setAzureCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client secret"
                    value={azureCredentials.clientSecret}
                    onChange={(e) => setAzureCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AWS Configuration */}
          {providerId === 'aws' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={awsCredentials.accessKeyId}
                  onChange={(e) => setAWSCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Access Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={awsCredentials.secretAccessKey}
                    onChange={(e) => setAWSCredentials(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Region
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={awsCredentials.region}
                  onChange={(e) => setAWSCredentials(prev => ({ ...prev, region: e.target.value }))}
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>
            </div>
          )}

          {/* GCP Configuration */}
          {providerId === 'gcp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="my-project-12345"
                  value={gcpCredentials.projectId}
                  onChange={(e) => setGCPCredentials(prev => ({ ...prev, projectId: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Account Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="service-account@my-project.iam.gserviceaccount.com"
                  value={gcpCredentials.serviceAccountEmail}
                  onChange={(e) => setGCPCredentials(prev => ({ ...prev, serviceAccountEmail: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Private Key (JSON)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  placeholder="Paste your service account private key JSON here..."
                  value={gcpCredentials.privateKey}
                  onChange={(e) => setGCPCredentials(prev => ({ ...prev, privateKey: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={!isFormValid() || testingConnection}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid() || isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
