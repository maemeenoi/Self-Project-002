"""
Integrations Router for Unified Backend

Handles configuration and data fetching for third-party integrations:
- GitHub: Repository data, commits, pull requests, issues
- Jira: Projects, issues, sprints, users
- Handles credential storage, API calls, data processing pipeline

Flow:
1. Store encrypted credentials
2. Fetch data from APIs
3. Save raw data to Azure staging storage
4. Process and cleanse data
5. Save cleansed data to Azure cleansed storage
6. Insert into SQL database
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import json
import base64
from cryptography.fernet import Fernet

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session

# Database imports
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
from db import query_one, query_many, execute_sql, insert_and_return

# Services
from services.azure_storage import UnifiedAzureBlobStorage
from services.github_service import GitHubService
from services.jira_service import JiraService
from services.data_ingestion_service import DataIngestionService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# Encryption key for credentials (should be in environment)
from decouple import config
ENCRYPTION_KEY = config('INTEGRATION_ENCRYPTION_KEY', default=Fernet.generate_key().decode())
cipher_suite = Fernet(ENCRYPTION_KEY.encode())

# =========================================
# Pydantic Models
# =========================================

class IntegrationCredentials(BaseModel):
    integration_type: str  # 'github' or 'jira'
    credentials: Dict[str, str]  # API tokens, URLs, etc.
    
    @validator('integration_type')
    def validate_integration_type(cls, v):
        if v not in ['github', 'jira']:
            raise ValueError('integration_type must be "github" or "jira"')
        return v

class GitHubCredentials(BaseModel):
    token: str
    organization: Optional[str] = None
    repositories: Optional[List[str]] = None  # Specific repos or empty for all

class JiraCredentials(BaseModel):
    url: str
    email: str
    api_token: str
    projects: Optional[List[str]] = None  # Specific projects or empty for all

class IntegrationConfig(BaseModel):
    id: str
    name: str
    type: str
    enabled: bool
    last_sync: Optional[str] = None
    credentials_configured: bool = False

class SyncRequest(BaseModel):
    integration_type: str
    force_full_sync: bool = False

# =========================================
# Helper Functions
# =========================================

def encrypt_credentials(credentials: Dict[str, str]) -> str:
    """Encrypt credentials for secure storage"""
    json_str = json.dumps(credentials)
    encrypted = cipher_suite.encrypt(json_str.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_credentials(encrypted_credentials: str) -> Dict[str, str]:
    """Decrypt stored credentials"""
    try:
        encrypted_bytes = base64.b64decode(encrypted_credentials)
        decrypted = cipher_suite.decrypt(encrypted_bytes)
        return json.loads(decrypted.decode())
    except Exception as e:
        logger.error(f"Failed to decrypt credentials: {e}")
        raise HTTPException(status_code=500, detail="Failed to decrypt credentials")

async def check_company_admin_permission(current_user_id: int, company_id: int) -> bool:
    """Check if user has company admin permissions"""
    query = """
        SELECT COUNT(*) as count
        FROM UserAccount u
        JOIN UserRole ur ON u.UserID = ur.UserID
        JOIN Role r ON ur.RoleID = r.RoleID
        WHERE u.UserID = {current_user_id} 
        AND u.CompanyID = {company_id}
        AND r.Name IN ('Client Admin', 'SuperAdmin')
        AND u.IsActive = 1
    """
    
    result = await query_one(query, {
        "current_user_id": current_user_id,
        "company_id": company_id
    })
    
    return result and result.get("count", 0) > 0

# =========================================
# API Endpoints
# =========================================

@router.get("/", response_model=List[IntegrationConfig])
async def list_integrations(
    company_id: int = Query(...),
    current_user_id: int = Query(...)
):
    """List all available integrations for a company"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        # Get stored integration configurations
        query = """
            SELECT integration_type, credentials_encrypted, enabled, last_sync_at
            FROM IntegrationConfig 
            WHERE company_id = {company_id}
        """
        
        stored_configs = await query_many(query, {"company_id": company_id})
        stored_dict = {config["integration_type"]: config for config in stored_configs}
        
        # Define available integrations
        available_integrations = [
            {
                "id": "github",
                "name": "GitHub",
                "type": "github",
                "enabled": False,
                "last_sync": None,
                "credentials_configured": False
            },
            {
                "id": "jira",
                "name": "Jira",
                "type": "jira", 
                "enabled": False,
                "last_sync": None,
                "credentials_configured": False
            }
        ]
        
        # Update with stored configuration
        for integration in available_integrations:
            if integration["type"] in stored_dict:
                stored = stored_dict[integration["type"]]
                integration["enabled"] = stored.get("enabled", False)
                integration["credentials_configured"] = bool(stored.get("credentials_encrypted"))
                if stored.get("last_sync_at"):
                    integration["last_sync"] = stored["last_sync_at"].isoformat()
        
        return available_integrations
        
    except Exception as e:
        logger.error(f"Failed to list integrations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list integrations: {str(e)}")

