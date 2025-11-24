'use client'

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  XCircle,
  Edit2,
  Trash2,
  Ban,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { formatDate } from '../utils/formatters';
import superAdminApi from '../services/superAdminApi';
import EditCompanyModal from './EditCompanyModal';
import './CompanyManagement.css';

interface CompanyUsage {
  company_id: number;
  company_name: string;
  size_label: string;
  is_active: boolean;
  created_at: string;
  total_users?: number;
  admin_name?: string;
  admin_email?: string;
}

interface CompanyUsageBillingProps {
  data?: CompanyUsage[];
  onRefresh?: () => void;
}

function CompanyUsageBilling({ data, onRefresh }: CompanyUsageBillingProps) {
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'created'>('name');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyUsage | null>(null);

  // Action handlers
  const handleEdit = (company: CompanyUsage) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleDelete = async (company: CompanyUsage) => {
    if (!window.confirm(`Are you sure you want to delete "${company.company_name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await superAdminApi.deleteCompany(company.company_id);
      
      if (onRefresh) {
        onRefresh();
      }
      
      alert(`Company "${company.company_name}" has been successfully deleted.`);
    } catch (error: any) {
      let errorMessage = 'Failed to delete company. Please try again.';
      if (error.message) {
        if (error.message.includes('Cannot delete company with') && error.message.includes('users')) {
          errorMessage = `${error.message}\n\nTo delete this company:\n1. First remove all users from the company\n2. Then try deleting the company again`;
        } else {
          errorMessage = error.message;
        }
      }
      alert(errorMessage);
    }
  };

  const handleToggleStatus = async (company: CompanyUsage) => {
    const newStatus = company.is_active ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} "${company.company_name}"?`)) {
      return;
    }

    try {
      await superAdminApi.updateCompany(company.company_id, {
        is_active: !company.is_active
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      alert('Failed to update company status. Please try again.');
    }
  };

  const handleModalSave = () => {
    setShowEditModal(false);
    setSelectedCompany(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedCompany(null);
  };

  if (!data) {
    return (
      <div className="company-management-pro loading">
        <div className="loading-spinner"></div>
        <p>Loading company data...</p>
      </div>
    );
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.company_name.localeCompare(b.company_name);
      case 'users':
        return (b.total_users || 0) - (a.total_users || 0);
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  // Filter data
  const filteredData = sortedData.filter(company => {
    if (filter === 'active') return company.is_active;
    if (filter === 'inactive') return !company.is_active;
    return true;
  });

  // Calculate totals
  const totalCompanies = data.length;
  const activeCompanies = data.filter(c => c.is_active).length;
  const totalUsers = data.reduce((sum, company) => sum + (company.total_users || 0), 0);

  // Format date to clean format
  const formatCleanDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="company-management-pro">
      {/* Header */}
      <div className="cm-header">
        <div className="cm-header-content">
          <div className="cm-title-section">
            <Building2 className="cm-header-icon" size={28} />
            <div>
              <h2 className="cm-title">Company Management</h2>
              <p className="cm-subtitle">Manage all companies and their configurations</p>
            </div>
          </div>
          
          <div className="cm-header-actions">
            <div className="cm-filter-group">
              <Filter size={16} />
              <select 
                className="cm-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Companies</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <div className="cm-filter-group">
              <ArrowUpDown size={16} />
              <select 
                className="cm-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'users' | 'created')}
              >
                <option value="name">Sort by Name</option>
                <option value="users">Sort by Users</option>
                <option value="created">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cm-stats-grid">
        <div className="cm-stat-card">
          <div className="cm-stat-icon blue">
            <Building2 size={24} />
          </div>
          <div className="cm-stat-content">
            <p className="cm-stat-label">Total Companies</p>
            <p className="cm-stat-value">{totalCompanies}</p>
          </div>
        </div>

        <div className="cm-stat-card">
          <div className="cm-stat-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div className="cm-stat-content">
            <p className="cm-stat-label">Active</p>
            <p className="cm-stat-value">{activeCompanies}</p>
          </div>
        </div>

        <div className="cm-stat-card">
          <div className="cm-stat-icon purple">
            <Users size={24} />
          </div>
          <div className="cm-stat-content">
            <p className="cm-stat-label">Total Users</p>
            <p className="cm-stat-value">{totalUsers}</p>
          </div>
        </div>

        <div className="cm-stat-card">
          <div className="cm-stat-icon gray">
            <XCircle size={24} />
          </div>
          <div className="cm-stat-content">
            <p className="cm-stat-label">Inactive</p>
            <p className="cm-stat-value">{totalCompanies - activeCompanies}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cm-table-container">
          <table className="cm-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Admin</th>
              <th>Status</th>
              <th>Size</th>
              <th>Users</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((company) => (
              <tr key={company.company_id}>
                <td>
                  <div className="cm-company-cell">
                    <div className="cm-company-avatar">
                      {company.company_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="cm-company-name">{company.company_name}</span>
                  </div>
                </td>
                <td>
                  <div className="cm-admin-cell">
                    {company.admin_name ? (
                      <>
                        <div className="cm-admin-name">{company.admin_name}</div>
                        {company.admin_email && (
                          <div className="cm-admin-email">{company.admin_email}</div>
                        )}
                      </>
                    ) : (
                      <span className="cm-admin-unassigned">—</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`cm-status-badge ${company.is_active ? 'active' : 'inactive'}`}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <span className="cm-size-text">{company.size_label}</span>
                </td>
                <td>
                  <span className="cm-users-count">{company.total_users || 0}</span>
                </td>
                <td>
                  <span className="cm-date-text">{formatCleanDate(company.created_at)}</span>
                </td>
                <td>
                  <div className="cm-action-buttons">
                    <button 
                      className="cm-btn cm-btn-edit"
                      title="Edit Company"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="cm-btn cm-btn-delete"
                      title="Delete Company"
                      onClick={() => handleDelete(company)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      className={`cm-btn ${company.is_active ? 'cm-btn-deactivate' : 'cm-btn-activate'}`}
                      title={company.is_active ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggleStatus(company)}
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="cm-empty-state">
            <Building2 size={48} className="cm-empty-icon" />
            <p className="cm-empty-text">No companies found</p>
            <p className="cm-empty-subtext">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={{
            company_id: selectedCompany.company_id,
            name: selectedCompany.company_name,
            size_label: selectedCompany.size_label,
            is_active: selectedCompany.is_active,
            created_at: selectedCompany.created_at,
            total_users: selectedCompany.total_users || 0
          }}
          onClose={handleModalClose}
          onSuccess={handleModalSave}
        />
      )}
    </div>
  );
}

export default CompanyUsageBilling;
