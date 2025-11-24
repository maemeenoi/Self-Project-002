/**
 * Jira Integration Configuration Modal
 * 
 * Allows users to configure Jira integration credentials including
 * Jira URL, email, API token, and project filters.
 */

import { useState } from 'react';
import { integrationApi, IntegrationConfig, CreateIntegrationRequest } from '@/services/integration-api';

interface JiraConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JiraConfigModal({ isOpen, onClose, onSuccess }: JiraConfigModalProps) {
  const [formData, setFormData] = useState({
    jira_url: '',
    jira_email: '',
    jira_token: '',
    jira_projects: '', // comma-separated string
    jql: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
    setSuccess(null);
  };



  const handleSave = async () => {
    if (!formData.jira_url.trim() || !formData.jira_email.trim() || !formData.jira_token.trim()) {
      setError('Jira URL, email, and API token are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const integrationData = {
        integration_type: 'jira',
        integration_name: `Jira Integration - ${formData.jira_url.replace(/^https?:\/\//, '').split('/')[0]}`,
        config_json: {
          base_url: formData.jira_url.trim(),
          project_keys: formData.jira_projects.trim() || '',
          jql_query: formData.jql.trim() || ''
        },
        secrets_json: {
          email: formData.jira_email.trim(),
          api_token: formData.jira_token.trim()
        },
        is_active: true
      };

      await integrationApi.createIntegration(integrationData, true); // trigger sync after creation
      
      setSuccess('Jira integration configured successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Configure Jira Integration</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}



        <div className="space-y-4">
          {/* Jira URL */}
          <div>
            <label htmlFor="jira_url" className="block text-sm font-medium text-gray-700 mb-1">
              Jira URL *
            </label>
            <input
              type="url"
              id="jira_url"
              name="jira_url"
              value={formData.jira_url}
              onChange={handleInputChange}
              placeholder="https://your-domain.atlassian.net"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Jira instance URL (e.g., https://company.atlassian.net)
            </p>
          </div>

          {/* Jira Email */}
          <div>
            <label htmlFor="jira_email" className="block text-sm font-medium text-gray-700 mb-1">
              Jira Email *
            </label>
            <input
              type="email"
              id="jira_email"
              name="jira_email"
              value={formData.jira_email}
              onChange={handleInputChange}
              placeholder="your-email@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address associated with your Jira account
            </p>
          </div>

          {/* Jira API Token */}
          <div>
            <label htmlFor="jira_token" className="block text-sm font-medium text-gray-700 mb-1">
              Jira API Token *
            </label>
            <input
              type="password"
              id="jira_token"
              name="jira_token"
              value={formData.jira_token}
              onChange={handleInputChange}
              placeholder="Your API token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Create an API token at id.atlassian.com → Security → API tokens
            </p>
          </div>

          {/* Project Filter */}
          <div>
            <label htmlFor="jira_projects" className="block text-sm font-medium text-gray-700 mb-1">
              Project Keys (Optional)
            </label>
            <input
              type="text"
              id="jira_projects"
              name="jira_projects"
              value={formData.jira_projects}
              onChange={handleInputChange}
              placeholder="PROJ1, PROJ2, PROJ3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated project keys. Leave empty to sync all accessible projects.
            </p>
          </div>

          {/* JQL Filter */}
          <div>
            <label htmlFor="jql" className="block text-sm font-medium text-gray-700 mb-1">
              JQL Filter (Optional)
            </label>
            <textarea
              id="jql"
              name="jql"
              value={formData.jql}
              onChange={handleInputChange}
              placeholder="status != Done AND updated >= -30d"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Custom JQL query to filter issues. Leave empty for default filtering.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6">
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.jira_url.trim() || !formData.jira_email.trim() || !formData.jira_token.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}