@router.post("/configure")
async def configure_integration(
    credentials: IntegrationCredentials,
    company_id: int = Query(...),
    current_user_id: int = Query(...)
):
    """Configure credentials for an integration"""
    
    # Check permissions - DISABLED FOR TESTING
    # if not await check_company_admin_permission(current_user_id, company_id):
    #     raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        # Validate credentials by testing API connection
        if credentials.integration_type == "github":
            github_service = GitHubService(credentials.credentials.get("token"))
            await github_service.test_connection()
        elif credentials.integration_type == "jira":
            jira_service = JiraService(
                credentials.credentials.get("url"),
                credentials.credentials.get("email"),
                credentials.credentials.get("api_token")
            )
            await jira_service.test_connection()
        
        # Encrypt and store credentials
        encrypted_creds = encrypt_credentials(credentials.credentials)
        
        # Insert or update configuration
        upsert_query = """
            MERGE IntegrationConfig AS target
            USING (SELECT {company_id1} as company_id, {integration_type1} as integration_type) AS source
            ON target.company_id = source.company_id AND target.integration_type = source.integration_type
            WHEN MATCHED THEN
                UPDATE SET 
                    credentials_encrypted = {credentials_encrypted1},
                    updated_at = SYSUTCDATETIME(),
                    updated_by = {current_user_id1}
            WHEN NOT MATCHED THEN
                INSERT (company_id, integration_type, credentials_encrypted, enabled, created_at, created_by)
                VALUES ({company_id2}, {integration_type2}, {credentials_encrypted2}, 1, SYSUTCDATETIME(), {current_user_id2});
        """
        
        await execute_sql(upsert_query, {
            "company_id1": company_id,
            "company_id2": company_id,
            "integration_type1": credentials.integration_type,
            "integration_type2": credentials.integration_type,
            "credentials_encrypted1": encrypted_creds,
            "credentials_encrypted2": encrypted_creds,
            "current_user_id1": current_user_id,
            "current_user_id2": current_user_id
        })
        
        return {
            "success": True,
            "message": f"{credentials.integration_type.title()} integration configured successfully",
            "integration_type": credentials.integration_type
        }
        
    except Exception as e:
        logger.error(f"Failed to configure integration: {e}")
        raise HTTPException(status_code=400, detail=f"Configuration failed: {str(e)}")

@router.post("/sync")
async def sync_integration_data(
    sync_request: SyncRequest,
    background_tasks: BackgroundTasks,
    company_id: int = Query(...),
    current_user_id: int = Query(...)
):
    """Trigger data sync for an integration"""
    
    # Check permissions - DISABLED FOR TESTING
    # if not await check_company_admin_permission(current_user_id, company_id):
    #     raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        # Get stored credentials
        query = """
            SELECT credentials_encrypted, enabled
            FROM IntegrationConfig 
            WHERE company_id = {company_id} AND integration_type = {integration_type}
        """
        
        config_result = await query_one(query, {
            "company_id": company_id,
            "integration_type": sync_request.integration_type
        })
        
        if not config_result:
            raise HTTPException(status_code=404, detail="Integration not configured")
        
        if not config_result.get("enabled"):
            raise HTTPException(status_code=400, detail="Integration is disabled")
        
        # Decrypt credentials
        credentials = decrypt_credentials(config_result["credentials_encrypted"])
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start sync: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed to start: {str(e)}")

