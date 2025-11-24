'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  enabled: boolean;
}

const mockIntegrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Suite of APIs powering online payment processing and commerce solutions for internet businesses of all sizes.',
    category: 'Payments',
    icon: 'S',
    enabled: true
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Web-based hosting service for version control using Git. Collaborate on code with built-in review tools.',
    category: 'Development',
    icon: 'G',
    enabled: true
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Issue tracking and project management tool designed for agile teams to plan, track, and manage work.',
    category: 'Productivity',
    icon: 'J',
    enabled: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team collaboration platform that brings all your communication together in one searchable workspace.',
    category: 'Communication',
    icon: 'S',
    enabled: true
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud storage service that enables users to store and sync files across devices with collaborative features.',
    category: 'Storage',
    icon: 'D',
    enabled: false
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'All-in-one marketing platform for small businesses to manage mailing lists, create campaigns, and track results.',
    category: 'Marketing',
    icon: 'M',
    enabled: false
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Customer relationship management (CRM) platform that brings companies and customers together.',
    category: 'CRM',
    icon: 'S',
    enabled: true
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing and web communication platform for meetings, webinars, and collaborative workspaces.',
    category: 'Communication',
    icon: 'Z',
    enabled: false
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [activeFilter, setActiveFilter] = useState('All integrations');
  const [loadingIntegrations, setLoadingIntegrations] = useState<Set<string>>(new Set());

  const categories = ['All integrations', ...Array.from(new Set(integrations.map(i => i.category)))];
  
  const filteredIntegrations = activeFilter === 'All integrations' 
    ? integrations 
    : integrations.filter(i => i.category === activeFilter);

  const handleToggleIntegration = async (integrationId: string) => {
    setLoadingIntegrations(prev => new Set([...prev, integrationId]));
    
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, enabled: !integration.enabled }
          : integration
      ));
      
      setLoadingIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }, 800);
  };

  const enabledCount = integrations.filter(i => i.enabled).length;
  const totalCount = integrations.length;

  return (
    <ProtectedRoute requiredRoles={['Client Admin']}>
      <SimpleLayout title="Integrations" subtitle="Connect all your tools to leverage the best performance">
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalCount}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">{enabledCount}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalCount - enabledCount}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-pill ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="integrations-grid">
            {filteredIntegrations.map(integration => (
              <div 
                key={integration.id} 
                className={`integration-card ${integration.enabled ? 'enabled' : 'disabled'}`}
              >
                <div className="card-header-admin">
                  <div className="icon-container">
                    <div className={`integration-icon text-white flex items-center justify-center rounded-lg text-lg font-bold ${
                      integration.enabled 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600' 
                        : 'bg-gray-400'
                    }`}>
                      {integration.icon}
                    </div>
                  </div>
                  <div className="toggle-container">
                    <button
                      role="switch"
                      aria-checked={integration.enabled}
                      aria-label={`${integration.enabled ? 'Disable' : 'Enable'} ${integration.name} integration`}
                      className={`toggle-switch ${integration.enabled ? 'enabled' : 'disabled'} ${
                        loadingIntegrations.has(integration.id) ? 'loading' : ''
                      }`}
                      onClick={() => handleToggleIntegration(integration.id)}
                      disabled={loadingIntegrations.has(integration.id)}
                    >
                      <span 
                        className={`toggle-slider ${
                          loadingIntegrations.has(integration.id) ? 'loading' : ''
                        }`}
                      />
                    </button>
                    <span className={`status-badge ${integration.enabled ? 'enabled' : 'disabled'}`}>
                      {integration.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="integration-name">{integration.name}</h3>
                  <p className="integration-description">{integration.description}</p>
                  <div className="mt-auto pt-4">
                    <span className="text-xs text-gray-500 font-medium">{integration.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No integrations found</div>
              <div className="text-gray-400 text-sm">Try selecting a different category</div>
            </div>
          )}
        </div>
      </SimpleLayout>
    </ProtectedRoute>
  );
}
