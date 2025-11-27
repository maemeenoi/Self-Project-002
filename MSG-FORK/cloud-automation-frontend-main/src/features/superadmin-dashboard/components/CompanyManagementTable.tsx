'use client'

import React, { useState } from 'react';
import CreateCompanyModal from './CreateCompanyModal';
import EditCompanyModal from './EditCompanyModal';
import LoginAsModal from './LoginAsModal';
import EmptyState from './EmptyState';
import { formatDate } from '../utils/formatters';
import superAdminApi from '../services/superAdminApi';
import './CompanyManagementTable.css';

interface Company {
  company_id: number;
  name: string;
  size_label: string;
  is_active: boolean;
  created_at: string;
  total_users: number; // This will be calculated from the UserAccount table
}

interface CompanyManagementData {
  total: number;
  companies: Company[];
}

interface CompanyManagementTableProps {
  data?: CompanyManagementData;
  onRefresh: () => void;
}

function CompanyManagementTable({ data, onRefresh }: CompanyManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginAsModal, setShowLoginAsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded to show action buttons
  const [showLimit, setShowLimit] = useState(6);

  if (!data || !data.companies) {
    return (
      <div className="company-management-table superadmin-widget-card loading">
        <div className="widget-header">
          <h3>Company Management</h3>
        </div>
        <div className="loading-content">
          <div className="loading-skeleton">Loading companies...</div>
        </div>
      </div>
    );
  }

  // Filter companies
  const filteredCompanies = (Array.isArray(data?.companies) ? data.companies : []).filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && company.is_active) ||
      (statusFilter === 'inactive' && !company.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDashboard = (company: Company) => {
    // Navigate to company's dashboard
    window.location.href = `/dashboard/${company.company_id}`;
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleLoginAs = (company: Company) => {
    setSelectedCompany(company);
    setShowLoginAsModal(true);
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      await superAdminApi.toggleCompanyStatus(company.company_id, !company.is_active);
      onRefresh();
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const handleDelete = async (company: Company) => {
    const confirmed = window.confirm(
      `⚠️ DANGER: Are you sure you want to permanently delete "${company.name}"?\n\n` +
      `This will:\n` +
      `• Remove all company data from the Azure database\n` +
      `• Delete all associated users and settings\n` +
      `• This action CANNOT be undone!\n\n` +
      `Type "DELETE" to confirm:`
    );
    
    if (!confirmed) return;
    
    // Additional confirmation step
    const confirmText = prompt(
      `⚠️ FINAL CONFIRMATION\n\n` +
      `Company: ${company.name}\n` +
      `Users: ${company.total_users}\n` +
      `Size: ${company.size_label}\n\n` +
      `Type exactly "DELETE" to permanently remove this company from the Azure database:`
    );
    
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled. Company was not deleted.');
      return;
    }

    try {
      const result = await superAdminApi.deleteCompany(company.company_id) as { message?: string };
      alert(`✅ ${result.message || 'Company deleted successfully'}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      alert(`❌ Failed to delete company: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="company-management-table superadmin-widget-card">
      <div className="widget-header">
        <div className="header-content">
          <div>
            <h3>Company Management</h3>
            <p className="company-count">{data.total} total companies</p>
          </div>
          <div className="header-actions">
            <button 
              className="toggle-table-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '▲ Collapse' : `▼ Expand (${data.total})`}
            </button>
            <button 
              className="create-company-btn"
              onClick={() => setShowCreateModal(true)}
            >
              + New Company
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Table - only show when expanded */}
      {isExpanded && (
        <>
          <div className="table-filters">
            <input
              type="text"
              className="search-input"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-container">
            {filteredCompanies.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No companies found"
                message={searchQuery ? 
                  `No companies match "${searchQuery}"` : 
                  "No companies in the system yet."
                }
                action={!searchQuery ? {
                  label: '+ Create First Company',
                  onClick: () => setShowCreateModal(true)
                } : undefined}
              />
            ) : (
              <table className="superadmin-table striped">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Users</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.slice(0, isExpanded ? filteredCompanies.length : showLimit).map((company, index) => {
                
                return (
                  <tr key={company.company_id}>
                    <td>
                      <div className="company-info">
                        <strong>{company.name}</strong>
                        <small>ID: {company.company_id}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${company.is_active ? 'active' : 'inactive'}`}>
                        {company.is_active ? '✅ Active' : '🚫 Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className="size-badge">
                        📏 {company.size_label || 'Unknown'}
                      </span>
                    </td>
                    <td>{company.total_users || 0}</td>
                    <td>
                      <small>{formatDate(company.created_at)}</small>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewDashboard(company)}
                        title="View Dashboard"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(company)}
                        title="Edit Company"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn login-as"
                        onClick={() => handleLoginAs(company)}
                        title="Login As Admin"
                      >
                        🔐
                      </button>
                      <button 
                        className={`action-btn ${company.is_active ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(company)}
                        title={company.is_active ? 'Deactivate Company' : 'Activate Company'}
                      >
                        {company.is_active ? '🚫' : '✅'}
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(company)}
                        title="Delete Company (Permanent)"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Quick stats when collapsed */}
      {!isExpanded && (
        <div className="collapsed-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{data.companies.filter(c => c.is_active).length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{data.companies.filter(c => !c.is_active).length}</span>
              <span className="stat-label">Inactive</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{data.companies.filter(c => c.size_label === 'Large').length}</span>
              <span className="stat-label">Large</span>
            </div>
          </div>
        </div>
      )}      {/* Pagination */}
      {filteredCompanies.length > 0 && (
        <div className="table-pagination">
          <span>Showing {filteredCompanies.length} of {data?.total || 0}</span>
          <div className="pagination-buttons">
            <button disabled>← Previous</button>
            <button disabled>Next →</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
            onRefresh();
          }}
        />
      )}

      {showLoginAsModal && selectedCompany && (
        <LoginAsModal
          company={selectedCompany}
          onClose={() => {
            setShowLoginAsModal(false);
            setSelectedCompany(null);
          }}
          onConfirm={async () => {
            // Implement impersonation logic
            try {
              const data = await superAdminApi.loginAsCompany(selectedCompany.company_id) as any;
              // Store impersonation token and redirect
              localStorage.setItem('impersonation_token', data.access_token);
              localStorage.setItem('impersonated_company_id', selectedCompany.company_id.toString());
              window.location.href = `/dashboard/${selectedCompany.company_id}`;
            } catch (error) {
              console.error('Error impersonating user:', error);
            }
          }}
        />
      )}

      {/* Floating Create Button */}
      <button 
        className="floating-create-btn"
        onClick={() => setShowCreateModal(true)}
        title="Create New Company"
      >
        + New Company
      </button>
    </div>
  );
}

export default CompanyManagementTable;
