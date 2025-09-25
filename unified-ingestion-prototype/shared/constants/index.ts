// Application constants

// API Endpoints
export const API_ENDPOINTS = {
  GITHUB_DATA: "/api/data/github",
  JIRA_DATA: "/api/data/jira",
  FOCUS_DATA: "/api/data/focus",
  INGEST: "/api/ingest",
  INGEST_STATUS: "/api/ingest/status",
  GITHUB_PRS: "/api/ingest/github/prs",
  GITHUB_ACTIONS: "/api/ingest/github/actions",
  JIRA_CSV: "/api/ingest/jira/csv-file",
  JIRA_API: "/api/ingest/jira/api",
  FOCUS_CSV: "/api/ingest/focus/csv-file",
  METRICS_DEPLOYMENTS: "/api/metrics/deployments",
} as const

// Ingestion Sources
export const INGESTION_SOURCES = {
  GITHUB_API: "github_api",
  JIRA_CSV: "jira_csv",
  JIRA_API: "jira_api",
  FOCUS_CSV: "focus_csv",
} as const

// Status Values
export const STATUS_VALUES = {
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  OPEN: "open",
  CLOSED: "closed",
  MERGED: "merged",
  DONE: "done",
  IN_PROGRESS: "progress",
} as const

// GitHub PR States
export const GITHUB_PR_STATES = {
  OPEN: "open",
  CLOSED: "closed",
  MERGED: "merged",
} as const

// Jira Issue Statuses
export const JIRA_STATUSES = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  BLOCKED: "Blocked",
  REVIEW: "Review",
} as const

// Default Configuration
export const DEFAULT_CONFIG = {
  DATABASE_PATH: "data/finops.db",
  DATA_ROOT: "data",
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  PAGE_SIZE: 100,
} as const

// File Extensions
export const FILE_EXTENSIONS = {
  CSV: ".csv",
  JSON: ".json",
  DB: ".db",
} as const

// Environment Variables
export const ENV_VARS = {
  GITHUB_TOKEN: "GITHUB_TOKEN",
  GITHUB_OWNER: "GITHUB_OWNER",
  GITHUB_REPO: "GITHUB_REPO",
  JIRA_BASE_URL: "JIRA_BASE_URL",
  JIRA_EMAIL: "JIRA_EMAIL",
  JIRA_API_TOKEN: "JIRA_API_TOKEN",
  SQLITE_DB_PATH: "SQLITE_DB_PATH",
  DATA_ROOT: "DATA_ROOT",
} as const
