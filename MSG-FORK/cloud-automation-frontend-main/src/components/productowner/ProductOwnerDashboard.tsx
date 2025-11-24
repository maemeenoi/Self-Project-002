'use client';

import React, { useEffect, useState } from 'react';
import { ProductOwnerDashboardData, Provider } from '@/types/productOwnerDashboard';
import { productOwnerDashboardApi } from '@/services/productOwnerDashboardApi';

// Import new PO-specific components
import CustomerSavingsCard from './CustomerSavingsCard';

// Import reused components from other dashboards
import CostBreakdownChart from '../cfo/CostBreakdownChart';
import CostTrendLine from '../cfo/CostTrendLine';
import SavingsSummaryCard from '../cfo/SavingsSummaryCard';
import DeploymentMetricsWidget from '../widgets/DeploymentMetricsWidget';

const ProductOwnerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ProductOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Provider selection state
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);

  // Handle provider change
  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    // Refetch data with the new provider filter
    fetchDashboardData(providerName);
  };

  // Fetch all dashboard data
  const fetchDashboardData = async (provider?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productOwnerDashboardApi.fetchAllDashboardData(provider || selectedProvider);
      setDashboardData(data);
      
      // Set available providers if they exist
      if (data.availableProviders && data.availableProviders.length > 0) {
        setAvailableProviders(data.availableProviders);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Error fetching Product Owner dashboard data:', err);
      
      // Set empty data structure so components can show "no data" states
      setDashboardData({
        costBreakdown: [],
        costTrend: [],
        savingsSummary: {
          total_list_cost: 0,
          total_effective_cost: 0,
          total_savings: 0,
          savings_percent: 0
        },
        teamPerformance: [],
        systemHealth: [],
        deploymentMetrics: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(selectedProvider);
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="po-dashboard space-y-6">
        {/* Dashboard Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 animate-pulse">
              Loading...
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Loading dashboard...</span>
            <button 
              disabled
              className="btn btn-sm opacity-50 cursor-not-allowed"
            >
              Refresh All
            </button>
          </div>
        </div>

        {/* Loading Grid */}
        <div className="po-dashboard-grid">
          {/* Row 1: Cost widgets */}
          <div className="row-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Row 2: Savings widgets */}
          <div className="row-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-48 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-48 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Row 3: Deployment Metrics */}
          <div className="row-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - Show the dashboard with error banner if no data
  if (error && !dashboardData) {
    return (
      <div className="po-dashboard space-y-6">
        {/* Error Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold text-gray-900">Failed to Load Dashboard</h3>
                <p className="text-gray-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-primary btn-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="po-dashboard space-y-6">
      {/* Error Banner (if error but data exists) */}
      {error && dashboardData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold text-gray-900">Partial Data Loading</h3>
                <p className="text-gray-700 text-sm mt-1">Some widgets may show limited data due to: {error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-primary btn-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Real Data
          </span>
          {selectedProvider !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Filtered by {availableProviders.find(p => p.name === selectedProvider)?.display_name || selectedProvider}
            </span>
          )}
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {availableProviders.length > 0 && (
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">All Providers</option>
              {availableProviders.map(provider => (
                <option key={provider.name} value={provider.name}>
                  {provider.display_name} (${provider.cost.toFixed(2)})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh All'}
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="po-dashboard-grid">
        {/* Row 1: Cost Breakdown + Cost Trend (50% each) */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <div className="dashboard-row row-1">
          {dashboardData?.costBreakdown ? (
            <CostBreakdownChart 
              data={dashboardData.costBreakdown} 
              loading={loading}
              error={null}
              currentGroupBy="ServiceName"
            />
          ) : (
            <div className="po-widget-card">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">📊</div>
                <p className="text-gray-500">No cost breakdown data available</p>
              </div>
            </div>
          )}
          {dashboardData?.costTrend ? (
            <CostTrendLine 
              data={dashboardData.costTrend} 
              loading={loading}
              error={null}
            />
          ) : (
            <div className="po-widget-card">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">📈</div>
                <p className="text-gray-500">No cost trend data available</p>
              </div>
            </div>
          )}
          </div>
        </section>

        {/* Row 2: Customer Savings + Savings Summary (Side by Side) */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <div className="dashboard-row row-3">
            <CustomerSavingsCard 
              data={dashboardData?.savingsSummary || null} 
              loading={loading}
            />
            {dashboardData?.savingsSummary ? (
              <SavingsSummaryCard 
                data={dashboardData.savingsSummary} 
                loading={loading}
              />
            ) : (
              <div className="po-widget-card">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">💰</div>
                  <p className="text-gray-500">No savings data available</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Row 5: Deployment Metrics - FULL WIDTH */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-8">
          <div className="dashboard-row row-5">
          {dashboardData?.deploymentMetrics && dashboardData.deploymentMetrics.length > 0 ? (
            <DeploymentMetricsWidget 
              data={{
                deploymentsThisWeek: dashboardData.deploymentMetrics.reduce((sum, d) => sum + (d.deployments || 0), 0),
                successRate: `${(dashboardData.deploymentMetrics.reduce((sum, d) => sum + (d.success_rate || 0), 0) / dashboardData.deploymentMetrics.length).toFixed(1)}%`,
                averageDeployTime: 'N/A', // No real data available
                rollbackRate: 'N/A' // No real data available
              }}
            />
          ) : (
            <div className="po-widget-card">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">🚀</div>
                <p className="text-gray-500">No deployment metrics available</p>
              </div>
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductOwnerDashboard;
