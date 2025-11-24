'use client'

import React, { useState, useEffect } from 'react';
import superAdminApi from '../services/superAdminApi';
import type { CreateCompanyFormData } from '../types/superAdmin';
import './CreateCompanyModal.css';

interface CreateCompanyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateCompanyModal({ onClose, onSuccess }: CreateCompanyModalProps) {
  const [formData, setFormData] = useState<CreateCompanyFormData>({
    name: '',
    size_label: 'Small',
    subscription_tier: 'Basic',
    admin_first_name: '',
    admin_middle_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_phone: '',
    admin_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, label: '', color: '' };
    if (password.length < 8) return { score: 1, label: 'Too short', color: '#DC2626' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score: 2, label: 'Weak', color: '#DC2626' };
    if (score === 3) return { score: 3, label: 'Fair', color: '#D97706' };
    if (score === 4) return { score: 4, label: 'Good', color: '#059669' };
    return { score: 5, label: 'Strong', color: '#059669' };
  };

  const passwordStrength = getPasswordStrength(formData.admin_password);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password
    if (formData.admin_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await superAdminApi.createCompany(formData);
      onSuccess();
    } catch (err: any) {
      setError('Error creating company: ' + (err.message || 'Unknown error'));
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
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create New Company</h2>
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Company Details</h3>
              
              <div className="form-group">
                <label htmlFor="name">Company Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Acme Corporation"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="size_label">Size</label>
                  <select 
                    id="size_label"
                    name="size_label" 
                    value={formData.size_label} 
                    onChange={handleChange}
                  >
                    <option value="Small">Small (1-50 employees)</option>
                    <option value="Medium">Medium (51-200 employees)</option>
                    <option value="Large">Large (201-1000 employees)</option>
                    <option value="Enterprise">Enterprise (1000+ employees)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subscription_tier">Subscription</label>
                  <select 
                    id="subscription_tier"
                    name="subscription_tier" 
                    value={formData.subscription_tier} 
                    onChange={handleChange}
                  >
                    <option value="Free">Free</option>
                    <option value="Basic">Basic - $99/month</option>
                    <option value="Pro">Pro - $499/month</option>
                    <option value="Enterprise">Enterprise - Custom</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Admin User Details</h3>
              
              <div className="form-row three-columns">
                <div className="form-group">
                  <label htmlFor="admin_first_name">First Name *</label>
                  <input
                    type="text"
                    id="admin_first_name"
                    name="admin_first_name"
                    value={formData.admin_first_name}
                    onChange={handleChange}
                    required
                    placeholder="John"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin_middle_name">Middle Name</label>
                  <input
                    type="text"
                    id="admin_middle_name"
                    name="admin_middle_name"
                    value={formData.admin_middle_name}
                    onChange={handleChange}
                    placeholder="Michael"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin_last_name">Last Name *</label>
                  <input
                    type="text"
                    id="admin_last_name"
                    name="admin_last_name"
                    value={formData.admin_last_name}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="admin_email">Email *</label>
                  <input
                    type="email"
                    id="admin_email"
                    name="admin_email"
                    value={formData.admin_email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin_phone">Phone</label>
                  <input
                    type="tel"
                    id="admin_phone"
                    name="admin_phone"
                    value={formData.admin_phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin_password">Initial Password *</label>
                <input
                  type="password"
                  id="admin_password"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleChange}
                  required
                  placeholder="Secure password for client admin login"
                  minLength={8}
                />
                {formData.admin_password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color 
                        }}
                      ></div>
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
                <div className="field-hint">
                  Password must be at least 8 characters long. Include uppercase, lowercase, numbers, and special characters for better security.
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCompanyModal;
