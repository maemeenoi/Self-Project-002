import React from 'react';
import { 
  DollarSign, 
  Cloud, 
  Target, 
  Zap,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface ProfessionalMetricCardProps {
  title: string;
  icon: 'dollar' | 'cloud' | 'target' | 'deploy';
  primaryValue: string | number;
  unit?: string;
  context?: string;
  trend?: string;
  trendType?: 'success' | 'warning' | 'danger';
  status?: string;
}

const ProfessionalMetricCard: React.FC<ProfessionalMetricCardProps> = ({
  title,
  icon,
  primaryValue,
  unit,
  context,
  trend,
  trendType,
  status
}) => {
  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 text-gray-500" };
    switch (icon) {
      case 'dollar': return <DollarSign {...iconProps} />;
      case 'cloud': return <Cloud {...iconProps} />;
      case 'target': return <Target {...iconProps} />;
      case 'deploy': return <Zap {...iconProps} />;
      default: return <Target {...iconProps} />;
    }
  };

  const getTrendIcon = () => {
    if (!trendType) return <Minus className="w-4 h-4" />;
    switch (trendType) {
      case 'success': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <TrendingUp className="w-4 h-4" />;
      case 'danger': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="metric-card">
      <div className="card-header">
        <span className="card-icon">{getIcon()}</span>
        <h3 className="card-title">{title}</h3>
      </div>
      
      <div className="card-body">
        <div className="primary-metric">
          <span className="metric-value">{primaryValue}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        
        {context && (
          <div className="metric-context">{context}</div>
        )}
        
        {trend && (
          <div className={`metric-trend trend-${trendType}`}>
            {getTrendIcon()}
            <span>{trend}</span>
          </div>
        )}
        
        {status && (
          <div className={`status-badge status-${trendType}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalMetricCard;
