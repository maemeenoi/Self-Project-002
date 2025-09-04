'use client'

import { TrendingUp, TrendingDown, DollarSign, Server } from 'lucide-react'

interface CostSummaryCardsProps {
  data: {
    totalCost: number
    monthlyGrowth: number
    servicesCount: number
  }
}

export default function CostSummaryCards({ data }: CostSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Monthly Cost',
      value: formatCurrency(data.totalCost),
      icon: DollarSign,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Monthly Growth',
      value: `${data.monthlyGrowth}%`,
      icon: data.monthlyGrowth > 0 ? TrendingUp : TrendingDown,
      color: data.monthlyGrowth > 0 ? 'bg-green-500' : 'bg-red-500',
      bgColor: data.monthlyGrowth > 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: data.monthlyGrowth > 0 ? 'text-green-700' : 'text-red-700'
    },
    {
      title: 'Active Services',
      value: data.servicesCount.toString(),
      icon: Server,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Cost per Service',
      value: formatCurrency(data.totalCost / data.servicesCount),
      icon: DollarSign,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
