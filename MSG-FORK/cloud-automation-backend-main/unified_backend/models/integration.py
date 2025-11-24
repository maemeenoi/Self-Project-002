"""
Integration models for managing company integrations with encrypted credentials.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class IntegrationType(str, Enum):
    """Supported integration types"""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    GITHUB = "github"
    JIRA = "jira"


class IntegrationBase(BaseModel):
    """Base integration model"""
    integration_type: IntegrationType = Field(..., description="Type of integration")
    integration_name: str = Field(..., min_length=1, max_length=200, description="Friendly name for the integration")
    config_json: Optional[Dict[str, Any]] = Field(None, description="Non-secret configuration")
    is_active: bool = Field(True, description="Whether the integration is active")


class IntegrationCreate(IntegrationBase):
    """Model for creating a new integration"""
    secrets_json: Optional[Dict[str, str]] = Field(None, description="Secret credentials (will be encrypted)")


class IntegrationUpdate(BaseModel):
    """Model for updating an integration"""
    integration_name: Optional[str] = Field(None, min_length=1, max_length=200)
    config_json: Optional[Dict[str, Any]] = None
    secrets_json: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None


class IntegrationResponse(IntegrationBase):
    """Response model for integration (without secrets)"""
    integration_id: int
    company_id: int
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class IntegrationWithSecrets(IntegrationResponse):
    """Response model including decrypted secrets (for authorized access only)"""
    secrets_json: Optional[Dict[str, str]] = None


# Common integration configurations
class AWSConfig(BaseModel):
    """AWS integration configuration"""
    region: str = Field(..., description="AWS region")
    account_id: Optional[str] = Field(None, description="AWS account ID")


class AWSSecrets(BaseModel):
    """AWS integration secrets"""
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_session_token: Optional[str] = None


class AzureConfig(BaseModel):
    """Azure integration configuration"""
    subscription_id: str = Field(..., description="Azure subscription ID")
    resource_group: Optional[str] = Field(None, description="Resource group name")
    storage_account: Optional[str] = Field(None, description="Storage account name")


class AzureSecrets(BaseModel):
    """Azure integration secrets"""
    client_id: str
    client_secret: str
    tenant_id: str


class GitHubConfig(BaseModel):
    """GitHub integration configuration"""
    owner: str = Field(..., description="GitHub owner/organization")
    repo: Optional[str] = Field(None, description="Specific repository (leave empty for all)")


class GitHubSecrets(BaseModel):
    """GitHub integration secrets"""
    github_token: str = Field(..., description="GitHub personal access token")


class JiraConfig(BaseModel):
    """Jira integration configuration"""
    base_url: str = Field(..., description="Jira base URL")
    project_keys: Optional[str] = Field(None, description="Comma-separated project keys")


class JiraSecrets(BaseModel):
    """Jira integration secrets"""
    email: str = Field(..., description="Jira user email")
    api_token: str = Field(..., description="Jira API token")


class GCPConfig(BaseModel):
    """GCP integration configuration"""
    project_id: str = Field(..., description="GCP project ID")


class GCPSecrets(BaseModel):
    """GCP integration secrets"""
    private_key_id: str = Field(..., description="GCP private key ID")
    private_key: str = Field(..., description="GCP private key")
    client_email: str = Field(..., description="GCP client email")
    client_id: str = Field(..., description="GCP client ID")
    client_x509_cert_url: str = Field(..., description="GCP client x509 cert URL")