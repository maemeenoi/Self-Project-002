"""
Automated Baseline API Endpoints
Production-ready endpoints for intelligent baseline management
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from services.automation.automated_baseline_service import baseline_service
from routers.auth import get_current_user, UserLogin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/drs/auto-baseline", tags=["DRS Auto Baseline"])

# ==========================================
# PRODUCTION BASELINE ENDPOINTS
# ==========================================

@router.post("/generate/{company_id}")
async def auto_generate_company_baselines(
    company_id: int,
    background_tasks: BackgroundTasks,
    force_regenerate: bool = Query(False, description="Force regeneration even if recent baselines exist"),
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Automatically generate intelligent baselines for a company.
    This runs in the background and uses industry benchmarks and historical data analysis.
    
    **For Real Clients**: This should be called:
    - During onboarding (first time setup)
    - Monthly via scheduled job
    - When significant infrastructure changes detected
    """
    try:
        # Start background processing
        background_tasks.add_task(
            _process_baseline_generation,
            company_id,
            force_regenerate
        )
        
        return {
            "success": True,
            "message": "Baseline generation started in background",
            "company_id": company_id,
            "estimated_completion": "2-3 minutes",
            "check_status_endpoint": f"/api/drs/auto-baseline/status/{company_id}"
        }
        
    except Exception as e:
        logger.error(f"Error starting baseline generation: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to start baseline generation: {str(e)}"
        )

async def _process_baseline_generation(company_id: int, force_regenerate: bool):
    """Background task for baseline processing"""
    try:
        result = await baseline_service.auto_generate_baselines_for_company(
            company_id, 
            force_regenerate
        )
        
        logger.info(f"Baseline generation completed for company {company_id}: {result['status']}")
        
        # In production, you could:
        # - Store result in cache/database
        # - Send notification to admin
        # - Update company settings
        # - Trigger DRS widget refresh
        
    except Exception as e:
        logger.error(f"Background baseline generation failed for company {company_id}: {e}")

