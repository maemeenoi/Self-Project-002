'use client'

import React, { useEffect, useState } from 'react';

// Import all the components
import SuperAdminLayout from './SuperAdminLayout';
import CompanyUsageBilling from './CompanyUsageBilling';
import TotalCompaniesCard from './TotalCompaniesCard';
import TotalUsersCard from './TotalUsersCard';
import ActiveCompaniesCard from './ActiveCompaniesCard';
import SystemHealthCard from './SystemHealthCard';
import IntegrationStatus from './IntegrationStatus';
import RecentCompanies from './RecentCompanies';

import superAdminApi from '../services/superAdminApi';

interface DashboardData {
  usage?: any;
  totalCompanies?: any;
  totalUsers?: any;
  activeCompanies?: any;
  systemHealth?: any;
  recentCompanies?: any;
  integrationStatus?: any;
}

function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🚀 Fetching SuperAdmin Dashboard data...');
        
        // Fetch all data in parallel for better performance
        const [
          companiesData,
          totalCompaniesData,
          totalUsersData,
          activeCompaniesData,
          systemHealthData,
          recentCompaniesData,
          integrationStatusData
        ] = await Promise.allSettled([
          superAdminApi.getCompanies({ limit: 50 }),
          superAdminApi.getTotalCompanies(),
          superAdminApi.getTotalUsers(),
          superAdminApi.getActiveCompanies(),
          superAdminApi.getSystemHealth(),
          superAdminApi.getRecentCompanies(5),
          superAdminApi.getIntegrationStatus()
        ]);

        // Transform and set data
        const usage = companiesData.status === 'fulfilled' ? (companiesData.value as any[])?.map((company: any) => ({
          company_id: company.company_id,
          company_name: company.name,
          size_label: company.size_label,
          is_active: company.is_active,
          created_at: company.created_at,
          total_users: company.total_users,
          admin_name: company.admin_name,
          admin_email: company.admin_email
        })) : [];

        setDashboardData({
          usage,
          totalCompanies: totalCompaniesData.status === 'fulfilled' ? totalCompaniesData.value : null,
          totalUsers: totalUsersData.status === 'fulfilled' ? totalUsersData.value : null,
          activeCompanies: activeCompaniesData.status === 'fulfilled' ? activeCompaniesData.value : null,
          systemHealth: systemHealthData.status === 'fulfilled' ? systemHealthData.value : null,
          recentCompanies: recentCompaniesData.status === 'fulfilled' ? recentCompaniesData.value : [],
          integrationStatus: integrationStatusData.status === 'fulfilled' ? integrationStatusData.value : null
        });

        console.log('✅ Dashboard data loaded successfully');
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SuperAdminLayout 
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
    >
      {/* Metrics Section */}
      <section className="metrics-section" style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div className="section-header" style={{
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>Key Metrics</h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>Overview of system performance and activity</p>
        </div>
        
        <div className="metrics-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <TotalCompaniesCard data={dashboardData.totalCompanies} />
          <TotalUsersCard data={dashboardData.totalUsers} />
          <ActiveCompaniesCard data={dashboardData.activeCompanies} />
          <SystemHealthCard data={dashboardData.systemHealth} />
        </div>
      </section>

      {/* Row 2: Main Content - Full Width */}
      <div className="main-content-grid" style={{
        marginBottom: '30px'
      }}>
        <CompanyUsageBilling 
          data={dashboardData.usage} 
          onRefresh={handleRefresh}
        />
      </div>

      {/* Row 3: Bottom Section - Two Column Layout */}
      <div className="bottom-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        <RecentCompanies data={dashboardData.recentCompanies} />
        <IntegrationStatus data={dashboardData.integrationStatus} />
      </div>
    </SuperAdminLayout>
  );
}

export default SuperAdminDashboard;
