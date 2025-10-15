# widgetsService.py
# ---------------------------------------------------------
# FastAPI service routes for all 32 widgets
# Source: FinancialFact (FOCUS data) + WorkflowFact (Jira/GitHub)
# + Combined (Both) + Internal/System (Admin)
# ---------------------------------------------------------

from fastapi import APIRouter, Query
from typing import Optional
from lib.db import query as db_query  # assume you have db.query helper

router = APIRouter(prefix="/api/widgets", tags=["Widgets"])


# =========================================================
# 🧾 FINANCIALFACT WIDGETS (9)
# =========================================================

@router.get("/financial/cost-breakdown")
async def get_cost_breakdown(company_id: int, group_by: str = Query("ServiceName", enum=["ServiceName", "Region", "Provider"])):
    """Total cost grouped by Service, Region, or Provider."""
    sql = f"""
        SELECT {group_by} AS category,
               SUM(CAST(BilledCost AS FLOAT)) AS total_cost
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY {group_by}
        ORDER BY total_cost DESC;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/cost-trend")
async def get_cost_trend(company_id: int):
    """Total cost trend by billing date."""
    sql = """
        SELECT FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd') AS period,
               SUM(CAST(BilledCost AS FLOAT)) AS total_cost
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd')
        ORDER BY period;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/savings-summary")
async def get_savings_summary(company_id: int):
    """Compare ListCost vs EffectiveCost to calculate total savings."""
    sql = """
        SELECT 
            SUM(CAST(ListCost AS FLOAT)) AS total_list_cost,
            SUM(CAST(EffectiveCost AS FLOAT)) AS total_effective_cost,
            (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) AS total_savings,
            (1 - SUM(CAST(EffectiveCost AS FLOAT)) / NULLIF(SUM(CAST(ListCost AS FLOAT)),0)) * 100 AS savings_percent
        FROM FinancialFact
        WHERE CompanyID = @CompanyID;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/optimization-opportunities")
async def get_optimization_opportunities(company_id: int):
    """Find high ListCost vs EffectiveCost gaps."""
    sql = """
        SELECT 
            ServiceName,
            SUM(CAST(ListCost AS FLOAT)) AS total_list_cost,
            SUM(CAST(EffectiveCost AS FLOAT)) AS total_effective_cost,
            (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) AS potential_saving
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY ServiceName
        HAVING (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) > 0
        ORDER BY potential_saving DESC;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/cost-analytics")
async def get_cost_analytics(company_id: int):
    """Cost by Provider, Service, Region."""
    sql = """
        SELECT 
            Provider,
            ServiceName,
            Region,
            SUM(CAST(BilledCost AS FLOAT)) AS total_cost
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY Provider, ServiceName, Region
        ORDER BY total_cost DESC;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/vendor-costs")
async def get_vendor_costs(company_id: int):
    """Cost by Publisher/Vendor."""
    sql = """
        SELECT Publisher, SUM(CAST(BilledCost AS FLOAT)) AS total_cost
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY Publisher
        ORDER BY total_cost DESC;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/resource-allocation")
async def get_resource_allocation(company_id: int):
    """Cost by Resource and Location."""
    sql = """
        SELECT ResourceLocation, ResourceId,
               SUM(CAST(BilledCost AS FLOAT)) AS total_cost
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY ResourceLocation, ResourceId
        ORDER BY total_cost DESC;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/financial-alerts")
async def get_financial_alerts(company_id: int):
    """Detect cost spikes (>20% increase)."""
    sql = """
        WITH cost_trend AS (
            SELECT 
                FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd') AS period,
                SUM(CAST(BilledCost AS FLOAT)) AS total_cost
            FROM FinancialFact
            WHERE CompanyID = @CompanyID
            GROUP BY FORMAT(CAST(BillingPeriodStart AS DATE), 'yyyy-MM-dd')
        )
        SELECT period, total_cost,
               LAG(total_cost) OVER (ORDER BY period) AS prev_cost,
               ((total_cost - LAG(total_cost) OVER (ORDER BY period)) / NULLIF(LAG(total_cost) OVER (ORDER BY period),0)) * 100 AS growth_percent
        FROM cost_trend
        WHERE ((total_cost - LAG(total_cost) OVER (ORDER BY period)) / NULLIF(LAG(total_cost) OVER (ORDER BY period),0)) * 100 > 20;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/financial/resource-allocation-detail")
