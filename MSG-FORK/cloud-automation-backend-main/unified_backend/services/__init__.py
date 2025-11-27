"""
Services Package

Organized service modules for cloud automation platform:

📁 cloud/           - Cloud provider services (AWS, Azure, GCP)
📁 integrations/    - Third-party integrations (GitHub, Jira)
📁 ai/              - AI and ML services (OpenAI, Transformation Analysis)
📁 automation/      - Automated processes and workflows
📁 core/            - Core utilities and shared components
"""

# Cloud Services
from .cloud import *

# Integration Services  
from .integrations import *

# AI Services
from .ai import *

# Automation Services
from .automation import *

# Core Services
from .core import *

__all__ = [
    # Cloud Services
    'AWSService',
    'AzureService', 
    'UnifiedAzureBlobStorage',
    'GCPService',
    
    # Integration Services
    'GitHubService',
    'OptimizedGitHubService',
    'JiraService', 
    'IntegrationService',
    
    # AI Services
    'AzureOpenAIService',
    'azure_openai_service',
    'TransformationAIService',
    'transformation_ai_service',
    
    # Automation Services
    'AutomatedBaselineService',
    'baseline_service',
    'DataIngestionService',
    
    # Core Services
    'EncryptionService',
    'encrypt_integration_secrets',
    'decrypt_integration_secrets'
]