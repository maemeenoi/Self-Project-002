/**
 * TypeScript interfaces for Engineer Dashboard widgets
 * Based on the API endpoints from widgetsService.py
 */

export interface DeploymentMetric {
  provider: string;
  deployments_count: number;
  success_rate: number;
  avg_lead_time_hours: number;
  avg_cycle_time_hours: number;
}

export interface ActivityItem {
  provider: string;
  item_type: string;
  title: string;
  status: string;
  author: string;
  created_at: string;
  project_or_repo: string;
}

export interface DeploymentMetricsResponse {
  data: DeploymentMetric[];
  loading: boolean;
  error: string | null;
}

export interface ActivityStreamResponse {
  data: ActivityItem[];
  loading: boolean;
  error: string | null;
}

// Status badge color mapping
export type StatusType = 
  | 'merged' 
  | 'open' 
  | 'in_progress' 
  | 'in_review' 
  | 'done' 
  | 'closed' 
  | 'success' 
  | 'failed'
  | 'default';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Provider and ItemType combinations for icons
export type ProviderType = 'github' | 'jira';
export type ItemType = 'pull_request' | 'issue' | 'build' | 'deployment';

export interface ActivityIconProps {
  provider: ProviderType;
  itemType: ItemType;
  status?: string;
}

// Widget card wrapper props
export interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  showMockDataIndicator?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
}

// Loading skeleton props
export interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}
