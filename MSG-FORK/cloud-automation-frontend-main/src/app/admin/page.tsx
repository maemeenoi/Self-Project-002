'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardStats from '@/components/dashboard/DashboardStats'
import SystemHealthWidget from '@/components/widgets/SystemHealthWidget'
import GitHubAdminWidget from '@/components/admin/GitHubAdminWidget'
import JiraAdminWidget from '@/components/admin/JiraAdminWidget'
import { useAuth } from '@/context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <ProtectedRoute requiredRoles={['Client Admin', 'SuperAdmin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 font-sans text-base">
              Welcome to {user?.organizationName || 'makeStuffGo'} Admin Portal
            </p>
          </div>

          {/* Dashboard Stats */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-6">
            <DashboardStats />
          </section>

          {/* Main Content */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
            <div className="space-y-6">
              <SystemHealthWidget />
              <GitHubAdminWidget />
              <JiraAdminWidget />
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}