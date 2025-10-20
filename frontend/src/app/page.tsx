'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/ui/StatsCard'
import { ChartCard } from '@/components/ui/ChartCard'

interface DashboardStats {
  totalCompanies: number
  totalUsers: number
  totalFinancialRecords: number
  totalWorkflowRecords: number
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalUsers: 0,
    totalFinancialRecords: 0,
    totalWorkflowRecords: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        
        // For now, use mock data until we have real dashboard endpoint
        setStats({
          totalCompanies: 10,
          totalUsers: 38,
          totalFinancialRecords: 43,
          totalWorkflowRecords: 19
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome to the FinOps & Workflow Management Portal
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}