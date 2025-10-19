"""
Workflow Models and Schemas
Pydantic models for Jira, GitHub, and general workflow management
Based on Backend-Cushla schemas and workflow tracking requirements
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum

# ==========================================
# ENUMS FOR WORKFLOW TYPES
# ==========================================

class IssueType(str, Enum):
    JIRA_TASK = "jira_task"
    JIRA_BUG = "jira_bug"
    JIRA_STORY = "jira_story"
    JIRA_EPIC = "jira_epic"
    GITHUB_ISSUE = "github_issue"
    GITHUB_PR = "github_pr"

class IssueStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"
    CLOSED = "Closed"
    OPEN = "Open"
    MERGED = "Merged"
    DRAFT = "Draft"

class Priority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    LOWEST = "Lowest"

class SourceSystem(str, Enum):
    JIRA = "jira"
    GITHUB = "github"
    AZURE_DEVOPS = "azure_devops"
    MANUAL = "manual"

# ==========================================
# CORE WORKFLOW MODELS
# ==========================================

class WorkflowIssue(BaseModel):
    """Base workflow issue model"""
    company_id: int
    issue_key: str = Field(..., description="Unique identifier (e.g., PROJ-123, GITHUB-456)")
    summary: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    issue_type: IssueType
    status: IssueStatus
    priority: Optional[Priority] = None
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    resolved_date: Optional[datetime] = None
    project_key: Optional[str] = None
    project_name: Optional[str] = None
    labels: Optional[List[str]] = []
    components: Optional[List[str]] = []
    story_points: Optional[float] = Field(None, ge=0, le=100)
    epic_link: Optional[str] = None
    source_system: SourceSystem
    source_url: Optional[str] = None

    @validator('story_points')
    def validate_story_points(cls, v):
        if v is not None:
            return round(v, 1)
        return v

class JiraIssue(WorkflowIssue):
    """Jira-specific issue model"""
    source_system: SourceSystem = SourceSystem.JIRA
    fix_versions: Optional[List[str]] = []
    affects_versions: Optional[List[str]] = []
    environment: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = {}
    
    # Jira-specific fields
    resolution: Optional[str] = None
    sprint: Optional[str] = None
    team: Optional[str] = None
    
class GitHubIssue(WorkflowIssue):
    """GitHub-specific issue model"""
    source_system: SourceSystem = SourceSystem.GITHUB
    github_id: Optional[int] = None
    github_number: Optional[int] = None
    repository: Optional[str] = None
    
    # GitHub-specific fields
    closed_at: Optional[datetime] = None
    assignees: Optional[List[str]] = []
    labels_with_colors: Optional[List[str]] = []
    comments_count: Optional[int] = 0
    locked: Optional[bool] = False
    state_reason: Optional[str] = None
    milestone: Optional[str] = None
    milestone_url: Optional[str] = None
    milestone_due_on: Optional[datetime] = None
    author_association: Optional[str] = None
    
    # Reactions data
    reactions_total: Optional[int] = 0
    reactions_plus_one: Optional[int] = 0
    reactions_minus_one: Optional[int] = 0
    reactions_laugh: Optional[int] = 0
    reactions_hooray: Optional[int] = 0
    reactions_confused: Optional[int] = 0
    reactions_heart: Optional[int] = 0
    reactions_rocket: Optional[int] = 0
    reactions_eyes: Optional[int] = 0
    
    # Content analysis
    body_text_length: Optional[int] = 0
    title_length: Optional[int] = 0

class GitHubPullRequest(GitHubIssue):
    """GitHub Pull Request model"""
    issue_type: IssueType = IssueType.GITHUB_PR
    
    # PR-specific fields
    base_branch: Optional[str] = None
    head_branch: Optional[str] = None
    merged_at: Optional[datetime] = None
    merge_commit_sha: Optional[str] = None
    draft: Optional[bool] = False
    mergeable: Optional[bool] = None
    mergeable_state: Optional[str] = None
    
    # Review data
    requested_reviewers: Optional[List[str]] = []
    review_comments_count: Optional[int] = 0
    commits_count: Optional[int] = 0
    additions: Optional[int] = 0
    deletions: Optional[int] = 0
    changed_files: Optional[int] = 0

# ==========================================
# WORKFLOW ANALYTICS MODELS
# ==========================================

class WorkflowMetrics(BaseModel):
    """Workflow performance metrics"""
    total_issues: int = 0
    completed_issues: int = 0
    in_progress_issues: int = 0
    completion_rate: float = Field(0.0, ge=0, le=100)
    average_resolution_time_hours: Optional[float] = None
    average_cycle_time_hours: Optional[float] = None
    
    @validator('completion_rate')
    def calculate_completion_rate(cls, v, values):
        total = values.get('total_issues', 0)
        completed = values.get('completed_issues', 0)
        if total > 0:
            return round((completed / total) * 100, 2)
        return 0.0

class TeamProductivity(BaseModel):
    """Team productivity metrics"""
    team_name: str
    team_id: Optional[str] = None
    member_count: int = Field(..., ge=1)
    
    # Issue metrics
    issues_completed: int = 0
    issues_in_progress: int = 0
    story_points_completed: float = 0.0
    
    # Time metrics
    average_resolution_time_hours: Optional[float] = None
    average_cycle_time_hours: Optional[float] = None
    
    # Quality metrics
    bugs_created: int = 0
    bugs_resolved: int = 0
    
    # Trend
    productivity_trend: Optional[str] = None  # "up", "down", "stable"
    period: str = "monthly"
    last_updated: datetime

class SprintMetrics(BaseModel):
    """Sprint/iteration metrics"""
    sprint_name: str
    sprint_start: datetime
    sprint_end: datetime
    
    # Planning metrics
    planned_story_points: float = 0.0
    planned_issues: int = 0
    
    # Completion metrics
    completed_story_points: float = 0.0
    completed_issues: int = 0
    
    # Carry-over metrics
    carried_over_points: float = 0.0
    carried_over_issues: int = 0
    
    # Sprint health
    sprint_goal_met: bool = False
    velocity: float = 0.0
    
    @validator('velocity')
    def calculate_velocity(cls, v, values):
        return values.get('completed_story_points', 0.0)

# ==========================================
# WORKFLOW REPORTING MODELS
# ==========================================

class WorkflowSummary(BaseModel):
    """High-level workflow summary for dashboards"""
    period: str = "monthly"
    total_issues: int = 0
    completed_issues: int = 0
    blocked_issues: int = 0
    overdue_issues: int = 0
    
    # By type
    bugs: int = 0
    features: int = 0
    tasks: int = 0
    
    # Performance
    average_completion_time_days: Optional[float] = None
    throughput: float = 0.0  # issues per day
    
    # Team metrics
    active_contributors: int = 0
    top_contributors: Optional[List[Dict[str, Any]]] = []
    
    last_updated: datetime

class BurndownData(BaseModel):
    """Sprint burndown chart data"""
    date: datetime
    remaining_points: float
    ideal_remaining: float
    completed_points: float

class BurndownChart(BaseModel):
    """Complete burndown chart"""
    sprint_name: str
    sprint_start: datetime
    sprint_end: datetime
    total_points: float
    data_points: List[BurndownData]

# ==========================================
# REQUEST/RESPONSE MODELS
# ==========================================

class WorkflowQuery(BaseModel):
    """Query parameters for workflow data"""
    company_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assignee: Optional[str] = None
    project: Optional[str] = None
    status: Optional[List[IssueStatus]] = None
    issue_type: Optional[List[IssueType]] = None
    source_system: Optional[SourceSystem] = None
    limit: Optional[int] = Field(100, ge=1, le=1000)
    offset: Optional[int] = Field(0, ge=0)

class BulkWorkflowUpload(BaseModel):
    """Bulk upload of workflow issues"""
    company_id: int
    issues: List[Union[JiraIssue, GitHubIssue, GitHubPullRequest]]
    source: str = "api"
    overwrite_existing: bool = False
    
    @validator('issues')
    def validate_issues_limit(cls, v):
        if len(v) > 5000:
            raise ValueError("Cannot upload more than 5,000 issues at once")
        return v

class BulkUploadResponse(BaseModel):
    """Response for bulk workflow upload"""
    success: bool
    processed: int
    failed: int
    duplicates: int
    errors: List[str] = []
    message: str
    upload_id: Optional[str] = None

class WorkflowReportRequest(BaseModel):
    """Request for workflow reports"""
    company_id: int
    report_type: str = Field(..., pattern="^(summary|productivity|burndown|metrics)$")
    period: str = Field("monthly", pattern="^(daily|weekly|monthly|quarterly)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    team_filter: Optional[str] = None
    project_filter: Optional[str] = None

# ==========================================
# INTEGRATION MODELS
# ==========================================

class JiraIntegrationConfig(BaseModel):
    """Jira integration configuration"""
    server_url: str
    username: str
    api_token: str
    project_keys: List[str] = []
    sync_interval_hours: int = Field(24, ge=1, le=168)  # 1 hour to 1 week
    include_closed: bool = True
    custom_field_mappings: Optional[Dict[str, str]] = {}

class GitHubIntegrationConfig(BaseModel):
    """GitHub integration configuration"""
    access_token: str
    repositories: List[str] = []  # Format: "owner/repo"
    sync_interval_hours: int = Field(6, ge=1, le=48)  # 1 hour to 2 days
    include_pull_requests: bool = True
    include_closed: bool = True

class IntegrationStatus(BaseModel):
    """Integration sync status"""
    source_system: SourceSystem
    last_sync: Optional[datetime] = None
    next_sync: Optional[datetime] = None
    status: str = Field(..., pattern="^(active|error|disabled|syncing)$")
    error_message: Optional[str] = None
    records_synced: int = 0
    records_failed: int = 0

# Export all models
__all__ = [
    # Enums
    'IssueType', 'IssueStatus', 'Priority', 'SourceSystem',
    
    # Core models
    'WorkflowIssue', 'JiraIssue', 'GitHubIssue', 'GitHubPullRequest',
    
    # Analytics models
    'WorkflowMetrics', 'TeamProductivity', 'SprintMetrics',
    
    # Reporting models
    'WorkflowSummary', 'BurndownData', 'BurndownChart',
    
    # Request/Response models
    'WorkflowQuery', 'BulkWorkflowUpload', 'BulkUploadResponse', 'WorkflowReportRequest',
    
    # Integration models
    'JiraIntegrationConfig', 'GitHubIntegrationConfig', 'IntegrationStatus'
]