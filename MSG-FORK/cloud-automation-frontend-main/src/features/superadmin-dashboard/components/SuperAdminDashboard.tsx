'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, LogOut, Clock } from 'lucide-react';
import CompanyUsageBilling from './CompanyUsageBilling';
import CreateCompanyModal from './CreateCompanyModal';
import './SuperAdminDashboard.css';
import superAdminApi from '../services/superAdminApi';

interface DashboardData {
  usage?: any;
}

function SuperAdminDashboard() {
  const { logout, getUserDisplayName, getRoleDisplayNames } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);
      
      try {
        const realCompaniesData = await superAdminApi.getCompanies({ limit: 50 });
        
        const transformedUsageData = (realCompaniesData as any[])?.map((company: any) => ({
          company_id: company.company_id,
          company_name: company.name,
          size_label: company.size_label,
          is_active: company.is_active,
          created_at: company.created_at,
          total_users: company.total_users,
          admin_name: company.admin_name,
          admin_email: company.admin_email
        })) || [];
        
        setDashboardData({
          usage: transformedUsageData
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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

  const handleCreateCompany = () => {
    setShowCreateModal(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="superadmin-dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Super Admin Dashboard</h1>
              <p>Multi-tenant company management portal</p>
            </div>
            <div className="header-actions">
              <button className="refresh-btn" disabled>
                🔄 Refresh All
              </button>
              <div className="last-updated">
                Loading...
              </div>
            </div>
          </div>
        </header>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #f3f4f6',
            borderTop: '5px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            fontWeight: 500
          }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superadmin-error">
        <div className="error-icon">🚨</div>
        <h2>Dashboard Error</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={handleRefresh}>
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      {/* Professional SaaS Top Bar */}
      <header className="dashboard-header-pro">
        <div className="header-content-pro">
          {/* Left: User Info */}
          <div className="user-section-pro">
            <div className="user-name-pro">{getUserDisplayName()}</div>
            <div className="user-role-pro">{getRoleDisplayNames().join(', ')}</div>
          </div>
          
          {/* Right: Actions */}
          <div className="actions-section-pro">
            <button 
              className="btn-pro btn-primary-pro"
              onClick={handleCreateCompany}
            >
              <Plus size={16} />
              Create Company
            </button>
            
            <button 
              className="btn-pro btn-secondary-pro"
              onClick={handleRefresh}
            >
              <RefreshCw size={16} />
              Refresh All
            </button>
            
            <button 
              className="btn-pro btn-secondary-pro"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
            
            <div className="timestamp-pro">
              <Clock size={14} />
              {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Row 1: Company Usage & Billing - THE HERO SECTION (Full Width) */}
      <div style={{ width: '100%', maxWidth: '1800px', margin: '0 auto 24px auto', padding: '0 20px' }}>
        <CompanyUsageBilling 
          data={dashboardData.usage} 
          onRefresh={handleRefresh}
        />
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}

export default SuperAdminDashboard;
