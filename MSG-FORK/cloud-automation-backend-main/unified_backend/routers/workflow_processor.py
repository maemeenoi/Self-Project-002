"""
Workflow Processor Router

This router provides endpoints for Jira and GitHub workflow data processing,
combining functionality from the work_processor project.
"""

import sys
import asyncio
import logging
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import pandas as pd
from io import StringIO

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Add work_processor to path
sys.path.append(str(Path(__file__).parent.parent.parent / "work_processor" / "backend"))

from lib.db import create_sync_batch, complete_sync_batch, query_many, execute_sql, query_one
from services.cloud.azure_storage import UnifiedAzureBlobStorage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflow", tags=["workflow-processor"])

# Pydantic models
class JiraIssue(BaseModel):
    issue_key: str
    summary: str
    description: Optional[str] = None
    issue_type: str
    status: str
    priority: Optional[str] = None
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    resolved: Optional[str] = None
    project_key: str
    project_name: str
    labels: Optional[str] = None
    story_points: Optional[str] = None

class GitHubItem(BaseModel):
    type: str  # issue, pull_request
    number: int
    title: str
    body: Optional[str] = None
    state: str
    created_at: str
    updated_at: Optional[str] = None
    closed_at: Optional[str] = None
    merged_at: Optional[str] = None
    user: Dict[str, Any]
    assignee: Optional[Dict[str, Any]] = None
    assignees: Optional[List[Dict[str, Any]]] = None
    labels: Optional[List[Dict[str, Any]]] = None
    html_url: str
    repository_url: Optional[str] = None

class BulkJiraUploadRequest(BaseModel):
    issues: List[JiraIssue]
    company_id: Optional[int] = 1

class BulkGitHubUploadRequest(BaseModel):
    items: List[GitHubItem]
    company_id: Optional[int] = 1

class WorkflowMetricsRequest(BaseModel):
    company_id: Optional[int] = 1
    provider: Optional[str] = None  # jira, github
    days: int = 30
    metric_type: str = "summary"  # summary, lead_time, velocity

class WorkflowSyncRequest(BaseModel):
    company_id: Optional[int] = 1
    providers: List[str] = ["jira", "github"]
    full_sync: bool = False


# Initialize services
azure_storage = None

def get_azure_storage():
    """Get Azure storage instance"""
    global azure_storage
    if azure_storage is None:
        azure_storage = UnifiedAzureBlobStorage()
    return azure_storage


