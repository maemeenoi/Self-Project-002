'use client';

import { ExecutiveRoute } from '@/components/ExecutiveRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { BusinessExecutiveDashboard } from '@/components/BusinessExecutiveDashboard';

export default function CFOPage() {
  return (
    <ExecutiveRoute requiredRoles={['CFO']}>
      <SimpleLayout 
        title="CFO Dashboard" 
        subtitle="Strategic Financial Intelligence & Executive Overview"
      >
        <BusinessExecutiveDashboard />
      </SimpleLayout>
    </ExecutiveRoute>
  );
}