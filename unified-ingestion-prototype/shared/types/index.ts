// Shared TypeScript types for the unified ingestion platform

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

// GitHub Types
export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  status: string
  state: string
  author: string
  author_login: string
  reviewers?: string
  assignees?: string
  changedFiles?: number
  changed_files?: number
  url: string
  repo_full_name: string
  created_at: string
  updated_at: string
  merged_at?: string
  additions?: number
  deletions?: number
}

// Jira Types
export interface JiraIssue {
  id: string
  key: string
  issue_key: string
  summary: string
  status: string
  assignee?: string
  reporter?: string
  project?: string
  priority?: string
  created: string
  created_at: string
  updated: string
  updated_at: string
}

// GitHub Actions Types
export interface GitHubAction {
  id: string
  name: string
  status: string
  conclusion?: string
  created_at: string
  updated_at: string
  html_url: string
}

// FOCUS Cloud Cost Types
export interface FocusCostData {
  id: string
  billing_period: string
  resource_id: string
  resource_name?: string
  service_name: string
  cost: number
  currency: string
  usage_quantity?: number
  usage_unit?: string
}

// Ingestion Types
export interface IngestionConfig {
  source: "github_api" | "jira_csv" | "jira_api" | "focus_csv"
  input?: Record<string, any>
  config?: Record<string, any>
}

export interface IngestionStatus {
  runId: string
  source: string
  status: "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  stats?: {
    rows_read: number
    rows_upserted: number
    rows_skipped: number
  }
  error?: string
}

// Component Props Types
export interface TableProps<T = any> {
  title?: string
  rows: T[]
  loading?: boolean
}

export interface StatusChipProps {
  label: string
}

// Database Types
export interface DatabaseConfig {
  file: string
}

// Storage Types
export interface StorageConfig {
  root: string
}
