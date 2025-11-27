'use client'

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  XCircle,
  Edit2,
  Trash2,
  Ban,
  Play,
  ArrowUpDown,
  Filter,
  User,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';
import superAdminApi from '../services/superAdminApi';
import EditCompanyModal from './EditCompanyModal';
import EditUserModal from './EditUserModal';
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
  admin_role?: string;
}

interface UserData {
  user_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  company_id?: number;
  company_name?: string;
  is_super_admin: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  role?: string;
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
  
  // Users Management State
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersSortBy, setUsersSortBy] = useState<'name' | 'email' | 'company' | 'created'>('name');
  const [usersFilter, setUsersFilter] = useState<'all' | 'active' | 'inactive' | 'super_admin'>('all');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Fetch all users
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await superAdminApi.getAllUsers();
      setUsersData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback to mock data if API fails
      setUsersData([
        {
          user_id: 1,
          first_name: "John",
          last_name: "Doe", 
          email: "john@acme.com",
          company_id: 1,
          company_name: "Acme Corporation",
          is_super_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          role: "Client Admin"
        },
        {
          user_id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane@techflow.com", 
          company_id: 2,
          company_name: "TechFlow Solutions",
          is_super_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          role: "Client Admin"
        }
      ]);
    } finally {
      setUsersLoading(false);
    }
  };

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

  // User action handlers
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (user: UserData) => {
    if (!window.confirm(`Are you sure you want to delete "${user.first_name} ${user.last_name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await superAdminApi.deleteUser(user.user_id);
      // Refresh users data
      fetchAllUsers();
      alert(`User "${user.first_name} ${user.last_name}" has been successfully deleted.`);
    } catch (error: any) {
      let errorMessage = 'Failed to delete user. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  };

  const handleToggleUserStatus = async (user: UserData) => {
    const newStatus = user.is_active ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} "${user.first_name} ${user.last_name}"?`)) {
      return;
    }

    try {
      await superAdminApi.updateUser(user.user_id, {
        is_active: !user.is_active
      });
      fetchAllUsers(); // Refresh users data
    } catch (error) {
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleUserModalSave = () => {
    setShowEditUserModal(false);
    setSelectedUser(null);
    fetchAllUsers();
  };

  const handleUserModalClose = () => {
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleAddUserModalSave = () => {
    setShowAddUserModal(false);
    fetchAllUsers();
  };

  const handleAddUserModalClose = () => {
    setShowAddUserModal(false);
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

  // Users sorting and filtering
  const sortedUsers = [...usersData].sort((a, b) => {
    switch (usersSortBy) {
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'email':
        return a.email.localeCompare(b.email);
      case 'company':
        return (a.company_name || '').localeCompare(b.company_name || '');
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const filteredUsers = sortedUsers.filter(user => {
    if (usersFilter === 'active') return user.is_active;
    if (usersFilter === 'inactive') return !user.is_active;
    if (usersFilter === 'super_admin') return user.is_super_admin;
    return true;
  });

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
                        {company.admin_role && (
                          <div className="cm-admin-role">{company.admin_role}</div>
                        )}
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
                      title={company.is_active ? 'Deactivate Company' : 'Activate Company'}
                      onClick={() => handleToggleStatus(company)}
                    >
                      {company.is_active ? (
                        <Ban size={16} />
                      ) : (
                        <Play size={16} />
                      )}
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

      {/* Users Management Section */}
      <div className="company-management-pro" style={{marginTop: '48px'}}>
        {/* Users Header */}
        <div className="cm-header">
          <div className="cm-header-content">
            <div className="cm-title-section">
              <User className="cm-header-icon" size={28} />
              <div>
                <h2 className="cm-title">User Management</h2>
                <p className="cm-subtitle">Manage all users across the system</p>
              </div>
            </div>
            
            <div className="cm-header-actions">
              
              <div className="cm-filter-group">
                <Filter size={16} />
                <select 
                  className="cm-select"
                  value={usersFilter}
                  onChange={(e) => setUsersFilter(e.target.value as 'all' | 'active' | 'inactive' | 'super_admin')}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="super_admin">Super Admins</option>
                </select>
              </div>
              
              <div className="cm-filter-group">
                <ArrowUpDown size={16} />
                <select 
                  className="cm-select"
                  value={usersSortBy}
                  onChange={(e) => setUsersSortBy(e.target.value as 'name' | 'email' | 'company' | 'created')}
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="company">Sort by Company</option>
                  <option value="created">Sort by Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Stats Cards */}
        <div className="cm-stats-grid" style={{gridTemplateColumns: 'repeat(5, 1fr)'}}>
          <div className="cm-stat-card">
            <div className="cm-stat-icon purple">
              <User size={24} />
            </div>
            <div className="cm-stat-content">
              <p className="cm-stat-label">Total Users</p>
              <p className="cm-stat-value">{usersData.length}</p>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon green">
              <CheckCircle2 size={24} />
            </div>
            <div className="cm-stat-content">
              <p className="cm-stat-label">Active Users</p>
              <p className="cm-stat-value">{usersData.filter(u => u.is_active).length}</p>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon orange">
              <Shield size={24} />
            </div>
            <div className="cm-stat-content">
              <p className="cm-stat-label">Super Admins</p>
              <p className="cm-stat-value">{usersData.filter(u => u.is_super_admin).length}</p>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon blue">
              <Shield size={24} />
            </div>
            <div className="cm-stat-content">
              <p className="cm-stat-label">Client Admins</p>
              <p className="cm-stat-value">{usersData.filter(u => u.role === 'Client Admin').length}</p>
            </div>
          </div>

          <div className="cm-stat-card">
            <div className="cm-stat-icon gray">
              <XCircle size={24} />
            </div>
            <div className="cm-stat-content">
              <p className="cm-stat-label">Inactive Users</p>
              <p className="cm-stat-value">{usersData.filter(u => !u.is_active).length}</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="cm-table-container">
          {usersLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <table className="cm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className="cm-company-cell">
                        <div className="cm-company-avatar">
                          {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="cm-company-name">
                            {user.first_name} {user.middle_name ? user.middle_name + ' ' : ''}{user.last_name}
                          </span>
                          {user.is_super_admin && (
                            <div className="cm-admin-role" style={{fontSize: '11px', color: '#7c3aed'}}>
                              Super Admin
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cm-admin-cell">
                        <div className="cm-admin-email">{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="cm-size-text">{user.company_name || '—'}</span>
                    </td>
                    <td>
                      {user.is_super_admin ? (
                        <span className="role-badge super-admin">
                          Super Admin
                        </span>
                      ) : user.role === 'Client Admin' ? (
                        <span className="role-badge client-admin">
                          Client Admin
                        </span>
                      ) : (
                        <span className="role-badge user">
                          {user.role || 'User'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`cm-status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className="cm-date-text">{formatCleanDate(user.created_at)}</span>
                    </td>
                    <td>
                      <div className="cm-action-buttons">
                        <button 
                          className="cm-btn cm-btn-edit"
                          title="Edit User"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="cm-btn cm-btn-delete"
                          title="Delete User"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className={`cm-btn ${user.is_active ? 'cm-btn-deactivate' : 'cm-btn-activate'}`}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.is_active ? (
                            <Ban size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!usersLoading && filteredUsers.length === 0 && (
            <div className="cm-empty-state">
              <User size={48} className="cm-empty-icon" />
              <p className="cm-empty-text">No users found</p>
              <p className="cm-empty-subtext">Try adjusting your filters</p>
            </div>
          )}
        </div>
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

      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={handleUserModalClose}
          onSuccess={handleUserModalSave}
        />
      )}

    </div>
  );
}

export default CompanyUsageBilling;
