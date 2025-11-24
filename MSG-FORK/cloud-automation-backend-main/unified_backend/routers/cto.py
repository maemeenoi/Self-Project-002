"""
CTO Dashboard Router
Handles CTO-specific endpoints including cost forecasting and AI recommendations
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import requests
import json
import os
import tempfile
import zipfile

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/cto", tags=["cto"])
security = HTTPBearer()

# Import the current company function  
from utils.auth import get_current_company

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


async def generate_forecast_for_company(company_id: int, forecast_request: "ForecastRequest") -> CTOAnalysisResponse:
    """
    Shared implementation for generating cloud cost forecast + AI recommendations.
    Used by both CTO and Engineer dashboards.
    """
    logger.info(f"🔍 Generating forecast for company {company_id}, provider: {forecast_request.provider}")

    requested_provider = (forecast_request.provider or "").strip().lower()
    if not requested_provider:
        requested_provider = "auto"

    # Explicit provider targeting behaves exactly as before
    if requested_provider == 'aws':
        logger.info("🔧 Explicitly requesting AWS data")
        aws_creds = await get_integration_credentials(company_id, "AWS")
        if aws_creds.get("success"):
            return await _fetch_aws_forecast(company_id, aws_creds)
        raise HTTPException(
            status_code=404,
            detail="AWS integration not configured. Please ask your administrator to add AWS credentials in the Admin dashboard."
        )

    if requested_provider == 'azure':
        logger.info("🔧 Explicitly requesting Azure data")
        azure_creds = await get_integration_credentials(company_id, "Azure")
        if azure_creds.get("success"):
            return await _fetch_azure_forecast(company_id, azure_creds)
        raise HTTPException(
            status_code=404,
            detail="Azure integration not configured. Please ask your administrator to add Azure credentials in the Admin dashboard."
        )

    if requested_provider == 'gcp':
        raise HTTPException(
            status_code=501,
            detail="GCP cost forecasting is not implemented yet. Please use Azure or AWS credentials."
        )

    # Auto-detect provider order: Azure first, then AWS
    last_error: Optional[str] = None
    for provider in ("Azure", "AWS"):
        creds = await get_integration_credentials(company_id, provider)
        if not creds.get("success"):
            logger.info(f"🔎 {provider} credentials unavailable: {creds.get('error')}")
            if creds.get("error"):
                last_error = creds["error"]
            continue

        logger.info(f"✅ Found {provider} credentials, attempting forecast generation")
        try:
            if provider.lower() == "azure":
                return await _fetch_azure_forecast(company_id, creds)
            return await _fetch_aws_forecast(company_id, creds)
        except HTTPException as http_exc:
            logger.error(f"{provider} forecast failed: {http_exc.detail}")
            last_error = http_exc.detail
        except Exception as e:
            logger.error(f"{provider} forecast error: {e}")
            last_error = str(e)

    message = "Please contact your administrator to configure at least one cloud provider integration (Azure or AWS)."
    if last_error:
        message += f" Last error: {last_error}"
    logger.error(f"❌ {message}")
    raise HTTPException(status_code=404, detail=message)

async def get_integration_credentials(company_id: int, provider: str):
    """Get integration credentials for a specific provider from the database"""
    try:
        from services.integration_service import IntegrationService
        from models.integration import IntegrationType
        
        service = IntegrationService()
        
        # Convert provider name to IntegrationType enum (lowercase)
        try:
            integration_type = IntegrationType(provider.lower())
        except ValueError:
            logger.warning(f"Invalid provider type: {provider}")
            return {"success": False, "error": f"Invalid provider type: {provider}"}
        
        # Get active integrations of the specified type for the company
        integrations = await service.get_company_integrations(
            company_id=company_id,
            integration_type=integration_type,
            include_secrets=True
        )
        
        if not integrations:
            logger.warning(f"No integration credentials found for company {company_id}, provider {provider}")
            return {"success": False, "error": f"No {provider} integration found"}
        
        # Use the first active integration
        integration = integrations[0]
        secrets = integration.secrets_json or {}
        config = integration.config_json or {}
        
        # Merge secrets and config into a single credentials dict
        credentials = {**config, **secrets}
        
        # Log what we're retrieving for debugging
        logger.info(f"🔍 Retrieved {provider} credentials - config keys: {list(config.keys())}, secrets keys: {list(secrets.keys())}")
        
        # Normalize AWS field names (Integration table uses aws_* prefix, but CTO router expects without prefix)
        if provider.lower() == 'aws':
            if 'aws_access_key_id' in credentials:
                credentials['access_key_id'] = credentials['aws_access_key_id']
            if 'aws_secret_access_key' in credentials:
                credentials['secret_access_key'] = credentials['aws_secret_access_key']
        
        # Validate Azure credentials
        if provider.lower() == 'azure':
            required_fields = ['tenant_id', 'client_id', 'client_secret', 'subscription_id']
            missing_fields = [field for field in required_fields if not credentials.get(field)]
            if missing_fields:
                logger.error(f"❌ Azure credentials missing fields: {missing_fields}")
                logger.error(f"Available credentials: {list(credentials.keys())}")
                return {"success": False, "error": f"Azure credentials incomplete. Missing: {', '.join(missing_fields)}"}
        
        return {"success": True, "credentials": credentials}
        
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

class ForecastRequest(BaseModel):
    days: int = 30
    provider: Optional[str] = None  # 'azure', 'aws', or None for auto-detect

async def _fetch_azure_forecast(company_id: int, azure_creds: dict) -> CTOAnalysisResponse:
    """Helper function to fetch Azure forecast data"""
    credentials = azure_creds["credentials"]
    
    # Fetch real Azure data (these are sync functions)
    azure_forecast = fetch_azure_forecast_data(
        credentials.get("subscription_id"),
        credentials.get("tenant_id"), 
        credentials.get("client_id"),
        credentials.get("client_secret")
    )
    
    azure_recommendations = fetch_azure_recommendations(
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
        # Note: fetch_azure_recommendations returns a list directly, not a dict
        recommendations = []
        azure_recs = azure_recommendations if isinstance(azure_recommendations, list) else []
        seen_recommendations = set()
        for rec in azure_recs:
            key = (rec.get("title"), rec.get("action"))
            if key in seen_recommendations:
                continue
            seen_recommendations.add(key)
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
    else:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Azure data: {azure_forecast.get('error', 'Unknown error')}")

async def _fetch_aws_forecast(company_id: int, aws_creds: dict) -> CTOAnalysisResponse:
    """Helper function to fetch AWS forecast data"""
    credentials = aws_creds["credentials"]
    
    # Fetch real AWS data (this is a sync function)
    aws_result = fetch_aws_forecast_and_recommendations(
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
    else:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AWS data: {aws_result.get('error', 'Unknown error')}")

@router.post("/forecast")
async def get_cto_forecast(
    forecast_request: ForecastRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get cost forecast and AI recommendations for CTO dashboard
    Uses real cloud provider APIs - NO MOCK DATA
    """
    try:
        company_id = await get_current_company(credentials)
        return await generate_forecast_for_company(company_id, forecast_request)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_cto_forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Terraform Generation Models
