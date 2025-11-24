"""
Simplified Integrations Router that works with existing database schema
Uses environment variables for credentials instead of database storage
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import json
import os

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, validator

# Database imports
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
from db import query_one, query_many, execute_sql, insert_and_return

# Services
from services.azure_storage import UnifiedAzureBlobStorage
from services.github_service import GitHubService
from services.jira_service import JiraService
from services.data_ingestion_service import DataIngestionService

# Environment config
from decouple import config

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# =========================================
# Models
# =========================================

class SyncRequest(BaseModel):
    integration_type: str
    force_full_sync: bool = False

class IntegrationStatus(BaseModel):
    integration_type: str
    configured: bool
    last_sync: Optional[str] = None
    last_sync_status: Optional[str] = None
    records_count: int = 0
    error_message: Optional[str] = None

# =========================================
# Helper Functions
# =========================================

def get_integration_credentials(integration_type: str) -> Dict[str, str]:
    """Get credentials from environment variables"""
    credentials = {}
    
    if integration_type == "github":
        token = config('GITHUB_TOKEN', default=None)
        if token:
            credentials['token'] = token
            credentials['organization'] = config('GITHUB_ORGANIZATION', default='')
            
    elif integration_type == "jira":
        url = config('JIRA_BASE_URL', default=None)
        email = config('JIRA_EMAIL', default=None)
        token = config('JIRA_API_TOKEN', default=None)
        
        if url and email and token:
            credentials['url'] = url
            credentials['email'] = email
            credentials['api_token'] = token
    
    return credentials

def is_integration_configured(integration_type: str) -> bool:
    """Check if integration has required credentials in environment"""
    credentials = get_integration_credentials(integration_type)
    
    if integration_type == "github":
        return bool(credentials.get('token'))
    elif integration_type == "jira":
        return bool(credentials.get('url') and credentials.get('email') and credentials.get('api_token'))
    
    return False

async def get_last_sync_info(integration_type: str, company_id: int = 1) -> Dict[str, Any]:
    """Get last sync information from SyncBatch table"""
    try:
        query = """
            SELECT TOP 1 
                StartedAt,
                CompletedAt,
                RecordsIngested
            FROM SyncBatch 
            WHERE CompanyID = {company_id} AND SourceSystem = {source_system}
            ORDER BY StartedAt DESC
        """
        
        result = await query_one(query, {
            "company_id": company_id,
            "source_system": integration_type
        })
        
        if result:
            started_at = result.get("StartedAt")
            return {
                "last_sync": started_at.isoformat() if started_at else None,
                "last_sync_status": "success" if result.get("CompletedAt") else "running",
                "records_count": result.get("RecordsIngested", 0)
            }
    except Exception as e:
        logger.error(f"Failed to get sync info for {integration_type}: {e}")
    
    return {
        "last_sync": None,
        "last_sync_status": None,
        "records_count": 0
    }

# =========================================
# API Endpoints
# =========================================

@router.get("/status")
async def get_all_integrations_status(
    company_id: int = Query(1, description="Company ID")
):
    """Get status of all available integrations"""
    integrations = []
    
    for integration_type in ["github", "jira"]:
        configured = is_integration_configured(integration_type)
        sync_info = await get_last_sync_info(integration_type, company_id)
        
        integrations.append(IntegrationStatus(
            integration_type=integration_type,
            configured=configured,
            **sync_info
        ))
    
    return integrations

@router.get("/status/{integration_type}")
async def get_integration_status(
    integration_type: str,
    company_id: int = Query(1, description="Company ID")
):
    """Get status of specific integration"""
    if integration_type not in ["github", "jira"]:
        raise HTTPException(status_code=400, detail="Unsupported integration type")
    
    configured = is_integration_configured(integration_type)
    sync_info = await get_last_sync_info(integration_type, company_id)
    
    return IntegrationStatus(
        integration_type=integration_type,
        configured=configured,
        **sync_info
    )

@router.post("/sync")
async def sync_integration_data(
    sync_request: SyncRequest,
    background_tasks: BackgroundTasks,
    company_id: int = Query(1, description="Company ID"),
    current_user_id: int = Query(1, description="Current user ID")
):
    """Trigger data sync for an integration"""
    
    if sync_request.integration_type not in ["github", "jira"]:
        raise HTTPException(status_code=400, detail="Unsupported integration type")
    
    # Check if integration is configured
    if not is_integration_configured(sync_request.integration_type):
        raise HTTPException(
            status_code=400, 
            detail=f"{sync_request.integration_type.title()} integration not configured. Please check environment variables."
        )
    
    # Get credentials from environment
    credentials = get_integration_credentials(sync_request.integration_type)
    
    # Start background sync process
    background_tasks.add_task(
        perform_data_sync,
        company_id,
        sync_request.integration_type,
        credentials,
        sync_request.force_full_sync
    )
    
    return {
        "success": True,
        "message": f"{sync_request.integration_type.title()} sync started",
        "integration_type": sync_request.integration_type
    }

# =========================================
# Background Task Functions  
# =========================================

async def perform_data_sync(company_id: int, integration_type: str, credentials: Dict[str, str], force_full: bool):
    """Background task to perform data synchronization"""
    
    logger.info(f"Starting {integration_type} data sync for company {company_id}")
    
    try:
        data_ingestion = DataIngestionService()
        
        if integration_type == "github":
            github_service = GitHubService(credentials.get("token"))
            raw_data = await github_service.fetch_all_data(
                organization=credentials.get("organization"),
                repositories=credentials.get("repositories", [])
            )
            
        elif integration_type == "jira":
            jira_service = JiraService(
                credentials.get("url"),
                credentials.get("email"),
                credentials.get("api_token")
            )
            raw_data = await jira_service.fetch_all_data(
                projects=credentials.get("projects", [])
            )
        else:
            raise ValueError(f"Unsupported integration type: {integration_type}")
        
        # Process data through ingestion pipeline
        result = await data_ingestion.process_raw_data(company_id, integration_type, raw_data)
        
        logger.info(f"Data sync completed successfully: {result}")
        
    except Exception as e:
        logger.error(f"Data sync failed for {integration_type}: {e}")
        raise e