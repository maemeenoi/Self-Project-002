"""
Cloud Cost API Router

This router provides endpoints for fetching real-time cloud cost data from AWS, Azure, and GCP.
It integrates with the integrations system to get credentials and fetch cost data.
"""

import asyncio
import logging
import tempfile
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel

# Import the current company function
from utils.auth import get_current_company

# Database imports
from lib.db import query_many, execute_sql

# Services
from services.integration_service import IntegrationService
from models.integration import IntegrationType

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["cloud-cost"])

# Cloud API imports (with fallback)
try:
    import boto3
    from azure.identity import ClientSecretCredential
    from azure.mgmt.costmanagement import CostManagementClient
    CLOUD_APIS_AVAILABLE = True
    logger.info("✅ Cloud APIs imported successfully")
except ImportError as e:
    logger.warning(f"⚠️  Some cloud APIs not available: {e}")
    CLOUD_APIS_AVAILABLE = False

# =========================================
# Models
# =========================================

class CloudCostRequest(BaseModel):
    days: int = 30

class CloudCostResponse(BaseModel):
    success: bool
    message: str
    data: List[Dict[str, Any]]
    rows: int
    date_range: str
    provider: str

# =========================================
# Helper Functions
# =========================================

async def get_cloud_credentials(company_id: int, provider: str) -> Optional[Dict[str, Any]]:
    """Get cloud provider credentials from the integrations system"""
    try:
        service = IntegrationService()
        
        # Map provider to integration type
        provider_map = {
            'aws': IntegrationType.AWS,
            'azure': IntegrationType.AZURE,
            'gcp': IntegrationType.GCP
        }
        
        if provider not in provider_map:
            logger.error(f"Unsupported provider: {provider}")
            return None
        
        # Get active integrations for this provider
        integrations = await service.get_company_integrations(
            company_id=company_id,
            integration_type=provider_map[provider],
            include_secrets=True
        )
        
        if not integrations:
            logger.warning(f"No {provider.upper()} integration found for company {company_id}")
            return None
        
        # Use the first active integration
        integration = integrations[0]
        
        if not integration.secrets_json:
            logger.warning(f"No decrypted secrets found for {provider.upper()} integration")
            return None
        
        # Extract credentials based on provider
        if provider == 'aws':
            return {
                'access_key': integration.secrets_json.get('aws_access_key_id', ''),
                'secret_key': integration.secrets_json.get('aws_secret_access_key', ''),
                'session_token': integration.secrets_json.get('aws_session_token', ''),
                'region': integration.config_json.get('region', 'us-east-1') if integration.config_json else 'us-east-1',
                'account_id': integration.config_json.get('account_id', '') if integration.config_json else ''
            }
        elif provider == 'azure':
            return {
                'client_id': integration.secrets_json.get('client_id', ''),
                'client_secret': integration.secrets_json.get('client_secret', ''),
                'tenant_id': integration.secrets_json.get('tenant_id', ''),
                'subscription_id': integration.config_json.get('subscription_id', '') if integration.config_json else ''
            }
        elif provider == 'gcp':
            return {
                'service_account_key': integration.secrets_json.get('service_account_key', ''),
                'project_id': integration.config_json.get('project_id', '') if integration.config_json else ''
            }
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to get {provider} credentials: {e}")
        return None

def process_aws_cost_data(response) -> List[Dict[str, Any]]:
    """Process AWS Cost Explorer response into standard format"""
    processed_data = []
    
    for result in response.get('ResultsByTime', []):
        date = result['TimePeriod']['Start']
        
        for group in result.get('Groups', []):
            service = group['Keys'][0] if group.get('Keys') else 'Unknown'
            cost = float(group['Metrics']['BlendedCost']['Amount'])
            
            processed_data.append({
                'date': date,
                'service': service,
                'cost': cost,
                'currency': group['Metrics']['BlendedCost']['Unit']
            })
    
    return processed_data