class TerraformRequest(BaseModel):
    recommendation: Dict[str, Any]
    cost_summary: Dict[str, Any]

class TerraformResponse(BaseModel):
    success: bool
    terraform_files: Dict[str, str]
    download_url: Optional[str] = None
    error: Optional[str] = None
    fallback_used: Optional[bool] = False
    message: Optional[str] = None


async def process_terraform_generation(company_id: int, request: TerraformRequest, download_prefix: str) -> TerraformResponse:
    """Shared Terraform generation workflow used by CTO and Engineer dashboards."""
    try:
        logger.info(f"🔧 Generating Terraform for company {company_id}, recommendation: {request.recommendation.get('title')}")
        
        result = generate_terraform_with_azure_openai(
            recommendation=request.recommendation,
            cost_summary=request.cost_summary
        )

        if result['success']:
            logger.info(f"✅ Successfully generated Terraform code with {len(result['terraform_files'])} files")
            zip_filename = create_terraform_zip(result['terraform_files'])
            return TerraformResponse(
                success=True,
                terraform_files=result['terraform_files'],
                download_url=f"{download_prefix}/{zip_filename}",
                fallback_used=result.get('fallback_used', False),
                message=result.get('message')
            )

        logger.error(f"❌ Failed to generate Terraform: {result.get('error')}")
        return TerraformResponse(
            success=False,
            terraform_files={},
            error=result.get('error', 'Unknown error generating Terraform')
        )

    except Exception as e:
        logger.error(f"Error in process_terraform_generation: {e}")
        return TerraformResponse(
            success=False,
            terraform_files={},
            error=str(e)
        )