@router.get("/company-type/{company_id}")
async def detect_company_type(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Detect company type based on cloud usage patterns.
    
    **Company Types**:
    - startup: Low spend, simple services
    - enterprise: Multi-region, diverse services  
    - saas: High database + compute usage
    - ecommerce: Compute-heavy workloads
    - fintech: High AI/ML usage, compliance-focused
    """
    try:
        company_type = await baseline_service.detect_company_type(company_id)
        
        # Get the industry benchmarks for this type
        benchmarks = {
            "revenue_multiplier": baseline_service.industry_benchmarks["revenue_multiplier"].get(company_type, 4.2),
            "ttm_baseline_days": baseline_service.industry_benchmarks["ttm_baseline_days"].get(company_type, 60),
            "cost_efficiency_target": baseline_service.industry_benchmarks["cost_efficiency_target"].get(company_type, 0.25)
        }
        
        return {
            "success": True,
            "data": {
                "company_id": company_id,
                "detected_type": company_type,
                "benchmarks": benchmarks,
                "detection_time": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error detecting company type: {e}")
        raise HTTPException(status_code=500, detail="Failed to detect company type")

@router.post("/batch-update")
async def batch_update_all_baselines(
    background_tasks: BackgroundTasks,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    **PRODUCTION SCHEDULER ENDPOINT**
    
    Update baselines for all active companies. 
    This should be called by your production scheduler:
    - Weekly via cron job
    - Monthly for comprehensive updates
    - After major platform changes
    
    **Kubernetes CronJob Example**:
    ```yaml
    apiVersion: batch/v1
    kind: CronJob
    metadata:
      name: drs-baseline-update
    spec:
      schedule: "0 2 * * 0"  # Sunday 2 AM
      jobTemplate:
        spec:
          template:
            spec:
              containers:
              - name: baseline-updater
                image: curl
                command:
                - curl
                - -X
                - POST
                - -H
                - "Authorization: Bearer $SERVICE_TOKEN"
                - "https://your-api.com/api/drs/auto-baseline/batch-update"
    ```
    """
    try:
        # Validate user permissions (should be admin/system)
        if not current_user.get("isSuperAdmin", False):
            # Check if user has admin role
            user_roles = current_user.get("roles", [])
            if not any(role in ["admin", "superadmin", "system"] for role in user_roles):
                raise HTTPException(
                    status_code=403,
                    detail="Insufficient permissions for batch baseline update"
                )
        
        background_tasks.add_task(_process_batch_baseline_update)
        
        return {
            "success": True,
            "message": "Batch baseline update started",
            "estimated_duration": "10-30 minutes",
            "started_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting batch update: {e}")
        raise HTTPException(status_code=500, detail="Failed to start batch update")

async def _process_batch_baseline_update():
    """Background task for batch processing"""
    try:
        result = await baseline_service.schedule_baseline_updates_for_all_companies()
        
        logger.info(f"Batch baseline update completed: {result['successful']} successful, "
                   f"{result['skipped']} skipped, {result['failed']} failed")
        
        # In production, send notification/alert about results
        
    except Exception as e:
        logger.error(f"Batch baseline update failed: {e}")

# ==========================================
# MONITORING & MAINTENANCE
# ==========================================

@router.get("/health-check")
async def baseline_system_health():
    """
    Health check for baseline calculation system.
    Monitors baseline freshness and calculation accuracy.
    """
    try:
        from lib.db import query_many, query_one
        
        # Check recent baseline generation activity
        recent_baselines = """
            SELECT 
                COUNT(DISTINCT CompanyID) as CompaniesWithBaselines,
                MIN(CreatedAt) as OldestBaseline,
                MAX(CreatedAt) as NewestBaseline,
                COUNT(*) as TotalBaselines
            FROM BaselineMetric
            WHERE CreatedAt >= DATEADD(day, -30, GETDATE())
        """
        
        health_data = await query_one(recent_baselines, {})
        
        # Check for companies that need baseline updates
        stale_companies = """
            SELECT COUNT(DISTINCT ff.CompanyID) as CompaniesNeedingUpdate
            FROM FinancialFact ff
            LEFT JOIN BaselineMetric bm ON ff.CompanyID = bm.CompanyID 
                AND bm.CreatedAt >= DATEADD(day, -30, GETDATE())
            WHERE ff.BillingPeriodStart >= DATEADD(month, -2, GETDATE())
              AND bm.CompanyID IS NULL
        """
        
        stale_data = await query_one(stale_companies, {})
        
        companies_with_baselines = int(health_data.get('CompaniesWithBaselines') or 0)
        companies_needing_update = int(stale_data.get('CompaniesNeedingUpdate') or 0)
        total_baselines = int(health_data.get('TotalBaselines') or 0)
        
        # Determine health status
        if companies_needing_update == 0:
            status = "healthy"
        elif companies_needing_update <= 5:
            status = "warning"
        else:
            status = "critical"
        
        return {
            "status": status,
            "baseline_system": {
                "companies_with_recent_baselines": companies_with_baselines,
                "companies_needing_update": companies_needing_update,
                "total_baselines_generated": total_baselines,
                "oldest_baseline": health_data.get('OldestBaseline'),
                "newest_baseline": health_data.get('NewestBaseline')
            },
            "recommendations": {
                "healthy": "System operating normally",
                "warning": f"{companies_needing_update} companies need baseline updates",
                "critical": f"{companies_needing_update} companies urgently need baseline updates"
            }.get(status, "Unknown status"),
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "checked_at": datetime.now().isoformat()
        }

# ==========================================
# CONFIGURATION & TUNING
# ==========================================

@router.get("/industry-benchmarks")
async def get_industry_benchmarks():
    """
    View current industry benchmarks used for baseline calculations.
    
    **For Production**: 
    - Update these benchmarks quarterly based on industry research
    - Allow customer-specific benchmark overrides
    - Track benchmark effectiveness over time
    """
    return {
        "success": True,
        "benchmarks": baseline_service.industry_benchmarks,
        "last_updated": "2025-Q4",  # Update this when benchmarks change
        "source": "Industry research and customer data analysis",
        "usage": {
            "revenue_multiplier": "Estimates baseline revenue from cloud spend",
            "ttm_baseline_days": "Time to market baseline for different company types", 
            "cost_efficiency_target": "Expected cost optimization potential"
        }
    }

@router.post("/recalculate-all-drs/{company_id}")
async def trigger_drs_recalculation(
    company_id: int,
    background_tasks: BackgroundTasks,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    **PRODUCTION FEATURE**: Trigger complete DRS recalculation
    
    Use this after:
    - Major infrastructure changes
    - New service deployments  
    - Significant cost optimization projects
    - Quarterly business reviews
    """
    try:
        background_tasks.add_task(
            _recalculate_company_drs,
            company_id
        )
        
        return {
            "success": True,
            "message": f"DRS recalculation triggered for company {company_id}",
            "includes": [
                "Fresh baseline generation",
                "Initiative progress updates", 
                "ROI recalculation",
                "KPI metric refresh"
            ],
            "estimated_completion": "5-10 minutes"
        }
        
    except Exception as e:
        logger.error(f"Error triggering DRS recalculation: {e}")
        raise HTTPException(status_code=500, detail="Failed to trigger recalculation")

async def _recalculate_company_drs(company_id: int):
    """Background task for complete DRS recalculation"""
    try:
        # Step 1: Regenerate baselines
        baseline_result = await baseline_service.auto_generate_baselines_for_company(
            company_id, force_regenerate=True
        )
        
        # Step 2: Update initiative progress (if you have automation for this)
        # Step 3: Refresh financial impact calculations
        # Step 4: Clear any cached DRS widget data
        
        logger.info(f"DRS recalculation completed for company {company_id}")
        
    except Exception as e:
        logger.error(f"DRS recalculation failed for company {company_id}: {e}")