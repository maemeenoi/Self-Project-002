'use client';

import { ExecutiveRoute } from '@/components/ExecutiveRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { TechnologyExecutiveDashboard } from '@/components/TechnologyExecutiveDashboard';

export default function CISOPage() {
  return (
    <ExecutiveRoute requiredRoles={['CISO']}>
      <SimpleLayout 
        title="CISO Dashboard" 
        subtitle="Cloud Security Posture, Compliance & Risk Management"
      >
        <TechnologyExecutiveDashboard />
      </SimpleLayout>
    </ExecutiveRoute>
  );
}