def build_terraform_file_response(filename: str) -> FileResponse:
    """Return FileResponse for a generated Terraform ZIP."""
    file_path = os.path.join(tempfile.gettempdir(), filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename="terraform_optimization.zip",
        media_type="application/zip"
    )


def create_terraform_prompt_single(recommendation: Dict[str, Any], cost_summary: Dict[str, Any]) -> str:
    """Create a focused prompt for generating Terraform code for a single recommendation"""
    
    prompt = f"""You are an expert Terraform specialist and cloud cost optimization architect. Generate a production-ready Terraform MODULE to implement this specific cost optimization recommendation following Terraform best practices:

## 🎯 **Recommendation to Implement**
**Title**: {recommendation.get('title', 'Cost Optimization')}
**Priority**: {recommendation.get('priority', 'medium').upper()}
**Category**: {recommendation.get('category', 'Cost')}
**Description**: {recommendation.get('description', 'Optimize cloud costs')}
**Action Required**: {recommendation.get('action', 'Implement cost optimization')}

## 📊 **Current Environment Context**
- **Total Monthly Cost**: ${cost_summary.get('total_cost', 0):.2f}
- **Average Daily Cost**: ${cost_summary.get('avg_cost', 0):.2f}

## 🏗️ **Terraform MODULE Requirements**

Generate a complete, focused Terraform MODULE specifically addressing this recommendation. The module must include comprehensive cost monitoring capabilities.

### **MODULE FILE STRUCTURE:**

### **main.tf**
- Resource group for the recommendation implementation
- Azure Budget with configurable thresholds for this optimization
- Cost Management Export for tracking recommendation effectiveness
- Focused infrastructure implementation of the specific recommendation
- All resources properly tagged (cost monitoring, owner, project)
- Comments explaining how each resource addresses the recommendation

### **variables.tf**
- ALL configurable values as variables (subscription ID, emails, budgets, etc.)
- Variables specific to this recommendation with validation
- Default values optimized for cost efficiency
- Email address validation for notifications
- Budget amount validation (positive numbers)
- Detailed descriptions explaining cost implications of each variable

### **outputs.tf**
- Budget ID for integration with other monitoring
- Export storage path and container information
- Resource group ID and location
- Cost monitoring dashboard URLs
- All outputs needed for module reusability
- Success metrics for tracking recommendation effectiveness

### **README.md**
- Module overview and usage instructions
- Input variables documentation with examples
- Expected cost savings and impact analysis
- Deployment steps and Azure permissions required
- Integration examples with other modules
- Monitoring and validation instructions

## 💡 **TERRAFORM MODULE REQUIREMENTS**

### **IMPLEMENTATION GUIDELINES**
1. **Focus specifically on this recommendation** with comprehensive cost monitoring
2. **Use variables for ALL configurable values** (subscription, storage, emails, budgets)
3. **Implement input validation** for all variables where possible
4. **Include comprehensive tagging** for cost allocation and project tracking
5. **Add detailed comments** explaining cost implications of each resource
6. **Follow Terraform best practices** for module development
7. **Make it production-ready** with proper error handling

Generate a complete, focused Terraform MODULE that implements this specific recommendation with comprehensive cost monitoring capabilities.
"""
    
    return prompt


