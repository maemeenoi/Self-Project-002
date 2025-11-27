'use client'

import React, { useState, useEffect } from 'react';
import superAdminApi from '../services/superAdminApi';
import './Modal.css';

interface Company {
  company_id: number;
  name: string;
  size_label: string;
  is_active: boolean;
  created_at: string;
  total_users: number;
}

interface AdminInfo {
  admin_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  last_login?: string;
}

interface EditCompanyModalProps {
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

function EditCompanyModal({ company, onClose, onSuccess }: EditCompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company.name,
    size_label: company.size_label,
    is_active: company.is_active
  });
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: company.name,
      size_label: company.size_label,
      is_active: company.is_active
    });
    
    // Fetch admin information
    fetchAdminInfo();
  }, [company]);

  const fetchAdminInfo = async () => {
    try {
      setAdminLoading(true);
      console.log('🔍 Fetching admin info for company ID:', company.company_id);
      const admin = await superAdminApi.getCompanyAdmin(company.company_id);
      console.log('✅ Admin info received:', admin);
      setAdminInfo(admin as AdminInfo);
    } catch (err: any) {
      console.error('❌ Admin info fetch failed:', err);
      console.warn('Admin info not found:', err.message);
      setAdminInfo(null);
    } finally {
      setAdminLoading(false);
    }
  };

  // Calculate password strength
  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(newPassword)) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 15;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  }, [newPassword]);

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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await superAdminApi.updateCompany(company.company_id, formData);
      onSuccess();
    } catch (err: any) {
      setError('Error updating company: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const result = await superAdminApi.resetAdminPassword(company.company_id, { new_password: newPassword }) as { message: string; success: boolean };
      setPasswordSuccess(result.message);
      setNewPassword('');
      setShowPasswordReset(false);
      
      // Refresh admin info to update last modified time if available
      await fetchAdminInfo();
    } catch (err: any) {
      setPasswordError('Error resetting password: ' + (err.message || 'Unknown error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return '#ff4757';
    if (passwordStrength < 60) return '#ffa502';
    if (passwordStrength < 80) return '#2ed573';
    return '#1e90ff';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
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
          <h2>Edit Company</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Company Details Section */}
            <div className="form-section">
              <h3>Company Details</h3>
              
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Acme Corporation"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Size</label>
                  <select name="size_label" value={formData.size_label} onChange={handleChange}>
                    <option value="Small">Small (1-50 employees)</option>
                    <option value="Medium">Medium (51-200 employees)</option>
                    <option value="Large">Large (201-1000 employees)</option>
                    <option value="Enterprise">Enterprise (1000+ employees)</option>
                  </select>
                </div>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="is_active">Company is active</label>
              </div>
            </div>

            {/* Client Admin Information Section */}
            <div className="form-section">
              <h3>Client Administrator</h3>
              
              {adminLoading ? (
                <div className="loading-state">
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ) : adminInfo ? (
                <div className="admin-info-grid">
                  <div className="admin-detail">
                    <label>Full Name</label>
                    <div className="admin-value">
                      {adminInfo.first_name} {adminInfo.middle_name ? adminInfo.middle_name + ' ' : ''}{adminInfo.last_name}
                    </div>
                  </div>
                  
                  <div className="admin-detail">
                    <label>Role</label>
                    <div className="admin-value">
                      <span className="role-badge">Client Admin</span>
                    </div>
                  </div>
                  
                  <div className="admin-detail">
                    <label>Email Address</label>
                    <div className="admin-value">
                      <span className="email-badge">{adminInfo.email}</span>
                    </div>
                  </div>
                  
                  <div className="admin-detail">
                    <label>Phone Number</label>
                    <div className="admin-value">
                      {adminInfo.phone || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="admin-detail">
                    <label>Created</label>
                    <div className="admin-value">
                      {new Date(adminInfo.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="admin-detail">
                    <label>Last Login</label>
                    <div className="admin-value">
                      {adminInfo.last_login ? new Date(adminInfo.last_login).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  
                  <div className="admin-detail">
                    <label>Password</label>
                    <div className="admin-value password-section">
                      <span className="password-hidden">••••••••••••</span>
                      <button 
                        type="button" 
                        className="btn-link"
                        onClick={() => setShowPasswordReset(!showPasswordReset)}
                      >
                        {showPasswordReset ? 'Cancel Reset' : 'Reset Password'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-admin-found">
                  <p>⚠️ No client administrator found for this company.</p>
                  <p>This may indicate the company was created before the admin user system was implemented.</p>
                </div>
              )}

              {/* Password Reset Form */}
              {showPasswordReset && (
                <div className="password-reset-section">
                  <h4>Reset Administrator Password</h4>
                  <form onSubmit={handlePasswordReset}>
                    <div className="form-group">
                      <label>New Password *</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                        className="password-input"
                        required
                      />
                      
                      {newPassword && (
                        <div className="password-strength">
                          <div className="strength-bar">
                            <div 
                              className="strength-fill"
                              style={{
                                width: `${passwordStrength}%`,
                                backgroundColor: getPasswordStrengthColor()
                              }}
                            />
                          </div>
                          <span 
                            className="strength-text"
                            style={{ color: getPasswordStrengthColor() }}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      )}
                    </div>

                    {passwordError && (
                      <div className="error-message">
                        ⚠️ {passwordError}
                      </div>
                    )}

                    <div className="password-reset-actions">
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => {
                          setShowPasswordReset(false);
                          setNewPassword('');
                          setPasswordError(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-danger"
                        disabled={passwordLoading || newPassword.length < 8}
                      >
                        {passwordLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {passwordSuccess && (
                <div className="success-message">
                  ✅ {passwordSuccess}
                </div>
              )}
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
              {loading ? 'Updating...' : 'Update Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCompanyModal;
