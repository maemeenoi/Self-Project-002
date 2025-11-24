'use client'

import React from 'react';
import './Modal.css';

interface Company {
  company_id: number;
  name: string;
  size_label: string;
  is_active: boolean;
  created_at: string;
  total_users: number;
}

interface LoginAsModalProps {
  company: Company;
  onClose: () => void;
  onConfirm: () => void;
}

function LoginAsModal({ company, onClose, onConfirm }: LoginAsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-as-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Login As Company Admin</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="warning-box">
            <span className="warning-icon">⚠️</span>
            <p>You are about to impersonate the admin user for this company.</p>
          </div>

          <div className="company-details">
            <div className="detail-row">
              <span className="label">Company:</span>
              <span className="value">{company.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Company ID:</span>
              <span className="value">{company.company_id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Size:</span>
              <span className="value">{company.size_label}</span>
            </div>
            <div className="detail-row">
              <span className="label">Users:</span>
              <span className="value">{company.total_users}</span>
            </div>
          </div>

          <div className="info-box">
            <div className="info-item">
              <span className="info-icon">📝</span>
              <span>All actions will be logged</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔒</span>
              <span>You will have full admin access to this company</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🚪</span>
              <span>You can exit impersonation mode at any time</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary login-as-btn" onClick={onConfirm}>
            Proceed to Login As
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginAsModal;