def generate_fallback_terraform(recommendation: Dict[str, Any], cost_summary: Dict[str, Any]) -> Dict[str, str]:
    """Generate basic Terraform template when AI is unavailable"""
    
    rec_title = recommendation.get('title', 'Cost Optimization')
    rec_desc = recommendation.get('description', 'Optimize cloud costs')
    rec_action = recommendation.get('action', 'Implement cost optimization')
    rec_priority = recommendation.get('priority', 'medium')
    
    main_tf = f'''# Terraform Configuration for: {rec_title}
# Priority: {rec_priority.upper()}
# Generated as fallback template

terraform {{
  required_version = ">= 1.0"
  required_providers {{
    azurerm = {{
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }}
  }}
}}

provider "azurerm" {{
  features {{}}
}}

# Resource Group for Cost Optimization
resource "azurerm_resource_group" "cost_optimization" {{
  name     = var.resource_group_name
  location = var.location
  
  tags = {{
    Environment = var.environment
    Purpose     = "cost-optimization"
    Recommendation = "{rec_title}"
    ManagedBy   = "Terraform"
  }}
}}

# Azure Budget for Cost Monitoring
resource "azurerm_consumption_budget_resource_group" "monthly_budget" {{
  name              = "${{var.resource_group_name}}-budget"
  resource_group_id = azurerm_resource_group.cost_optimization.id
  
  amount     = var.monthly_budget_amount
  time_grain = "Monthly"
  
  time_period {{
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  }}
  
  notification {{
    enabled   = true
    threshold = 80
    operator  = "GreaterThan"
    
    contact_emails = var.alert_emails
  }}
  
  notification {{
    enabled   = true
    threshold = 100
    operator  = "GreaterThan"
    
    contact_emails = var.alert_emails
  }}
}}

# TODO: Add specific resources for implementing: {rec_desc}
# Action required: {rec_action}
'''

    variables_tf = f'''# Variables for {rec_title}

variable "resource_group_name" {{
  description = "Name of the resource group for cost optimization"
  type        = string
  default     = "rg-cost-optimization"
}}

variable "location" {{
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}}

variable "environment" {{
  description = "Environment name"
  type        = string
  default     = "production"
}}

variable "monthly_budget_amount" {{
  description = "Monthly budget amount in USD"
  type        = number
  default     = {cost_summary.get('total_cost', 1000) * 1.1}
  
  validation {{
    condition     = var.monthly_budget_amount > 0
    error_message = "Budget amount must be greater than 0"
  }}
}}

variable "alert_emails" {{
  description = "List of email addresses for budget alerts"
  type        = list(string)
  default     = ["admin@example.com"]
}}

variable "tags" {{
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {{}}
}}
'''

    outputs_tf = f'''# Outputs for {rec_title}

output "resource_group_id" {{
  description = "ID of the created resource group"
  value       = azurerm_resource_group.cost_optimization.id
}}

output "resource_group_name" {{
  description = "Name of the created resource group"
  value       = azurerm_resource_group.cost_optimization.name
}}

output "resource_group_location" {{
  description = "Location of the resource group"
  value       = azurerm_resource_group.cost_optimization.location
}}

output "budget_id" {{
  description = "ID of the budget resource"
  value       = azurerm_consumption_budget_resource_group.monthly_budget.id
}}
'''

    readme_md = f'''# {rec_title} - Terraform Module

**Priority:** {rec_priority.upper()}

## Description

{rec_desc}

## Action Required

{rec_action}

## Usage

```hcl
module "cost_optimization" {{
  source = "./path/to/this/module"
  
  resource_group_name   = "my-cost-optimization-rg"
  location              = "East US"
  monthly_budget_amount = {cost_summary.get('total_cost', 1000) * 1.1}
  alert_emails          = ["your-email@example.com"]
}}
```

## Requirements

- Terraform >= 1.0
- Azure Provider ~> 3.0
- Azure subscription with appropriate permissions

## Current Cost Context

- **Total Monthly Cost:** ${cost_summary.get('total_cost', 0):.2f}
- **Average Daily Cost:** ${cost_summary.get('avg_cost', 0):.2f}

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| resource_group_name | Name of the resource group | string | "rg-cost-optimization" | no |
| location | Azure region | string | "East US" | no |
| monthly_budget_amount | Monthly budget in USD | number | {cost_summary.get('total_cost', 1000) * 1.1} | no |
| alert_emails | Budget alert emails | list(string) | ["admin@example.com"] | no |

## Outputs

| Name | Description |
|------|-------------|
| resource_group_id | ID of the resource group |
| budget_id | ID of the budget resource |

## Note

⚠️ This is a **fallback template** generated because Azure OpenAI was unavailable.
You may need to customize this template to fully implement the recommendation.

## Next Steps

1. Review and customize the template for your specific needs
2. Add specific resources to implement: {rec_action}
3. Test in a non-production environment first
4. Apply with: `terraform init && terraform plan && terraform apply`

## Support

For full AI-generated Terraform code, please try again when Azure OpenAI service is available.
'''

    return {
        'main.tf': main_tf,
        'variables.tf': variables_tf,
        'outputs.tf': outputs_tf,
        'README.md': readme_md
    }


