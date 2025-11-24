/**
 * GitHub Integration Configuration Modal
 * 
 * Allows users to configure GitHub integration credentials including
 * GitHub token, organization, and repository filters.
 */

import { useState } from 'react';
import { integrationApi, IntegrationConfig, CreateIntegrationRequest } from '@/services/integration-api';

interface GitHubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GitHubConfigModal({ isOpen, onClose, onSuccess }: GitHubConfigModalProps) {
  const [formData, setFormData] = useState({
    github_token: '',
    github_org: '',
    github_repos: '' // comma-separated string
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
    if (!formData.github_token.trim()) {
      setError('GitHub token is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const integrationData = {
        integration_type: 'github',
        integration_name: `GitHub Integration - ${formData.github_org || 'Personal'}`,
        config_json: {
          organization: formData.github_org.trim() || '',
          repositories: formData.github_repos.trim() 
            ? formData.github_repos.split(',').map(r => r.trim()).filter(r => r)
            : []
        },
        secrets_json: {
          token: formData.github_token.trim()
        },
        is_active: true
      };

      await integrationApi.createIntegration(integrationData, true); // trigger sync after creation
      
      setSuccess('GitHub integration configured successfully!');
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
        <h3 className="text-lg font-semibold mb-4">Configure GitHub Integration</h3>
        
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
          {/* GitHub Token */}
          <div>
            <label htmlFor="github_token" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Personal Access Token *
            </label>
            <input
              type="password"
              id="github_token"
              name="github_token"
              value={formData.github_token}
              onChange={handleInputChange}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Create a token at GitHub Settings → Developer settings → Personal access tokens
            </p>
          </div>

          {/* GitHub Organisation */}
          <div>
            <label htmlFor="github_org" className="block text-sm font-medium text-gray-700 mb-1">
              Organisation Name (Optional)
            </label>
            <input
              type="text"
              id="github_org"
              name="github_org"
              value={formData.github_org}
              onChange={handleInputChange}
              placeholder="your-org-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to sync all accessible repositories
            </p>
          </div>

          {/* Repository Filter */}
          <div>
            <label htmlFor="github_repos" className="block text-sm font-medium text-gray-700 mb-1">
              Repository Names (Optional)
            </label>
            <textarea
              id="github_repos"
              name="github_repos"
              value={formData.github_repos}
              onChange={handleInputChange}
              placeholder="repo1, repo2, repo3"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list. Leave empty to sync all repositories.
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
              disabled={loading || !formData.github_token.trim()}
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