'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import CFODashboard from '@/components/cfo/CFODashboard';

export default function CFOPage() {
  return (
    <ProtectedRoute requiredRoles={['CFO', 'Client Admin']}>
      <SimpleLayout title="CFO Dashboard" subtitle="Financial insights and cost management">
        <CFODashboard />
      </SimpleLayout>
    </ProtectedRoute>
  );
}