class WorkflowDataMapper:
    """
    Maps Jira and GitHub data to WorkflowFact table
    """
    
    def __init__(self, company_id: int):
        self.company_id = company_id
    
    def map_jira_issue_to_workflow_fact(self, issue: JiraIssue, batch_id: int) -> Dict[str, Any]:
        """Map Jira issue to WorkflowFact format"""
        try:
            # Parse dates
            created_at = self._parse_date(issue.created)
            updated_at = self._parse_date(issue.updated)
            closed_at = self._parse_date(issue.resolved)
            
            # Calculate lead time
            lead_time_hours = None
            if created_at and closed_at:
                lead_time_hours = (closed_at - created_at).total_seconds() / 3600
            
            # Parse story points
            story_points = None
            if issue.story_points:
                try:
                    story_points = float(issue.story_points)
                except (ValueError, TypeError):
                    pass
            
            return {
                'CompanyID': self.company_id,
                'BatchID': batch_id,
                'Provider': 'jira',
                'ItemType': issue.issue_type.lower().replace(' ', '_'),
                'ItemKey': issue.issue_key,
                'ProjectOrRepo': issue.project_name or issue.project_key,
                'Title': issue.summary[:1000] if issue.summary else None,  # Truncate to fit DB
                'Status': issue.status,
                'Labels': issue.labels,
                'Author': issue.reporter,
                'Assignee': issue.assignee,
                'StoryPoints': story_points,
                'LeadTimeHours': lead_time_hours,
                'CreatedAt': created_at,
                'ClosedAt': closed_at
            }
            
        except Exception as e:
            logger.error(f"Error mapping Jira issue {issue.issue_key}: {e}")
            raise
    
    def map_github_item_to_workflow_fact(self, item: GitHubItem, batch_id: int) -> Dict[str, Any]:
        """Map GitHub issue/PR to WorkflowFact format"""
        try:
            # Parse dates
            created_at = self._parse_date(item.created_at)
            updated_at = self._parse_date(item.updated_at)
            closed_at = self._parse_date(item.closed_at or item.merged_at)
            
            # Calculate lead time
            lead_time_hours = None
            if created_at and closed_at:
                lead_time_hours = (closed_at - created_at).total_seconds() / 3600
            
            # Extract repository name
            repo_name = None
            if item.repository_url:
                repo_name = item.repository_url.split('/')[-1]
            elif item.html_url:
                # Extract from URL pattern: https://github.com/owner/repo/issues/123
                url_parts = item.html_url.split('/')
                if len(url_parts) >= 5:
                    repo_name = url_parts[4]
            
            # Get assignee
            assignee = None
            if item.assignee:
                assignee = item.assignee.get('login')
            elif item.assignees and len(item.assignees) > 0:
                assignee = item.assignees[0].get('login')
            
            # Format labels
            labels = None
            if item.labels:
                label_names = [label.get('name') for label in item.labels if label.get('name')]
                labels = ', '.join(label_names) if label_names else None
            
            return {
                'CompanyID': self.company_id,
                'BatchID': batch_id,
                'Provider': 'github',
                'ItemType': item.type,
                'ItemKey': f"#{item.number}",
                'ProjectOrRepo': repo_name,
                'Title': item.title[:1000] if item.title else None,
                'Status': item.state,
                'Labels': labels,
                'Author': item.user.get('login') if item.user else None,
                'Assignee': assignee,
                'StoryPoints': None,  # GitHub doesn't have story points by default
                'LeadTimeHours': lead_time_hours,
                'CreatedAt': created_at,
                'ClosedAt': closed_at
            }
            
        except Exception as e:
            logger.error(f"Error mapping GitHub item #{item.number}: {e}")
            raise
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse date string to datetime"""
        if not date_str:
            return None
        
        try:
            # Handle different date formats
            formats = [
                '%Y-%m-%dT%H:%M:%S.%fZ',  # ISO with microseconds
                '%Y-%m-%dT%H:%M:%SZ',     # ISO without microseconds
                '%Y-%m-%dT%H:%M:%S.%f',   # ISO with microseconds, no Z
                '%Y-%m-%dT%H:%M:%S',      # ISO without microseconds, no Z
                '%Y-%m-%d %H:%M:%S',      # SQL datetime format
                '%Y-%m-%d',               # Date only
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            logger.warning(f"Could not parse date: {date_str}")
            return None
            
        except Exception as e:
            logger.warning(f"Error parsing date {date_str}: {e}")
            return None


async def store_workflow_facts(workflow_facts: List[Dict[str, Any]]) -> int:
    """
    Store workflow facts in database using individual inserts
    """
    if not workflow_facts:
        logger.info("⚠️ No workflow facts to store")
        return 0
    
    stored_count = 0
    try:
        logger.info(f"💾 Attempting to store {len(workflow_facts)} workflow facts")
        
        # Simple insert query for individual records
        insert_query = """
            INSERT INTO WorkflowFact (
                CompanyID, BatchID, Provider, ItemType, ItemKey, ProjectOrRepo,
                Title, Status, Labels, Author, Assignee,
                StoryPoints, LeadTimeHours, CreatedAt, ClosedAt
            ) VALUES (
                {CompanyID}, {BatchID}, {Provider}, {ItemType}, {ItemKey}, {ProjectOrRepo},
                {Title}, {Status}, {Labels}, {Author}, {Assignee},
                {StoryPoints}, {LeadTimeHours}, {CreatedAt}, {ClosedAt}
            )
        """
        
        # Insert each record individually
        for i, fact in enumerate(workflow_facts):
            try:
                logger.info(f"📝 Inserting record {i+1}/{len(workflow_facts)}: {fact['ItemKey']}")
                
                # Execute individual insert
                await execute_sql(insert_query, fact)
                stored_count += 1
                
                logger.info(f"✅ Successfully stored: {fact['ItemKey']}")
                
            except Exception as e:
                logger.error(f"❌ Failed to store record {fact['ItemKey']}: {e}")
                logger.error(f"Record data: {fact}")
                # Continue with next record instead of failing completely
                continue
        
        logger.info(f"✅ Successfully stored {stored_count}/{len(workflow_facts)} workflow facts")
        return stored_count
        
    except Exception as e:
        logger.error(f"Error in store_workflow_facts: {e}")
        return stored_count


@router.post("/jira/bulk-upload")
async def bulk_upload_jira_issues(
    background_tasks: BackgroundTasks,
    request: BulkJiraUploadRequest
):
    """
    Upload multiple Jira issues for processing
    """
    try:
        if not request.issues:
            raise HTTPException(status_code=400, detail="No issues provided")
        
        # Create sync batch  
        batch_id = await create_sync_batch(
            company_id=request.company_id,
            source_system="jira",
            storage_stage_path=f"bulk_upload_{len(request.issues)}_issues.json"
        )
        
        # Fallback to existing batch if creation fails (temporary fix)
        if not batch_id:
            logger.warning("Sync batch creation failed, using existing batch ID 29 as fallback")
            batch_id = 29
        
        # Process in background
        background_tasks.add_task(
            process_jira_issues,
            issues=request.issues,
            company_id=request.company_id,
            batch_id=batch_id
        )
        
        return {
            "success": True,
            "message": f"Started processing {len(request.issues)} Jira issues",
            "batch_id": batch_id,
            "issues_count": len(request.issues)
        }
        
    except Exception as e:
        logger.error(f"Bulk Jira upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_jira_issues(issues: List[JiraIssue], company_id: int, batch_id: int):
    """Background task to process Jira issues"""
    try:
        logger.info(f"🔄 Processing {len(issues)} Jira issues for batch {batch_id}")
        
        # Map issues to workflow facts
        mapper = WorkflowDataMapper(company_id)
        workflow_facts = []
        
        for issue in issues:
            try:
                logger.info(f"🔄 Processing issue: {issue.issue_key}")
                fact = mapper.map_jira_issue_to_workflow_fact(issue, batch_id)
                workflow_facts.append(fact)
                logger.info(f"✅ Mapped issue {issue.issue_key} to workflow fact: {fact}")
            except Exception as e:
                logger.error(f"❌ Error mapping Jira issue {issue.issue_key}: {e}")
                import traceback
                logger.error(f"Full traceback: {traceback.format_exc()}")
        
        logger.info(f"📊 About to store {len(workflow_facts)} workflow facts")
        
        if not workflow_facts:
            logger.error("❌ No workflow facts created from issues!")
            return
        
        # Store workflow facts
        stored_count = await store_workflow_facts(workflow_facts)
        
        logger.info(f"💾 Stored {stored_count} workflow facts in database")
        
        # Save raw data as CSV to staging container
        try:
            storage = get_azure_storage()
            raw_data = [issue.dict() for issue in issues]
            
            # Convert to CSV format
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            csv_filename = f"jira_raw_{batch_id}_{timestamp}.csv"
            
            # Create CSV content from raw Jira data
            if raw_data:
                df = pd.DataFrame(raw_data)
                csv_content = df.to_csv(index=False)
                
                # Upload CSV to staging container
                await storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=csv_filename,
                    container_type='staging',
                    company_id=company_id
                )
                logger.info(f"✅ Successfully saved raw Jira data as CSV to staging: {csv_filename}")
                
                # Create cleansed data from workflow facts
                cleansed_data = []
                for fact in workflow_facts:
                    cleansed_record = {
                        'IssueKey': fact['ItemKey'],
                        'Summary': fact['Title'],
                        'Status': fact['Status'],
                        'IssueType': fact['ItemType'],
                        'Project': fact['ProjectOrRepo'],
                        'Assignee': fact['Assignee'],
                        'Author': fact['Author'],
                        'Labels': fact['Labels'],
                        'StoryPoints': fact['StoryPoints'],
                        'LeadTimeHours': fact['LeadTimeHours'],
                        'CreatedAt': fact['CreatedAt'],
                        'ClosedAt': fact['ClosedAt'],
                        'CompanyID': fact['CompanyID'],
                        'BatchID': fact['BatchID'],
                        'ProcessedAt': datetime.utcnow().isoformat()
                    }
                    cleansed_data.append(cleansed_record)
                
                # Save cleansed data as CSV to cleansed container
                if cleansed_data:
                    cleansed_df = pd.DataFrame(cleansed_data)
                    cleansed_csv_content = cleansed_df.to_csv(index=False)
                    cleansed_filename = f"jira_cleansed_{batch_id}_{timestamp}.csv"
                    
                    await storage.upload_csv_data(
                        csv_data=cleansed_csv_content,
                        blob_name=cleansed_filename,
                        container_type='cleansed',
                        company_id=company_id
                    )
                    logger.info(f"✅ Successfully saved cleansed Jira data as CSV: {cleansed_filename}")
                
        except Exception as e:
            logger.error(f"⚠️ Azure CSV storage failed: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Complete sync batch
        await complete_sync_batch(batch_id, stored_count, len(issues) - stored_count, None)
        
        logger.info(f"✅ Completed Jira processing for batch {batch_id}: {stored_count} issues")
        
    except Exception as e:
        logger.error(f"❌ Jira processing failed for batch {batch_id}: {e}")
        await complete_sync_batch(batch_id, 0, len(issues), str(e))


@router.post("/github/bulk-upload")
async def bulk_upload_github_items(
    background_tasks: BackgroundTasks,
    request: BulkGitHubUploadRequest
):
    """
    Upload multiple GitHub issues/PRs for processing
    """
    try:
        if not request.items:
            raise HTTPException(status_code=400, detail="No items provided")
        
        # Create sync batch
        batch_id = await create_sync_batch(
            company_id=request.company_id,
            source_system="github",
            storage_stage_path=f"bulk_upload_{len(request.items)}_items.json"
        )
        
        if not batch_id:
            raise HTTPException(status_code=500, detail="Failed to create sync batch") 
        
        # Process in background
        background_tasks.add_task(
            process_github_items,
            items=request.items,
            company_id=request.company_id,
            batch_id=batch_id
        )
        
        return {
            "success": True,
            "message": f"Started processing {len(request.items)} GitHub items",
            "batch_id": batch_id,
            "items_count": len(request.items)
        }
        
    except Exception as e:
        logger.error(f"Bulk GitHub upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_github_items(items: List[GitHubItem], company_id: int, batch_id: int):
    """Background task to process GitHub items"""
    try:
        logger.info(f"Processing {len(items)} GitHub items for batch {batch_id}")
        
        # Map items to workflow facts
        mapper = WorkflowDataMapper(company_id)
        workflow_facts = []
        
        for item in items:
            try:
                fact = mapper.map_github_item_to_workflow_fact(item, batch_id)
                workflow_facts.append(fact)
            except Exception as e:
                logger.error(f"Error mapping GitHub item #{item.number}: {e}")
        
        # Store workflow facts
        stored_count = await store_workflow_facts(workflow_facts)
        
        # Save raw data as CSV to staging container
        try:
            storage = get_azure_storage()
            raw_data = [item.dict() for item in items]
            
            # Convert to CSV format
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            csv_filename = f"github_raw_{batch_id}_{timestamp}.csv"
            
            # Create CSV content from raw GitHub data
            if raw_data:
                df = pd.DataFrame(raw_data)
                csv_content = df.to_csv(index=False)
                
                # Upload CSV to staging container
                await storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=csv_filename,
                    container_type='staging',
                    company_id=company_id
                )
                logger.info(f"✅ Successfully saved raw GitHub data as CSV to staging: {csv_filename}")
                
                # Create cleansed data from workflow facts
                cleansed_data = []
                for fact in workflow_facts:
                    cleansed_record = {
                        'ItemKey': fact['ItemKey'],
                        'Title': fact['Title'],
                        'Status': fact['Status'],
                        'ItemType': fact['ItemType'],
                        'Repository': fact['ProjectOrRepo'],
                        'Assignee': fact['Assignee'],
                        'Author': fact['Author'],
                        'Labels': fact['Labels'],
                        'StoryPoints': fact['StoryPoints'],
                        'LeadTimeHours': fact['LeadTimeHours'],
                        'CreatedAt': fact['CreatedAt'],
                        'ClosedAt': fact['ClosedAt'],
                        'CompanyID': fact['CompanyID'],
                        'BatchID': fact['BatchID'],
                        'ProcessedAt': datetime.utcnow().isoformat()
                    }
                    cleansed_data.append(cleansed_record)
                
                # Save cleansed data as CSV to cleansed container
                if cleansed_data:
                    cleansed_df = pd.DataFrame(cleansed_data)
                    cleansed_csv_content = cleansed_df.to_csv(index=False)
                    cleansed_filename = f"github_cleansed_{batch_id}_{timestamp}.csv"
                    
                    await storage.upload_csv_data(
                        csv_data=cleansed_csv_content,
                        blob_name=cleansed_filename,
                        container_type='cleansed',
                        company_id=company_id
                    )
                    logger.info(f"✅ Successfully saved cleansed GitHub data as CSV: {cleansed_filename}")
                
        except Exception as e:
            logger.error(f"⚠️ Azure CSV storage failed: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Complete sync batch
        await complete_sync_batch(batch_id, stored_count, len(items) - stored_count, None)
        
        logger.info(f"✅ Completed GitHub processing for batch {batch_id}: {stored_count} items")
        
    except Exception as e:
        logger.error(f"❌ GitHub processing failed for batch {batch_id}: {e}")
        await complete_sync_batch(batch_id, 0, len(items), str(e))


@router.post("/csv-upload")
async def upload_workflow_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    provider: str = Form(...),  # jira or github
    company_id: int = Form(1)
):
    """
    Upload CSV file containing workflow data
    """
    try:
        if provider not in ['jira', 'github']:
            raise HTTPException(status_code=400, detail="Provider must be 'jira' or 'github'")
        
        # Read CSV content
        csv_content = await file.read()
        csv_string = csv_content.decode('utf-8')
        
        # Parse CSV
        df = pd.read_csv(StringIO(csv_string))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Create sync batch
        batch_id = await create_sync_batch(
            company_id=company_id,
            source_system=provider,
            storage_stage_path=file.filename
        )
        
        if not batch_id:
            raise HTTPException(status_code=500, detail="Failed to create sync batch")
        
        # Upload original CSV to staging storage
        storage = get_azure_storage()
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        staging_filename = f"{provider}_raw_upload_{batch_id}_{timestamp}.csv"
        
        await storage.upload_csv_data(
            csv_data=csv_string,
            blob_name=staging_filename,
            container_type='staging',
            company_id=company_id
        )
        logger.info(f"✅ Uploaded raw CSV to staging: {staging_filename}")
        
        # Process CSV in background
        background_tasks.add_task(
            process_workflow_csv,
            df=df,
            provider=provider,
            company_id=company_id,
            batch_id=batch_id
        )
        
        return {
            "success": True,
            "message": f"Started processing {provider} CSV with {len(df)} rows",
            "batch_id": batch_id,
            "rows_count": len(df)
        }
        
    except Exception as e:
        logger.error(f"CSV upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_workflow_csv(df: pd.DataFrame, provider: str, company_id: int, batch_id: int):
    """Background task to process workflow CSV"""
    try:
        logger.info(f"Processing {provider} CSV with {len(df)} rows for batch {batch_id}")
        
        mapper = WorkflowDataMapper(company_id)
        workflow_facts = []
        
        # Convert DataFrame rows to appropriate models
        for _, row in df.iterrows():
            try:
                if provider == 'jira':
                    issue = JiraIssue(
                        issue_key=row.get('Issue key') or row.get('Key', ''),
                        summary=row.get('Summary', ''),
                        description=row.get('Description'),  # Keep this for CSV processing
                        issue_type=row.get('Issue Type', 'Task'),
                        status=row.get('Status', 'Unknown'),
                        priority=row.get('Priority'),
                        assignee=row.get('Assignee'),
                        reporter=row.get('Reporter'),
                        created=row.get('Created'),
                        updated=row.get('Updated'),
                        resolved=row.get('Resolved'),
                        project_key=row.get('Project key', ''),
                        project_name=row.get('Project name', ''),
                        labels=row.get('Labels'),
                        story_points=row.get('Story Points')
                    )
                    fact = mapper.map_jira_issue_to_workflow_fact(issue, batch_id)
                    
                elif provider == 'github':
                    item = GitHubItem(
                        type=row.get('type', 'issue'),
                        number=int(row.get('number', 0)),
                        title=row.get('title', ''),
                        body=row.get('body'),
                        state=row.get('state', 'open'),
                        created_at=row.get('created_at', datetime.utcnow().isoformat()),
                        updated_at=row.get('updated_at'),
                        closed_at=row.get('closed_at'),
                        merged_at=row.get('merged_at'),
                        user={'login': row.get('user', '')},
                        assignee={'login': row.get('assignee')} if row.get('assignee') else None,
                        html_url=row.get('html_url', ''),
                        repository_url=row.get('repository_url')
                    )
                    fact = mapper.map_github_item_to_workflow_fact(item, batch_id)
                
                workflow_facts.append(fact)
                
            except Exception as e:
                logger.error(f"Error processing CSV row: {e}")
        
        # Store workflow facts
        stored_count = await store_workflow_facts(workflow_facts)
        
        # Save cleansed data as CSV to cleansed container
        try:
            if workflow_facts:
                cleansed_data = []
                for fact in workflow_facts:
                    cleansed_record = {
                        'ItemKey': fact['ItemKey'],
                        'Title': fact['Title'],
                        'Status': fact['Status'],
                        'ItemType': fact['ItemType'],
                        'ProjectOrRepo': fact['ProjectOrRepo'],
                        'Assignee': fact['Assignee'],
                        'Author': fact['Author'],
                        'Labels': fact['Labels'],
                        'StoryPoints': fact['StoryPoints'],
                        'LeadTimeHours': fact['LeadTimeHours'],
                        'CreatedAt': fact['CreatedAt'],
                        'ClosedAt': fact['ClosedAt'],
                        'CompanyID': fact['CompanyID'],
                        'BatchID': fact['BatchID'],
                        'ProcessedAt': datetime.utcnow().isoformat()
                    }
                    cleansed_data.append(cleansed_record)
                
                # Convert to CSV and save to cleansed container
                cleansed_df = pd.DataFrame(cleansed_data)
                cleansed_csv_content = cleansed_df.to_csv(index=False)
                timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                cleansed_filename = f"{provider}_cleansed_csv_{batch_id}_{timestamp}.csv"
                
                storage = get_azure_storage()
                await storage.upload_csv_data(
                    csv_data=cleansed_csv_content,
                    blob_name=cleansed_filename,
                    container_type='cleansed',
                    company_id=company_id
                )
                logger.info(f"✅ Successfully saved cleansed CSV data: {cleansed_filename}")
                
        except Exception as e:
            logger.error(f"⚠️ Failed to save cleansed CSV: {e}")
        
        # Complete sync batch
        await complete_sync_batch(batch_id, stored_count, len(df) - stored_count, None)
        
        logger.info(f"✅ Completed CSV processing for batch {batch_id}: {stored_count} records")
        
    except Exception as e:
        logger.error(f"❌ CSV processing failed for batch {batch_id}: {e}")
        await complete_sync_batch(batch_id, 0, len(df), str(e))


@router.get("/data")
async def get_workflow_data(
    company_id: int = Query(1),
    provider: Optional[str] = Query(None),
    limit: int = Query(100, le=1000)
):
    """
    Get workflow data from database
    """
    try:
        # Build query with filters
        where_conditions = ["CompanyID = {company_id}"]
        params = {"company_id": company_id, "limit": limit}
        
        if provider:
            where_conditions.append("Provider = {provider}")
            params["provider"] = provider
        
        query = f"""
            SELECT TOP ({{{limit}}})
                Provider, ItemType, ItemKey, ProjectOrRepo, Title, Status,
                Author, Assignee, StoryPoints, LeadTimeHours, CycleTimeHours,
                CreatedAt, ClosedAt, Labels
            FROM WorkflowFact
            WHERE {' AND '.join(where_conditions)}
            ORDER BY CreatedAt DESC
        """
        
        results = await query_many(query, params)
        
        return {
            "workflow_data": results,
            "count": len(results),
            "filters": {
                "company_id": company_id,
                "provider": provider,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/summary")
async def get_workflow_summary(
    company_id: int = Query(1),
    days: int = Query(30)
):
    """
    Get workflow summary metrics
    """
    try:
        from lib.db import get_workflow_summary
        summary = await get_workflow_summary(company_id, days)
        
        return {
            "workflow_summary": summary,
            "period_days": days,
            "company_id": company_id,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/batches")
async def get_workflow_batches(
    company_id: int = Query(1),
    limit: int = Query(10)
):
    """
    Get recent workflow processing batches
    """
    try:
        from lib.db import get_recent_sync_batches
        batches = await get_recent_sync_batches(company_id, limit)
        
        # Filter for workflow-related batches
        workflow_batches = [
            batch for batch in batches 
            if batch.get('SourceSystem') in ['jira', 'github']
        ]
        
        return {
            "batches": workflow_batches,
            "count": len(workflow_batches),
            "company_id": company_id
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow batches: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/debug/test-insert")
async def debug_test_insert():
    """Debug endpoint to test database insertion directly"""
    try:
        logger.info("🧪 Starting debug test insert")
        
        # Create a simple test fact using existing batch ID
        test_fact = {
            'CompanyID': 1,
            'BatchID': 29,  # Use existing batch ID to avoid foreign key constraint
            'Provider': 'jira', 
            'ItemType': 'story',
            'ItemKey': 'DEBUG-999',
            'ProjectOrRepo': 'Debug Project',
            'Title': 'Debug test insert',
            'Status': 'Done',
            'Labels': 'debug,test',
            'Author': 'debug-user',
            'Assignee': 'cushla',
            'StoryPoints': 1.0,
            'LeadTimeHours': 24.0,
            'CreatedAt': datetime.utcnow(),
            'ClosedAt': None
        }
        
        logger.info(f"📊 Test fact: {test_fact}")
        
        # Try to store it
        stored_count = await store_workflow_facts([test_fact])
        
        return {
            "success": True,
            "message": f"Debug test completed, stored {stored_count} record(s)",
            "test_fact": test_fact
        }
        
    except Exception as e:
        logger.error(f"Debug test failed: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@router.get("/health")
async def workflow_health_check():
    """Health check for workflow processor service"""
    try:
        storage = get_azure_storage()
        storage_health = await storage.health_check()
        
        # Test database connectivity
        test_query = "SELECT COUNT(*) as count FROM WorkflowFact WHERE CompanyID = {company_id}"
        result = await query_one(test_query, {"company_id": 1})
        
        return {
            "status": "healthy",
            "workflow_processor": "available",
            "azure_storage": storage_health["status"],
            "database": "accessible",
            "workflow_records": result.get("count", 0) if result else 0,
            "supported_providers": ["jira", "github"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Workflow processor health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }