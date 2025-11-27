'use client';

import { ExecutiveRoute } from '@/components/ExecutiveRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { BusinessExecutiveDashboard } from '@/components/BusinessExecutiveDashboard';
import '@/styles/ceo-dashboard.css';

export default function CEOPage() {
  return (
    <ExecutiveRoute requiredRoles={['CEO']}>
      <SimpleLayout 
        title="CEO Dashboard" 
        subtitle="Strategic Business Intelligence & Executive Overview"
      >
        <BusinessExecutiveDashboard />
      </SimpleLayout>
    </ExecutiveRoute>
  );
}