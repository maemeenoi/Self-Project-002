'use client';

import { ExecutiveRoute } from '@/components/ExecutiveRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { TechnologyExecutiveDashboard } from '@/components/TechnologyExecutiveDashboard';

export default function DeliveryExecutivePage() {
  return (
    <ExecutiveRoute requiredRoles={['Delivery Executive']}>
      <SimpleLayout 
        title="Delivery Executive Dashboard" 
        subtitle="Cloud Migration Progress, Service Quality & Team Performance"
      >
        <TechnologyExecutiveDashboard />
      </SimpleLayout>
    </ExecutiveRoute>
  );
}