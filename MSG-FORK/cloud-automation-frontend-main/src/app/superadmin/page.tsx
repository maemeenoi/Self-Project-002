'use client'

import React from 'react';
import { SuperAdminDashboard } from '@/features/superadmin-dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SuperAdminPage() {
  return (
    <ProtectedRoute requiredRoles={['SuperAdmin']}>
      <div className="superadmin-page">
        <SuperAdminDashboard />
      </div>
    </ProtectedRoute>
  );
}
