'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import ProductOwnerDashboard from '@/components/productowner/ProductOwnerDashboard';
import '@/styles/product-owner-dashboard.css';

export default function ProductOwnerPage() {
  return (
    <ProtectedRoute requiredRoles={['Product Owner', 'Client Admin']}>
      <SimpleLayout 
        title="Product Owner Dashboard" 
        subtitle="Product metrics and customer impact"
      >
        <ProductOwnerDashboard />
      </SimpleLayout>
    </ProtectedRoute>
  );
}