async def get_resource_allocation_detail(company_id: int):
    """Detailed cost allocation for drill-down view."""
    sql = """
        SELECT Region, ServiceName, ResourceLocation,
               SUM(CAST(BilledCost AS FLOAT)) AS total_cost
        FROM FinancialFact
        WHERE CompanyID = @CompanyID
        GROUP BY Region, ServiceName, ResourceLocation;
    """
    return await db_query(sql, {"CompanyID": company_id})


# =========================================================
# ⚙️ WORKFLOWFACT WIDGETS (12)
# =========================================================

@router.get("/workflow/jira")
async def get_jira_issues(company_id: int):
    """Jira: count by status."""
    sql = """
        SELECT Status, COUNT(*) AS issue_count
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND Provider = 'jira'
        GROUP BY Status;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/pull-requests")
async def get_pull_requests(company_id: int):
    """GitHub pull requests by status."""
    sql = """
        SELECT Status, COUNT(*) AS pr_count
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND Provider = 'github'
          AND ItemType = 'pull_request'
        GROUP BY Status;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/build-status")
async def get_build_status(company_id: int):
    """Pipeline build results."""
    sql = """
        SELECT Status, COUNT(*) AS build_count
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND ItemType = 'build'
        GROUP BY Status;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/deployment-metrics")
async def get_deployment_metrics(company_id: int):
    """Deployment frequency and success."""
    sql = """
        SELECT FORMAT(CAST(CreatedAt AS DATE), 'yyyy-MM-dd') AS date,
               COUNT(*) AS deployments,
               SUM(CASE WHEN Status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS success_rate
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND ItemType = 'deployment'
        GROUP BY FORMAT(CAST(CreatedAt AS DATE), 'yyyy-MM-dd')
        ORDER BY date;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/release-pipeline")
async def get_release_pipeline(company_id: int):
    """Track release progress."""
    sql = """
        SELECT ProjectOrRepo, COUNT(*) AS total_releases
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND ItemType = 'release'
        GROUP BY ProjectOrRepo;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/active-projects")
async def get_active_projects(company_id: int):
    """List active repos/projects."""
    sql = """
        SELECT DISTINCT ProjectOrRepo
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND Status IN ('active','open','in_progress');
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/team-performance")
async def get_team_performance(company_id: int):
    """Average lead/cycle time per assignee."""
    sql = """
        SELECT Assignee,
               COUNT(*) AS items_completed,
               AVG(CAST(LeadTimeHours AS FLOAT)) AS avg_lead,
               AVG(CAST(CycleTimeHours AS FLOAT)) AS avg_cycle
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
        GROUP BY Assignee;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/system-health")
async def get_system_health(company_id: int):
    """Error vs success counts."""
    sql = """
        SELECT ItemType,
               SUM(CASE WHEN Status IN ('failed','error') THEN 1 ELSE 0 END) AS failed,
               SUM(CASE WHEN Status IN ('success','done','closed') THEN 1 ELSE 0 END) AS successful
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
        GROUP BY ItemType;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/team-capacity")
async def get_team_capacity(company_id: int):
    """Tasks per team member."""
    sql = """
        SELECT Assignee, COUNT(*) AS active_items
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND Status IN ('open','in_progress')
        GROUP BY Assignee;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/technical-debt")
async def get_technical_debt(company_id: int):
    """Count of tech debt or bug items."""
    sql = """
        SELECT COUNT(*) AS tech_debt_items
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND Labels LIKE '%tech_debt%';
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/innovation-pipeline")
async def get_innovation_pipeline(company_id: int):
    """Innovation/architecture pipeline tasks."""
    sql = """
        SELECT COUNT(*) AS innovation_tasks
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
          AND Labels LIKE '%innovation%';
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/workflow/recent-activity")
async def get_recent_activity(company_id: int, limit: int = 10):
    """Recent events for feed."""
    sql = """
        SELECT TOP (@Limit) Provider, ItemType, Title, Status, CreatedAt, ClosedAt
        FROM WorkflowFact
        WHERE CompanyID = @CompanyID
        ORDER BY CreatedAt DESC;
    """
    return await db_query(sql, {"CompanyID": company_id, "Limit": limit})


# =========================================================
# 🔄 BOTH (COMBINED DATA) WIDGETS (3)
# =========================================================

@router.get("/combined/optimization-progress")
async def get_optimization_progress(company_id: int):
    """Blend workflow & financial data for optimization."""
    sql = """
        SELECT f.ServiceName,
               SUM(CAST(f.BilledCost AS FLOAT)) AS total_cost,
               COUNT(w.WorkflowID) AS related_tasks
        FROM FinancialFact f
        LEFT JOIN WorkflowFact w
          ON f.ServiceName = w.ProjectOrRepo
         AND f.CompanyID = w.CompanyID
        WHERE f.CompanyID = @CompanyID
        GROUP BY f.ServiceName;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/combined/efficiency-kpi")
async def get_efficiency_kpi(company_id: int):
    """Compute ratio of savings vs deployment throughput."""
    sql = """
        SELECT 
            (SUM(CAST(f.ListCost AS FLOAT)) - SUM(CAST(f.EffectiveCost AS FLOAT))) / 
            NULLIF(COUNT(w.WorkflowID),0) AS cost_saving_per_deployment
        FROM FinancialFact f
        JOIN WorkflowFact w ON f.CompanyID = w.CompanyID
        WHERE f.CompanyID = @CompanyID;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/combined/executive-kpi")
async def get_executive_kpi(company_id: int):
    """Top-level KPIs for executives."""
    sql = """
        SELECT 
            SUM(CAST(f.BilledCost AS FLOAT)) AS total_spend,
            COUNT(DISTINCT w.WorkflowID) AS deployments,
            (SUM(CAST(f.ListCost AS FLOAT)) - SUM(CAST(f.EffectiveCost AS FLOAT))) AS total_savings
        FROM FinancialFact f
        JOIN WorkflowFact w ON f.CompanyID = w.CompanyID
        WHERE f.CompanyID = @CompanyID;
    """
    return await db_query(sql, {"CompanyID": company_id})


# =========================================================
# 🧩 INTERNAL / SYSTEM WIDGETS (8)
# =========================================================

@router.get("/system/total-users")
async def get_total_users():
    sql = "SELECT COUNT(*) AS total_users FROM UserAccount;"
    return await db_query(sql)


@router.get("/system/active-sessions")
async def get_active_sessions():
    sql = "SELECT COUNT(*) AS active_sessions FROM ActiveSessions WHERE IsActive = 1;"
    return await db_query(sql)


@router.get("/system/integrations-overview")
async def get_integrations_overview():
    sql = "SELECT IntegrationName, Status, LastSync FROM IntegrationStatus;"
    return await db_query(sql)


@router.get("/system/integration-sync-status")
async def get_integration_sync_status():
    sql = "SELECT IntegrationName, LastSync, Status FROM IntegrationStatus;"
    return await db_query(sql)


@router.get("/system/efficiency-gain")
async def get_efficiency_gain(company_id: int):
    sql = """
        SELECT 
            (SUM(CAST(ListCost AS FLOAT)) - SUM(CAST(EffectiveCost AS FLOAT))) / 
            NULLIF(SUM(CAST(ListCost AS FLOAT)),0) * 100 AS efficiency_gain_percent
        FROM FinancialFact
        WHERE CompanyID = @CompanyID;
    """
    return await db_query(sql, {"CompanyID": company_id})


@router.get("/system/system-health")
async def get_system_health_admin():
    sql = """
        SELECT SystemName, Status, LastCheck, UptimePercent
        FROM SystemHealth;
    """
    return await db_query(sql)


@router.get("/system/recent-activity")
async def get_recent_activity_admin(limit: int = 10):
    sql = "SELECT TOP (@Limit) * FROM ActivityLog ORDER BY CreatedAt DESC;"
    return await db_query(sql, {"Limit": limit})


@router.get("/system/error-alerts")
async def get_error_alerts():
    sql = """
        SELECT TOP 20 * 
        FROM ErrorLog
        WHERE Severity IN ('High','Critical')
        ORDER BY CreatedAt DESC;
    """
    return await db_query(sql)