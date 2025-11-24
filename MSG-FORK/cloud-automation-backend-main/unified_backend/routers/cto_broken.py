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
import boto3
from botocore.exceptions import ClientError

# Import the current company function
from main import get_current_company
from pydantic import BaseModel
from decouple import config

from lib.auth import get_current_user
from lib.db import query_many
from services.cloud_api_service import (
    fetch_azure_forecast_data, 
    fetch_azure_recommendations, 
    fetch_aws_forecast_and_recommendations
)

logger = logging.getLogger(__name__)

# Pydantic models
class ForecastRequest(BaseModel):
    provider: str  # 'aws', 'azure', or 'gcp'
    days: int = 30

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/cto", tags=["cto"])

# Real API functions from working app.py
async def get_integration_credentials(company_id: int, provider: str) -> Dict[str, Any]:
    """Get integration credentials from database for the specified provider"""
    try:
        from lib.db import query_one
        
        # Query the integration credentials table
        query = """
        SELECT 
            Provider,
            ConfigValue
        FROM IntegrationConfig 
        WHERE CompanyID = {company_id} 
          AND Provider = {provider}
          AND IsActive = 1
        """
        
        result = await query_one(query, {"company_id": company_id, "provider": provider.upper()})
        
        if not result:
            logger.warning(f"No credentials found for {provider} provider for company {company_id}")
            return {"success": False, "error": f"No {provider} credentials configured"}
        
        import json
        config_value = json.loads(result.get('ConfigValue', '{}'))
        
        return {"success": True, "credentials": config_value}
        
    except Exception as e:
        logger.error(f"Error getting integration credentials: {e}")
        return {"success": False, "error": str(e)}

def fetch_azure_forecast_data(subscription_id, tenant_id, client_id, client_secret):
    """Helper function to get cloud cost data from FinancialFact database table"""
    try:
        # Database imports
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
        from db import query_many
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Query FinancialFact table for cost data
        provider_name = provider.upper()  # Ensure consistent case
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        
        query = f"""
            SELECT 
                CAST(ChargePeriodStart AS DATE) as UsageDate,
                ServiceName,
                CAST(BilledCost AS FLOAT) as cost
            FROM FinancialFact 
            WHERE CompanyID = {company_id}
            AND Provider = '{provider_name}'
            AND ChargePeriodStart >= '{start_date_str}'
            AND ChargePeriodStart <= '{end_date_str}'
            AND BilledCost IS NOT NULL
            ORDER BY ChargePeriodStart, ServiceName
        """
        
        logger.info(f"Querying FinancialFact for company {company_id}, provider {provider_name} from {start_date_str} to {end_date_str}")
        
        results = await query_many(query, {})
        
        # Process data
        data = []
        for row in results:
            try:
                # Handle different possible date formats
                usage_date = row.get('UsageDate')
                if hasattr(usage_date, 'strftime'):
                    # It's a datetime object
                    date = usage_date.strftime('%Y-%m-%d')
                else:
                    # It's a string, use as-is or convert
                    date = str(usage_date)
                
                service = str(row.get('ServiceName', 'Unknown'))
                cost = float(row.get('cost', 0))
                currency = 'USD'  # Default currency since not available in FinancialFact table
                
                data.append({
                    'date': date,
                    'service': service,
                    'cost': cost,
                    'currency': currency
                })
            except (ValueError, TypeError) as e:
                logger.warning(f"Error processing database row {row}: {e}")
                continue
        
        logger.info(f"Successfully fetched {len(data)} {provider_name} cost records from database for company {company_id}")
        
        return {"success": True, "data": data}
        
    except Exception as e:
        logger.error(f"Failed to get {provider} cost data from database: {e}")
        return {"success": False, "error": str(e)}

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
        logger.error(f"❌ Failed to generate AI recommendations: {e}")
        return []

