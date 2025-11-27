'use client';

import { ExecutiveRoute } from '@/components/ExecutiveRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { TechnologyExecutiveDashboard } from '@/components/TechnologyExecutiveDashboard';

export default function CIOPage() {
  return (
    <ExecutiveRoute requiredRoles={['CIO']}>
      <SimpleLayout 
        title="CIO Dashboard" 
        subtitle="Cloud Governance, Investment ROI & Strategic IT Initiatives"
      >
        <TechnologyExecutiveDashboard />
      </SimpleLayout>
    </ExecutiveRoute>
  );
}