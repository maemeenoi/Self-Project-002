'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ChartCard } from '@/components/ui/ChartCard'

interface FinancialFact {
  FinancialID: number
  CompanyID: number
  BillingPeriodStart: string
  BillingPeriodEnd: string
  ServiceName: string
  Provider: string
  Region: string
  BilledCost: number
  BillingCurrency: string
  ResourceId: string
  CompanyName: string
}

export default function FinancialPage() {
  const [financialData, setFinancialData] = useState<FinancialFact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<number>(1)

  // Widget data
  const [costBreakdown, setCostBreakdown] = useState<any[]>([])
  const [savingsSummary, setSavingsSummary] = useState<any>(null)
  const [vendorCosts, setVendorCosts] = useState<any[]>([])

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/financial-facts?limit=50`)
        if (!response.ok) {
          throw new Error('Failed to fetch financial data')
        }
        const data = await response.json()
        // API returns {financial_facts: [...], count: number}, we need just the array
        setFinancialData(data.financial_facts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    const fetchWidgets = async () => {
      try {
        // Fetch cost breakdown
        const costRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/financial/cost-breakdown?company_id=${selectedCompany}&group_by=ServiceName`)
        if (costRes.ok) {
          const costData = await costRes.json()
          setCostBreakdown(costData)
        }

        // Fetch savings summary
        const savingsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/financial/savings-summary?company_id=${selectedCompany}`)
        if (savingsRes.ok) {
          const savingsData = await savingsRes.json()
          setSavingsSummary(savingsData)
        }

        // Fetch vendor costs
        const vendorRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/financial/vendor-costs?company_id=${selectedCompany}`)
        if (vendorRes.ok) {
          const vendorData = await vendorRes.json()
          setVendorCosts(vendorData)
        }
      } catch (err) {
        console.error('Error fetching widgets:', err)
      }
    }

    fetchFinancialData()
    fetchWidgets()
  }, [selectedCompany])

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Financial Data</h1>
            <p className="mt-2 text-sm text-gray-700">
              Cloud spending and cost optimization insights
            </p>
          </div>
          
          {/* Company Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="company-select" className="text-sm font-medium text-gray-700">
              Company:
            </label>
            <select
              id="company-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => (
                <option key={id} value={id}>Company {id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Cost Breakdown by Service">
            <div className="space-y-2">
              {costBreakdown.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.category}</span>
                  <span className="font-medium">${parseFloat(item.total_cost).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Savings Summary">
            {savingsSummary ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">List Cost</span>
                  <span className="font-medium">${parseFloat(savingsSummary.total_list_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Effective Cost</span>
                  <span className="font-medium">${parseFloat(savingsSummary.total_effective_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Savings</span>
                  <span className="font-medium text-green-600">${parseFloat(savingsSummary.total_savings || 0).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No savings data available</div>
            )}
          </ChartCard>

          <ChartCard title="Vendor Costs">
            <div className="space-y-2">
              {vendorCosts.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.Publisher}</span>
                  <span className="font-medium">${parseFloat(item.total_cost).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Financial Data Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Financial Records</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billed Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.map((record) => (
                    <tr key={record.FinancialID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.ServiceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.Provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.Region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.BilledCost.toFixed(2)} {record.BillingCurrency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.BillingPeriodStart).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {financialData.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No financial data</h3>
            <p className="mt-1 text-sm text-gray-500">Financial records will appear here when available.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}