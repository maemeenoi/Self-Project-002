'use client'

import React, { useState, useEffect } from 'react';
import superAdminApi from '../services/superAdminApi';
import './Modal.css';

interface User {
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
  role?: string;
}

interface Company {
  company_id: number;
  name: string;
}

interface Role {
  role_id: number;
  name: string;
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    middle_name: user.middle_name || '',
    last_name: user.last_name,
    email: user.email,
    company_id: user.company_id || 0,
    role: user.role || 'User',
    is_super_admin: user.is_super_admin,
    is_active: user.is_active
  });
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      first_name: user.first_name,
      middle_name: user.middle_name || '',
      last_name: user.last_name,
      email: user.email,
      company_id: user.company_id || 0,
      role: user.role || 'User',
      is_super_admin: user.is_super_admin,
      is_active: user.is_active
    });
    
    // Fetch companies and roles for the dropdowns
    fetchCompanies();
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const rolesData = await superAdminApi.getRoles();
      setRoles((rolesData as Role[]) || []);
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
      // Fallback roles if API fails
      setRoles([
        { role_id: 1, name: "User" },
        { role_id: 2, name: "Client Admin" }
      ]);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const companiesData = await superAdminApi.getCompanies({ limit: 1000 });
      setCompanies(companiesData as Company[]);
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'company_id' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call update user API (we'll need to implement this)
      await superAdminApi.updateUser(user.user_id, formData);
      onSuccess();
    } catch (err: any) {
      setError('Error updating user: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
    >
      <div 
        className="modal-content large-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Edit User</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* User Details Section */}
            <div className="form-section">
              <h3>User Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="John"
                  />
                </div>
                
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    placeholder="Michael (optional)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@company.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  {companiesLoading ? (
                    <div className="loading-skeleton">Loading companies...</div>
                  ) : (
                    <select 
                      name="company_id" 
                      value={formData.company_id} 
                      onChange={handleChange}
                    >
                      <option value={0}>No Company</option>
                      {companies.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Role</label>
                  {rolesLoading ? (
                    <div className="loading-skeleton">Loading roles...</div>
                  ) : (
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleChange}
                      disabled={formData.is_super_admin}
                    >
                      {roles.map((role) => (
                        <option key={role.role_id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.is_super_admin && (
                    <small className="field-note">Role is automatically set for Super Admins</small>
                  )}
                </div>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="is_super_admin"
                  name="is_super_admin"
                  checked={formData.is_super_admin}
                  onChange={(e) => setFormData({...formData, is_super_admin: e.target.checked})}
                />
                <label htmlFor="is_super_admin">
                  <span className="role-badge super-admin">Super Admin</span> privileges
                </label>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active">User is active</label>
              </div>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;