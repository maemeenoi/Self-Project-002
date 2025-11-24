import React from 'react';
import { SavingsOpportunities } from '@/types/focusedPODashboard';
import { DollarSign, Lightbulb, Clock, Zap } from 'lucide-react';

interface SavingsOpportunitiesWidgetProps {
  data: SavingsOpportunities;
}

const SavingsOpportunitiesWidget: React.FC<SavingsOpportunitiesWidgetProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compute': return '🖥️';
      case 'storage': return '💾';
      case 'database': return '🗄️';
      case 'network': return '🌐';
      default: return '⚙️';
    }
  };

  return (
    <div className="widget-card gamification">
      <h2 className="widget-title">
        💰 Savings Opportunities
      </h2>
      
      <div className="savings-summary mb-6">
        <div className="potential-savings text-center mb-4">
          <div className="savings-amount text-3xl font-bold text-green-600 mb-1">
            {formatCurrency(data.potentialSavings)}
          </div>
          <div className="savings-label text-gray-600">
            Potential Monthly Savings
          </div>
        </div>

        <div className="progress-summary grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(data.completedThisMonth)}
            </div>
            <div className="text-xs text-green-700">Completed This Month</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-600">
              {data.opportunities.length}
            </div>
            <div className="text-xs text-orange-700">Active Opportunities</div>
          </div>
        </div>
      </div>

      <div className="opportunities-list">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
          <Lightbulb className="w-4 h-4" />
          Top Opportunities
        </h4>
        
        {data.opportunities.slice(0, 5).map(opp => (
          <div key={opp.id} className="opportunity-item">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-lg">{getCategoryIcon(opp.category)}</span>
              <div className="flex-1">
                <span className="opp-title block">{opp.title}</span>
                {opp.estimatedHours && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {opp.estimatedHours}h estimated
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="opp-saving">
                {formatCurrency(opp.saving)}/mo
              </span>
              <span className={`difficulty ${opp.difficulty}`}>
                {opp.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gamification Elements */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Quick Wins Available
            </span>
          </div>
          <span className="achievement-badge">
            🎯 {data.opportunities.filter(o => o.difficulty === 'easy').length} Easy Tasks
          </span>
        </div>
      </div>

      {/* Data Source */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-800 font-medium mb-1">
          📊 Data Source
        </div>
        <div className="text-xs text-blue-700">
          AWS Trusted Advisor + Custom Analysis
        </div>
      </div>
    </div>
  );
};

export default SavingsOpportunitiesWidget;
