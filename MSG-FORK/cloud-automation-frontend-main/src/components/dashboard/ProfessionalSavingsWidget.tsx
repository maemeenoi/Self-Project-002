import React from 'react';
import { SavingsOpportunities } from '@/types/focusedPODashboard';
import { Lightbulb } from 'lucide-react';
import SavingsBarChart from '@/components/charts/SavingsBarChart';

interface ProfessionalSavingsWidgetProps {
  data: SavingsOpportunities;
}

const ProfessionalSavingsWidget: React.FC<ProfessionalSavingsWidgetProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getResourceTypeDisplay = (category: string) => {
    switch (category) {
      case 'compute': return 'Compute';
      case 'storage': return 'Storage';
      case 'database': return 'Database';
      case 'network': return 'Network';
      default: return 'Other';
    }
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gray-500" />
          <h3>Savings Opportunities</h3>
        </div>
        <div className="total-savings text-lg font-semibold text-green-600">
          {formatCurrency(data.potentialSavings)}/mo potential
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Top Opportunities by Savings</h4>
        <SavingsBarChart data={data} />
      </div>
      
      <div className="opportunities-list">
        {data.opportunities.slice(0, 3).map(opp => (
          <div key={opp.id} className="opportunity-item">
            <div className="opp-details">
              <div className="opp-title">{opp.title}</div>
              <div className="opp-meta">
                {getResourceTypeDisplay(opp.category)}
                {opp.estimatedHours && ` · ${opp.estimatedHours}h estimated`}
              </div>
            </div>
            <div className="opp-savings">{formatCurrency(opp.saving)}/mo</div>
          </div>
        ))}
      </div>

      <div className="widget-footer">
        <div className="summary-stats">
          <span>{formatCurrency(data.completedThisMonth)} completed this month</span>
          <span>{data.opportunities.length} active opportunities</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSavingsWidget;