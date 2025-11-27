'use client'

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, LogOut, Clock } from 'lucide-react';
import CreateCompanyModal from './CreateCompanyModal';
import AddUserModal from './AddUserModal';
import './SuperAdminDashboard.css';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function SuperAdminLayout({ 
  children, 
  onRefresh, 
  loading = false,
  error = null 
}: SuperAdminLayoutProps) {
  const { logout, getUserDisplayName, getRoleDisplayNames } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const handleCreateCompany = () => {
    setShowCreateModal(true);
  };

  const handleCreateUser = () => {
    setShowCreateUserModal(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
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
          {/* Left Side: Logo + User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className='company' style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                style={{ 
                  height: '60px', 
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </div>
            
            <div className="user-section-pro">
              <div className="user-name-pro">{getUserDisplayName()}</div>
              <div className="user-role-pro">{getRoleDisplayNames().join(', ')}</div>
            </div>
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
              className="btn-pro btn-primary-pro"
              onClick={handleCreateUser}
            >
              <Plus size={16} />
              Create User
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
                hour12: true,
                timeZone: 'UTC' 
              })} UTC
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content" style={{ padding: '20px', maxWidth: '1800px', margin: '0 auto' }}>
        {children}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleRefresh();
          }}
        />
      )}

      {showCreateUserModal && (
        <AddUserModal
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={() => {
            setShowCreateUserModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}