def process_azure_cost_data(result) -> List[Dict[str, Any]]:
    """Process Azure Cost Management response into standard format"""
    processed_data = []

    columns = []
    if hasattr(result, 'columns') and result.columns:
        for column in result.columns:
            if isinstance(column, dict):
                columns.append(column.get('name'))
            else:
                columns.append(getattr(column, 'name', None))

    if hasattr(result, 'rows') and result.rows:
        for row in result.rows:
            row_map = {}
            for idx, value in enumerate(row):
                key = columns[idx] if idx < len(columns) and columns[idx] else f'column_{idx}'
                row_map[key] = value

            # Extract date
            date_value = None
            date_keys = [
                key for key in row_map.keys()
                if key and any(token in key.lower() for token in ['date', 'usageperiod', 'billingperiod'])
            ]
            for key in date_keys:
                date_value = row_map.get(key)
                if date_value:
                    break
            if not date_value and len(row) > 1:
                date_value = row[1]

            if isinstance(date_value, datetime):
                date_str = date_value.date().isoformat()
            elif isinstance(date_value, (int, float)):
                value = float(date_value)
                if value > 1e12:
                    date_str = datetime.utcfromtimestamp(value / 1000).date().isoformat()
                elif value > 1e9:
                    date_str = datetime.utcfromtimestamp(value).date().isoformat()
                else:
                    date_str = datetime.utcfromtimestamp(value).date().isoformat()
            elif date_value:
                try:
                    parsed_date = datetime.fromisoformat(str(date_value).replace('Z', '+00:00'))
                    date_str = parsed_date.date().isoformat()
                except ValueError:
                    try:
                        date_str = datetime.strptime(str(date_value), '%Y-%m-%d').date().isoformat()
                    except ValueError:
                        date_str = str(date_value)
            else:
                date_str = None

            # Extract service
            service_value = None
            service_keys = [
                key for key in row_map.keys()
                if key and any(token in key.lower() for token in ['service', 'meter', 'product', 'resource'])
            ]
            for key in service_keys:
                service_value = row_map.get(key)
                if service_value:
                    break
            if not service_value and len(row) > 2:
                service_value = row[2]

            # Extract cost
            cost_value = None
            cost_keys = [
                key for key in row_map.keys()
                if key and any(token in key.lower() for token in ['cost', 'amount', 'pretax'])
            ]
            for key in cost_keys:
                value = row_map.get(key)
                if value is not None:
                    try:
                        cost_value = float(value)
                        break
                    except (TypeError, ValueError):
                        continue
            if cost_value is None and row:
                try:
                    cost_value = float(row[0]) if row[0] is not None else 0.0
                except (TypeError, ValueError):
                    cost_value = 0.0

            if not date_str:
                continue

            processed_data.append({
                'date': date_str,
                'service': str(service_value) if service_value is not None else 'Unknown',
                'cost': cost_value if cost_value is not None else 0.0,
                'currency': 'USD'
            })

    return processed_data

# =========================================
# Cloud Cost Endpoints
# =========================================

