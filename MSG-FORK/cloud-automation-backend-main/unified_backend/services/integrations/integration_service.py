"""
Database operations for Integration management.
"""
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import sys
import os

# Add lib to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
from lib.db import query_one, query_many, insert_and_return, execute_sql

from models.integration import IntegrationResponse, IntegrationWithSecrets, IntegrationType
from services.core.encryption import encrypt_integration_secrets, decrypt_integration_secrets

logger = logging.getLogger(__name__)


class IntegrationService:
    """Service for managing integrations in the database"""
    
    async def create_integration(
        self,
        company_id: int,
        integration_type: IntegrationType,
        integration_name: str,
        config_json: Optional[Dict[str, Any]] = None,
        secrets_json: Optional[Dict[str, str]] = None,
        created_by: Optional[int] = None
    ) -> IntegrationResponse:
        """Create a new integration"""
        
        # Encrypt secrets if provided
        encrypted_secrets = None
        if secrets_json:
            encrypted_secrets = encrypt_integration_secrets(secrets_json)
        
        # Convert config to JSON string
        config_string = json.dumps(config_json) if config_json else None
        
        query = """
            INSERT INTO Integration (
                CompanyID, IntegrationType, IntegrationName, 
                ConfigJson, SecretsJson, CreatedBy, CreatedAt
            )
            OUTPUT INSERTED.IntegrationID, INSERTED.CreatedAt
            VALUES ({CompanyID}, {IntegrationType}, {IntegrationName}, 
                    {ConfigJson}, {SecretsJson}, {CreatedBy}, SYSUTCDATETIME())
        """
        
        result = await insert_and_return(query, {
            "CompanyID": company_id,
            "IntegrationType": integration_type.value,
            "IntegrationName": integration_name,
            "ConfigJson": config_string,
            "SecretsJson": encrypted_secrets,
            "CreatedBy": created_by
        })
        
        logger.info(f"Database result: {result}")
        
        if not result:
            raise Exception(f"Failed to create integration - database returned: {result}")
        
        integration_id = result['IntegrationID']
        created_at = result['CreatedAt']
        
        logger.info(f"✅ Created integration {integration_id} for company {company_id}")
        
        return IntegrationResponse(
            integration_id=integration_id,
            company_id=company_id,
            integration_type=integration_type,
            integration_name=integration_name,
            config_json=config_json,
            created_by=created_by,
            is_active=True,
            created_at=created_at,
            updated_at=None
        )
    
    async def get_company_integrations(
        self, 
        company_id: int, 
        integration_type: Optional[IntegrationType] = None,
        include_secrets: bool = False
    ) -> List[IntegrationResponse]:
        """Get all integrations for a company"""
        
        base_query = """
            SELECT 
                IntegrationID, CompanyID, IntegrationType, IntegrationName,
                ConfigJson, SecretsJson, CreatedBy, IsActive, CreatedAt, UpdatedAt
            FROM Integration 
            WHERE CompanyID = {CompanyID} AND IsActive = 1
        """
        
        params = {"CompanyID": company_id}
        
        if integration_type:
            base_query += " AND IntegrationType = {IntegrationType}"
            params["IntegrationType"] = integration_type.value
        
        base_query += " ORDER BY CreatedAt DESC"
        
        results = await query_many(base_query, params)
        
        if not results:
            return []
        
        integrations = []
        for row in results:
            # Parse config JSON
            config_json = None
            if row['ConfigJson']:
                try:
                    config_json = json.loads(row['ConfigJson'])
                except json.JSONDecodeError:
                    logger.warning(f"Invalid config JSON for integration {row['IntegrationID']}")
            
            # Decrypt secrets if requested
            secrets_json = None
            if include_secrets and row['SecretsJson']:
                secrets_json = decrypt_integration_secrets(row['SecretsJson'])
            
            # Create appropriate response model
            if include_secrets:
                integration = IntegrationWithSecrets(
                    integration_id=row['IntegrationID'],
                    company_id=row['CompanyID'],
                    integration_type=IntegrationType(row['IntegrationType']),
                    integration_name=row['IntegrationName'],
                    config_json=config_json,
                    secrets_json=secrets_json,
                    created_by=row['CreatedBy'],
                    is_active=bool(row['IsActive']),
                    created_at=row['CreatedAt'],
                    updated_at=row['UpdatedAt']
                )
            else:
                integration = IntegrationResponse(
                    integration_id=row['IntegrationID'],
                    company_id=row['CompanyID'],
                    integration_type=IntegrationType(row['IntegrationType']),
                    integration_name=row['IntegrationName'],
                    config_json=config_json,
                    created_by=row['CreatedBy'],
                    is_active=bool(row['IsActive']),
                    created_at=row['CreatedAt'],
                    updated_at=row['UpdatedAt']
                )
            
            integrations.append(integration)
        
        return integrations
    
    async def get_integration_by_id(
        self, 
        integration_id: int, 
        company_id: int, 
        include_secrets: bool = False
    ) -> Optional[IntegrationResponse]:
        """Get a specific integration by ID"""
        
        query = """
            SELECT 
                IntegrationID, CompanyID, IntegrationType, IntegrationName,
                ConfigJson, SecretsJson, CreatedBy, IsActive, CreatedAt, UpdatedAt
            FROM Integration 
            WHERE IntegrationID = {IntegrationID} AND CompanyID = {CompanyID} AND IsActive = 1
        """
        
        result = await query_one(query, {
            "IntegrationID": integration_id,
            "CompanyID": company_id
        })
        
        if not result:
            return None
        
        row = result
        
        # Parse config JSON
        config_json = None
        if row['ConfigJson']:
            try:
                config_json = json.loads(row['ConfigJson'])
            except json.JSONDecodeError:
                logger.warning(f"Invalid config JSON for integration {integration_id}")
        
        # Decrypt secrets if requested
        secrets_json = None
        if include_secrets and row['SecretsJson']:
            secrets_json = decrypt_integration_secrets(row['SecretsJson'])
        
        # Create appropriate response model
        if include_secrets:
            return IntegrationWithSecrets(
                integration_id=row['IntegrationID'],
                company_id=row['CompanyID'],
                integration_type=IntegrationType(row['IntegrationType']),
                integration_name=row['IntegrationName'],
                config_json=config_json,
                secrets_json=secrets_json,
                created_by=row['CreatedBy'],
                is_active=bool(row['IsActive']),
                created_at=row['CreatedAt'],
                updated_at=row['UpdatedAt']
            )
        else:
            return IntegrationResponse(
                integration_id=row['IntegrationID'],
                company_id=row['CompanyID'],
                integration_type=IntegrationType(row['IntegrationType']),
                integration_name=row['IntegrationName'],
                config_json=config_json,
                created_by=row['CreatedBy'],
                is_active=bool(row['IsActive']),
                created_at=row['CreatedAt'],
                updated_at=row['UpdatedAt']
            )
    
    async def update_integration(
        self,
        integration_id: int,
        company_id: int,
        integration_name: Optional[str] = None,
        config_json: Optional[Dict[str, Any]] = None,
        secrets_json: Optional[Dict[str, str]] = None,
        is_active: Optional[bool] = None
    ) -> Optional[IntegrationResponse]:
        """Update an existing integration"""
        
        # Build update query dynamically
        updates = []
        params = []
        
        if integration_name is not None:
            updates.append("IntegrationName = ?")
            params.append(integration_name)
        
        if config_json is not None:
            updates.append("ConfigJson = ?")
            params.append(json.dumps(config_json) if config_json else None)
        
        if secrets_json is not None:
            updates.append("SecretsJson = ?")
            encrypted_secrets = encrypt_integration_secrets(secrets_json) if secrets_json else None
            params.append(encrypted_secrets)
        
        if is_active is not None:
            updates.append("IsActive = ?")
            params.append(is_active)
        
        if not updates:
            # No updates to make
            return await self.get_integration_by_id(integration_id, company_id)
        
        # Build parameterized query
        param_dict = {
            "IntegrationID": integration_id,
            "CompanyID": company_id
        }
        
        update_clauses = []
        param_index = 0
        
        if integration_name is not None:
            update_clauses.append("IntegrationName = {IntegrationName}")
            param_dict["IntegrationName"] = integration_name
        
        if config_json is not None:
            update_clauses.append("ConfigJson = {ConfigJson}")
            param_dict["ConfigJson"] = json.dumps(config_json) if config_json else None
        
        if secrets_json is not None:
            update_clauses.append("SecretsJson = {SecretsJson}")
            encrypted_secrets = encrypt_integration_secrets(secrets_json) if secrets_json else None
            param_dict["SecretsJson"] = encrypted_secrets
        
        if is_active is not None:
            update_clauses.append("IsActive = {IsActive}")
            param_dict["IsActive"] = is_active
        
        update_clauses.append("UpdatedAt = SYSUTCDATETIME()")
        
        query = f"""
            UPDATE Integration 
            SET {', '.join(update_clauses)}
            WHERE IntegrationID = {{IntegrationID}} AND CompanyID = {{CompanyID}}
        """
        
        await execute_sql(query, param_dict)
        
        logger.info(f"✅ Updated integration {integration_id} for company {company_id}")
        
        return await self.get_integration_by_id(integration_id, company_id)
    
    async def delete_integration(self, integration_id: int, company_id: int) -> bool:
        """Soft delete an integration (set IsActive = 0)"""
        
        query = """
            UPDATE Integration 
            SET IsActive = 0, UpdatedAt = SYSUTCDATETIME()
            WHERE IntegrationID = {IntegrationID} AND CompanyID = {CompanyID}
        """
        
        try:
            await execute_sql(query, {
                "IntegrationID": integration_id,
                "CompanyID": company_id
            })
            logger.info(f"✅ Deleted integration {integration_id} for company {company_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to delete integration {integration_id}: {e}")
            return False