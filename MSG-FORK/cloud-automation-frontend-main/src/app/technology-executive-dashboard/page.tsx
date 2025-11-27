import { TechnologyExecutiveDashboard } from '@/components/TechnologyExecutiveDashboard';
import ExecutiveRoute from '@/components/ExecutiveRoute';

export default function TechnologyExecutiveDashboardPage() {
  return (
    <ExecutiveRoute requiredRoles={['CTO', 'CIO', 'CISO', 'Delivery Executive']}>
      <TechnologyExecutiveDashboard />
    </ExecutiveRoute>
  );
}