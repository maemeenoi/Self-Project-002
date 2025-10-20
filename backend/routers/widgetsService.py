# widgetsService.py
# ---------------------------------------------------------
# FastAPI service routes for all 32 widgets
# Source: FinancialFact (FOCUS data) + WorkflowFact (Jira/GitHub)
# + Combined (Both) + Internal/System (Admin)
# ---------------------------------------------------------

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
import logging
from lib.db import query_all, query_one

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/widgets", tags=["Widgets"])


# =========================================================
# 🧾 FINANCIALFACT WIDGETS (9)
# =========================================================

@router.get("/financial/cost-breakdown")
async def get_cost_breakdown(company_id: int, group_by: str = Query("ServiceName")):
    """Total cost grouped by Service, Region, or Provider."""
    try:
        sql = f"""
            SELECT {group_by} AS category,
                   SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY {group_by}
            ORDER BY total_cost DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in cost-breakdown: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cost breakdown")


@router.get("/financial/cost-trend")
async def get_cost_trend(company_id: int):
    """Total cost trend by billing date."""
    try:
        sql = f"""
            SELECT FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd') AS period,
                   SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd')
            ORDER BY period;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in cost-trend: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cost trend")


@router.get("/financial/savings-summary")
async def get_savings_summary(company_id: int):
    """Compare ListCost vs EffectiveCost to calculate total savings."""
    try:
        sql = f"""
            SELECT 
                SUM(CAST(ListCost AS FLOAT)) AS total_list_cost,
                SUM(CAST(EffectiveCost AS FLOAT)) AS total_effective_cost,
                (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) AS total_savings,
                (1 - SUM(CAST(EffectiveCost AS FLOAT)) / NULLIF(SUM(CAST(ListCost AS FLOAT)),0)) * 100 AS savings_percent
            FROM FinancialFact
            WHERE CompanyID = {company_id};
        """
        return await query_one(sql)
    except Exception as e:
        logger.error(f"Error in savings-summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch savings summary")


@router.get("/financial/optimization-opportunities")
async def get_optimization_opportunities(company_id: int):
    """Find high ListCost vs EffectiveCost gaps."""
    try:
        sql = f"""
            SELECT 
                ServiceName,
                SUM(CAST(ListCost AS FLOAT)) AS total_list_cost,
                SUM(CAST(EffectiveCost AS FLOAT)) AS total_effective_cost,
                (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) AS potential_saving
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY ServiceName
            HAVING (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) > 0
            ORDER BY potential_saving DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in optimization-opportunities: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch optimization opportunities")


@router.get("/financial/cost-analytics")
async def get_cost_analytics(company_id: int):
    """Cost by Provider, Service, Region."""
    try:
        sql = f"""
            SELECT 
                Provider,
                ServiceName,
                Region,
                SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY Provider, ServiceName, Region
            ORDER BY total_cost DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in cost-analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cost analytics")


@router.get("/financial/vendor-costs")
async def get_vendor_costs(company_id: int):
    """Cost by Publisher/Vendor."""
    try:
        sql = f"""
            SELECT Publisher, SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY Publisher
            ORDER BY total_cost DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in vendor-costs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch vendor costs")


@router.get("/financial/resource-allocation")
async def get_resource_allocation(company_id: int):
    """Cost by Resource and Location."""
    try:
        sql = f"""
            SELECT ResourceLocation, ResourceId,
                   SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY ResourceLocation, ResourceId
            ORDER BY total_cost DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in resource-allocation: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch resource allocation")


@router.get("/financial/financial-alerts")
async def get_financial_alerts(company_id: int):
    """Detect cost spikes (>20% increase)."""
    try:
        sql = f"""
            WITH cost_trend AS (
                SELECT 
                    FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd') AS period,
                    SUM(CAST(BilledCost AS FLOAT)) AS total_cost
                FROM FinancialFact
                WHERE CompanyID = {company_id}
                GROUP BY FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd')
            )
            SELECT period, total_cost,
                   LAG(total_cost) OVER (ORDER BY period) AS prev_cost,
                   ((total_cost - LAG(total_cost) OVER (ORDER BY period)) / NULLIF(LAG(total_cost) OVER (ORDER BY period),0)) * 100 AS growth_percent
            FROM cost_trend
            WHERE ((total_cost - LAG(total_cost) OVER (ORDER BY period)) / NULLIF(LAG(total_cost) OVER (ORDER BY period),0)) * 100 > 20;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in financial-alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch financial alerts")


@router.get("/financial/resource-allocation-detail")
async def get_resource_allocation_detail(company_id: int):
    """Detailed cost allocation for drill-down view."""
    try:
        sql = f"""
            SELECT Region, ServiceName, ResourceLocation,
                   SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = {company_id}
            GROUP BY Region, ServiceName, ResourceLocation;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in resource-allocation-detail: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch resource allocation detail")


