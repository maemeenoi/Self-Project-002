'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import CTODashboard from '@/components/cto/CTODashboard';
import '@/styles/cto-dashboard.css';

export default function CTOPage() {
  return (
    <ProtectedRoute requiredRoles={['CTO', 'Client Admin']}>
      <SimpleLayout 
        title="CTO Dashboard" 
        subtitle="Engineering metrics and technical oversight"
      >
        <CTODashboard />
      </SimpleLayout>
    </ProtectedRoute>
  );
}
