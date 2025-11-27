"""
Integrations Services Package

This package contains services for integrating with third-party tools and platforms:
- GitHub (Source Code Management)
- Jira (Project Management)
- General Integration Framework
"""

from .github_service import *
from .github_service_optimized import *
from .jira_service import *
from .integration_service import *

__all__ = [
    # GitHub Services
    'GitHubService',
    'OptimizedGitHubService',
    
    # Project Management
    'JiraService',
    
    # Integration Framework
    'IntegrationService'
]