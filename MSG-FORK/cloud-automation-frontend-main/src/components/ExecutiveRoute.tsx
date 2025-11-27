'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock } from 'lucide-react';
import SimpleLayout from './layout/SimpleLayout';

interface ExecutiveRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ExecutiveRoute: React.FC<ExecutiveRouteProps> = ({ 
  children, 
  requiredRoles = ['CEO', 'CTO', 'CFO'] 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect
  }

  // Check if user has required executive roles
  const userRoleNames = user?.roles?.map(role => typeof role === 'string' ? role : role.name) || [];
  const primaryRoleName = user?.primaryRole?.name || '';
  
  const allRoles = [...userRoleNames, primaryRoleName].filter(Boolean);
  
  const hasExecutiveAccess = requiredRoles.some(role => 
    allRoles.some(userRole => userRole.toLowerCase().includes(role.toLowerCase()))
  );

  if (!hasExecutiveAccess) {
    return (
    <SimpleLayout title="Access Denied" subtitle="Executive Access Required">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border">
          <div className="pt-6 text-center p-6">
            <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Executive Access Required</h2>
            <p className="text-gray-600 mb-4">
              This area is restricted to executives with the following roles:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {requiredRoles.map(role => (
                <span 
                  key={role} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Your current role: <span className="font-medium">{primaryRoleName || 'None'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Please contact your administrator if you believe you should have access to this area.
            </p>
          </div>
        </div>
      </div>
    </SimpleLayout>
    );
  }

  return <>{children}</>;
};

export default ExecutiveRoute;