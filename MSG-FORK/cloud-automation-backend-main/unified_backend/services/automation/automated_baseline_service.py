"""
Automated Baseline Service for DRS
Automatically calculates and maintains baseline metrics for real client deployments
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from decimal import Decimal

from lib.db import query_many, query_one, execute_sql

logger = logging.getLogger(__name__)


class AutomatedBaselineService:
    """
    Intelligent baseline calculation service for production environments
    """
    
    def __init__(self):
        self.industry_benchmarks = {
            "revenue_multiplier": {
                "startup": 2.5,          # Startups: lower revenue per cloud spend
                "enterprise": 4.2,       # Enterprise: moderate revenue efficiency  
                "saas": 6.8,            # SaaS: high revenue efficiency
                "ecommerce": 5.1,       # E-commerce: good revenue efficiency
                "fintech": 3.9,         # FinTech: moderate (high compliance costs)
                "default": 4.2
            },
            "ttm_baseline_days": {
                "startup": 21,           # Startups: very fast
                "enterprise": 90,        # Enterprise: slower, more process
                "saas": 45,             # SaaS: moderate speed
                "ecommerce": 30,        # E-commerce: fast iterations
                "fintech": 120,         # FinTech: slower (compliance)
                "default": 60
            },
            "cost_efficiency_target": {
                "startup": 0.15,         # 15% target savings
                "enterprise": 0.25,      # 25% target savings
                "saas": 0.30,           # 30% target savings (cloud-native)
                "ecommerce": 0.20,      # 20% target savings
                "fintech": 0.18,        # 18% target savings (compliance overhead)
                "default": 0.25
            }
        }
    
    async def detect_company_type(self, company_id: int) -> str:
        """
        Intelligently detect company type from cloud usage patterns
        """
        try:
            # Analyze service usage patterns
            service_analysis = """
                SELECT 
                    SUM(CASE WHEN ServiceName LIKE '%database%' OR ServiceName LIKE '%sql%' 
                             OR ServiceName LIKE '%cosmos%' THEN EffectiveCost ELSE 0 END) as DatabaseSpend,
                    SUM(CASE WHEN ServiceName LIKE '%compute%' OR ServiceName LIKE '%vm%' 
                             OR ServiceName LIKE '%container%' THEN EffectiveCost ELSE 0 END) as ComputeSpend,
                    SUM(CASE WHEN ServiceName LIKE '%storage%' OR ServiceName LIKE '%blob%' 
                             THEN EffectiveCost ELSE 0 END) as StorageSpend,
                    SUM(CASE WHEN ServiceName LIKE '%ai%' OR ServiceName LIKE '%cognitive%' 
                             OR ServiceName LIKE '%ml%' THEN EffectiveCost ELSE 0 END) as AISpend,
                    SUM(EffectiveCost) as TotalSpend,
                    COUNT(DISTINCT ServiceName) as ServiceDiversity,
                    COUNT(DISTINCT Region) as RegionCount
                FROM FinancialFact
                WHERE CompanyID = {company_id}
                  AND BillingPeriodStart >= DATEADD(month, -6, GETDATE())
            """
            
            result = await query_one(service_analysis, {"company_id": company_id})
            
            total_spend = float(result.get('TotalSpend') or 0)
            if total_spend == 0:
                return "startup"  # New company, minimal cloud usage
            
            # Calculate spending ratios
            db_ratio = float(result.get('DatabaseSpend') or 0) / total_spend
            compute_ratio = float(result.get('ComputeSpend') or 0) / total_spend
            ai_ratio = float(result.get('AISpend') or 0) / total_spend
            service_diversity = int(result.get('ServiceDiversity') or 0)
            region_count = int(result.get('RegionCount') or 0)
            
            # Classification logic based on spending patterns
            if ai_ratio > 0.15 and service_diversity > 15:
                return "fintech"  # High AI usage, diverse services
            elif db_ratio > 0.40 and compute_ratio > 0.30:
                return "saas"  # High database + compute (typical SaaS pattern)
            elif region_count > 5 and service_diversity > 20:
                return "enterprise"  # Multi-region, diverse services
            elif compute_ratio > 0.60:
                return "ecommerce"  # Compute-heavy (web traffic)
            elif total_spend < 500:  # Monthly spend threshold
                return "startup"  # Low overall spend
            else:
                return "enterprise"  # Default for established companies
                
        except Exception as e:
            logger.warning(f"Could not detect company type: {e}")
            return "default"
    
    async def calculate_intelligent_revenue_baseline(self, company_id: int, company_type: str, 
                                                   historical_months: int = 12) -> Optional[Dict]:
        """
        Calculate revenue baseline using industry benchmarks and actual usage patterns
        """
        try:
            # Get historical cloud spend
            spend_query = """
                SELECT 
                    SUM(EffectiveCost) as TotalSpend,
                    AVG(EffectiveCost) as AvgMonthlySpend,
                    COUNT(DISTINCT CONCAT(YEAR(BillingPeriodStart), '-', MONTH(BillingPeriodStart))) as MonthCount
                FROM FinancialFact
                WHERE CompanyID = {company_id}
                  AND BillingPeriodStart >= DATEADD(month, -{months}, GETDATE())
            """
            
            result = await query_one(spend_query, {
                "company_id": company_id, 
                "months": historical_months
            })
            
            total_spend = float(result.get('TotalSpend') or 0)
            month_count = int(result.get('MonthCount') or 1)
            
            if total_spend == 0:
                return None
            
            # Get industry-appropriate revenue multiplier
            revenue_multiplier = self.industry_benchmarks["revenue_multiplier"].get(
                company_type, 
                self.industry_benchmarks["revenue_multiplier"]["default"]
            )
            
            # Calculate annualized baseline revenue
            annual_cloud_spend = (total_spend / month_count) * 12
            baseline_revenue = annual_cloud_spend * revenue_multiplier
            
            # Adjust for company maturity (based on service diversity)
            maturity_query = """
                SELECT COUNT(DISTINCT ServiceName) as ServiceCount
                FROM FinancialFact
                WHERE CompanyID = {company_id}
                  AND BillingPeriodStart >= DATEADD(month, -3, GETDATE())
            """
            
            maturity = await query_one(maturity_query, {"company_id": company_id})
            service_count = int(maturity.get('ServiceCount') or 1)
            
            # Mature companies (more services) tend to have higher revenue efficiency
            maturity_factor = min(1.5, 1.0 + (service_count / 50))
            baseline_revenue *= maturity_factor
            
            return {
                "baseline_value": baseline_revenue,
                "calculation_method": "intelligent_industry_benchmark",
                "company_type": company_type,
                "revenue_multiplier": revenue_multiplier,
                "maturity_factor": maturity_factor,
                "annual_cloud_spend": annual_cloud_spend,
                "months_analyzed": month_count
            }
            
        except Exception as e:
            logger.error(f"Error calculating revenue baseline: {e}")
            return None
    
    async def calculate_adaptive_cost_baseline(self, company_id: int, company_type: str) -> Optional[Dict]:
        """
        Calculate cost baseline with seasonal and growth adjustments
        """
        try:
            # Get 18 months of data for trend analysis
            cost_trend_query = """
                SELECT 
                    YEAR(BillingPeriodStart) as Year,
                    MONTH(BillingPeriodStart) as Month,
                    SUM(EffectiveCost) as MonthlySpend
                FROM FinancialFact
                WHERE CompanyID = {company_id}
                  AND BillingPeriodStart >= DATEADD(month, -18, GETDATE())
                GROUP BY YEAR(BillingPeriodStart), MONTH(BillingPeriodStart)
                ORDER BY Year, Month
            """
            
            cost_trends = await query_many(cost_trend_query, {"company_id": company_id})
            
            if len(cost_trends) < 6:  # Need at least 6 months
                return None
            
            monthly_costs = [float(row['MonthlySpend']) for row in cost_trends]
            
            # Calculate trend (growth rate)
            if len(monthly_costs) >= 12:
                recent_avg = sum(monthly_costs[-6:]) / 6  # Last 6 months
                older_avg = sum(monthly_costs[-12:-6]) / 6  # 6 months before that
                growth_rate = (recent_avg - older_avg) / older_avg if older_avg > 0 else 0
            else:
                growth_rate = 0
            
            # Calculate baseline with trend adjustment
            current_monthly_avg = sum(monthly_costs[-3:]) / 3  # Last 3 months
            
            # Project forward with growth trend (capped at reasonable limits)
            growth_rate = max(-0.5, min(0.5, growth_rate))  # Cap between -50% and +50%
            projected_monthly = current_monthly_avg * (1 + growth_rate)
            
            # Apply efficiency target based on company type
            efficiency_target = self.industry_benchmarks["cost_efficiency_target"].get(
                company_type,
                self.industry_benchmarks["cost_efficiency_target"]["default"]
            )
            
            # Baseline represents "pre-optimization" cost
            baseline_annual_cost = projected_monthly * 12 / (1 - efficiency_target)
            
            return {
                "baseline_value": baseline_annual_cost,
                "calculation_method": "trend_adjusted_with_efficiency_target",
                "company_type": company_type,
                "current_monthly_avg": current_monthly_avg,
                "growth_rate": growth_rate,
                "efficiency_target": efficiency_target,
                "months_analyzed": len(monthly_costs)
            }
            
        except Exception as e:
            logger.error(f"Error calculating cost baseline: {e}")
            return None
    
    async def calculate_workflow_ttm_baseline(self, company_id: int, company_type: str) -> Optional[Dict]:
        """
        Calculate Time to Market baseline from actual workflow data or industry standards
        """
        try:
            # Try to get actual workflow data
            workflow_query = """
                SELECT 
                    AVG(CycleTimeHours) as AvgCycleHours,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CycleTimeHours) as MedianCycleHours,
                    COUNT(*) as ItemCount
                FROM WorkflowFact
                WHERE CompanyID = {company_id}
                  AND CreatedAt >= DATEADD(month, -6, GETDATE())
                  AND CycleTimeHours > 0
                  AND CycleTimeHours <= 2160  -- Less than 3 months (filter outliers)
            """
            
            result = await query_one(workflow_query, {"company_id": company_id})
            
            avg_hours = float(result.get('AvgCycleHours') or 0)
            median_hours = float(result.get('MedianCycleHours') or 0)
            item_count = int(result.get('ItemCount') or 0)
            
            if item_count >= 10 and avg_hours > 0:
                # Use actual data (prefer median to avoid outlier skew)
                baseline_hours = median_hours if median_hours > 0 else avg_hours
                baseline_days = baseline_hours / 24
                
                # Add inefficiency buffer (assume 20% improvement potential)
                baseline_days *= 1.2
                
                return {
                    "baseline_value": baseline_days,
                    "calculation_method": "historical_workflow_data",
                    "company_type": company_type,
                    "sample_size": item_count,
                    "median_days": median_hours / 24,
                    "average_days": avg_hours / 24
                }
            else:
                # Use industry benchmark
                baseline_days = self.industry_benchmarks["ttm_baseline_days"].get(
                    company_type,
                    self.industry_benchmarks["ttm_baseline_days"]["default"]
                )
                
                return {
                    "baseline_value": baseline_days,
                    "calculation_method": "industry_benchmark",
                    "company_type": company_type,
                    "reason": f"insufficient_workflow_data_{item_count}_items"
                }
                
        except Exception as e:
            logger.error(f"Error calculating TTM baseline: {e}")
            return None
    
    async def auto_generate_baselines_for_company(self, company_id: int, 
                                                force_regenerate: bool = False) -> Dict[str, Any]:
        """
        Main method to automatically generate all baselines for a company
        """
        try:
            logger.info(f"Auto-generating baselines for company {company_id}")
            
            # Check if baselines already exist
            if not force_regenerate:
                existing_query = """
                    SELECT COUNT(*) as BaselineCount
                    FROM BaselineMetric 
                    WHERE CompanyID = {company_id}
                      AND CreatedAt >= DATEADD(day, -30, GETDATE())  -- Generated in last 30 days
                """
                
                existing = await query_one(existing_query, {"company_id": company_id})
                if int(existing.get('BaselineCount', 0)) >= 3:
                    return {
                        "status": "skipped",
                        "reason": "Recent baselines already exist",
                        "baseline_count": int(existing.get('BaselineCount', 0))
                    }
            
            # Detect company type
            company_type = await self.detect_company_type(company_id)
            logger.info(f"Detected company type: {company_type}")
            
            baselines_created = []
            calculation_date = datetime.now()
            
            # 1. Revenue Baseline
            revenue_baseline = await self.calculate_intelligent_revenue_baseline(
                company_id, company_type
            )
            
            if revenue_baseline:
                await self._insert_baseline(
                    company_id, "REVENUE_BASELINE", revenue_baseline["baseline_value"], 
                    "NZD", calculation_date, revenue_baseline
                )
                baselines_created.append(revenue_baseline)
            
            # 2. Cost Baseline
            cost_baseline = await self.calculate_adaptive_cost_baseline(
                company_id, company_type
            )
            
            if cost_baseline:
                await self._insert_baseline(
                    company_id, "OPS_COST_BASELINE", cost_baseline["baseline_value"],
                    "NZD", calculation_date, cost_baseline
                )
                baselines_created.append(cost_baseline)
            
            # 3. TTM Baseline
            ttm_baseline = await self.calculate_workflow_ttm_baseline(
                company_id, company_type
            )
            
            if ttm_baseline:
                await self._insert_baseline(
                    company_id, "TTM_BASELINE", ttm_baseline["baseline_value"],
                    "days", calculation_date, ttm_baseline
                )
                baselines_created.append(ttm_baseline)
            
            return {
                "status": "success",
                "company_id": company_id,
                "company_type": company_type,
                "baselines_created": len(baselines_created),
                "details": baselines_created,
                "generated_at": calculation_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in auto baseline generation: {e}")
            return {
                "status": "error",
                "company_id": company_id,
                "error": str(e)
            }
    
    async def _insert_baseline(self, company_id: int, metric_code: str, value: float,
                             unit: str, calc_date: datetime, metadata: Dict):
        """Insert baseline metric with metadata"""
        try:
            # Calculate period (use last 12 months as baseline period)
            period_end = calc_date - timedelta(days=30)
            period_start = period_end - timedelta(days=365)
            
            insert_query = """
                INSERT INTO BaselineMetric 
                (CompanyID, MetricCode, ScopeType, ScopeKey, PeriodStart, PeriodEnd, BaselineValue, Unit)
                VALUES ({company_id}, {metric_code}, 'company', {scope_key}, {period_start}, {period_end}, {value}, {unit})
            """
            
            scope_key = metadata.get("calculation_method", "auto_generated")
            
            await execute_sql(insert_query, {
                "company_id": company_id,
                "metric_code": metric_code,
                "scope_key": scope_key,
                "period_start": period_start.strftime("%Y-%m-%d"),
                "period_end": period_end.strftime("%Y-%m-%d"),
                "value": value,
                "unit": unit
            })
            
            logger.info(f"Inserted baseline {metric_code}: {value} {unit} for company {company_id}")
            
        except Exception as e:
            logger.error(f"Error inserting baseline: {e}")
    
    async def schedule_baseline_updates_for_all_companies(self) -> Dict[str, Any]:
        """
        Batch process to update baselines for all active companies
        """
        try:
            # Get all companies with recent activity
            active_companies_query = """
                SELECT DISTINCT CompanyID
                FROM FinancialFact
                WHERE BillingPeriodStart >= DATEADD(month, -2, GETDATE())
                
                UNION
                
                SELECT DISTINCT CompanyID
                FROM WorkflowFact
                WHERE CreatedAt >= DATEADD(month, -2, GETDATE())
            """
            
            companies = await query_many(active_companies_query, {})
            
            results = []
            for company_row in companies:
                company_id = int(company_row['CompanyID'])
                
                try:
                    result = await self.auto_generate_baselines_for_company(
                        company_id, force_regenerate=False
                    )
                    results.append(result)
                    
                    # Small delay to avoid overwhelming the database
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    logger.error(f"Failed to generate baselines for company {company_id}: {e}")
                    results.append({
                        "status": "error",
                        "company_id": company_id,
                        "error": str(e)
                    })
            
            successful = len([r for r in results if r["status"] == "success"])
            skipped = len([r for r in results if r["status"] == "skipped"])
            failed = len([r for r in results if r["status"] == "error"])
            
            return {
                "batch_complete": True,
                "companies_processed": len(companies),
                "successful": successful,
                "skipped": skipped,
                "failed": failed,
                "results": results,
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in batch baseline update: {e}")
            return {
                "batch_complete": False,
                "error": str(e)
            }


# Global service instance
baseline_service = AutomatedBaselineService()