def generate_terraform_with_azure_openai(recommendation: Dict[str, Any], cost_summary: Dict[str, Any]) -> Dict[str, Any]:
    """Generate Terraform code using Azure OpenAI based on a cost recommendation"""
    try:
        # Import Azure OpenAI service
        from services.azure_openai_service import azure_openai_service
        from decouple import config
        
        # Get Azure OpenAI configuration
        api_key = config('AZURE_OPENAI_API_KEY', default='')
        endpoint = config('AZURE_OPENAI_ENDPOINT', default='')
        deployment_name = config('AZURE_OPENAI_DEPLOYMENT_NAME', default='')
        
        if not api_key or not endpoint or not deployment_name:
            logger.error("Azure OpenAI not configured, using fallback template")
            return {
                'success': True,
                'terraform_files': generate_fallback_terraform(recommendation, cost_summary),
                'fallback_used': True,
                'message': 'Azure OpenAI not configured. Generated basic template instead.'
            }
        
        # Create prompt
        prompt = create_terraform_prompt_single(recommendation, cost_summary)
        
        logger.info(f"Generating Terraform code for recommendation: {recommendation.get('title')}")
        
        # Call Azure OpenAI with retry logic for rate limiting
        import httpx
        import time
        
        headers = {
            'api-key': api_key,
            'Content-Type': 'application/json'
        }
        
        data = {
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are an expert Terraform specialist. Generate focused, production-ready Terraform code that implements cost optimization recommendations. Include main.tf, variables.tf, outputs.tf, and README.md files.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 12000,
            'temperature': 0.1,
            'top_p': 0.1
        }
        
        # Retry logic for rate limiting (429 errors)
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                response = httpx.post(
                    f"{endpoint}/openai/deployments/{deployment_name}/chat/completions?api-version=2025-01-01-preview",
                    headers=headers,
                    json=data,
                    timeout=120.0
                )
                
                if response.status_code == 200:
                    break  # Success!
                elif response.status_code == 429:
                    # Rate limit error - wait and retry
                    if attempt < max_retries - 1:
                        wait_time = retry_delay * (2 ** attempt)  # Exponential backoff
                        logger.warning(f"Rate limit hit (429), retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"Rate limit exceeded after {max_retries} retries, using fallback template")
                        return {
                            'success': True,
                            'terraform_files': generate_fallback_terraform(recommendation, cost_summary),
                            'fallback_used': True,
                            'message': 'Azure OpenAI rate limit exceeded. Generated basic template instead. Please increase your Azure OpenAI quota for AI-generated code.'
                        }
                else:
                    logger.error(f"Azure OpenAI API error: {response.status_code} - {response.text}")
                    return {
                        'success': False,
                        'error': f'Azure OpenAI API error: {response.status_code}',
                        'terraform_files': {}
                    }
            except Exception as req_error:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)
                    logger.warning(f"Request error, retrying in {wait_time}s: {str(req_error)}")
                    time.sleep(wait_time)
                    continue
                else:
                    raise
        
        if response.status_code != 200:
            logger.error(f"Azure OpenAI API error after retries: {response.status_code}")
            return {
                'success': False,
                'error': f'Azure OpenAI API error: {response.status_code}',
                'terraform_files': {}
            }
        
        result = response.json()
        terraform_code = result['choices'][0]['message']['content']
        
        logger.info(f"Raw Azure OpenAI response length: {len(terraform_code)} characters")
        
        # Parse the response to extract different files
        terraform_files = parse_terraform_response(terraform_code)
        
        if not terraform_files or all(len(content.strip()) < 100 for content in terraform_files.values()):
            logger.warning("Azure OpenAI response was too short or incomplete")
            return {
                'success': False,
                'error': 'Generated Terraform code was incomplete or too short',
                'terraform_files': {}
            }
        
        return {
            'success': True,
            'terraform_files': terraform_files,
            'raw_response': terraform_code,
            'tokens_used': result.get('usage', {}).get('total_tokens')
        }
        
    except Exception as e:
        logger.error(f"Error generating Terraform with Azure OpenAI: {e}")
        return {
            'success': False,
            'error': str(e),
            'terraform_files': {}
        }


