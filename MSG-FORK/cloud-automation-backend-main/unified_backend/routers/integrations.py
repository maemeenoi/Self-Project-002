"""
Enhanced Integrations Router supporting both environment variables and database storage
Supports the new Integration table for secure credential management
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import json
import os

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks, status
from pydantic import BaseModel, validator

# Import the current company function
from utils.auth import get_current_company

# Database imports
import sys
import os
# Ensure we import from the unified backend lib directory
# Database imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
from db  import query_one, query_many, execute_sql, insert_and_return
router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# Integration models and services
from models.integration import (
    IntegrationCreate, IntegrationUpdate, IntegrationResponse, 
    IntegrationWithSecrets, IntegrationType
)
from services.integrations.integration_service import IntegrationService

# Services
from services.cloud.azure_storage import UnifiedAzureBlobStorage
from services.integrations.github_service import GitHubService
from services.integrations.jira_service import JiraService
from services.automation.data_ingestion_service import DataIngestionService
from services.cloud.aws_service import AWSService
from services.cloud.azure_cost_service import AzureService
from services.cloud.gcp_service import GCPService

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
    """Get credentials from environment variables (LEGACY - used as fallback)"""
    if integration_type == "github":
        return {
            "token": config("GITHUB_TOKEN", default=""),
            "organization": config("GITHUB_ORG", default=""),
            "repositories": config("GITHUB_REPOS", default="").split(",") if config("GITHUB_REPOS", default="") else []
        }
    elif integration_type == "jira":
        return {
            "url": config("JIRA_URL", default=""),
            "email": config("JIRA_EMAIL", default=""),
            "api_token": config("JIRA_API_TOKEN", default=""),
            "projects": config("JIRA_PROJECTS", default="").split(",") if config("JIRA_PROJECTS", default="") else []
        }
    elif integration_type == "aws":
        return {
            "aws_access_key_id": config("AWS_ACCESS_KEY_ID", default=""),
            "aws_secret_access_key": config("AWS_SECRET_ACCESS_KEY", default=""),
            "aws_session_token": config("AWS_SESSION_TOKEN", default=""),
            "region": config("AWS_DEFAULT_REGION", default="us-east-1"),
            "account_id": config("AWS_ACCOUNT_ID", default="")
        }
    elif integration_type == "azure":
        return {
            "client_id": config("AZURE_CLIENT_ID", default=""),
            "client_secret": config("AZURE_CLIENT_SECRET", default=""),
            "tenant_id": config("AZURE_TENANT_ID", default=""),
            "subscription_id": config("AZURE_SUBSCRIPTION_ID", default=""),
            "resource_group": config("AZURE_RESOURCE_GROUP", default=""),
            "storage_account": config("AZURE_STORAGE_ACCOUNT", default="")
        }
    elif integration_type == "gcp":
        return {
            "project_id": config("GCP_PROJECT_ID", default=""),
            "private_key_id": config("GCP_PRIVATE_KEY_ID", default=""),
            "private_key": config("GCP_PRIVATE_KEY", default=""),
            "client_email": config("GCP_CLIENT_EMAIL", default=""),
            "client_id": config("GCP_CLIENT_ID", default=""),
            "client_x509_cert_url": config("GCP_CLIENT_X509_CERT_URL", default="")
        }
    else:
        return {}

async def get_managed_integration_credentials(integration_type: str, company_id: int) -> Dict[str, str]:
    """Get credentials from managed integrations (Integration table)"""
    try:
        service = IntegrationService()
        
        # Convert string to IntegrationType enum
        try:
            integration_type_enum = IntegrationType(integration_type.lower())
        except ValueError:
            logger.error(f"Invalid integration type: {integration_type}")
            return {}
        
        # Get active integrations of the specified type for the company
        integrations = await service.get_company_integrations(
            company_id=company_id,
            integration_type=integration_type_enum,
            include_secrets=True
        )
        
        if not integrations:
            return {}
        
        # Use the first active integration (you may want to add logic for multiple integrations)
        integration = integrations[0]
        
        # Extract credentials based on integration type
        if integration_type == "github":
            secrets = integration.secrets_json or {}
            config_data = integration.config_json or {}
            return {
                "token": secrets.get("token", ""),
                "organization": config_data.get("organization", ""),
                "repositories": config_data.get("repositories", [])
            }
        elif integration_type == "jira":
            secrets = integration.secrets_json or {}
            config_data = integration.config_json or {}
            credentials = {
                "url": config_data.get("base_url", ""),
                "email": secrets.get("email", ""),
                "api_token": secrets.get("api_token", ""),
                "projects": config_data.get("project_keys", "").split(",") if config_data.get("project_keys") else []
            }
            logger.info(f"🔍 Jira credentials retrieved: URL={credentials['url']}, Email={credentials['email']}, Projects={credentials['projects']}")
            return credentials
        elif integration_type == "aws":
            secrets = integration.secrets_json or {}
            config_data = integration.config_json or {}
            return {
                "aws_access_key_id": secrets.get("aws_access_key_id", ""),
                "aws_secret_access_key": secrets.get("aws_secret_access_key", ""),
                "aws_session_token": secrets.get("aws_session_token", ""),
                "region": config_data.get("region", "us-east-1"),
                "account_id": config_data.get("account_id", "")
            }
        elif integration_type == "azure":
            secrets = integration.secrets_json or {}
            config_data = integration.config_json or {}
            return {
                "client_id": secrets.get("client_id", ""),
                "client_secret": secrets.get("client_secret", ""),
                "tenant_id": secrets.get("tenant_id", ""),
                "subscription_id": config_data.get("subscription_id", ""),
                "resource_group": config_data.get("resource_group", ""),
                "storage_account": config_data.get("storage_account", "")
            }
        elif integration_type == "gcp":
            secrets = integration.secrets_json or {}
            config_data = integration.config_json or {}
            return {
                "project_id": config_data.get("project_id", ""),
                "private_key_id": secrets.get("private_key_id", ""),
                "private_key": secrets.get("private_key", ""),
                "client_email": secrets.get("client_email", ""),
                "client_id": secrets.get("client_id", ""),
                "client_x509_cert_url": secrets.get("client_x509_cert_url", "")
            }
        else:
            return {}
            
    except Exception as e:
        logger.error(f"Failed to get managed integration credentials for {integration_type}: {e}")
        return {}

def is_integration_configured(integration_type: str) -> bool:
    """Check if integration has required credentials in environment (LEGACY)"""
    credentials = get_integration_credentials(integration_type)
    
    if integration_type == "github":
        return bool(credentials.get("token"))
    elif integration_type == "jira":
        return bool(credentials.get("url") and credentials.get("email") and credentials.get("api_token"))
    elif integration_type == "aws":
        return bool(credentials.get("aws_access_key_id") and credentials.get("aws_secret_access_key"))
    elif integration_type == "azure":
        return bool(credentials.get("client_id") and credentials.get("client_secret") and credentials.get("tenant_id"))
    elif integration_type == "gcp":
        return bool(credentials.get("project_id") and credentials.get("private_key") and credentials.get("client_email"))
    else:
        return False

async def is_managed_integration_configured(integration_type: str, company_id: int) -> bool:
    """Check if managed integration has required credentials in database"""
    credentials = await get_managed_integration_credentials(integration_type, company_id)
    
    if integration_type == "github":
        return bool(credentials.get("token"))
    elif integration_type == "jira":
        return bool(credentials.get("url") and credentials.get("email") and credentials.get("api_token"))
    elif integration_type == "aws":
        return bool(credentials.get("aws_access_key_id") and credentials.get("aws_secret_access_key"))
    elif integration_type == "azure":
        return bool(credentials.get("client_id") and credentials.get("client_secret") and credentials.get("tenant_id"))
    elif integration_type == "gcp":
        return bool(credentials.get("project_id") and credentials.get("private_key") and credentials.get("client_email"))
    else:
        return False

async def get_last_sync_info(integration_type: str, company_id: int) -> Dict[str, Any]:
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
            records_ingested = result.get("RecordsIngested")
            return {
                "last_sync": started_at.isoformat() if started_at else None,
                "last_sync_status": "success" if result.get("CompletedAt") else "running",
                "records_count": records_ingested if records_ingested is not None else 0
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
    company_id: int = Depends(get_current_company)
):
    """Get status of all available integrations"""
    integrations = []
    
    for integration_type in ["github", "jira", "aws", "azure", "gcp"]:
        # Check both managed and environment configurations
        managed_configured = await is_managed_integration_configured(integration_type, company_id)
        env_configured = is_integration_configured(integration_type)
        configured = managed_configured or env_configured
        
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
    company_id: int = Depends(get_current_company)
):
    """Get status of specific integration"""
    if integration_type not in ["github", "jira", "aws", "azure", "gcp"]:
        raise HTTPException(status_code=400, detail="Unsupported integration type")
    
    # Check both managed and environment configurations
    managed_configured = await is_managed_integration_configured(integration_type, company_id)
    env_configured = is_integration_configured(integration_type)
    configured = managed_configured or env_configured
    
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
    company_id: int = Depends(get_current_company),
    current_user_id: int = Query(1, description="Current user ID")
):
    """Trigger data sync for an integration"""
    
    if sync_request.integration_type not in ["github", "jira"]:
        raise HTTPException(status_code=400, detail="Data sync only supported for GitHub and Jira integrations")
    
    # First try to get credentials from managed integrations
    managed_credentials = await get_managed_integration_credentials(sync_request.integration_type, company_id)
    managed_configured = await is_managed_integration_configured(sync_request.integration_type, company_id)
    
    # Fallback to environment credentials if no managed integration exists
    env_configured = is_integration_configured(sync_request.integration_type)
    env_credentials = get_integration_credentials(sync_request.integration_type)
    
    if managed_configured:
        logger.info(f"Using managed integration credentials for {sync_request.integration_type}")
        credentials = managed_credentials
        source = "managed"
    elif env_configured:
        logger.info(f"Using environment credentials for {sync_request.integration_type} (fallback)")
        credentials = env_credentials
        source = "environment"
    else:
        raise HTTPException(
            status_code=400, 
            detail=f"{sync_request.integration_type.title()} integration not configured. Please configure it through the Integration Management page or check environment variables."
        )
    
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
        "message": f"{sync_request.integration_type.title()} sync started using {source} credentials",
        "integration_type": sync_request.integration_type,
        "credentials_source": source
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
            # Process workflow data through ingestion pipeline
            result = await data_ingestion.process_raw_data(company_id, integration_type, raw_data)
            
        elif integration_type == "jira":
            logger.info(f"🔧 Jira credentials: URL={credentials.get('url')}, Email={credentials.get('email')}, Token={credentials.get('api_token')[:10]}..., Projects={credentials.get('projects', [])}")
            jira_service = JiraService(
                credentials.get("url"),
                credentials.get("email"),
                credentials.get("api_token")
            )
            raw_data = await jira_service.fetch_all_data(
                projects=credentials.get("projects", [])
            )
            # Process workflow data through ingestion pipeline
            result = await data_ingestion.process_raw_data(company_id, integration_type, raw_data)
            
        elif integration_type in ["aws", "azure", "gcp"]:
            logger.info(f"🔧 Starting financial data sync for {integration_type}")
            
            # Fetch real financial data from cloud providers
            raw_financial_data = await fetch_real_financial_data(integration_type, credentials)
            
            # Process financial data through the financial pipeline
            result = await data_ingestion.process_financial_data(company_id, integration_type, raw_financial_data)
            
        else:
            raise ValueError(f"Unsupported integration type: {integration_type}")
        
        logger.info(f"Data sync completed successfully: {result}")
        
    except Exception as e:
        logger.error(f"Data sync failed for {integration_type}: {e}")
        raise e


async def fetch_real_financial_data(integration_type: str, credentials: Dict[str, str]) -> List[Dict[str, Any]]:
    """
    Fetch real financial data from cloud providers using their APIs
    """
    logger.info(f"🔍 Fetching real financial data for {integration_type}")
    
    try:
        if integration_type == "aws":
            aws_service = AWSService(
                aws_access_key_id=credentials.get("aws_access_key_id", ""),
                aws_secret_access_key=credentials.get("aws_secret_access_key", ""),
                region=credentials.get("region", "us-east-1")
            )
            return await aws_service.fetch_all_data(days=30)
            
        elif integration_type == "azure":
            azure_service = AzureService(
                client_id=credentials.get("client_id", ""),
                client_secret=credentials.get("client_secret", ""),
                tenant_id=credentials.get("tenant_id", ""),
                subscription_id=credentials.get("subscription_id", "")
            )
            return await azure_service.fetch_all_data(days=30)
            
        elif integration_type == "gcp":
            gcp_service = GCPService(
                project_id=credentials.get("project_id", ""),
                client_email=credentials.get("client_email", ""),
                private_key=credentials.get("private_key", "")
            )
            return await gcp_service.fetch_all_data(days=30)
        else:
            logger.warning(f"Unknown financial integration type: {integration_type}")
            return []
            
    except Exception as e:
        logger.error(f"❌ Failed to fetch real financial data for {integration_type}: {e}")
        # Do NOT fallback to mock data - raise the error to show real API issues
        raise Exception(f"Failed to fetch real financial data from {integration_type}: {str(e)}")


# =========================================
# NEW: Database-stored Integration Management
# =========================================

@router.post("/managed", response_model=IntegrationResponse)
async def create_managed_integration(
    integration_data: IntegrationCreate,
    background_tasks: BackgroundTasks,
    company_id: int = Depends(get_current_company),
    trigger_sync: bool = Query(False, description="Whether to trigger data sync after creation")
):
    """Create a new managed integration stored in database"""
    try:
        service = IntegrationService()
        
        integration = await service.create_integration(
            company_id=company_id,
            integration_type=integration_data.integration_type,
            integration_name=integration_data.integration_name,
            config_json=integration_data.config_json,
            secrets_json=integration_data.secrets_json,
            created_by=None  # TODO: Add user context when auth is implemented
        )
        
        logger.info(f"Created managed integration {integration.integration_id} for company {company_id}")
        
        # Trigger data sync if requested
        integration_type_str = str(integration_data.integration_type.value) if hasattr(integration_data.integration_type, 'value') else str(integration_data.integration_type)
        logger.info(f"🔧 Debug - trigger_sync: {trigger_sync}")
        logger.info(f"🔧 Debug - integration_type_str: {integration_type_str}")
        
        if trigger_sync and integration_type_str in ["github", "jira", "aws", "azure", "gcp"]:
            logger.info(f"🔧 Triggering sync for {integration_type_str}")
            
            managed_credentials = await get_managed_integration_credentials(integration_type_str, company_id)
            if managed_credentials:
                logger.info(f"Found credentials, starting sync for integration {integration.integration_id}")
                background_tasks.add_task(
                    perform_data_sync,
                    company_id,
                    integration_type_str,
                    managed_credentials,
                    False  # force_full_sync
                )
            else:
                logger.warning(f"No credentials found for {integration_type_str}, sync not triggered")
        
        return integration
        
    except Exception as e:
        logger.error(f"Failed to create managed integration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create integration: {str(e)}"
        )


@router.post("/manual-sync/{integration_type}")
async def manual_sync(
    integration_type: str,
    company_id: int = Depends(get_current_company)
):
    """Manual sync endpoint for testing"""
    try:
        logger.info(f"🔧 Manual sync triggered for {integration_type}, company {company_id}")
        
        # Get credentials (try managed first, fall back to env vars)
        managed_credentials = await get_managed_integration_credentials(integration_type, company_id)
        if not managed_credentials:
            logger.info(f"🔧 No managed credentials found for {integration_type}, trying environment variables")
            managed_credentials = get_integration_credentials(integration_type)
            if not managed_credentials:
                raise HTTPException(status_code=404, detail=f"No {integration_type} integration found")
        
        logger.info(f"🔧 Found credentials for {integration_type}: {managed_credentials}")
        
        # Perform sync directly (not as background task)
        await perform_data_sync(company_id, integration_type, managed_credentials, False)
        
        return {"status": "success", "message": f"Manual sync completed for {integration_type}"}
        
    except Exception as e:
        logger.error(f"Manual sync failed: {e}")
        raise HTTPException(status_code=500, detail=f"Manual sync failed: {str(e)}")


@router.get("/managed", response_model=List[IntegrationResponse])
async def list_managed_integrations(
    integration_type: Optional[IntegrationType] = None,
    company_id: int = Depends(get_current_company)
):
    """List all managed integrations for the company"""
    try:
        service = IntegrationService()
        
        integrations = await service.get_company_integrations(
            company_id=company_id,
            integration_type=integration_type,
            include_secrets=False
        )
        
        return integrations
        
    except Exception as e:
        logger.error(f"Failed to list managed integrations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list integrations: {str(e)}"
        )


@router.get("/managed/{integration_id}", response_model=IntegrationResponse)
async def get_managed_integration(
    integration_id: int,
    company_id: int = Depends(get_current_company)
):
    """Get a specific managed integration (without secrets)"""
    try:
        service = IntegrationService()
        
        integration = await service.get_integration_by_id(
            integration_id=integration_id,
            company_id=company_id,
            include_secrets=False
        )
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration not found"
            )
        
        return integration
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get managed integration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get integration: {str(e)}"
        )


@router.get("/managed/{integration_id}/secrets", response_model=IntegrationWithSecrets)
async def get_managed_integration_with_secrets(
    integration_id: int,
    company_id: int = Depends(get_current_company)
):
    """Get a specific managed integration (with decrypted secrets)"""
    try:
        service = IntegrationService()
        
        integration = await service.get_integration_by_id(
            integration_id=integration_id,
            company_id=company_id,
            include_secrets=True
        )
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration not found"
            )
        
        return integration
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get managed integration with secrets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get integration with secrets: {str(e)}"
        )


@router.put("/managed/{integration_id}", response_model=IntegrationResponse)
async def update_managed_integration(
    integration_id: int,
    integration_data: IntegrationUpdate,
    company_id: int = Depends(get_current_company)
):
    """Update an existing managed integration"""
    try:
        service = IntegrationService()
        
        # Check if integration exists first
        existing = await service.get_integration_by_id(
            integration_id=integration_id,
            company_id=company_id
        )
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration not found"
            )
        
        integration = await service.update_integration(
            integration_id=integration_id,
            company_id=company_id,
            integration_name=integration_data.integration_name,
            config_json=integration_data.config_json,
            secrets_json=integration_data.secrets_json,
            is_active=integration_data.is_active
        )
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update integration"
            )
        
        logger.info(f"Updated managed integration {integration_id} for company {company_id}")
        return integration
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update managed integration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update integration: {str(e)}"
        )


@router.delete("/managed/{integration_id}")
async def delete_managed_integration(
    integration_id: int,
    company_id: int = Depends(get_current_company)
):
    """Delete a managed integration (soft delete)"""
    try:
        service = IntegrationService()
        
        # Check if integration exists first
        existing = await service.get_integration_by_id(
            integration_id=integration_id,
            company_id=company_id
        )
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration not found"
            )
        
        success = await service.delete_integration(
            integration_id=integration_id,
            company_id=company_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete integration"
            )
        
        logger.info(f"Deleted managed integration {integration_id} for company {company_id}")
        return {"message": "Integration deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete managed integration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete integration: {str(e)}"
        )


@router.post("/managed/{integration_id}/sync")
async def sync_managed_integration(
    integration_id: int,
    background_tasks: BackgroundTasks,
    company_id: int = Depends(get_current_company),
    force_full_sync: bool = Query(False, description="Force full data sync")
):
    """Trigger data sync for a specific managed integration"""
    try:
        service = IntegrationService()
        
        # Get the integration
        integration = await service.get_integration_by_id(
            integration_id=integration_id,
            company_id=company_id,
            include_secrets=True
        )
        
        if not integration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration not found"
            )
        
        if not integration.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Integration is not active"
            )
        
        integration_type = integration.integration_type.value
        if integration_type not in ["github", "jira"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Sync not supported for this integration type"
            )
        
        # Get credentials from the specific integration
        secrets = integration.secrets_json or {}
        config_data = integration.config_json or {}
        
        # Extract credentials based on integration type
        if integration_type == "github":
            managed_credentials = {
                "token": secrets.get("token", ""),
                "organization": config_data.get("organization", ""),
                "repositories": config_data.get("repositories", [])
            }
        elif integration_type == "jira":
            managed_credentials = {
                "url": config_data.get("base_url", ""),
                "email": secrets.get("email", ""),
                "api_token": secrets.get("api_token", ""),
                "projects": config_data.get("project_keys", "").split(",") if config_data.get("project_keys") else []
            }
        else:
            managed_credentials = {}
        
        logger.info(f"Retrieved credentials for integration {integration_id}: organization={managed_credentials.get('organization')}, repositories={managed_credentials.get('repositories')}")
        
        if not managed_credentials or not any(managed_credentials.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No valid credentials found for integration {integration_id}"
            )
        
        # Start background sync process
        background_tasks.add_task(
            perform_data_sync,
            company_id,
            integration_type,
            managed_credentials,
            force_full_sync
        )
        
        logger.info(f"Started sync for managed integration {integration_id} ({integration_type})")
        
        return {
            "success": True,
            "message": f"Data sync started for {integration.integration_name}",
            "integration_id": integration_id,
            "integration_type": integration_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to sync managed integration {integration_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start sync: {str(e)}"
        )


@router.get("/types", response_model=List[str])
async def get_integration_types():
    """Get list of supported integration types"""
    return [integration_type.value for integration_type in IntegrationType]


@router.get("/test/{integration_type}")
async def test_integration_detailed(
    integration_type: str,
    company_id: int = Depends(get_current_company)
):
    """Test integration connection and return detailed diagnostics"""
    try:
        logger.info(f"🔧 Testing {integration_type} integration for company {company_id}")
        
        credentials = await get_managed_integration_credentials(integration_type, company_id)
        
        if not credentials:
            return {
                "success": False,
                "error": f"No {integration_type} integration configured",
                "details": "Please create an integration first"
            }
        
        if integration_type == "jira":
            jira_service = JiraService(
                credentials.get("url"),
                credentials.get("email"),
                credentials.get("api_token")
            )
            
            # Test connection
            connection_success = await jira_service.test_connection()
            
            # Test data fetching
            try:
                logger.info("🔧 Testing Jira data fetch...")
                sample_data = await jira_service.fetch_all_data(credentials.get("projects"))
                
                return {
                    "success": True,
                    "message": f"Jira connection and data fetch successful",
                    "details": {
                        "url": credentials.get("url"),
                        "email": credentials.get("email"),
                        "projects_configured": credentials.get("projects"),
                        "sample_data_count": len(sample_data),
                        "connection_test": connection_success,
                        "api_token_present": bool(credentials.get("api_token"))
                    }
                }
            except Exception as fetch_error:
                logger.error(f"🔧 Jira data fetch failed: {fetch_error}")
                return {
                    "success": False,
                    "error": f"Connection OK but data fetch failed: {str(fetch_error)}",
                    "details": {
                        "url": credentials.get("url"),
                        "email": credentials.get("email"),
                        "projects_configured": credentials.get("projects"),
                        "connection_test": connection_success,
                        "api_token_present": bool(credentials.get("api_token"))
                    }
                }
                
        elif integration_type == "github":
            github_service = GitHubService(credentials.get("token"))
            await github_service.test_connection()
            return {
                "success": True,
                "message": f"GitHub connection successful",
                "details": credentials
            }
        elif integration_type == "aws":
            # AWS credential validation
            required_fields = ["aws_access_key_id", "aws_secret_access_key"]
            missing_fields = [field for field in required_fields if not credentials.get(field)]
            
            if missing_fields:
                return {
                    "success": False,
                    "error": f"Missing required AWS credentials: {', '.join(missing_fields)}",
                    "details": {
                        "provided_fields": [k for k, v in credentials.items() if v],
                        "missing_fields": missing_fields
                    }
                }
            
            return {
                "success": True,
                "message": "AWS credentials configured successfully",
                "details": {
                    "region": credentials.get("region"),
                    "account_id": credentials.get("account_id"),
                    "has_session_token": bool(credentials.get("aws_session_token")),
                    "credentials_provided": ["aws_access_key_id", "aws_secret_access_key"]
                }
            }
            
        elif integration_type == "azure":
            # Azure credential validation
            required_fields = ["client_id", "client_secret", "tenant_id"]
            missing_fields = [field for field in required_fields if not credentials.get(field)]
            
            if missing_fields:
                return {
                    "success": False,
                    "error": f"Missing required Azure credentials: {', '.join(missing_fields)}",
                    "details": {
                        "provided_fields": [k for k, v in credentials.items() if v],
                        "missing_fields": missing_fields
                    }
                }
            
            return {
                "success": True,
                "message": "Azure credentials configured successfully",
                "details": {
                    "subscription_id": credentials.get("subscription_id"),
                    "resource_group": credentials.get("resource_group"),
                    "storage_account": credentials.get("storage_account"),
                    "credentials_provided": ["client_id", "client_secret", "tenant_id"]
                }
            }
            
        elif integration_type == "gcp":
            # GCP credential validation
            required_fields = ["project_id", "private_key", "client_email"]
            missing_fields = [field for field in required_fields if not credentials.get(field)]
            
            if missing_fields:
                return {
                    "success": False,
                    "error": f"Missing required GCP credentials: {', '.join(missing_fields)}",
                    "details": {
                        "provided_fields": [k for k, v in credentials.items() if v],
                        "missing_fields": missing_fields
                    }
                }
            
            return {
                "success": True,
                "message": "GCP credentials configured successfully",
                "details": {
                    "project_id": credentials.get("project_id"),
                    "client_email": credentials.get("client_email"),
                    "credentials_provided": ["project_id", "private_key", "client_email"]
                }
            }
        else:
            return {
                "success": False,
                "error": f"Unsupported integration type: {integration_type}"
            }
            
    except Exception as e:
        logger.error(f"Integration test failed for {integration_type}: {e}")
        return {
            "success": False,
            "error": str(e),
            "details": f"Connection test failed for {integration_type}"
        }