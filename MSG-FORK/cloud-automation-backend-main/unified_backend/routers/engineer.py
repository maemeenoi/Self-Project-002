"""
Engineer Dashboard Router for Unified Backend
Provides endpoints for engineer-specific data from GitHub and Jira integrations
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

# Import the current company function (avoiding circular import)
from utils.auth import get_current_company

# Database imports
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
from lib.db import query_one, query_many

# CTO imports for shared models and functionality
from routers.cto import (
    ForecastRequest,
    ForecastData,
    Recommendation, 
    DailyCosts,
    ForecastAndRecommendations,
    CTOAnalysisResponse,
    TerraformRequest,
    TerraformResponse,
    generate_forecast_for_company,
    process_terraform_generation,
    build_terraform_file_response,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/engineer", tags=["engineer"])

# =========================================
# Response Models
# =========================================

class IntegrationStatus(BaseModel):
    configured: bool
    message: Optional[str] = None

class JiraStats(BaseModel):
    total_issues: int
    projects: Dict[str, int]
    statuses: Dict[str, int]
    last_updated: str

class JiraIssue(BaseModel):
    id: int
    key: str
    summary: str
    description: str
    status: str
    priority: str
    assignee: str
    reporter: str
    project_key: str
    project_name: str
    issue_type: str
    created_date: str
    updated_date: str
    labels: List[str]
    components: List[str]

class JiraIssuesResponse(BaseModel):
    total: int
    limit: int
    offset: int
    issues: List[JiraIssue]

class GitHubStats(BaseModel):
    total_repositories: int
    total_issues: int
    total_pull_requests: int
    organization: str
    last_updated: str

class GitHubRepository(BaseModel):
    id: int
    name: str
    full_name: str
    description: str
    language: str
    stars: int
    forks: int
    open_issues: int
    recent_commits: int
    updated_at: str
    created_at: str
    private: bool

class GitHubRepositoriesResponse(BaseModel):
    total: int
    limit: int
    repositories: List[GitHubRepository]

class GitHubActivity(BaseModel):
    id: str
    type: str
    title: str
    repository: str
    author: str
    created_at: str
    status: Optional[str] = None
    url: Optional[str] = None

class GitHubActivityResponse(BaseModel):
    total: int
    limit: int
    activities: List[GitHubActivity]

# =========================================
# Helper Functions
# =========================================

async def check_integration_configured(integration_type: str, company_id: int) -> bool:
    """Check if an integration is configured for the company"""
    try:
        # Check if integration exists in the Integration table
        integration = await query_one(
            "SELECT IntegrationID FROM Integration WHERE CompanyID = {company_id} AND IntegrationType = {integration_type}",
            {"company_id": company_id, "integration_type": integration_type}
        )
        return integration is not None
    except Exception as e:
        logger.error(f"Error checking integration {integration_type} for company {company_id}: {e}")
        return False

def humanize_status(status: Optional[str]) -> str:
    """Convert raw status strings like in_progress to 'In Progress'."""
    if not status:
        return "Unknown"
    normalized = status.replace("_", " ").replace("-", " ").strip()
    return normalized.title() if normalized else "Unknown"

# =========================================
# GitHub Integration Endpoints
# =========================================

@router.get("/integrations/github/status", response_model=IntegrationStatus)
async def get_github_integration_status(
    company_id: int = Depends(get_current_company)
):
    """Check if GitHub integration is configured for the company"""
    try:
        configured = await check_integration_configured("github", company_id)
        
        if configured:
            return IntegrationStatus(
                configured=True,
                message="GitHub integration is active"
            )
        else:
            return IntegrationStatus(
                configured=False,
                message="GitHub integration not configured. Contact your admin to set up GitHub credentials."
            )
    except Exception as e:
        logger.error(f"Error checking GitHub integration status: {e}")
        raise HTTPException(status_code=500, detail="Failed to check GitHub integration status")

@router.get("/github/stats", response_model=GitHubStats)
async def get_github_stats(
    company_id: int = Depends(get_current_company)
):
    """Get GitHub statistics for the company"""
    try:
        # Check if GitHub integration is configured
        if not await check_integration_configured("github", company_id):
            raise HTTPException(status_code=404, detail="GitHub integration not configured")
        
        # Initialize default values
        repo_count = 0
        issues_count = 0
        pr_count = 0
        organization = ""
        
        try:
            # First, get the latest GitHub sync batch for this company
            latest_batch_result = await query_one(
                """
                SELECT TOP 1 BatchID 
                FROM SyncBatch 
                WHERE CompanyID = {company_id} AND SourceSystem = 'github' AND CompletedAt IS NOT NULL
                ORDER BY StartedAt DESC
                """,
                {"company_id": company_id}
            )
            
            if not latest_batch_result:
                # No sync batch found, return empty data
                return GitHubStats(
                    total_repositories=0,
                    total_issues=0,
                    total_pull_requests=0,
                    organization="",
                    last_updated=datetime.now().isoformat()
                )
            
            latest_batch_id = latest_batch_result["BatchID"]
            logger.info(f"🔍 GitHub Stats - Using latest batch {latest_batch_id} for company {company_id}")
            
            # Get repository count from the latest sync batch
            repo_result = await query_one(
                """
                SELECT COUNT(DISTINCT ProjectOrRepo) as total 
                FROM WorkflowFact 
                WHERE CompanyID = {company_id} AND Provider = 'github' AND BatchID = {batch_id} AND ProjectOrRepo IS NOT NULL
                """,
                {"company_id": company_id, "batch_id": latest_batch_id}
            )
            repo_count = repo_result["total"] if repo_result else 0
            logger.info(f"🔍 GitHub Stats Debug - Company {company_id}: Found {repo_count} repositories in latest batch")
        except Exception as e:
            logger.error(f"Error getting repository count: {e}")
            pass
        
        try:
            # Get issues count from the latest sync batch
            issues_result = await query_one(
                "SELECT COUNT(*) as total FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'github' AND BatchID = {batch_id} AND ItemType = 'issue'",
                {"company_id": company_id, "batch_id": latest_batch_id}
            )
            issues_count = issues_result["total"] if issues_result else 0
        except Exception as e:
            logger.error(f"Error getting issues count: {e}")
            pass
        
        try:
            # Get pull requests count from the latest sync batch
            pr_result = await query_one(
                "SELECT COUNT(*) as total FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'github' AND BatchID = {batch_id} AND ItemType = 'pull_request'",
                {"company_id": company_id, "batch_id": latest_batch_id}
            )
            pr_count = pr_result["total"] if pr_result else 0
        except Exception as e:
            logger.error(f"Error getting PR count: {e}")
            pass
        
        try:
            # Get organization info from the latest sync batch
            org_result = await query_one(
                "SELECT TOP 1 LEFT(ProjectOrRepo, CHARINDEX('/', ProjectOrRepo) - 1) as Organization FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'github' AND BatchID = {batch_id} AND ProjectOrRepo LIKE '%/%' ORDER BY CreatedAt DESC",
                {"company_id": company_id, "batch_id": latest_batch_id}
            )
            organization = org_result["Organization"] if org_result else ""
        except Exception as e:
            logger.error(f"Error getting organization: {e}")
            pass
        
        return GitHubStats(
            total_repositories=repo_count,
            total_issues=issues_count,
            total_pull_requests=pr_count,
            organization=organization,
            last_updated=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching GitHub stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch GitHub statistics")

@router.get("/github/repositories", response_model=GitHubRepositoriesResponse)
async def get_github_repositories(
    limit: int = Query(50, le=100),
    company_id: int = Depends(get_current_company)
):
    """Get GitHub repositories for the company"""
    try:
        # Check if GitHub integration is configured
        if not await check_integration_configured("github", company_id):
            raise HTTPException(status_code=404, detail="GitHub integration not configured")
        
        repositories = []
        total_count = 0
        
        try:
            # First, get the latest GitHub sync batch for this company
            latest_batch_result = await query_one(
                """
                SELECT TOP 1 BatchID 
                FROM SyncBatch 
                WHERE CompanyID = {company_id} AND SourceSystem = 'github' AND CompletedAt IS NOT NULL
                ORDER BY StartedAt DESC
                """,
                {"company_id": company_id}
            )
            
            if not latest_batch_result:
                # No sync batch found, return empty data
                return GitHubRepositoriesResponse(repositories=[], total=0)
            
            latest_batch_id = latest_batch_result["BatchID"]
            logger.info(f"🔍 GitHub Repositories - Using latest batch {latest_batch_id} for company {company_id}")
            
            repos_raw = await query_many(
                """
                SELECT 
                    ProjectOrRepo,
                    COUNT(*) as total_events,
                    SUM(CASE WHEN ItemType = 'issue' THEN 1 ELSE 0 END) as issue_count,
                    SUM(CASE WHEN ItemType IN ('commit', 'push') THEN 1 ELSE 0 END) as commit_count,
                    MAX(CreatedAt) as updated_at,
                    MIN(CreatedAt) as created_at
                FROM WorkflowFact 
                WHERE CompanyID = {company_id} 
                  AND Provider = 'github' 
                  AND BatchID = {batch_id}
                  AND ProjectOrRepo IS NOT NULL
                GROUP BY ProjectOrRepo
                ORDER BY MAX(CreatedAt) DESC  -- Order by latest activity first
                """,
                {"company_id": company_id, "batch_id": latest_batch_id}
            )
            
            total_count = len(repos_raw)
            logger.info(f"🔍 GitHub Repositories Debug - Company {company_id}: Found {total_count} distinct repositories")
            
            for i, repo_row in enumerate(repos_raw[:limit]):
                repo_name = repo_row["ProjectOrRepo"]
                name = repo_name.split('/')[-1] if '/' in repo_name else repo_name
                
                updated_at = repo_row["updated_at"].isoformat() if repo_row["updated_at"] else ""
                created_at = repo_row["created_at"].isoformat() if repo_row["created_at"] else ""
                
                repositories.append(GitHubRepository(
                    id=i + 1,
                    name=name,
                    full_name=repo_name,
                    description="",
                    language="",
                    stars=0,
                    forks=0,
                    open_issues=repo_row["issue_count"] or 0,
                    recent_commits=repo_row["commit_count"] or repo_row["total_events"] or 0,
                    updated_at=updated_at or created_at or datetime.now().isoformat(),
                    created_at=created_at or datetime.now().isoformat(),
                    private=False
                ))
            
        except Exception as e:
            logger.error(f"Error processing repositories: {e}")
            pass

        
        return GitHubRepositoriesResponse(
            total=total_count,
            limit=limit,
            repositories=repositories
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching GitHub repositories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch GitHub repositories")

@router.get("/github/recent-activity", response_model=GitHubActivityResponse)
async def get_github_recent_activity(
    limit: int = Query(20, le=100),
    company_id: int = Depends(get_current_company)
):
    """Get recent GitHub activity for the company"""
    try:
        # Check if GitHub integration is configured
        if not await check_integration_configured("github", company_id):
            raise HTTPException(status_code=404, detail="GitHub integration not configured")
        
        activities = []
        total_count = 0
        
        try:
            # First, get the latest GitHub sync batch for this company
            latest_batch_result = await query_one(
                """
                SELECT TOP 1 BatchID 
                FROM SyncBatch 
                WHERE CompanyID = {company_id} AND SourceSystem = 'github' AND CompletedAt IS NOT NULL
                ORDER BY StartedAt DESC
                """,
                {"company_id": company_id}
            )
            
            if not latest_batch_result:
                # No sync batch found, return empty data
                return GitHubActivityResponse(total=0, activities=[])
            
            latest_batch_id = latest_batch_result["BatchID"]
            logger.info(f"🔍 GitHub Activity - Using latest batch {latest_batch_id} for company {company_id}")
            
            # Get recent GitHub activity from the latest sync batch
            activities_data = await query_many(
                """
                SELECT TOP ({limit})
                    CAST(WorkflowID as VARCHAR) as id, 
                    ISNULL(ItemType, 'activity') as type,
                    ISNULL(Title, 'No title') as title, 
                    ISNULL(ProjectOrRepo, '') as repository, 
                    ISNULL(Author, '') as author,
                    CreatedAt as created_at, 
                    ISNULL(Status, '') as status, 
                    '' as url
                FROM WorkflowFact 
                WHERE CompanyID = {company_id} AND Provider = 'github' AND BatchID = {batch_id}
                ORDER BY CreatedAt DESC
                """,
                {"company_id": company_id, "limit": limit, "batch_id": latest_batch_id}
            )
            
            # Get total count from the latest sync batch
            total_result = await query_one(
                "SELECT COUNT(*) as total FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'github' AND BatchID = {batch_id}",
                {"company_id": company_id, "batch_id": latest_batch_id}
            )
            total_count = total_result["total"] if total_result else 0
            
            for activity in activities_data:
                activities.append(GitHubActivity(
                    id=activity["id"],
                    type=activity["type"],
                    title=activity["title"],
                    repository=activity["repository"],
                    author=activity["author"],
                    created_at=activity["created_at"].isoformat() if activity["created_at"] else "",
                    status=activity["status"],
                    url=activity["url"]
                ))
        except Exception:
            # Table might not exist yet, return empty data
            pass
        
        return GitHubActivityResponse(
            total=total_count,
            limit=limit,
            activities=activities
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching GitHub activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch GitHub activity")

# =========================================
# Jira Integration Endpoints
# =========================================

@router.get("/integrations/jira/status", response_model=IntegrationStatus)
async def get_jira_integration_status(
    company_id: int = Depends(get_current_company)
):
    """Check if Jira integration is configured for the company"""
    try:
        configured = await check_integration_configured("jira", company_id)
        
        if configured:
            return IntegrationStatus(
                configured=True,
                message="Jira integration is active"
            )
        else:
            return IntegrationStatus(
                configured=False,
                message="Jira integration not configured. Contact your admin to set up Jira credentials."
            )
    except Exception as e:
        logger.error(f"Error checking Jira integration status: {e}")
        raise HTTPException(status_code=500, detail="Failed to check Jira integration status")

@router.get("/jira/stats", response_model=JiraStats)
async def get_jira_stats(
    company_id: int = Depends(get_current_company)
):
    """Get Jira statistics for the company"""
    try:
        # Check if Jira integration is configured
        if not await check_integration_configured("jira", company_id):
            raise HTTPException(status_code=404, detail="Jira integration not configured")
        
        # Initialize default values
        total_issues = 0
        projects = {}
        statuses = {}
        
        try:
            # Get total issues count from WorkflowFact
            total_result = await query_one(
                "SELECT COUNT(*) as total FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'jira'",
                {"company_id": company_id}
            )
            total_issues = total_result["total"] if total_result else 0
        except Exception:
            # Table might not exist yet
            pass
        
        try:
            # Get project breakdown from WorkflowFact
            projects_data = await query_many(
                "SELECT ProjectOrRepo as ProjectKey, COUNT(*) as count FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'jira' GROUP BY ProjectOrRepo",
                {"company_id": company_id}
            )
            projects = {row["ProjectKey"]: row["count"] for row in projects_data}
        except Exception:
            # Table might not exist yet
            pass
        
        try:
            statuses_data = await query_many(
                "SELECT Status, COUNT(*) as count FROM WorkflowFact WHERE CompanyID = {company_id} AND Provider = 'jira' GROUP BY Status",
                {"company_id": company_id}
            )
            statuses = {humanize_status(row["Status"]): row["count"] for row in statuses_data}
        except Exception:
            # Table might not exist yet
            pass
        
        return JiraStats(
            total_issues=total_issues,
            projects=projects,
            statuses=statuses,
            last_updated=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Jira stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch Jira statistics")

@router.get("/jira/issues", response_model=JiraIssuesResponse)
async def get_jira_issues(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    project: str = Query(None, description="Filter by project key"),
    company_id: int = Depends(get_current_company)
):
    """Get Jira issues for the company with optional project filtering"""
    try:
        # Check if Jira integration is configured
        if not await check_integration_configured("jira", company_id):
            raise HTTPException(status_code=404, detail="Jira integration not configured")
        
        issues = []
        total_count = 0
        
        try:
            # Build query with optional project filter
            base_where = "CompanyID = {company_id} AND Provider = 'jira'"
            params = {"company_id": company_id, "limit": limit, "offset": offset}
            
            if project:
                base_where += " AND ProjectOrRepo = {project}"
                params["project"] = project
            
            # Get total count
            total_result = await query_one(
                f"SELECT COUNT(*) as total FROM WorkflowFact WHERE {base_where}",
                params
            )
            total_count = total_result["total"] if total_result else 0
            
            # Get Jira issues with improved query (ordered by creation date descending)
            issues_data = await query_many(
                f"""
                SELECT 
                    WorkflowID, 
                    ISNULL(Title, 'No title') as Title, 
                    ISNULL(Status, 'Unknown') as Status, 
                    ISNULL(Author, '') as Author, 
                    ISNULL(ProjectOrRepo, '') as ProjectOrRepo, 
                    ISNULL(ItemType, 'task') as ItemType, 
                    CreatedAt,
                    ISNULL(Assignee, '') as Assignee,
                    ISNULL(Labels, '') as Labels
                FROM WorkflowFact 
                WHERE {base_where}
                ORDER BY CreatedAt DESC
                OFFSET {offset} ROWS 
                FETCH NEXT {limit} ROWS ONLY
                """,
                params
            )
            
            for i, issue in enumerate(issues_data):
                try:
                    # Parse labels if they exist
                    labels = []
                    if issue.get("Labels"):
                        labels = [label.strip() for label in str(issue["Labels"]).split(",") if label.strip()]
                    
                    issues.append(JiraIssue(
                        id=issue["WorkflowID"] if issue["WorkflowID"] else i + 1,
                        key=f"{issue['ProjectOrRepo']}-{issue['WorkflowID']}" if issue["ProjectOrRepo"] and issue["WorkflowID"] else f"ITEM-{i + 1}",
                        summary=str(issue["Title"]),
                        description="",
                        status=humanize_status(issue["Status"]),
                        priority="Medium",  # Default priority
                        assignee=str(issue.get("Assignee", "")),
                        reporter=str(issue["Author"]),
                        project_key=str(issue["ProjectOrRepo"]),
                        project_name=str(issue["ProjectOrRepo"]),
                        issue_type=str(issue["ItemType"]).title(),
                        created_date=issue["CreatedAt"].isoformat() if issue["CreatedAt"] else "",
                        updated_date="",
                        labels=labels,
                        components=[]
                    ))
                except Exception as e:
                    logger.error(f"Failed to create Jira issue from row {i}: {e}")
                    continue
        except Exception as e:
            logger.error(f"Error querying Jira issues: {e}")
            pass
        
        return JiraIssuesResponse(
            total=total_count,
            limit=limit,
            offset=offset,
            issues=issues
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Jira issues: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch Jira issues")

@router.get("/jira/projects")
async def get_jira_projects(
    company_id: int = Depends(get_current_company)
):
    """Get Jira projects with task/epic counts"""
    try:
        # Check if Jira integration is configured
        if not await check_integration_configured("jira", company_id):
            raise HTTPException(status_code=404, detail="Jira integration not configured")
        
        projects = []
        
        try:
            # Get projects with detailed breakdown
            projects_data = await query_many(
                """
                SELECT 
                    ProjectOrRepo as project_key,
                    COUNT(*) as total_items,
                    SUM(CASE WHEN LOWER(ItemType) LIKE '%epic%' THEN 1 ELSE 0 END) as epics,
                    SUM(CASE WHEN LOWER(ItemType) LIKE '%story%' OR LOWER(ItemType) LIKE '%task%' OR ItemType = 'issue' THEN 1 ELSE 0 END) as tasks,
                    SUM(CASE WHEN LOWER(REPLACE(REPLACE(Status, '_', ' '), '-', ' ')) IN ('open', 'new', 'to do', 'in progress') THEN 1 ELSE 0 END) as active_items,
                    SUM(CASE WHEN LOWER(REPLACE(REPLACE(Status, '_', ' '), '-', ' ')) IN ('done', 'closed', 'resolved', 'completed') THEN 1 ELSE 0 END) as completed_items
                FROM WorkflowFact 
                WHERE CompanyID = {company_id} AND Provider = 'jira' AND ProjectOrRepo IS NOT NULL
                GROUP BY ProjectOrRepo
                ORDER BY COUNT(*) DESC
                """,
                {"company_id": company_id}
            )
            
            for project in projects_data:
                projects.append({
                    "project_key": project["project_key"],
                    "project_name": project["project_key"],  # Use key as name for now
                    "total_items": project["total_items"],
                    "epics": project["epics"],
                    "tasks": project["tasks"],
                    "active_items": project["active_items"],
                    "completed_items": project["completed_items"]
                })
        except Exception as e:
            logger.error(f"Error querying Jira projects: {e}")
            pass
        
        return {"projects": projects}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Jira projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch Jira projects")


# =========================================
# Test endpoint to verify router is working
# =========================================

@router.get("/test")
async def test_engineer_router():
    """Test endpoint to verify engineer router is working"""
    return {"status": "success", "message": "Engineer router is working!", "timestamp": datetime.now().isoformat()}

# =========================================
# AI Recommendations & Terraform - Engineer Implementation
# =========================================

# Using shared models and functions from CTO router to avoid duplication
# All AI logic is now handled by generate_forecast_for_company()

@router.post("/ai/forecast", response_model=CTOAnalysisResponse)
async def get_engineer_ai_forecast(
    forecast_request: ForecastRequest,
    company_id: int = Depends(get_current_company)
):
    """Generate AI forecast + recommendations for engineer dashboard."""
    try:
        # Use shared forecast implementation from CTO router
        logger.info(f"🔍 Engineer dashboard requesting forecast for company {company_id}")
        return await generate_forecast_for_company(company_id, forecast_request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating engineer forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {str(e)}")


@router.post("/ai/generate_terraform", response_model=TerraformResponse)
async def generate_engineer_terraform(
    request: TerraformRequest,
    company_id: int = Depends(get_current_company)
):
    """Generate Terraform from an AI recommendation for engineers."""
    try:
        logger.info(f"🔧 Engineer dashboard requesting Terraform for company {company_id}")
        
        # Use shared terraform generation from CTO router
        return await process_terraform_generation(
            company_id=company_id,
            request=request,
            download_prefix="/api/engineer/ai/download_terraform"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating engineer Terraform: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Terraform: {str(e)}")


@router.get("/ai/download_terraform/{filename}")
async def download_engineer_terraform_zip(
    filename: str,
    company_id: int = Depends(get_current_company)
):
    """Download generated Terraform ZIP for engineer audience."""
    logger.info(f"🔧 Engineer dashboard requesting Terraform download for company {company_id}")
    return build_terraform_file_response(filename)