# =========================================================
# ⚙️ WORKFLOWFACT WIDGETS (12)
# =========================================================

@router.get("/workflow/jira")
async def get_jira_issues(company_id: int):
    """Jira: count by status."""
    try:
        sql = f"""
            SELECT Status, COUNT(*) AS issue_count
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND Provider = 'jira'
            GROUP BY Status;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in jira: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch Jira issues")


@router.get("/workflow/pull-requests")
async def get_pull_requests(company_id: int):
    """GitHub pull requests by status."""
    try:
        sql = f"""
            SELECT Status, COUNT(*) AS pr_count
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND Provider = 'github'
              AND ItemType = 'pull_request'
            GROUP BY Status;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in pull-requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pull requests")


@router.get("/workflow/build-status")
async def get_build_status(company_id: int):
    """Pipeline build results."""
    try:
        sql = f"""
            SELECT Status, COUNT(*) AS build_count
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND ItemType = 'build'
            GROUP BY Status;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in build-status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch build status")


@router.get("/workflow/deployment-metrics")
async def get_deployment_metrics(company_id: int):
    """Deployment frequency and success."""
    try:
        sql = f"""
            SELECT FORMAT(CAST(CreatedAt AS DATE), 'yyyy-MM-dd') AS date,
                   COUNT(*) AS deployments,
                   SUM(CASE WHEN Status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS success_rate
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND ItemType = 'deployment'
            GROUP BY FORMAT(CAST(CreatedAt AS DATE), 'yyyy-MM-dd')
            ORDER BY date;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in deployment-metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch deployment metrics")


@router.get("/workflow/release-pipeline")
async def get_release_pipeline(company_id: int):
    """Track release progress."""
    try:
        sql = f"""
            SELECT ProjectOrRepo, COUNT(*) AS total_releases
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND ItemType = 'release'
            GROUP BY ProjectOrRepo;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in release-pipeline: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch release pipeline")


@router.get("/workflow/active-projects")
async def get_active_projects(company_id: int):
    """List active repos/projects."""
    try:
        sql = f"""
            SELECT DISTINCT ProjectOrRepo
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND Status IN ('active','open','in_progress');
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in active-projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch active projects")


@router.get("/workflow/team-performance")
async def get_team_performance(company_id: int):
    """Average lead/cycle time per assignee."""
    try:
        sql = f"""
            SELECT Assignee,
                   COUNT(*) AS items_completed,
                   AVG(CAST(LeadTimeHours AS FLOAT)) AS avg_lead,
                   AVG(CAST(CycleTimeHours AS FLOAT)) AS avg_cycle
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
            GROUP BY Assignee;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in team-performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch team performance")


@router.get("/workflow/system-health")
async def get_system_health(company_id: int):
    """Error vs success counts."""
    try:
        sql = f"""
            SELECT ItemType,
                   SUM(CASE WHEN Status IN ('failed','error') THEN 1 ELSE 0 END) AS failed,
                   SUM(CASE WHEN Status IN ('success','done','closed') THEN 1 ELSE 0 END) AS successful
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
            GROUP BY ItemType;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in system-health: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch system health")


@router.get("/workflow/team-capacity")
async def get_team_capacity(company_id: int):
    """Tasks per team member."""
    try:
        sql = f"""
            SELECT Assignee, COUNT(*) AS active_items
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND Status IN ('open','in_progress')
            GROUP BY Assignee;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in team-capacity: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch team capacity")


@router.get("/workflow/technical-debt")
async def get_technical_debt(company_id: int):
    """Count of tech debt or bug items."""
    try:
        sql = f"""
            SELECT COUNT(*) AS tech_debt_items
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND Labels LIKE '%tech_debt%';
        """
        result = await query_one(sql)
        return result if result else {"tech_debt_items": 0}
    except Exception as e:
        logger.error(f"Error in technical-debt: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch technical debt")


@router.get("/workflow/innovation-pipeline")
async def get_innovation_pipeline(company_id: int):
    """Innovation/architecture pipeline tasks."""
    try:
        sql = f"""
            SELECT COUNT(*) AS innovation_tasks
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND Labels LIKE '%innovation%';
        """
        result = await query_one(sql)
        return result if result else {"innovation_tasks": 0}
    except Exception as e:
        logger.error(f"Error in innovation-pipeline: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch innovation pipeline")


@router.get("/workflow/recent-activity")
async def get_recent_activity(company_id: int, limit: int = 10):
    """Recent events for feed."""
    try:
        sql = f"""
            SELECT TOP {limit} Provider, ItemType, Title, Status, CreatedAt, ClosedAt
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
            ORDER BY CreatedAt DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in recent-activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent activity")


# =========================================================
# 🔄 BOTH (COMBINED DATA) WIDGETS (3)
# =========================================================

@router.get("/combined/optimization-progress")
async def get_optimization_progress(company_id: int):
    """Blend workflow & financial data for optimization."""
    try:
        sql = f"""
            SELECT f.ServiceName,
                   SUM(CAST(f.BilledCost AS FLOAT)) AS total_cost,
                   COUNT(w.WorkflowID) AS related_tasks
            FROM FinancialFact f
            LEFT JOIN WorkflowFact w
              ON f.ServiceName = w.ProjectOrRepo
             AND f.CompanyID = w.CompanyID
            WHERE f.CompanyID = {company_id}
            GROUP BY f.ServiceName;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in optimization-progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch optimization progress")


@router.get("/combined/efficiency-kpi")
async def get_efficiency_kpi(company_id: int):
    """Compute ratio of savings vs deployment throughput."""
    try:
        sql = f"""
            SELECT 
                (SUM(CAST(f.ListCost AS FLOAT)) - SUM(CAST(f.EffectiveCost AS FLOAT))) / 
                NULLIF(COUNT(w.WorkflowID),0) AS cost_saving_per_deployment
            FROM FinancialFact f
            JOIN WorkflowFact w ON f.CompanyID = w.CompanyID
            WHERE f.CompanyID = {company_id};
        """
        result = await query_one(sql)
        return result if result else {"cost_saving_per_deployment": 0}
    except Exception as e:
        logger.error(f"Error in efficiency-kpi: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch efficiency KPI")


@router.get("/combined/executive-kpi")
async def get_executive_kpi(company_id: int):
    """Top-level KPIs for executives."""
    try:
        sql = f"""
            SELECT 
                SUM(CAST(f.BilledCost AS FLOAT)) AS total_spend,
                COUNT(DISTINCT w.WorkflowID) AS deployments,
                (SUM(CAST(f.ListCost AS FLOAT)) - SUM(CAST(f.EffectiveCost AS FLOAT))) AS total_savings
            FROM FinancialFact f
            JOIN WorkflowFact w ON f.CompanyID = w.CompanyID
            WHERE f.CompanyID = {company_id};
        """
        result = await query_one(sql)
        return result if result else {"total_spend": 0, "deployments": 0, "total_savings": 0}
    except Exception as e:
        logger.error(f"Error in executive-kpi: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch executive KPI")


# =========================================================
# 🧩 INTERNAL / SYSTEM WIDGETS (8)
# =========================================================

@router.get("/system/total-users")
async def get_total_users():
    try:
        sql = "SELECT COUNT(*) AS total_users FROM UserAccount;"
        result = await query_one(sql)
        return result if result else {"total_users": 0}
    except Exception as e:
        logger.error(f"Error in total-users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch total users")


@router.get("/system/integrations-overview")
async def get_integrations_overview():
    """Mock integration status - replace with real table if available"""
    try:
        # Since we don't have IntegrationStatus table yet, return mock data
        return [
            {"IntegrationName": "Azure SQL", "Status": "Active", "LastSync": "2025-10-20T10:00:00Z"},
            {"IntegrationName": "GitHub API", "Status": "Pending", "LastSync": None},
            {"IntegrationName": "Jira API", "Status": "Pending", "LastSync": None}
        ]
    except Exception as e:
        logger.error(f"Error in integrations-overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch integrations overview")


@router.get("/system/efficiency-gain")
async def get_efficiency_gain(company_id: int):
    try:
        sql = f"""
            SELECT 
                (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) / 
                NULLIF(SUM(CAST(ListCost AS FLOAT)),0) * 100 AS efficiency_gain_percent
            FROM FinancialFact
            WHERE CompanyID = {company_id};
        """
        result = await query_one(sql)
        return result if result else {"efficiency_gain_percent": 0}
    except Exception as e:
        logger.error(f"Error in efficiency-gain: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch efficiency gain")


@router.get("/system/recent-activity")
async def get_recent_activity_admin(limit: int = 10):
    """Mock recent activity - replace with real ActivityLog table if available"""
    try:
        # Since we don't have ActivityLog table yet, return recent workflow activity
        sql = f"""
            SELECT TOP {limit} 'Workflow' as ActivityType, Provider, ItemType, Title, CreatedAt
            FROM WorkflowFact
            ORDER BY CreatedAt DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in recent-activity-admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent activity")


@router.get("/system/error-alerts")
async def get_error_alerts():
    """Mock error alerts - replace with real ErrorLog table if available"""
    try:
        # Since we don't have ErrorLog table yet, return workflow errors
        sql = f"""
            SELECT TOP 20 ItemType, Title, Status, CreatedAt, 'Medium' as Severity
            FROM WorkflowFact
            WHERE Status IN ('failed','error')
            ORDER BY CreatedAt DESC;
        """
        return await query_all(sql)
    except Exception as e:
        logger.error(f"Error in error-alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch error alerts")