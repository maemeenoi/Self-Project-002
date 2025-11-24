'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import CEODashboard from '@/components/ceo/CEODashboard';
import '@/styles/ceo-dashboard.css';

export default function CEOPage() {
  return (
    <ProtectedRoute requiredRoles={['CEO', 'Client Admin']}>
      <SimpleLayout 
        title="CEO Dashboard" 
        subtitle="Executive overview and strategic insights"
      >
        <CEODashboard />
      </SimpleLayout>
    </ProtectedRoute>
  );
}