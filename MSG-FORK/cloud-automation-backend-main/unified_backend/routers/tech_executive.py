"""
Technology Executive Dashboard Router
Implements technology-focused widgets for CTO, CIO, CISO, and Delivery Executive roles
Based on the DRS specification for technology metrics from FinancialFact and WorkflowFact
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta
from decimal import Decimal

from lib.db import query_many, query_one
from routers.auth import get_current_user, UserLogin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tech-executive", tags=["Technology Executive Dashboard"])

# ==========================================
# CTO DASHBOARD WIDGETS
# ==========================================

@router.get("/cloud-native-score")
async def get_cloud_native_score(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CTO Widget: Cloud-Native Score
    Analyzes service mix (IaaS vs PaaS/SaaS/serverless) from FinancialFact
    """
    try:
        # Get service spending breakdown
        service_mix_query = """
            SELECT 
                ServiceName,
                PricingCategory,
                SUM(EffectiveCost) AS TotalSpend,
                COUNT(DISTINCT ResourceLocation) AS RegionCount
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= DATEADD(month, -3, GETDATE())
            GROUP BY ServiceName, PricingCategory
            ORDER BY TotalSpend DESC
        """
        
        service_data = await query_many(service_mix_query, {"company_id": company_id})
        
        # Define cloud-native service categories
        serverless_services = ['Lambda', 'Azure Functions', 'Cloud Functions', 'App Engine']
        paas_services = ['App Service', 'Elastic Beanstalk', 'Cloud Run', 'Container Apps']
        managed_services = ['RDS', 'Azure SQL', 'Cloud SQL', 'DynamoDB', 'Cosmos DB']
        
        total_spend = sum(item['TotalSpend'] for item in service_data)
        
        # Calculate cloud-native percentages
        serverless_spend = sum(item['TotalSpend'] for item in service_data 
                              if any(service in item['ServiceName'] for service in serverless_services))
        paas_spend = sum(item['TotalSpend'] for item in service_data 
                        if any(service in item['ServiceName'] for service in paas_services))
        managed_spend = sum(item['TotalSpend'] for item in service_data 
                           if any(service in item['ServiceName'] for service in managed_services))
        
        cloud_native_spend = serverless_spend + paas_spend + managed_spend
        cloud_native_percentage = (cloud_native_spend / total_spend * 100) if total_spend > 0 else 0
        
        # Calculate score (0-10)
        score = min(10, cloud_native_percentage / 10)  # 100% cloud-native = 10/10
        
        return {
            "success": True,
            "data": {
                "cloud_native_score": round(score, 1),
                "cloud_native_percentage": round(cloud_native_percentage, 1),
                "breakdown": {
                    "serverless_spend": float(serverless_spend),
                    "paas_spend": float(paas_spend), 
                    "managed_services_spend": float(managed_spend),
                    "total_cloud_native_spend": float(cloud_native_spend),
                    "total_spend": float(total_spend)
                },
                "service_mix": [
                    {
                        "service_name": item['ServiceName'],
                        "pricing_category": item['PricingCategory'],
                        "spend": float(item['TotalSpend']),
                        "regions": item['RegionCount']
                    }
                    for item in service_data[:10]  # Top 10 services
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-native-score: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "cloud_native_score": 0,
                "cloud_native_percentage": 0,
                "breakdown": {},
                "service_mix": []
            }
        }

@router.get("/multi-cloud-reliability")
async def get_multi_cloud_reliability(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CTO Widget: Multi-Cloud Reliability
    Analyzes distribution of workloads across regions/providers from FinancialFact
    """
    try:
        # Get provider and region distribution
        distribution_query = """
            SELECT 
                Provider,
                Region,
                SUM(EffectiveCost) AS TotalSpend,
                COUNT(DISTINCT ServiceName) AS ServiceCount
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= DATEADD(month, -3, GETDATE())
            GROUP BY Provider, Region
            ORDER BY TotalSpend DESC
        """
        
        distribution_data = await query_many(distribution_query, {"company_id": company_id})
        
        # Calculate multi-cloud metrics
        providers = set(item['Provider'] for item in distribution_data)
        regions = set(item['Region'] for item in distribution_data)
        
        total_spend = sum(item['TotalSpend'] for item in distribution_data)
        
        # Provider distribution
        provider_breakdown = {}
        for provider in providers:
            provider_spend = sum(item['TotalSpend'] for item in distribution_data 
                               if item['Provider'] == provider)
            provider_breakdown[provider.upper()] = {
                "spend": float(provider_spend),
                "percentage": round((provider_spend / total_spend * 100) if total_spend > 0 else 0, 1)
            }
        
        # Reliability score calculation
        provider_count = len(providers)
        region_count = len(regions)
        
        # Score based on distribution (higher is better)
        reliability_score = min(10, (provider_count * 2) + (region_count * 0.5))
        
        return {
            "success": True,
            "data": {
                "reliability_score": round(reliability_score, 1),
                "provider_count": provider_count,
                "region_count": region_count,
                "provider_breakdown": provider_breakdown,
                "geographic_distribution": [
                    {
                        "provider": item['Provider'].upper(),
                        "region": item['Region'],
                        "spend": float(item['TotalSpend']),
                        "services": item['ServiceCount']
                    }
                    for item in distribution_data
                ],
                "total_spend": float(total_spend)
            }
        }
        
    except Exception as e:
        logger.error(f"Error in multi-cloud-reliability: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "reliability_score": 0,
                "provider_count": 0,
                "region_count": 0,
                "provider_breakdown": {},
                "geographic_distribution": []
            }
        }

@router.get("/cloud-technical-debt")
async def get_cloud_technical_debt(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CTO Widget: Cloud Technical Debt
    Tech-debt backlog from WorkflowFact (issues with tech-debt, refactor, bug labels)
    """
    try:
        # Get technical debt items
        tech_debt_query = """
            SELECT 
                ItemType,
                Status,
                StoryPoints,
                Labels,
                LeadTimeHours,
                CreatedAt,
                ClosedAt,
                ProjectOrRepo
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND (
                Labels LIKE '%tech-debt%' OR 
                Labels LIKE '%refactor%' OR 
                ItemType = 'bug'
              )
              AND CreatedAt >= DATEADD(month, -6, GETDATE())
        """
        
        debt_items = await query_many(tech_debt_query, {"company_id": company_id})
        
        # Calculate metrics
        total_debt_items = len(debt_items)
        open_debt_items = len([item for item in debt_items if item['Status'] not in ['Done', 'Closed', 'Resolved']])
        
        total_story_points = sum(item['StoryPoints'] or 0 for item in debt_items)
        open_story_points = sum(item['StoryPoints'] or 0 for item in debt_items 
                               if item['Status'] not in ['Done', 'Closed', 'Resolved'])
        
        # Average lead time for resolved debt
        resolved_debt = [item for item in debt_items 
                        if item['Status'] in ['Done', 'Closed', 'Resolved'] and item['LeadTimeHours']]
        avg_resolution_hours = (sum(item['LeadTimeHours'] for item in resolved_debt) / len(resolved_debt)) if resolved_debt else 0
        
        # Categorize by type
        debt_by_type = {
            'bugs': len([item for item in debt_items if item['ItemType'] == 'bug']),
            'refactoring': len([item for item in debt_items if 'refactor' in item['Labels']]),
            'technical_debt': len([item for item in debt_items if 'tech-debt' in item['Labels']])
        }
        
        # Projects with highest debt
        project_debt = {}
        for item in debt_items:
            project = item['ProjectOrRepo']
            if project not in project_debt:
                project_debt[project] = {'count': 0, 'story_points': 0}
            project_debt[project]['count'] += 1
            project_debt[project]['story_points'] += item['StoryPoints'] or 0
        
        top_debt_projects = sorted(project_debt.items(), 
                                  key=lambda x: x[1]['story_points'], 
                                  reverse=True)[:5]
        
        return {
            "success": True,
            "data": {
                "total_debt_items": total_debt_items,
                "open_debt_items": open_debt_items,
                "total_story_points": total_story_points,
                "open_story_points": open_story_points,
                "avg_resolution_hours": round(avg_resolution_hours, 1),
                "avg_resolution_days": round(avg_resolution_hours / 24, 1) if avg_resolution_hours > 0 else 0,
                "debt_by_type": debt_by_type,
                "top_debt_projects": [
                    {
                        "project": project,
                        "debt_count": data['count'],
                        "story_points": data['story_points']
                    }
                    for project, data in top_debt_projects
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-technical-debt: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "total_debt_items": 0,
                "open_debt_items": 0,
                "total_story_points": 0,
                "open_story_points": 0,
                "avg_resolution_hours": 0,
                "debt_by_type": {},
                "top_debt_projects": []
            }
        }

@router.get("/cloud-engineering-velocity")
async def get_cloud_engineering_velocity(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CTO Widget: Cloud Engineering Velocity
    Throughput, flow metrics, and deployment frequency from WorkflowFact
    """
    try:
        # Get velocity metrics for last 6 months
        velocity_query = """
            SELECT 
                ItemType,
                Status,
                StoryPoints,
                LeadTimeHours,
                CycleTimeHours,
                CreatedAt,
                ClosedAt,
                DATEPART(YEAR, CreatedAt) AS Year,
                DATEPART(MONTH, CreatedAt) AS Month
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND CreatedAt >= DATEADD(month, -6, GETDATE())
              AND StoryPoints IS NOT NULL
            ORDER BY CreatedAt DESC
        """
        
        velocity_data = await query_many(velocity_query, {"company_id": company_id})
        
        # Calculate throughput by month
        monthly_throughput = {}
        for item in velocity_data:
            month_key = f"{item['Year']}-{item['Month']:02d}"
            if month_key not in monthly_throughput:
                monthly_throughput[month_key] = {'completed_points': 0, 'total_points': 0, 'items_completed': 0}
            
            monthly_throughput[month_key]['total_points'] += item['StoryPoints'] or 0
            
            if item['Status'] in ['Done', 'Closed', 'Resolved']:
                monthly_throughput[month_key]['completed_points'] += item['StoryPoints'] or 0
                monthly_throughput[month_key]['items_completed'] += 1
        
        # Calculate average metrics
        completed_items = [item for item in velocity_data if item['Status'] in ['Done', 'Closed', 'Resolved']]
        
        avg_lead_time = (sum(item['LeadTimeHours'] or 0 for item in completed_items) / len(completed_items)) if completed_items else 0
        avg_cycle_time = (sum(item['CycleTimeHours'] or 0 for item in completed_items) / len(completed_items)) if completed_items else 0
        
        # Deployment frequency (pull requests merged per week)
        pr_data = [item for item in velocity_data if item['ItemType'] == 'pull_request']
        merged_prs = [item for item in pr_data if item['Status'] == 'merged']
        
        # Last 4 weeks deployment frequency
        weekly_deployments = len([pr for pr in merged_prs 
                                 if pr['ClosedAt'] and 
                                 (datetime.now() - pr['ClosedAt']).days <= 28]) / 4
        
        return {
            "success": True,
            "data": {
                "monthly_throughput": [
                    {
                        "month": month,
                        "completed_story_points": data['completed_points'],
                        "total_story_points": data['total_points'],
                        "completion_rate": round((data['completed_points'] / data['total_points'] * 100) if data['total_points'] > 0 else 0, 1),
                        "items_completed": data['items_completed']
                    }
                    for month, data in sorted(monthly_throughput.items())
                ],
                "flow_metrics": {
                    "avg_lead_time_hours": round(avg_lead_time, 1),
                    "avg_lead_time_days": round(avg_lead_time / 24, 1) if avg_lead_time > 0 else 0,
                    "avg_cycle_time_hours": round(avg_cycle_time, 1),
                    "avg_cycle_time_days": round(avg_cycle_time / 24, 1) if avg_cycle_time > 0 else 0
                },
                "deployment_frequency": {
                    "deployments_per_week": round(weekly_deployments, 1),
                    "total_merged_prs": len(merged_prs),
                    "total_prs": len(pr_data)
                },
                "velocity_trend": "increasing" if len(list(monthly_throughput.values())[-2:]) >= 2 and 
                                list(monthly_throughput.values())[-1]['completed_points'] > 
                                list(monthly_throughput.values())[-2]['completed_points'] else "stable"
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-engineering-velocity: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "monthly_throughput": [],
                "flow_metrics": {},
                "deployment_frequency": {},
                "velocity_trend": "unknown"
            }
        }

# ==========================================
# CISO DASHBOARD WIDGETS  
# ==========================================

@router.get("/cloud-security-score")
async def get_cloud_security_score(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CISO Widget: Cloud Security Score
    Security services spend and security issue backlog analysis
    """
    try:
        # Get security services spending
        security_spend_query = """
            SELECT 
                ServiceName,
                SUM(EffectiveCost) AS SecuritySpend,
                COUNT(DISTINCT Region) AS RegionCount
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= DATEADD(month, -3, GETDATE())
              AND (
                ServiceName LIKE '%Security%' OR
                ServiceName LIKE '%Defender%' OR
                ServiceName LIKE '%GuardDuty%' OR
                ServiceName LIKE '%IAM%' OR
                ServiceName LIKE '%KeyVault%' OR
                ServiceName LIKE '%Firewall%'
              )
            GROUP BY ServiceName
            ORDER BY SecuritySpend DESC
        """
        
        security_spend_data = await query_many(security_spend_query, {"company_id": company_id})
        
        # Get security issues from WorkflowFact
        security_issues_query = """
            SELECT 
                Status,
                StoryPoints,
                LeadTimeHours,
                Labels,
                CreatedAt,
                ClosedAt
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND (
                Labels LIKE '%security%' OR
                Labels LIKE '%vulnerability%' OR
                Labels LIKE '%misconfig%'
              )
              AND CreatedAt >= DATEADD(month, -6, GETDATE())
        """
        
        security_issues = await query_many(security_issues_query, {"company_id": company_id})
        
        # Calculate metrics
        total_security_spend = sum(item['SecuritySpend'] for item in security_spend_data)
        
        total_security_issues = len(security_issues)
        open_security_issues = len([issue for issue in security_issues 
                                   if issue['Status'] not in ['Done', 'Closed', 'Resolved']])
        
        resolved_issues = [issue for issue in security_issues 
                          if issue['Status'] in ['Done', 'Closed', 'Resolved'] and issue['LeadTimeHours']]
        avg_resolution_time = (sum(issue['LeadTimeHours'] for issue in resolved_issues) / len(resolved_issues)) if resolved_issues else 0
        
        # Security score calculation (0-10)
        # Based on: spend investment, issue resolution rate, average response time
        resolution_rate = ((total_security_issues - open_security_issues) / total_security_issues * 100) if total_security_issues > 0 else 100
        spend_score = min(5, total_security_spend / 10000)  # $10k spend = 5 points max
        resolution_score = resolution_rate / 20  # 100% resolution = 5 points max
        
        security_score = spend_score + resolution_score
        
        return {
            "success": True,
            "data": {
                "security_score": round(min(10, security_score), 1),
                "total_security_spend": float(total_security_spend),
                "security_services": [
                    {
                        "service_name": item['ServiceName'],
                        "spend": float(item['SecuritySpend']),
                        "regions": item['RegionCount']
                    }
                    for item in security_spend_data
                ],
                "security_issues": {
                    "total_issues": total_security_issues,
                    "open_issues": open_security_issues,
                    "resolution_rate": round(resolution_rate, 1),
                    "avg_resolution_hours": round(avg_resolution_time, 1),
                    "avg_resolution_days": round(avg_resolution_time / 24, 1) if avg_resolution_time > 0 else 0
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-security-score: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "security_score": 0,
                "total_security_spend": 0,
                "security_services": [],
                "security_issues": {}
            }
        }

@router.get("/cloud-compliance")
async def get_cloud_compliance(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CISO Widget: Cloud Compliance
    Region-based compliance and remediation tasks analysis
    """
    try:
        # Get regional distribution for compliance
        regional_query = """
            SELECT 
                Region,
                Provider,
                SUM(EffectiveCost) AS RegionSpend,
                COUNT(DISTINCT ServiceName) AS ServiceCount
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= DATEADD(month, -3, GETDATE())
            GROUP BY Region, Provider
            ORDER BY RegionSpend DESC
        """
        
        regional_data = await query_many(regional_query, {"company_id": company_id})
        
        # Get compliance remediation tasks
        compliance_tasks_query = """
            SELECT 
                Status,
                Labels,
                StoryPoints,
                LeadTimeHours,
                CreatedAt,
                ClosedAt
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND (
                Labels LIKE '%compliance%' OR
                Labels LIKE '%SOX%' OR
                Labels LIKE '%PCI%' OR
                Labels LIKE '%GDPR%' OR
                Labels LIKE '%HIPAA%'
              )
              AND CreatedAt >= DATEADD(month, -6, GETDATE())
        """
        
        compliance_tasks = await query_many(compliance_tasks_query, {"company_id": company_id})
        
        # Define compliant regions (example - customize based on requirements)
        compliant_regions = {
            'us-east-1': ['SOX', 'PCI'],
            'eu-west-1': ['GDPR', 'PCI'],
            'ap-southeast-2': ['PCI']
        }
        
        # Calculate compliance metrics
        total_regional_spend = sum(item['RegionSpend'] for item in regional_data)
        
        compliant_spend = 0
        compliance_status = []
        
        for region_data in regional_data:
            region = region_data['Region']
            spend = region_data['RegionSpend']
            
            is_compliant = region in compliant_regions
            if is_compliant:
                compliant_spend += spend
                
            compliance_status.append({
                "region": region,
                "provider": region_data['Provider'],
                "spend": float(spend),
                "services": region_data['ServiceCount'],
                "compliant": is_compliant,
                "standards": compliant_regions.get(region, [])
            })
        
        compliance_percentage = (compliant_spend / total_regional_spend * 100) if total_regional_spend > 0 else 0
        
        # Compliance task metrics
        total_compliance_tasks = len(compliance_tasks)
        completed_compliance_tasks = len([task for task in compliance_tasks 
                                         if task['Status'] in ['Done', 'Closed', 'Resolved']])
        
        return {
            "success": True,
            "data": {
                "compliance_percentage": round(compliance_percentage, 1),
                "compliant_spend": float(compliant_spend),
                "total_regional_spend": float(total_regional_spend),
                "regional_compliance": compliance_status,
                "compliance_tasks": {
                    "total_tasks": total_compliance_tasks,
                    "completed_tasks": completed_compliance_tasks,
                    "completion_rate": round((completed_compliance_tasks / total_compliance_tasks * 100) if total_compliance_tasks > 0 else 0, 1),
                    "open_tasks": total_compliance_tasks - completed_compliance_tasks
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-compliance: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "compliance_percentage": 0,
                "compliant_spend": 0,
                "regional_compliance": [],
                "compliance_tasks": {}
            }
        }

# ==========================================
# DELIVERY EXECUTIVE DASHBOARD WIDGETS
# ==========================================

@router.get("/cloud-migration-delivery")
async def get_cloud_migration_delivery(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Delivery Executive Widget: Cloud Migration Delivery
    Migration task completion from WorkflowFact
    """
    try:
        # Get migration tasks
        migration_query = """
            SELECT 
                Status,
                StoryPoints,
                Labels,
                CreatedAt,
                ClosedAt,
                ProjectOrRepo
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND (
                Labels LIKE '%migration%' OR
                Labels LIKE '%app-migration%' OR
                Labels LIKE '%cloud-migration%'
              )
              AND CreatedAt >= DATEADD(month, -12, GETDATE())
        """
        
        migration_tasks = await query_many(migration_query, {"company_id": company_id})
        
        # Calculate migration metrics
        total_migration_tasks = len(migration_tasks)
        completed_tasks = len([task for task in migration_tasks 
                              if task['Status'] in ['Done', 'Closed', 'Resolved']])
        in_progress_tasks = len([task for task in migration_tasks 
                                if task['Status'] in ['In Progress', 'In Review', 'Testing']])
        
        total_story_points = sum(task['StoryPoints'] or 0 for task in migration_tasks)
        completed_story_points = sum(task['StoryPoints'] or 0 for task in migration_tasks 
                                    if task['Status'] in ['Done', 'Closed', 'Resolved'])
        
        completion_percentage = (completed_story_points / total_story_points * 100) if total_story_points > 0 else 0
        
        # Migration by project
        project_migration = {}
        for task in migration_tasks:
            project = task['ProjectOrRepo']
            if project not in project_migration:
                project_migration[project] = {
                    'total_tasks': 0,
                    'completed_tasks': 0,
                    'total_points': 0,
                    'completed_points': 0
                }
            
            project_migration[project]['total_tasks'] += 1
            project_migration[project]['total_points'] += task['StoryPoints'] or 0
            
            if task['Status'] in ['Done', 'Closed', 'Resolved']:
                project_migration[project]['completed_tasks'] += 1
                project_migration[project]['completed_points'] += task['StoryPoints'] or 0
        
        # Top migration projects
        top_projects = []
        for project, data in project_migration.items():
            completion_rate = (data['completed_points'] / data['total_points'] * 100) if data['total_points'] > 0 else 0
            top_projects.append({
                "project": project,
                "total_tasks": data['total_tasks'],
                "completed_tasks": data['completed_tasks'],
                "completion_rate": round(completion_rate, 1),
                "story_points": data['total_points']
            })
        
        top_projects = sorted(top_projects, key=lambda x: x['story_points'], reverse=True)[:5]
        
        return {
            "success": True,
            "data": {
                "migration_progress": {
                    "total_tasks": total_migration_tasks,
                    "completed_tasks": completed_tasks,
                    "in_progress_tasks": in_progress_tasks,
                    "completion_percentage": round(completion_percentage, 1),
                    "total_story_points": total_story_points,
                    "completed_story_points": completed_story_points
                },
                "top_migration_projects": top_projects
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-migration-delivery: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "migration_progress": {},
                "top_migration_projects": []
            }
        }

@router.get("/cloud-service-quality")
async def get_cloud_service_quality(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Delivery Executive Widget: Cloud Service Quality
    Defects, incidents, and MTTR from WorkflowFact
    """
    try:
        # Get defects and incidents
        quality_query = """
            SELECT 
                ItemType,
                Status,
                Labels,
                CreatedAt,
                ClosedAt,
                LeadTimeHours,
                ProjectOrRepo
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND (
                ItemType = 'bug' OR
                Labels LIKE '%incident%' OR
                Labels LIKE '%defect%'
              )
              AND CreatedAt >= DATEADD(month, -6, GETDATE())
        """
        
        quality_issues = await query_many(quality_query, {"company_id": company_id})
        
        # Calculate MTTR (Mean Time To Recovery)
        resolved_incidents = [issue for issue in quality_issues 
                             if issue['Status'] in ['Done', 'Closed', 'Resolved'] and 
                             'incident' in issue['Labels'] and 
                             issue['LeadTimeHours']]
        
        mttr_hours = (sum(incident['LeadTimeHours'] for incident in resolved_incidents) / len(resolved_incidents)) if resolved_incidents else 0
        
        # Quality metrics
        total_defects = len([issue for issue in quality_issues if issue['ItemType'] == 'bug'])
        open_defects = len([issue for issue in quality_issues 
                           if issue['ItemType'] == 'bug' and 
                           issue['Status'] not in ['Done', 'Closed', 'Resolved']])
        
        total_incidents = len([issue for issue in quality_issues if 'incident' in issue['Labels']])
        open_incidents = len([issue for issue in quality_issues 
                             if 'incident' in issue['Labels'] and 
                             issue['Status'] not in ['Done', 'Closed', 'Resolved']])
        
        # Quality by project
        project_quality = {}
        for issue in quality_issues:
            project = issue['ProjectOrRepo']
            if project not in project_quality:
                project_quality[project] = {'defects': 0, 'incidents': 0}
            
            if issue['ItemType'] == 'bug':
                project_quality[project]['defects'] += 1
            if 'incident' in issue['Labels']:
                project_quality[project]['incidents'] += 1
        
        # Calculate quality score (0-10, higher is better)
        total_issues = len(quality_issues)
        open_issues = open_defects + open_incidents
        resolution_rate = ((total_issues - open_issues) / total_issues * 100) if total_issues > 0 else 100
        
        # Quality score: higher resolution rate and lower MTTR = higher score
        quality_score = min(10, (resolution_rate / 10) + (max(0, 10 - (mttr_hours / 24))))
        
        return {
            "success": True,
            "data": {
                "quality_score": round(quality_score, 1),
                "defect_metrics": {
                    "total_defects": total_defects,
                    "open_defects": open_defects,
                    "defect_resolution_rate": round(((total_defects - open_defects) / total_defects * 100) if total_defects > 0 else 100, 1)
                },
                "incident_metrics": {
                    "total_incidents": total_incidents,
                    "open_incidents": open_incidents,
                    "mttr_hours": round(mttr_hours, 1),
                    "mttr_days": round(mttr_hours / 24, 1) if mttr_hours > 0 else 0
                },
                "project_quality": [
                    {
                        "project": project,
                        "defects": data['defects'],
                        "incidents": data['incidents'],
                        "total_issues": data['defects'] + data['incidents']
                    }
                    for project, data in sorted(project_quality.items(), 
                                               key=lambda x: x[1]['defects'] + x[1]['incidents'], 
                                               reverse=True)[:5]
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-service-quality: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "quality_score": 0,
                "defect_metrics": {},
                "incident_metrics": {},
                "project_quality": []
            }
        }

# ==========================================
# SHARED WIDGETS (CIO/GENERAL)
# ==========================================

@router.get("/cloud-governance-score")
async def get_cloud_governance_score(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    CIO/General Widget: Cloud Governance Score
    Tag/policy coverage analysis from FinancialFact
    """
    try:
        # Note: This is a simplified version assuming basic governance metrics
        # In a real implementation, you'd need tag columns in FinancialFact
        
        governance_query = """
            SELECT 
                ServiceName,
                Provider,
                Region,
                SUM(EffectiveCost) AS TotalSpend
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= DATEADD(month, -3, GETDATE())
            GROUP BY ServiceName, Provider, Region
        """
        
        governance_data = await query_many(governance_query, {"company_id": company_id})
        
        total_spend = sum(item['TotalSpend'] for item in governance_data)
        
        # Simple governance score based on resource distribution and naming
        governed_spend = sum(item['TotalSpend'] for item in governance_data 
                           if 'prod' in item['ServiceName'].lower() or 
                           'dev' in item['ServiceName'].lower() or 
                           'test' in item['ServiceName'].lower())
        
        governance_percentage = (governed_spend / total_spend * 100) if total_spend > 0 else 0
        governance_score = min(10, governance_percentage / 10)
        
        return {
            "success": True,
            "data": {
                "governance_score": round(governance_score, 1),
                "governance_percentage": round(governance_percentage, 1),
                "total_spend": float(total_spend),
                "governed_spend": float(governed_spend),
                "resource_distribution": [
                    {
                        "service": item['ServiceName'],
                        "provider": item['Provider'],
                        "region": item['Region'],
                        "spend": float(item['TotalSpend'])
                    }
                    for item in governance_data[:10]
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error in cloud-governance-score: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "governance_score": 0,
                "governance_percentage": 0,
                "total_spend": 0,
                "resource_distribution": []
            }
        }

# ==========================================
# SUMMARY ENDPOINT
# ==========================================

@router.get("/tech-executive-summary")
async def get_tech_executive_summary(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Technology Executive Summary
    Aggregated metrics for technology leadership dashboard
    """
    try:
        # Get key metrics from each widget
        cloud_native = await get_cloud_native_score(company_id, current_user)
        reliability = await get_multi_cloud_reliability(company_id, current_user)
        security = await get_cloud_security_score(company_id, current_user)
        governance = await get_cloud_governance_score(company_id, current_user)
        
        # Calculate overall technology health score
        scores = [
            cloud_native['data'].get('cloud_native_score', 0),
            reliability['data'].get('reliability_score', 0),
            security['data'].get('security_score', 0),
            governance['data'].get('governance_score', 0)
        ]
        
        overall_tech_score = sum(scores) / len(scores) if scores else 0
        
        return {
            "success": True,
            "data": {
                "overall_technology_score": round(overall_tech_score, 1),
                "cloud_native_score": cloud_native['data'].get('cloud_native_score', 0),
                "reliability_score": reliability['data'].get('reliability_score', 0),
                "security_score": security['data'].get('security_score', 0),
                "governance_score": governance['data'].get('governance_score', 0),
                "provider_count": reliability['data'].get('provider_count', 0),
                "region_count": reliability['data'].get('region_count', 0),
                "total_security_spend": security['data'].get('total_security_spend', 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Error in tech-executive-summary: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "overall_technology_score": 0,
                "cloud_native_score": 0,
                "reliability_score": 0,
                "security_score": 0,
                "governance_score": 0,
                "provider_count": 0,
                "region_count": 0,
                "total_security_spend": 0
            }
        }