def parse_terraform_response(terraform_code: str) -> Dict[str, str]:
    """Parse the Terraform response to extract individual files"""
    import re
    
    files = {}
    
    logger.info(f"Parsing Terraform response ({len(terraform_code)} chars)")
    
    # Extract variables section
    variables_pattern = r'variable\s+"[^"]+"\s*\{(?:[^{}]*|\{[^{}]*\})*\}(?:\s*variable\s+"[^"]+"\s*\{(?:[^{}]*|\{[^{}]*\})*\})*'
    variables_match = re.search(variables_pattern, terraform_code, re.DOTALL)
    if variables_match:
        files['variables.tf'] = variables_match.group(0).strip()
        logger.info(f"Extracted variables.tf: {len(files['variables.tf'])} chars")
    
    # Extract outputs section
    outputs_pattern = r'output\s+"[^"]+"\s*\{(?:[^{}]*|\{[^{}]*\})*\}(?:\s*output\s+"[^"]+"\s*\{(?:[^{}]*|\{[^{}]*\})*\})*'
    outputs_match = re.search(outputs_pattern, terraform_code, re.DOTALL)
    if outputs_match:
        files['outputs.tf'] = outputs_match.group(0).strip()
        logger.info(f"Extracted outputs.tf: {len(files['outputs.tf'])} chars")
    
    # Extract README section
    readme_patterns = [
        r'(?:```markdown\s*)?(# .*?(?:\n.*?)*?)(?:```|\Z)',
        r'markdown\s*\n(# .*?)(?:\n```|\Z)',
    ]
    
    for pattern in readme_patterns:
        try:
            readme_match = re.search(pattern, terraform_code, re.DOTALL | re.IGNORECASE)
            if readme_match:
                readme_content = readme_match.group(1).strip()
                if len(readme_content) > 100 and ('# ' in readme_content or '## ' in readme_content):
                    files['README.md'] = readme_content
                    logger.info(f"Extracted README.md: {len(files['README.md'])} chars")
                    break
        except re.error:
            continue
    
    # Extract main.tf (everything else - providers, resources, etc.)
    main_tf_content = terraform_code
    
    # Remove variables and outputs from main content if they were extracted
    if 'variables.tf' in files:
        main_tf_content = re.sub(variables_pattern, '', main_tf_content, flags=re.DOTALL)
    
    if 'outputs.tf' in files:
        main_tf_content = re.sub(outputs_pattern, '', main_tf_content, flags=re.DOTALL)
    
    # Clean up main.tf content
    main_tf_content = re.sub(r'```(?:hcl|terraform|markdown)?\s*', '', main_tf_content)
    main_tf_content = re.sub(r'^\s*---\s*$', '', main_tf_content, flags=re.MULTILINE)
    main_tf_content = re.sub(r'\n\s*\n\s*\n+', '\n\n', main_tf_content)
    main_tf_content = main_tf_content.strip()
    
    # Validate main.tf has meaningful content
    if main_tf_content and len(main_tf_content) > 50:
        has_terraform_content = any(keyword in main_tf_content for keyword in ['terraform {', 'provider ', 'resource ', 'data '])
        if has_terraform_content:
            files['main.tf'] = main_tf_content
            logger.info(f"Extracted main.tf: {len(files['main.tf'])} chars")
    
    # Ensure we have essential files with minimal content if missing
    if 'variables.tf' not in files:
        files['variables.tf'] = '''variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-cost-optimization"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}'''
        logger.info("Generated basic variables.tf")
    
    if 'outputs.tf' not in files:
        files['outputs.tf'] = '''output "resource_group_id" {
  description = "ID of the created resource group"
  value       = "See main.tf for resources"
}'''
        logger.info("Generated basic outputs.tf")
    
    if 'README.md' not in files:
        files['README.md'] = f'''# Terraform Cost Optimization Module

This module implements cost optimization recommendations for cloud infrastructure.

## Usage

```hcl
module "cost_optimization" {{
  source = "./path/to/this/module"
  
  resource_group_name = "my-resource-group"
  location            = "East US"
}}
```

## Requirements

- Terraform 1.0+
- Azure Provider

## Inputs

See variables.tf for all available inputs.

## Outputs

See outputs.tf for all outputs.
'''
        logger.info("Generated basic README.md")
    
    logger.info(f"Final parsed files: {list(files.keys())}")
    return files