@router.post("/fetch/aws", response_model=CloudCostResponse)
async def fetch_aws_data(
    request: CloudCostRequest = CloudCostRequest(),
    company_id: int = Depends(get_current_company)
):
    """Fetch cost data from AWS Cost Explorer using configured credentials"""
    try:
        if not CLOUD_APIS_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="AWS APIs not available - missing boto3 dependency"
            )
        
        # Get AWS credentials from the integrations system
        credentials = await get_cloud_credentials(company_id, 'aws')
        
        if not credentials or not credentials.get('access_key') or not credentials.get('secret_key'):
            raise HTTPException(
                status_code=503,
                detail="AWS credentials not configured in Admin Dashboard. Please configure AWS integration first."
            )
        
        logger.info(f"Using AWS credentials for company {company_id}")
            
        # Initialize AWS Cost Explorer client
        session = boto3.Session(
            aws_access_key_id=credentials['access_key'],
            aws_secret_access_key=credentials['secret_key'],
            region_name=credentials.get('region', 'us-east-1')
        )
        
        if credentials.get('session_token'):
            session = boto3.Session(
                aws_access_key_id=credentials['access_key'],
                aws_secret_access_key=credentials['secret_key'],
                aws_session_token=credentials['session_token'],
                region_name=credentials.get('region', 'us-east-1')
            )
        
        ce_client = session.client('ce')
        
        # Fetch cost data for the specified number of days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=request.days)
        
        response = ce_client.get_cost_and_usage(
            TimePeriod={
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            Granularity='DAILY',
            Metrics=['BlendedCost'],
            GroupBy=[
                {'Type': 'DIMENSION', 'Key': 'SERVICE'}
            ]
        )
        
        # Process AWS response into standard format
        processed_data = process_aws_cost_data(response)
        
        logger.info(f"Successfully fetched {len(processed_data)} AWS cost records for company {company_id}")
        
        return CloudCostResponse(
            success=True,
            message='AWS cost data fetched successfully',
            data=processed_data,
            rows=len(processed_data),
            date_range=f"{start_date} to {end_date}",
            provider='aws'
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"AWS fetch error for company {company_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch AWS data: {str(e)}"
        )

@router.post("/fetch/azure", response_model=CloudCostResponse)
async def fetch_azure_data(
    request: CloudCostRequest = CloudCostRequest(),
    company_id: int = Depends(get_current_company)
):
    """Fetch cost data from Azure Cost Management using configured credentials"""
    try:
        if not CLOUD_APIS_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="Azure APIs not available - missing Azure SDK dependencies"
            )
        
        # Get Azure credentials from the integrations system
        credentials = await get_cloud_credentials(company_id, 'azure')
        
        if not credentials or not all([
            credentials.get('client_id'),
            credentials.get('client_secret'),
            credentials.get('tenant_id'),
            credentials.get('subscription_id')
        ]):
            raise HTTPException(
                status_code=503,
                detail="Azure credentials not configured in Admin Dashboard. Please configure Azure integration first."
            )
        
        logger.info(f"Using Azure credentials for company {company_id}")
            
        # Initialize Azure credentials
        credential = ClientSecretCredential(
            tenant_id=credentials['tenant_id'],
            client_id=credentials['client_id'],
            client_secret=credentials['client_secret']
        )
        
        # Initialize Cost Management client
        cost_client = CostManagementClient(credential)
        
        # Define scope and parameters
        scope = f"/subscriptions/{credentials['subscription_id']}"
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=request.days)
        
        # Query parameters
        query_definition = {
            'type': 'ActualCost',
            'timeframe': 'Custom',
            'timePeriod': {
                'from': f"{start_date.isoformat()}T00:00:00Z",
                'to': f"{end_date.isoformat()}T23:59:59Z"
            },
            'dataset': {
                'granularity': 'Daily',
                'aggregation': {
                    'totalCost': {
                        'name': 'PreTaxCost',
                        'function': 'Sum'
                    }
                },
                'grouping': [
                    {
                        'type': 'Dimension',
                        'name': 'ServiceName'
                    }
                ]
            }
        }
        
        # Execute query
        result = cost_client.query.usage(scope, query_definition)
        
        # Process Azure response
        processed_data = process_azure_cost_data(result)
        
        logger.info(f"Successfully fetched {len(processed_data)} Azure cost records for company {company_id}")
        
        return CloudCostResponse(
            success=True,
            message='Azure cost data fetched successfully',
            data=processed_data,
            rows=len(processed_data),
            date_range=f"{start_date} to {end_date}",
            provider='azure'
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Azure fetch error for company {company_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Azure data: {str(e)}"
        )

@router.get("/debug/credentials")
async def debug_credentials(company_id: int = Depends(get_current_company)):
    """Debug endpoint to check what credentials are stored in database"""
    try:
        service = IntegrationService()
        
        # Get all integrations for this company
        aws_integrations = await service.get_company_integrations(
            company_id=company_id,
            integration_type=IntegrationType.AWS,
            include_secrets=False  # Don't decrypt for debug
        )
        
        azure_integrations = await service.get_company_integrations(
            company_id=company_id,
            integration_type=IntegrationType.AZURE,
            include_secrets=False  # Don't decrypt for debug
        )
        
        # Try to get decrypted credentials
        aws_creds = await get_cloud_credentials(company_id, 'aws')
        azure_creds = await get_cloud_credentials(company_id, 'azure')
        
        return {
            'company_id': company_id,
            'aws_integrations_count': len(aws_integrations),
            'azure_integrations_count': len(azure_integrations),
            'aws_credentials_decrypted': aws_creds is not None,
            'azure_credentials_decrypted': azure_creds is not None,
            'aws_has_access_key': bool(aws_creds and aws_creds.get('access_key')) if aws_creds else False,
            'azure_has_client_id': bool(azure_creds and azure_creds.get('client_id')) if azure_creds else False,
            'message': 'Credentials debug information'
        }
        
    except Exception as e:
        logger.error(f"Debug credentials error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Debug failed: {str(e)}"
        )
