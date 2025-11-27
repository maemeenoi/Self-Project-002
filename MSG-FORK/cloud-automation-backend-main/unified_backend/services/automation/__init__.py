"""
Automation Services Package

This package contains services for automated processes and workflows:
- Automated baseline metrics generation
- Data ingestion and processing pipelines
- Background task automation
"""

from .automated_baseline_service import *
from .data_ingestion_service import *

__all__ = [
    # Baseline Automation
    'AutomatedBaselineService',
    'automated_baseline_service',
    
    # Data Processing
    'DataIngestionService'
]