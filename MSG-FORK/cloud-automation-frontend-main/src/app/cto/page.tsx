'use client';

import { ExecutiveRoute } from '@/components/ExecutiveRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { TechnologyExecutiveDashboard } from '@/components/TechnologyExecutiveDashboard';
import '@/styles/cto-dashboard.css';

export default function CTOPage() {
  return (
    <ExecutiveRoute requiredRoles={['CTO']}>
      <SimpleLayout 
        title="CTO Dashboard" 
        subtitle="Strategic Technology Intelligence & Executive Overview"
      >
        <TechnologyExecutiveDashboard />
      </SimpleLayout>
    </ExecutiveRoute>
  );
}
