'use client';

import React, { useEffect, useState } from 'react';
import { CEODashboardData } from '@/types/ceoDashboard';
import { ceoDashboardApi } from '@/services/ceoDashboardApi';
import { RefreshCw, Clock, Activity } from 'lucide-react';
import './CEODashboard.css';

// Import CEO-specific widgets
import ExecutiveKPISummary from './ExecutiveKPISummary';
import RevenueImpactAnalysis from './RevenueImpactAnalysis';
import StrategicInitiatives from './StrategicInitiatives';
import OptimizationProgress from './OptimizationProgress';

// Import reused widgets from CFO dashboard
import CostBreakdownChart from '../cfo/CostBreakdownChart';
import CostTrendLine from '../cfo/CostTrendLine';

// Type adapters to convert CEO dashboard data to CFO widget formats
const adaptCostBreakdownData = (data: any[]): Array<{category: string, total_cost: number}> => {
  return data.map(item => ({
    category: item.category || item.name || 'Unknown',
    total_cost: item.amount || item.total_cost || 0
  }));
};

const adaptCostTrendData = (data: any[]): Array<{period: string, total_cost: number}> => {
  return data.map(item => ({
    period: item.date || item.period || new Date().toISOString().split('T')[0],
    total_cost: item.amount || item.total_cost || 0
  }));
};

const CEODashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<CEODashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Provider selection state
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [availableProviders, setAvailableProviders] = useState<Array<{name: string, display_name: string, cost: number, percentage: number}>>([]);
  const [providersLoading, setProvidersLoading] = useState(true);

  // Cost breakdown grouping state (simplified - only ServiceName supported)
  const [costGroupBy, setCostGroupBy] = useState<'ServiceName' | 'Region' | 'Provider'>('ServiceName');

  // Fetch available providers
  const fetchProviders = async () => {
    try {
      const providers = await ceoDashboardApi.fetchAvailableProviders();
      setAvailableProviders(providers);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setAvailableProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ceoDashboardApi.fetchAllDashboardData(selectedProvider);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error fetching CEO dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch dashboard data when provider changes
  useEffect(() => {
    if (!providersLoading) {
      fetchDashboardData();
    }
  }, [selectedProvider, providersLoading]);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle provider change
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="ceo-dashboard-pro">
        {/* Professional Header */}
        <div className="ceo-header-pro">
          <div className="ceo-header-content">
            <div className="ceo-header-left">
              {/* Provider Selector - Disabled while loading */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Cloud Provider:
                </label>
                <select
                  disabled
                  className="px-4 py-2 text-sm font-medium border-2 border-gray-300 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  <option>Loading...</option>
                </select>
              </div>
            </div>
            <div className="ceo-header-right">
              <button 
                disabled
                className="btn-pro btn-secondary-pro opacity-50 cursor-not-allowed"
              >
                <RefreshCw size={16} />
                Refresh All
              </button>
            </div>
          </div>
        </div>

        {/* Loading Grid */}
        <div className="ceo-dashboard-grid">
          <div className="row-1">
            <ExecutiveKPISummary data={null} loading={true} />
          </div>
          <div className="row-2">
            <div className="ceo-card-pro animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
            <div className="ceo-card-pro animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="row-3">
            <StrategicInitiatives data={null} loading={true} />
          </div>
          <div className="row-4">
            <RevenueImpactAnalysis data={null} loading={true} />
            <OptimizationProgress data={null} loading={true} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="ceo-dashboard-pro">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-red-500" />
              <div>
                <h3 className="font-semibold text-red-900">Failed to Load Dashboard</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="btn-pro btn-primary-pro"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ceo-dashboard-pro">
      {/* Professional Header Bar */}
      <div className="ceo-header-pro">
        <div className="ceo-header-content">
          <div className="ceo-header-left">
            {/* Provider Selector */}
            <div className="flex items-center gap-3">
              <label htmlFor="provider-select" className="text-sm font-medium text-gray-700">
                Cloud Provider:
              </label>
              <select
                id="provider-select"
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="px-4 py-2 text-sm font-medium border-2 border-primary bg-white text-gray-900 rounded-lg hover:border-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={providersLoading || loading}
              >
                <option value="all">All Providers</option>
                {availableProviders.map((provider) => (
                  <option key={provider.name} value={provider.name}>
                    {provider.display_name} (${provider.cost.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>{lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div className="ceo-header-right">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`btn-pro ${loading ? 'opacity-50 cursor-not-allowed' : 'btn-primary-pro'}`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="ceo-dashboard-grid">
        {/* Section 1: Executive KPI Summary */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <ExecutiveKPISummary 
            data={dashboardData?.executiveKPI || null} 
            loading={loading}
            selectedProvider={selectedProvider}
          />
        </div>

        {/* Section 2: Cost Analysis */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <div className="row-2">
            <CostBreakdownChart 
              data={adaptCostBreakdownData(dashboardData?.costBreakdown || [])} 
              loading={loading}
              error={null}
              currentGroupBy={costGroupBy}
              onGroupByChange={(newGroupBy) => setCostGroupBy(newGroupBy as 'ServiceName' | 'Region' | 'Provider')}
            />
            <CostTrendLine 
              data={adaptCostTrendData(dashboardData?.costTrend || [])} 
              loading={loading}
              error={null}
            />
          </div>
        </div>

        {/* Section 3: Strategic Initiatives */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <StrategicInitiatives 
            data={dashboardData?.optimizationProgress || null} 
            loading={loading}
          />
        </div>

        {/* Section 4: Financial Impact & Progress */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <div className="row-4">
            <RevenueImpactAnalysis 
              data={dashboardData?.savingsSummary || null} 
              loading={loading}
            />
            <OptimizationProgress 
              data={dashboardData?.optimizationProgress || null} 
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