def generate_forecast(daily_costs: DailyCosts) -> ForecastData:
    """Generate realistic forecast based on historical data trends"""
    if not daily_costs.costs:
        return ForecastData(dates=[], costs=[], monthly_projection=0, confidence_level=0)

    # Calculate trend from historical data
    costs = daily_costs.costs
    recent_period = min(7, len(costs))
    recent_costs = costs[-recent_period:]
    avg_recent = sum(recent_costs) / len(recent_costs)
    
    # Simple linear trend calculation
    trend_slope = 0
    if len(costs) > 1:
        first_half = costs[:len(costs)//2]
        second_half = costs[len(costs)//2:]
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)
        trend_slope = (second_avg - first_avg) / (len(costs) / 2)

    # Generate 7-day forecast
    forecast_dates = []
    base_date = datetime.now()
    for i in range(1, 8):
        forecast_date = base_date + timedelta(days=i)
        forecast_dates.append(forecast_date.strftime('%Y-%m-%d'))

    forecast_costs = []
    for i in range(7):
        # Forecast based on recent average plus linear trend
        forecast_value = avg_recent + (trend_slope * (i + 1))
        # Apply simple smoothing based on standard deviation
        if len(costs) > 1:
            variance = sum((cost - avg_recent) ** 2 for cost in costs) / len(costs)
            std_dev = variance ** 0.5
        else:
            std_dev = 0
        
        # Use deterministic adjustment based on day position in forecast
        import math
        cycle_adjustment = math.sin((i + 1) * math.pi / 7) * std_dev * 0.1
        adjusted_forecast = max(0, forecast_value + cycle_adjustment)
        forecast_costs.append(adjusted_forecast)

    monthly_projection = avg_recent * 30
    confidence = min(0.95, max(0.6, 0.9 - (abs(trend_slope) / avg_recent) if avg_recent > 0 else 0.6))

    return ForecastData(
        dates=forecast_dates,
        costs=forecast_costs,
        monthly_projection=monthly_projection,
        confidence_level=confidence
    )

@router.post("/forecast")
async def get_cto_forecast(
    forecast_request: ForecastRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get REAL CTO cost forecast and AI recommendations using API credentials
    Available providers: aws, azure, gcp
    """
    try:
        # Extract values from request model
        provider = forecast_request.provider
        days = forecast_request.days
        company_id = current_user.get("company_id")
        
        logger.info(f"🔍 Fetching REAL CTO forecast data for company {company_id} for {days} days from provider: {provider}")
        
        # Validate provider parameter
        valid_providers = ['aws', 'azure', 'gcp']
        if provider.lower() not in valid_providers:
            raise HTTPException(status_code=400, detail=f"Invalid provider '{provider}'. Must be one of: {', '.join(valid_providers)}")
        
        # Get real API credentials from admin dashboard
        credentials_response = await get_integration_credentials(company_id, provider.upper())
        if not credentials_response.get('success'):
            raise HTTPException(status_code=503, detail=f"No {provider.upper()} credentials configured in Admin Dashboard. Please configure your {provider.upper()} credentials first.")
        
        credentials = credentials_response.get('credentials', {})
        logger.info(f"✅ Found {provider.upper()} credentials for company {company_id}")
        
        # Fetch REAL data from cloud provider APIs
        forecast_data = {}
        recommendations = []
        
        if provider.lower() == 'aws':
            logger.info("🔗 Fetching REAL AWS forecast and recommendations from Cost Explorer API")
            aws_access_key = credentials.get('aws_access_key_id')
            aws_secret_key = credentials.get('aws_secret_access_key') 
            aws_region = credentials.get('aws_default_region', 'us-east-1')
            
            if not aws_access_key or not aws_secret_key:
                raise HTTPException(status_code=503, detail="AWS credentials incomplete. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Admin Dashboard.")
            
            aws_result = fetch_aws_forecast_and_recommendations(aws_access_key, aws_secret_key, aws_region)
            
            if aws_result.get('success'):
                forecast_data = aws_result.get('forecast', {})
                recommendations = aws_result.get('recommendations', [])
                logger.info(f"✅ Successfully fetched AWS forecast with {len(forecast_data.get('costs', []))} data points")
            else:
                error_msg = aws_result.get('error', 'Unknown AWS API error')
                logger.error(f"❌ AWS API error: {error_msg}")
                # Still return recommendations if available
                recommendations = aws_result.get('recommendations', [])
                forecast_data = {'dates': [], 'costs': [], 'monthly_projection': 0}
                
        elif provider.lower() == 'azure':
            logger.info("🔗 Fetching REAL Azure forecast and recommendations from Cost Management API")
            subscription_id = credentials.get('azure_subscription_id')
            tenant_id = credentials.get('azure_tenant_id')
            client_id = credentials.get('azure_client_id')
            client_secret = credentials.get('azure_client_secret')
            
            if not all([subscription_id, tenant_id, client_id, client_secret]):
                raise HTTPException(status_code=503, detail="Azure credentials incomplete. Please configure AZURE_SUBSCRIPTION_ID, AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET in Admin Dashboard.")
            
            # Fetch forecast data
            azure_forecast = fetch_azure_forecast_data(subscription_id, tenant_id, client_id, client_secret)
            
            if azure_forecast.get('success'):
                forecast_data = azure_forecast.get('forecast', {})
                logger.info(f"✅ Successfully fetched Azure forecast with {len(forecast_data.get('costs', []))} data points")
            else:
                logger.error(f"❌ Azure forecast API error: {azure_forecast.get('error')}")
                forecast_data = {'dates': [], 'costs': [], 'monthly_projection': 0}
            
            # Fetch recommendations
            try:
                azure_recommendations = fetch_azure_recommendations(subscription_id, tenant_id, client_id, client_secret)
                recommendations = azure_recommendations
                logger.info(f"✅ Successfully fetched {len(recommendations)} Azure recommendations")
            except Exception as rec_error:
                logger.error(f"❌ Azure recommendations API error: {rec_error}")
                recommendations = []
                
        elif provider.lower() == 'gcp':
            # GCP implementation can be added here
            raise HTTPException(status_code=501, detail="GCP provider not yet implemented")
        
        # Convert cloud data to required format for processing
        cloud_data = []
        if forecast_data.get('dates') and forecast_data.get('costs'):
            for date, cost in zip(forecast_data['dates'], forecast_data['costs']):
                cloud_data.append({
                    'date': date,
                    'cost': cost,
                    'service': 'Total',  # Forecast is typically total cost
                    'provider': provider.upper()
                })
        
        provider_used = provider.upper()

        # Process daily costs from cloud data
        cost_by_date = {}
        for item in cloud_data:
            date = item.get('date', '')
            cost = float(item.get('cost', 0))
            cost_by_date[date] = cost_by_date.get(date, 0) + cost

        # Sort by date
        sorted_dates = sorted(cost_by_date.keys())
        daily_costs = DailyCosts(
            dates=sorted_dates,
            costs=[cost_by_date[date] for date in sorted_dates]
        )

        # Generate forecast from the real data
        forecast = generate_forecast(daily_costs)
        
        # Convert API recommendations to Recommendation objects
        formatted_recommendations = []
        for rec in recommendations:
            try:
                formatted_recommendations.append(Recommendation(
                    title=rec.get('title', 'API Recommendation'),
                    description=rec.get('description', 'Cloud provider recommendation'),
                    priority=rec.get('priority', 'medium'),
                    action=rec.get('action', 'Review recommendation'),
                    type=rec.get('type', 'API Optimization'),
                    source=rec.get('source', f'{provider.upper()} API'),
                    category=rec.get('category', 'optimization')
                ))
            except Exception as e:
                logger.warning(f"Failed to parse API recommendation: {e}")
                continue

        # Create forecast and recommendations response
        forecast_and_recommendations = ForecastAndRecommendations(
            forecast=forecast,
            recommendations=formatted_recommendations
        )

        # Return the structured response
        response = CTOAnalysisResponse(
            daily_costs=daily_costs,
            forecast_and_recommendations=forecast_and_recommendations,
            provider_used=provider_used
        )

        logger.info(f"✅ Generated CTO forecast with {len(formatted_recommendations)} recommendations from {provider_used}")
        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in CTO forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

        # Process daily costs from cloud data
        cost_by_date = {}
        for item in cloud_data:
            date = item.get('date', '')
            cost = float(item.get('cost', 0))
            cost_by_date[date] = cost_by_date.get(date, 0) + cost

        # Debug: Log actual cost values
        logger.info(f"🔍 Debug - Raw cloud data sample: {cloud_data[:3] if len(cloud_data) > 3 else cloud_data}")
        logger.info(f"🔍 Debug - Processed costs by date: {dict(list(cost_by_date.items())[:5])}")

        # Sort by date
        sorted_dates = sorted(cost_by_date.keys())
        daily_costs = DailyCosts(
            dates=sorted_dates,
            costs=[cost_by_date[date] for date in sorted_dates]
        )

        logger.info(f"🔍 Debug - Daily costs summary: {len(daily_costs.costs)} days, total: ${sum(daily_costs.costs):.4f}, avg: ${sum(daily_costs.costs)/len(daily_costs.costs) if daily_costs.costs else 0:.4f}")

        # Generate forecast
        forecast_data = generate_forecast(daily_costs)
        
        # Generate AI recommendations
        recommendations = await generate_ai_recommendations(cloud_data, daily_costs)

        response = CTOAnalysisResponse(
            daily_costs=daily_costs,
            forecast_and_recommendations=ForecastAndRecommendations(
                forecast=forecast_data,
                recommendations=recommendations
            ),
            provider_used=provider_used
        )

        logger.info(f"✅ Generated CTO forecast with {len(recommendations)} recommendations from {provider_used}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error generating CTO forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {str(e)}")