def create_terraform_zip(terraform_files: Dict[str, str]) -> str:
    """Create a downloadable ZIP file containing Terraform files"""
    import tempfile
    
    # Create a unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f'terraform_optimization_{timestamp}.zip'
    
    # Use tempfile directory
    zip_path = os.path.join(tempfile.gettempdir(), zip_filename)
    
    # Create ZIP file
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for filename, content in terraform_files.items():
            if content and content.strip():
                zipf.writestr(filename, content)
            else:
                logger.warning(f"Skipping empty file: {filename}")
    
    logger.info(f"Created ZIP file: {zip_path}")
    return zip_filename


# @router.post("/generate_terraform", response_model=TerraformResponse)
# async def generate_terraform_for_recommendation(
#     request: TerraformRequest,
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Generate Terraform code for a single cost optimization recommendation
#     Uses Azure OpenAI to create production-ready Terraform modules
#     """
#     company_id = await get_current_company(credentials)
#     return await process_terraform_generation(
#         company_id,
#         request,
#         download_prefix="/api/cto/download_terraform"
#     )


# @router.get("/download_terraform/{filename}")
# async def download_terraform_zip(
#     filename: str,
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """Download the generated Terraform ZIP file"""
#     await get_current_company(credentials)
#     return build_terraform_file_response(filename)
