"""
Baseline Metrics Generator for DRS
Automatically calculates baseline metrics from historical FinancialFact and WorkflowFact data
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta
from decimal import Decimal

from lib.db import query_many, query_one, execute_sql
from routers.auth import get_current_user, UserLogin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/drs/baseline", tags=["DRS Baseline Generator"])

# ==========================================
# BASELINE CALCULATION LOGIC
# ==========================================

@router.post("/generate-baselines")
async def generate_company_baselines(
    company_id: int,
    baseline_period_months: int = Query(default=12, description="Months to look back for baseline calculation"),
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Generate baseline metrics from historical data for a company.
    This creates the comparison points for DRS widgets.
    """
    try:
        logger.info(f"Generating baselines for company {company_id} using {baseline_period_months} months of data")
        
        # Calculate baseline period
        baseline_end = datetime.now() - timedelta(days=30)  # 1 month ago
        baseline_start = baseline_end - timedelta(days=baseline_period_months * 30)
        
        baselines_created = []
        
        # 1. REVENUE BASELINE - Calculate from historical revenue or estimated ARR
        revenue_baseline = await _calculate_revenue_baseline(company_id, baseline_start, baseline_end)
        if revenue_baseline:
            baselines_created.append(revenue_baseline)
        
        # 2. OPERATIONAL COST BASELINE - From FinancialFact historical data
        cost_baseline = await _calculate_cost_baseline(company_id, baseline_start, baseline_end)
        if cost_baseline:
            baselines_created.append(cost_baseline)
        
        # 3. TIME TO MARKET BASELINE - From WorkflowFact cycle time data
        ttm_baseline = await _calculate_ttm_baseline(company_id, baseline_start, baseline_end)
        if ttm_baseline:
            baselines_created.append(ttm_baseline)
        
        return {
            "success": True,
            "message": f"Generated {len(baselines_created)} baseline metrics",
            "data": {
                "company_id": company_id,
                "baseline_period": f"{baseline_start.date()} to {baseline_end.date()}",
                "baselines_created": baselines_created
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating baselines: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate baselines: {str(e)}")

async def _calculate_revenue_baseline(company_id: int, start_date: datetime, end_date: datetime) -> Optional[Dict]:
    """Calculate revenue baseline from historical data or estimate"""
    try:
        # Try to find actual revenue data first
        revenue_query = """
            SELECT SUM(EffectiveCost) AS TotalSpend
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= {start_date}
              AND BillingPeriodStart <= {end_date}
        """
        
        result = await query_one(revenue_query, {
            "company_id": company_id,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        })
        
        total_spend = float(result.get('TotalSpend') or 0)
        
        # Estimate baseline revenue as 3-5x cloud spend (industry average)
        # This assumes cloud infrastructure supports business operations
        estimated_revenue = total_spend * 4.2  # Conservative multiplier
        
        if estimated_revenue > 0:
            # Insert baseline metric
            insert_query = """
                INSERT INTO BaselineMetric (CompanyID, MetricCode, ScopeType, ScopeKey, PeriodStart, PeriodEnd, BaselineValue, Unit)
                VALUES ({company_id}, 'REVENUE_BASELINE', 'company', 'estimated', {start_date}, {end_date}, {value}, 'NZD')
            """
            
            await execute_sql(insert_query, {
                "company_id": company_id,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "value": estimated_revenue
            })
            
            return {
                "metric_code": "REVENUE_BASELINE",
                "value": estimated_revenue,
                "unit": "NZD",
                "method": "estimated_from_cloud_spend",
                "multiplier": 4.2
            }
            
    except Exception as e:
        logger.warning(f"Could not calculate revenue baseline: {e}")
        return None

async def _calculate_cost_baseline(company_id: int, start_date: datetime, end_date: datetime) -> Optional[Dict]:
    """Calculate operational cost baseline from FinancialFact data"""
    try:
        # Calculate average monthly cost from historical data
        cost_query = """
            SELECT 
                SUM(EffectiveCost) AS TotalCost,
                COUNT(DISTINCT CONCAT(YEAR(BillingPeriodStart), '-', MONTH(BillingPeriodStart))) AS MonthCount
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= {start_date}
              AND BillingPeriodStart <= {end_date}
        """
        
        result = await query_one(cost_query, {
            "company_id": company_id,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        })
        
        total_cost = float(result.get('TotalCost') or 0)
        month_count = int(result.get('MonthCount') or 1)
        
        # Annualize the baseline cost
        annual_baseline_cost = (total_cost / month_count) * 12
        
        if annual_baseline_cost > 0:
            # Insert baseline metric
            insert_query = """
                INSERT INTO BaselineMetric (CompanyID, MetricCode, ScopeType, ScopeKey, PeriodStart, PeriodEnd, BaselineValue, Unit)
                VALUES ({company_id}, 'OPS_COST_BASELINE', 'company', 'historical', {start_date}, {end_date}, {value}, 'NZD')
            """
            
            await execute_sql(insert_query, {
                "company_id": company_id,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "value": annual_baseline_cost
            })
            
            return {
                "metric_code": "OPS_COST_BASELINE",
                "value": annual_baseline_cost,
                "unit": "NZD",
                "method": "historical_average",
                "months_analyzed": month_count
            }
            
    except Exception as e:
        logger.warning(f"Could not calculate cost baseline: {e}")
        return None

async def _calculate_ttm_baseline(company_id: int, start_date: datetime, end_date: datetime) -> Optional[Dict]:
    """Calculate Time to Market baseline from WorkflowFact data"""
    try:
        # Calculate average cycle time from historical workflow data
        ttm_query = """
            SELECT 
                AVG(CycleTimeHours) AS AvgCycleTimeHours,
                COUNT(*) AS ItemCount
            FROM WorkflowFact
            WHERE CompanyID = {company_id}
              AND CreatedAt >= {start_date}
              AND CreatedAt <= {end_date}
              AND CycleTimeHours > 0
              AND CycleTimeHours < 8760  -- Less than 1 year (filter outliers)
        """
        
        result = await query_one(ttm_query, {
            "company_id": company_id,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        })
        
        avg_cycle_hours = float(result.get('AvgCycleTimeHours') or 0)
        item_count = int(result.get('ItemCount') or 0)
        
        if avg_cycle_hours > 0 and item_count >= 5:  # Need minimum sample size
            baseline_ttm_days = avg_cycle_hours / 24
            
            # Insert baseline metric
            insert_query = """
                INSERT INTO BaselineMetric (CompanyID, MetricCode, ScopeType, ScopeKey, PeriodStart, PeriodEnd, BaselineValue, Unit)
                VALUES ({company_id}, 'TTM_BASELINE', 'company', 'historical', {start_date}, {end_date}, {value}, 'days')
            """
            
            await execute_sql(insert_query, {
                "company_id": company_id,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "value": baseline_ttm_days
            })
            
            return {
                "metric_code": "TTM_BASELINE",
                "value": baseline_ttm_days,
                "unit": "days",
                "method": "historical_cycle_time",
                "sample_size": item_count
            }
        else:
            # Use industry default if no data
            default_ttm = 90  # 90 days industry average
            
            insert_query = """
                INSERT INTO BaselineMetric (CompanyID, MetricCode, ScopeType, ScopeKey, PeriodStart, PeriodEnd, BaselineValue, Unit)
                VALUES ({company_id}, 'TTM_BASELINE', 'company', 'industry_default', {start_date}, {end_date}, {value}, 'days')
            """
            
            await execute_sql(insert_query, {
                "company_id": company_id,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "value": default_ttm
            })
            
            return {
                "metric_code": "TTM_BASELINE",
                "value": default_ttm,
                "unit": "days",
                "method": "industry_default",
                "reason": f"Insufficient_historical_data_({item_count}_items)"
            }
            
    except Exception as e:
        logger.warning(f"Could not calculate TTM baseline: {e}")
        return None

# ==========================================
# SAMPLE INITIATIVE GENERATOR
# ==========================================

@router.post("/generate-sample-initiatives")
async def generate_sample_initiatives(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """
    Generate sample strategic initiatives based on company's cloud providers
    """
    try:
        # Get company's cloud providers
        providers_query = """
            SELECT DISTINCT Provider, COUNT(*) as ServiceCount, SUM(EffectiveCost) as TotalSpend
            FROM FinancialFact
            WHERE CompanyID = {company_id}
              AND BillingPeriodStart >= DATEADD(month, -6, GETDATE())
            GROUP BY Provider
            ORDER BY TotalSpend DESC
        """
        
        providers = await query_many(providers_query, {"company_id": company_id})
        
        sample_initiatives = []
        
        # Generate initiatives based on providers
        for i, provider in enumerate(providers[:3]):  # Top 3 providers
            provider_name = provider['Provider']
            spend = float(provider['TotalSpend'] or 0)
            
            # Create cloud optimisation initiative
            initiative_name = f"{provider_name.upper()} Cost Optimisation Initiative"
            description = f"Optimise and modernise {provider_name.upper()} infrastructure to reduce costs and improve performance"
            
            # Insert initiative
            insert_initiative = """
                INSERT INTO Initiative (CompanyID, Name, Description, ImpactLevel, Owner, PlannedStartDate, PlannedEndDate, Status)
                VALUES ({company_id}, {name}, {description}, 'High', 'CTO', DATEADD(month, -6, GETDATE()), DATEADD(month, 6, GETDATE()), 'InProgress')
            """
            
            await execute_sql(insert_initiative, {
                "company_id": company_id,
                "name": initiative_name,
                "description": description
            })
            
            # Get the inserted initiative ID
            get_id_query = """
                SELECT TOP 1 InitiativeID 
                FROM Initiative 
                WHERE CompanyID = {company_id} AND Name = {name}
                ORDER BY CreatedAt DESC
            """
            
            initiative_result = await query_one(get_id_query, {
                "company_id": company_id,
                "name": initiative_name
            })
            
            initiative_id = initiative_result['InitiativeID']
            
            # Add sample metrics
            target_savings = spend * 0.25  # Target 25% cost savings
            realized_savings = target_savings * 0.6  # 60% progress
            
            metrics = [
                {
                    "type": "PROGRESS_PCT",
                    "value": 60.0,
                    "unit": "%"
                },
                {
                    "type": "TARGET_SAVINGS",
                    "value": target_savings,
                    "unit": "NZD"
                },
                {
                    "type": "REALISED_SAVINGS", 
                    "value": realized_savings,
                    "unit": "NZD"
                },
                {
                    "type": "INVESTMENT_COST",
                    "value": spend * 0.05,  # 5% of spend as investment
                    "unit": "NZD"
                }
            ]
            
            for metric in metrics:
                insert_metric = """
                    INSERT INTO InitiativeMetric (InitiativeID, PeriodStart, PeriodEnd, MetricType, Value, Unit, SourceSystem)
                    VALUES ({initiative_id}, DATEADD(month, -3, GETDATE()), GETDATE(), {metric_type}, {value}, {unit}, 'manual')
                """
                
                await execute_sql(insert_metric, {
                    "initiative_id": initiative_id,
                    "metric_type": metric["type"],
                    "value": metric["value"],
                    "unit": metric["unit"]
                })
            
            sample_initiatives.append({
                "name": initiative_name,
                "provider": provider_name,
                "target_savings": target_savings,
                "realized_savings": realized_savings,
                "progress": 60.0
            })
        
        return {
            "success": True,
            "message": f"Generated {len(sample_initiatives)} sample initiatives",
            "data": {
                "company_id": company_id,
                "initiatives": sample_initiatives
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating sample initiatives: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate initiatives: {str(e)}")

# ==========================================
# BASELINE VIEWING ENDPOINTS
# ==========================================

@router.get("/view-baselines")
async def view_company_baselines(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """View all baseline metrics for a company"""
    try:
        baselines_query = """
            SELECT 
                MetricCode,
                ScopeType,
                ScopeKey,
                PeriodStart,
                PeriodEnd,
                BaselineValue,
                Unit,
                CreatedAt
            FROM BaselineMetric
            WHERE CompanyID = {company_id}
            ORDER BY MetricCode, CreatedAt DESC
        """
        
        baselines = await query_many(baselines_query, {"company_id": company_id})
        
        formatted_baselines = []
        for baseline in baselines:
            formatted_baselines.append({
                "metric_code": baseline["MetricCode"],
                "scope": f"{baseline['ScopeType']}:{baseline['ScopeKey']}",
                "period": f"{baseline['PeriodStart']} to {baseline['PeriodEnd']}",
                "value": float(baseline["BaselineValue"]),
                "unit": baseline["Unit"],
                "created": baseline["CreatedAt"].isoformat() if baseline["CreatedAt"] else None
            })
        
        return {
            "success": True,
            "data": {
                "company_id": company_id,
                "baselines": formatted_baselines,
                "total_count": len(formatted_baselines)
            }
        }
        
    except Exception as e:
        logger.error(f"Error viewing baselines: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch baselines")

@router.delete("/clear-baselines")
async def clear_company_baselines(
    company_id: int,
    current_user: UserLogin = Depends(get_current_user)
):
    """Clear all baseline metrics for a company (for regeneration)"""
    try:
        delete_query = """
            DELETE FROM BaselineMetric WHERE CompanyID = {company_id}
        """
        
        await execute_sql(delete_query, {"company_id": company_id})
        
        return {
            "success": True,
            "message": f"Cleared all baseline metrics for company {company_id}"
        }
        
    except Exception as e:
        logger.error(f"Error clearing baselines: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear baselines")