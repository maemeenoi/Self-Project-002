'use client'

import React from 'react';
import { 
  Shield, Cloud, Code, Zap, BarChart3, Target, Clock, Gauge, Building2, Globe, 
  AlertTriangle, Activity, CheckCircle, GitBranch, Server, Database, Network,
  Cpu, HardDrive, Rocket
} from 'lucide-react';

// Shared components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow border ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b ${className}`}>{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string; variant?: string }> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

// CTO Widgets
export const CloudNativeWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Cloud className="h-5 w-5 mr-2" />
        Cloud-Native Architecture
        <Badge variant="secondary" className="ml-auto">
          {data.cloud_native_score}/10
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded">
            <Server className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-600">
              ${((data.breakdown?.serverless_spend || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-600">Serverless</div>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <Database className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold text-purple-600">
              ${((data.breakdown?.paas_spend || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-600">PaaS</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Top Cloud Services</div>
          {(data.service_mix || []).slice(0, 3).map((service: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{service.service_name}</span>
              <span className="font-medium">${(service.spend || 0).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TechnicalDebtWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Code className="h-5 w-5 mr-2" />
        Technical Debt Management
        <Badge variant="outline" className="ml-auto">
          {data.open_debt_items} open
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-red-50 rounded">
            <div className="text-lg font-bold text-red-600">{data.debt_by_type?.bugs || 0}</div>
            <div className="text-xs text-gray-600">Bugs</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <div className="text-lg font-bold text-yellow-600">{data.debt_by_type?.refactoring || 0}</div>
            <div className="text-xs text-gray-600">Refactor</div>
          </div>
          <div className="p-3 bg-orange-50 rounded">
            <div className="text-lg font-bold text-orange-600">{data.debt_by_type?.technical_debt || 0}</div>
            <div className="text-xs text-gray-600">Tech Debt</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Projects with Highest Debt</div>
          {(data.top_debt_projects || []).slice(0, 3).map((project: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="truncate">{project.project}</span>
              <span className="font-medium">{project.story_points} SP</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const MultiCloudReliabilityWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Globe className="h-5 w-5 mr-2" />
        Multi-Cloud Reliability
        <Badge variant="secondary" className="ml-auto">
          {data.provider_count} providers
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {Object.keys(data.provider_breakdown || {}).length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Provider Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.provider_breakdown || {}).map(([provider, providerData]: [string, any]) => (
                <div key={provider} className="text-center p-4 border rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{providerData.percentage}%</div>
                  <div className="font-medium">{provider}</div>
                  <div className="text-sm text-gray-600">${(providerData.spend || 0).toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// CISO Widgets
export const SecurityScoreWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        Cloud Security Posture
        <div className="ml-auto flex items-center space-x-2">
          <Badge variant="outline">
            {(data.security_score || 0).toFixed(1)}/10
          </Badge>
          <Badge variant="secondary">
            {(data.compliance_percentage || 0).toFixed(1)}%
          </Badge>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded">
            <Shield className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-green-600">
              {(data.security_score || 0).toFixed(1)}/10
            </div>
            <div className="text-xs text-gray-600">Security Score</div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <CheckCircle className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-600">
              {(data.compliance_percentage || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Compliance</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Security Services</div>
          {(data.security_services || []).slice(0, 3).map((service: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="truncate">{service.service_name}</span>
              <span className="font-medium">${(service.spend || 0).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Delivery Executive Widgets
export const MigrationDeliveryWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Rocket className="h-5 w-5 mr-2" />
        Cloud Migration Progress
        <Badge variant="secondary" className="ml-auto">
          {(data.migration_progress?.completion_percentage || 0).toFixed(1)}% complete
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-green-50 rounded">
            <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-green-600">
              {data.migration_progress?.completed_tasks || 0}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <Clock className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
            <div className="text-lg font-bold text-yellow-600">
              {data.migration_progress?.in_progress_tasks || 0}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <Target className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-600">
              {data.migration_progress?.total_tasks || 0}
            </div>
            <div className="text-xs text-gray-600">Total Tasks</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Top Migration Projects</div>
          {(data.top_migration_projects || []).slice(0, 3).map((project: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="truncate">{project.project}</span>
                <span className="font-medium">{project.completion_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${project.completion_rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ServiceQualityWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Activity className="h-5 w-5 mr-2" />
        Service Quality & Reliability
        <Badge variant="outline" className="ml-auto">
          {(data.quality_score || 0).toFixed(1)}/10
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">
              {data.defect_metrics?.defect_resolution_rate || 0}%
            </div>
            <div className="text-xs text-gray-600">Defect Resolution</div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">
              {data.incident_metrics?.mttr_hours || 0}h
            </div>
            <div className="text-xs text-gray-600">MTTR</div>
          </div>
        </div>

        {(data.project_quality || []).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Project Quality Overview</div>
            {(data.project_quality || []).slice(0, 3).map((project: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="truncate">{project.project}</span>
                <div className="text-xs">
                  <span className="text-red-600">{project.defects}</span> bugs, 
                  <span className="text-yellow-600 ml-1">{project.incidents}</span> incidents
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// CIO Widgets  
export const GovernanceWidget: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        Cloud Governance & Compliance
        <Badge variant="secondary" className="ml-auto">
          {(data.governance_score || 0).toFixed(1)}/10
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">
              {(data.governance_percentage || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Policy Compliance</div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">
              ${((data.governed_spend || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-600">Governed Spend</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Resource Distribution</div>
          {(data.resource_distribution || []).slice(0, 3).map((resource: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{resource.service} ({resource.provider})</span>
              <span className="font-medium">${(resource.spend || 0).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);