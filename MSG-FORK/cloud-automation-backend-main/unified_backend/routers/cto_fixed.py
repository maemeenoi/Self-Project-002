"""
CTO Dashboard Router
Handles CTO-specific endpoints including cost forecasting and AI recommendations
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import requests
import json

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/cto", tags=["cto"])
security = HTTPBearer()

# Import the current company function  
from main import get_current_company

# Import cloud service
from services.cloud_api_service import (
    fetch_azure_forecast_data,
    fetch_azure_recommendations, 
    fetch_aws_forecast_and_recommendations
)

# Pydantic Models
class ForecastData(BaseModel):
    dates: List[str]
    costs: List[float]
    monthly_projection: Optional[float] = None
    confidence_level: Optional[float] = None

class Recommendation(BaseModel):
    title: str
    description: str
    priority: str  # 'high', 'medium', 'low'
    action: str
    type: str
    source: str
    category: str

class DailyCosts(BaseModel):
    dates: List[str]
    costs: List[float]

class ForecastAndRecommendations(BaseModel):
    forecast: ForecastData
    recommendations: List[Recommendation]

class CTOAnalysisResponse(BaseModel):
    daily_costs: DailyCosts
    forecast_and_recommendations: ForecastAndRecommendations
    provider_used: Optional[str] = None  # Which provider was actually used

async def get_integration_credentials(company_id: int, provider: str):
    """Get integration credentials for a specific provider from the database"""
    try:
        from lib.db import get_db_connection
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Query the IntegrationConfig table for the specific provider
            query = """
                SELECT ConfigValue 
                FROM IntegrationConfig 
                WHERE CompanyID = ? AND IntegrationType = ?
            """
            
            cursor.execute(query, (company_id, provider))
            result = cursor.fetchone()
            
            if not result:
                logger.warning(f"No integration credentials found for company {company_id}, provider {provider}")
                return {"success": False, "error": f"No {provider} integration found"}
        
        # Parse the JSON configuration
        config_value = json.loads(result[0] if result[0] else '{}')
        
        return {"success": True, "credentials": config_value}
        
    except Exception as e:
        logger.error(f"Error getting integration credentials: {e}")
        return {"success": False, "error": str(e)}

async def generate_ai_recommendations(cost_data: List[Dict[str, Any]], daily_costs: DailyCosts) -> List[Recommendation]:
    """Generate AI recommendations using Azure OpenAI based on real cloud cost data analysis"""
    try:
        # Import Azure OpenAI service
        from services.azure_openai_service import azure_openai_service
        
        # Convert DailyCosts to dict for AI service
        daily_costs_dict = {
            'dates': daily_costs.dates,
            'costs': daily_costs.costs
        }
        
        # Get AI-generated recommendations
        ai_recommendations = await azure_openai_service.generate_cost_recommendations(cost_data, daily_costs_dict)
        
        # Convert AI recommendations to Recommendation objects
        recommendations = []
        for rec in ai_recommendations:
            try:
                recommendations.append(Recommendation(
                    title=rec.get('title', 'AI Recommendation'),
                    description=rec.get('description', 'AI-generated recommendation'),
                    priority=rec.get('priority', 'medium'),
                    action=rec.get('action', 'Review recommendation'),
                    type=rec.get('type', 'AI Optimization'),
                    source=rec.get('source', 'Azure OpenAI Analysis'),
                    category=rec.get('category', 'optimization')
                ))
            except Exception as e:
                logger.warning(f"Failed to parse AI recommendation: {e}")
                continue
        
        # If AI failed or returned no recommendations, provide minimal fallback based on real data
        if not recommendations and cost_data and daily_costs.costs:
            logger.warning("AI recommendations failed - using basic data analysis fallback")
            
            # Basic analysis fallback
            total_cost = sum(daily_costs.costs)
            avg_daily_cost = total_cost / len(daily_costs.costs)
            recent_costs = daily_costs.costs[-7:] if len(daily_costs.costs) >= 7 else daily_costs.costs
            recent_avg = sum(recent_costs) / len(recent_costs)
            
            # Service analysis
            service_data = {}
            for item in cost_data:
                service = item.get('service', 'Unknown')
                cost = float(item.get('cost', 0))
                service_data[service] = service_data.get(service, 0) + cost

            top_services = sorted(service_data.items(), key=lambda x: x[1], reverse=True)[:3]
            
            # Generate minimal real-data recommendations
            if recent_avg > avg_daily_cost:
                recommendations.append(Recommendation(
                    title="Recent Cost Increase Detected",
                    description=f"Recent 7-day average (${recent_avg:.2f}) is higher than overall average (${avg_daily_cost:.2f}). Investigation recommended.",
                    priority="high",
                    action="Review recent resource changes and usage patterns",
                    type="Cost Analysis",
                    source="Basic Data Analysis",
                    category="cost-monitoring"
                ))

            if top_services:
                top_service, top_cost = top_services[0]
                service_percentage = (top_cost / total_cost * 100)
                recommendations.append(Recommendation(
                    title=f"Review {top_service} Costs",
                    description=f"{top_service} represents {service_percentage:.1f}% of total costs (${top_cost:.2f}). Consider optimization opportunities.",
                    priority="medium",
                    action=f"Analyze {top_service} usage and configuration",
                    type="Service Optimization",
                    source="Basic Data Analysis", 
                    category="service-optimization"
                ))
        
        logger.info(f"✅ Generated {len(recommendations)} recommendations ({'AI-powered' if ai_recommendations else 'data-analysis fallback'})")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating AI recommendations: {e}")
        # Return empty list on error - no fallback to mock data
        return []

@router.post("/forecast")
async def get_cto_forecast(request: Request, token: str = Depends(security)):
    """
    Get cost forecast and AI recommendations for CTO dashboard
    Uses real cloud provider APIs - NO MOCK DATA
    """
    try:
        # Get company from token
        company_info = await get_current_company(token.credentials)
        if not company_info or not company_info.get("success"):
            raise HTTPException(status_code=401, detail="Invalid token or company not found")
        
        company_id = company_info["company"]["id"]
        logger.info(f"🔍 Getting CTO forecast for company {company_id}")
        
        # Try Azure first
        azure_creds = await get_integration_credentials(company_id, "Azure")
        if azure_creds.get("success"):
            logger.info("✅ Found Azure credentials, fetching real Azure data")
            try:
                credentials = azure_creds["credentials"]
                
                # Fetch real Azure data
                azure_forecast = await fetch_azure_forecast_data(
                    credentials.get("subscription_id"),
                    credentials.get("tenant_id"), 
                    credentials.get("client_id"),
                    credentials.get("client_secret")
                )
                
                azure_recommendations = await fetch_azure_recommendations(
                    credentials.get("subscription_id"),
                    credentials.get("tenant_id"),
                    credentials.get("client_id"), 
                    credentials.get("client_secret")
                )
                
                if azure_forecast and not azure_forecast.get("error"):
                    # Process Azure data
                    historical = azure_forecast.get("historical_data", {})
                    forecast = azure_forecast.get("forecast_data", {})
                    
                    daily_costs = DailyCosts(
                        dates=historical.get("dates", []),
                        costs=historical.get("costs", [])
                    )
                    
                    forecast_data = ForecastData(
                        dates=forecast.get("dates", []),
                        costs=forecast.get("costs", []),
                        monthly_projection=forecast.get("monthly_projection"),
                        confidence_level=0.85
                    )
                    
                    # Convert Azure recommendations to our format
                    recommendations = []
                    for rec in azure_recommendations.get("recommendations", []):
                        recommendations.append(Recommendation(
                            title=rec.get("title", "Azure Recommendation"),
                            description=rec.get("description", ""),
                            priority=rec.get("priority", "medium"),
                            action=rec.get("action", "Review recommendation"),
                            type=rec.get("type", "Azure Advisor"),
                            source="Azure Advisor API",
                            category=rec.get("category", "optimization")
                        ))
                    
                    # Generate additional AI recommendations if enabled
                    ai_recommendations = await generate_ai_recommendations(
                        [{"service": k, "cost": v} for k, v in azure_forecast.get("service_breakdown", {}).items()],
                        daily_costs
                    )
                    recommendations.extend(ai_recommendations)
                    
                    return CTOAnalysisResponse(
                        daily_costs=daily_costs,
                        forecast_and_recommendations=ForecastAndRecommendations(
                            forecast=forecast_data,
                            recommendations=recommendations
                        ),
                        provider_used="Azure"
                    )
                    
            except Exception as e:
                logger.error(f"Failed to fetch Azure data: {e}")
        
        # Try AWS if Azure failed
        aws_creds = await get_integration_credentials(company_id, "AWS")
        if aws_creds.get("success"):
            logger.info("✅ Found AWS credentials, fetching real AWS data")
            try:
                credentials = aws_creds["credentials"]
                
                # Fetch real AWS data
                aws_result = await fetch_aws_forecast_and_recommendations(
                    credentials.get("access_key_id"),
                    credentials.get("secret_access_key"),
                    credentials.get("region", "us-east-1")
                )
                
                if aws_result and not aws_result.get("error"):
                    # Process AWS data
                    historical = aws_result.get("historical_data", {})
                    forecast = aws_result.get("forecast_data", {})
                    
                    daily_costs = DailyCosts(
                        dates=historical.get("dates", []),
                        costs=historical.get("costs", [])
                    )
                    
                    forecast_data = ForecastData(
                        dates=forecast.get("dates", []),
                        costs=forecast.get("costs", []),
                        monthly_projection=forecast.get("monthly_projection"),
                        confidence_level=0.80
                    )
                    
                    # Convert AWS recommendations to our format
                    recommendations = []
                    for rec in aws_result.get("recommendations", []):
                        recommendations.append(Recommendation(
                            title=rec.get("title", "AWS Recommendation"),
                            description=rec.get("description", ""),
                            priority=rec.get("priority", "medium"),
                            action=rec.get("action", "Review recommendation"),
                            type=rec.get("type", "AWS Trusted Advisor"),
                            source="AWS Cost Explorer API",
                            category=rec.get("category", "optimization")
                        ))
                    
                    # Generate additional AI recommendations if enabled
                    ai_recommendations = await generate_ai_recommendations(
                        [{"service": k, "cost": v} for k, v in aws_result.get("service_breakdown", {}).items()],
                        daily_costs
                    )
                    recommendations.extend(ai_recommendations)
                    
                    return CTOAnalysisResponse(
                        daily_costs=daily_costs,
                        forecast_and_recommendations=ForecastAndRecommendations(
                            forecast=forecast_data,
                            recommendations=recommendations
                        ),
                        provider_used="AWS"
                    )
                    
            except Exception as e:
                logger.error(f"Failed to fetch AWS data: {e}")
        
        # If we get here, no valid credentials were found
        logger.error(f"❌ No valid cloud provider credentials found for company {company_id}")
        raise HTTPException(
            status_code=404, 
            detail="No cloud provider integrations configured. Please set up Azure or AWS integration in the admin dashboard."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_cto_forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
