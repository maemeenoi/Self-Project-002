/**
 * Main CFO Dashboard Component
 * Orchestrates all 9 widgets with responsive layout
 */

import React, { useState, useEffect } from 'react';
import {
  CFODashboardData,
  GroupByType,
} from "@/types/cfoDashboard"

// CloudProvider type to match backend
interface CloudProvider {
  name: string;
  display_name: string;
  cost: number;
  percentage: number;
}
import cfoDashboardApi from '@/services/cfoDashboardApi';

// Import all widget components
import CostBreakdownChart from './CostBreakdownChart';
import CostTrendLine from './CostTrendLine';
import SavingsSummaryCard from './SavingsSummaryCard';
import FinancialAlerts from './FinancialAlerts';
import BudgetTracking from './BudgetTracking';
import VendorManagement from './VendorManagement';
import ResourceAllocationWidget from './ResourceAllocation';
import ExecutiveKPISummary from './ExecutiveKPISummary';
import OptimizationProgressWidget from './OptimizationProgress';

const CFODashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<CFODashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentGroupBy, setCurrentGroupBy] = useState<GroupByType>('ServiceName');
  
  // Provider selection state
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [availableProviders, setAvailableProviders] = useState<Array<{name: string, display_name: string, cost: number, percentage: number}>>([]);
  const [providersLoading, setProvidersLoading] = useState(true);

  // Fetch available providers
  const fetchProviders = async () => {
    try {
      const providers = await cfoDashboardApi.fetchAvailableProviders();
      setAvailableProviders(providers);
    } catch (err) {
      console.error('Error fetching providers:', err);
      // If providers fail to load, still allow "All" option
      setAvailableProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async (groupBy: GroupByType = currentGroupBy, provider: string = selectedProvider) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await cfoDashboardApi.fetchAllDashboardData(groupBy, provider);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error fetching CFO dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProviders();
    fetchDashboardData();
  }, []);

  // Handle provider change
  const handleProviderChange = async (provider: string) => {
    setSelectedProvider(provider);
    await fetchDashboardData(currentGroupBy, provider);
  };

  // Handle group by change for cost breakdown
  const handleGroupByChange = async (newGroupBy: GroupByType) => {
    setCurrentGroupBy(newGroupBy);
    
    try {
      const newCostBreakdown = await cfoDashboardApi.fetchCostBreakdown(newGroupBy, selectedProvider);
      setDashboardData(prev => prev ? {
        ...prev,
        costBreakdown: newCostBreakdown
      } : null);
    } catch (err) {
      console.warn('Failed to fetch new cost breakdown, keeping current data:', err);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchDashboardData(currentGroupBy, selectedProvider);
  };

  if (loading && !dashboardData) {
    return (
      <div>
        {/* Widget Skeletons */}
        <div className="space-y-6">
          {/* Row 1: 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-24 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2 font-semibold">Failed to load dashboard data</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Controls */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {availableProviders.length > 0 && (
              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Providers</option>
                {availableProviders.map(provider => (
                  <option key={provider.name} value={provider.name}>
                    {provider.display_name} (${provider.cost.toFixed(2)})
                  </option>
                ))}
              </select>
            )}
            <span className="text-sm text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh All'}
          </button>
        </div>
      </div>

        {/* Dashboard Grid */}
        <div className="space-y-8">
          {/* Row 1: Cost Analysis Section */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CostBreakdownChart 
                data={dashboardData.costBreakdown}
                loading={loading}
                error={error}
                onGroupByChange={handleGroupByChange}
                currentGroupBy={currentGroupBy}
              />
              <CostTrendLine 
                data={dashboardData.costTrend}
                loading={loading}
                error={error}
              />
            </div>
          </section>

          {/* Row 2: Financial Overview Section */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SavingsSummaryCard 
                data={dashboardData.savingsSummary}
                loading={loading}
                error={error}
              />
              <FinancialAlerts 
                data={dashboardData.financialAlerts}
                loading={loading}
                error={error}
              />
              <BudgetTracking 
                data={dashboardData.costTrend}
                loading={loading}
                error={error}
              />
            </div>
          </section>

          {/* Row 3: Resource Management Section */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VendorManagement 
                data={dashboardData.vendorCosts}
                loading={loading}
                error={error}
              />
              <ResourceAllocationWidget 
                data={dashboardData.resourceAllocation}
                loading={loading}
                error={error}
              />
            </div>
          </section>

          {/* Row 4: Executive KPI Summary (full width) */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
            <ExecutiveKPISummary 
              data={dashboardData.executiveKPI}
              loading={loading}
              selectedProvider={selectedProvider}
            />
          </section>

          {/* Row 5: Optimization Progress (full width) */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
            <OptimizationProgressWidget 
              data={dashboardData.optimizationProgress}
              loading={loading}
              lastUpdated={lastUpdated}
            />
          </section>
        </div>
    </div>
  );
};

export default CFODashboard;