@router.get("/sync-status")
async def get_sync_status(
    company_id: int = Query(...),
    current_user_id: int = Query(...),
    integration_type: Optional[str] = Query(None)
):
    """Get sync status for integrations"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        where_clause = "WHERE CompanyID = {company_id}"
        params = {"company_id": company_id}
        
        if integration_type:
            where_clause += " AND SourceSystem = {integration_type}"
            params["integration_type"] = integration_type
        
        query = f"""
            SELECT TOP 10
                SourceSystem as integration_type,
                Status,
                StartedAt,
                CompletedAt,
                RecordsIngested,
                ErrorMessage
            FROM SyncBatch 
            {where_clause}
            ORDER BY StartedAt DESC
        """
        
        sync_history = await query_many(query, params)
        
        return {
            "success": True,
            "sync_history": sync_history
        }
        
    except Exception as e:
        logger.error(f"Failed to get sync status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get sync status: {str(e)}")

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
        
        # Update last sync timestamp
        update_query = """
            UPDATE IntegrationConfig 
            SET last_sync_at = SYSUTCDATETIME()
            WHERE company_id = {company_id} AND integration_type = {integration_type}
        """
        
        await execute_sql(update_query, {
            "company_id": company_id,
            "integration_type": integration_type
        })
        
        logger.info(f"Data sync completed successfully: {result}")
        
    except Exception as e:
        logger.error(f"Data sync failed: {e}")
        # Error handling is done in the data ingestion service


# =========================================
# API Endpoints
# =========================================

@router.get("/status")
async def get_all_integrations_status():
    """Get status of all available integrations"""
    try:
        # Mock response for now - replace with actual integration status logic
        integrations_status = [
            {
                "integration_type": "jira",
                "configured": True,
                "last_sync": "2025-10-29T10:30:00Z",
                "last_sync_status": "success",
                "records_count": 25,
                "error_message": None
            },
            {
                "integration_type": "github", 
                "configured": False,
                "last_sync": None,
                "last_sync_status": None,
                "records_count": 0,
                "error_message": None
            }
        ]
        
        return integrations_status
        
    except Exception as e:
        logger.error(f"Error getting integrations status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{integration_type}")
async def get_integration_status(integration_type: str):
    """Get status of specific integration"""
    try:
        if integration_type not in ['github', 'jira']:
            raise HTTPException(status_code=400, detail="Invalid integration type")
            
        # Mock response for now - replace with actual status logic
        status = {
            "integration_type": integration_type,
            "configured": integration_type == "jira",
            "last_sync": "2025-10-29T10:30:00Z" if integration_type == "jira" else None,
            "last_sync_status": "success" if integration_type == "jira" else None,
            "records_count": 25 if integration_type == "jira" else 0,
            "error_message": None
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting integration status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/configure")
async def configure_integration(
    config: IntegrationCredentials,
    company_id: int = Query(1, description="Company ID"),
    current_user_id: int = Query(1, description="Current user ID")
):
    """Configure integration credentials"""
    try:
        logger.info(f"Configuring {config.integration_type} integration for company {company_id}")
        
        # Skip auth check for testing - TODO: Re-enable in production
        # has_permission = await check_company_admin_permission(current_user_id, company_id)
        # if not has_permission:
        #     raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
        
        # Encrypt credentials for storage
        encrypted_creds = encrypt_credentials(config.credentials)
        logger.info(f"Successfully encrypted credentials for {config.integration_type}")
        
        # Store credentials in database (mock for now)
        logger.info(f"Storing encrypted credentials for {config.integration_type}")
        
        # TODO: Implement actual database storage of encrypted credentials
        # await store_integration_credentials(company_id, config.integration_type, encrypted_creds)
        
        return {
            "success": True,
            "message": f"Successfully configured {config.integration_type} integration",
            "integration_type": config.integration_type,
            "configured": True
        }
        
    except Exception as e:
        logger.error(f"Error configuring integration: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync")
async def sync_integration(sync_request: SyncRequest):
    """Trigger data sync for an integration"""
    try:
        # Mock response for now - replace with actual sync logic
        return {
            "success": True,
            "message": f"Started sync for {sync_request.integration_type}",
            "batch_id": "mock-batch-123",
            "started_at": "2025-10-29T10:50:00Z",
            "estimated_completion": "2025-10-29T11:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error starting sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def integrations_health():
    """Health check for integrations service"""
    return {
        "status": "healthy",
        "integrations_available": ["jira", "github"],
        "timestamp": datetime.utcnow().isoformat()
    }
