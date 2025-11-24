"""
Real Cloud API Service - Direct API calls to AWS, Azure, GCP
Uses real credentials from admin dashboard, not database data
"""
import logging
import requests
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

def fetch_azure_forecast_data(subscription_id, tenant_id, client_id, client_secret):
    """Fetch Azure cost forecast and historical data using Cost Management API"""
    try:
        # Get access token
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/token"
        token_data = {
            'grant_type': 'client_credentials',
            'client_id': client_id,
            'client_secret': client_secret,
            'resource': 'https://management.azure.com/'
        }
        
        logger.info("Getting Azure access token for cost data...")
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        access_token = token_response.json().get('access_token')
        
        if not access_token:
            raise Exception("Failed to get Azure access token")
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Initialize result structure to match AWS format
        result = {
            'success': False,
            'historical_data': {'dates': [], 'costs': []},
            'forecast_data': {'dates': [], 'costs': [], 'monthly_projection': 0},
            'service_breakdown': {},
            'confidence_level': 'High',
            'source': 'Azure Cost Management API',
            'recommendations': []
        }
        
        # Fetch historical data (last 30 days)
        today = datetime.utcnow().date()
        historical_start = today - timedelta(days=30)
        
        query_url = f"https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.CostManagement/query"
        
        historical_payload = {
            "type": "ActualCost",
            "timeframe": "Custom",
            "timePeriod": {
                "from": historical_start.strftime('%Y-%m-%dT00:00:00Z'),
                "to": today.strftime('%Y-%m-%dT00:00:00Z')
            },
            "dataset": {
                "granularity": "Daily",
                "aggregation": {
                    "totalCost": {"name": "PreTaxCost", "function": "Sum"}
                }
            }
        }
        
        logger.info(f"Fetching Azure historical cost data from {historical_start} to {today}...")
        historical_response = requests.post(
            query_url,
            headers=headers,
            json=historical_payload,
            params={'api-version': '2023-03-01'}
        )
        
        if historical_response.status_code == 200:
            historical_data = historical_response.json()
            
            # Extract historical values from Azure response
            if 'properties' in historical_data and 'rows' in historical_data['properties']:
                rows = historical_data['properties']['rows']
                columns = historical_data['properties'].get('columns', [])
                
                # Find column indices
                date_col_idx = None
                cost_col_idx = None
                for i, col in enumerate(columns):
                    if col.get('name') == 'UsageDate' or col.get('name') == 'Date':
                        date_col_idx = i
                    elif col.get('name') == 'PreTaxCost' or col.get('name') == 'Cost':
                        cost_col_idx = i
                
                if date_col_idx is not None and cost_col_idx is not None:
                    for row in rows:
                        if len(row) > max(date_col_idx, cost_col_idx):
                            usage_date = row[date_col_idx]
                            cost = float(row[cost_col_idx]) if row[cost_col_idx] is not None else 0.0
                            
                            # Convert date format if needed
                            if usage_date:
                                try:
                                    # Azure returns date as integer (YYYYMMDD)
                                    if isinstance(usage_date, int):
                                        date_str = str(usage_date)
                                        formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
                                    else:
                                        formatted_date = str(usage_date)[:10]  # Take first 10 chars for YYYY-MM-DD
                                    
                                    result['historical_data']['dates'].append(formatted_date)
                                    result['historical_data']['costs'].append(round(cost, 2))
                                except:
                                    continue
                
                logger.info(f"Retrieved {len(result['historical_data']['dates'])} days of Azure historical data")
        
        # Fetch forecast data
        forecast_url = f"https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.CostManagement/forecast"
        
        forecast_start = today + timedelta(days=1)
        forecast_end = forecast_start + timedelta(days=30)
        
        forecast_payload = {
            "type": "ActualCost",
            "timeframe": "Custom",
            "timePeriod": {
                "from": forecast_start.strftime('%Y-%m-%dT00:00:00Z'),
                "to": forecast_end.strftime('%Y-%m-%dT00:00:00Z')
            },
            "dataset": {
                "granularity": "Daily",
                "aggregation": {
                    "totalCost": {"name": "PreTaxCost", "function": "Sum"}
                }
            }
        }
        
        logger.info(f"Fetching Azure cost forecast from {forecast_start} to {forecast_end}...")
        forecast_response = requests.post(
            forecast_url,
            headers=headers,
            json=forecast_payload,
            params={'api-version': '2023-03-01'}
        )
        
        if forecast_response.status_code == 200:
            forecast_data = forecast_response.json()
            
            # Extract forecast values from Azure response
            if 'properties' in forecast_data and 'rows' in forecast_data['properties']:
                rows = forecast_data['properties']['rows']
                columns = forecast_data['properties'].get('columns', [])
                
                # Find column indices
                date_col_idx = None
                cost_col_idx = None
                for i, col in enumerate(columns):
                    if col.get('name') == 'UsageDate' or col.get('name') == 'Date':
                        date_col_idx = i
                    elif col.get('name') == 'PreTaxCost' or col.get('name') == 'Cost':
                        cost_col_idx = i
                
                if date_col_idx is not None and cost_col_idx is not None:
                    total_forecast = 0
                    for row in rows:
                        if len(row) > max(date_col_idx, cost_col_idx):
                            usage_date = row[date_col_idx]
                            cost = float(row[cost_col_idx]) if row[cost_col_idx] is not None else 0.0
                            total_forecast += cost
                            
                            # Convert date format if needed
                            if usage_date:
                                try:
                                    # Azure returns date as integer (YYYYMMDD)
                                    if isinstance(usage_date, int):
                                        date_str = str(usage_date)
                                        formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
                                    else:
                                        formatted_date = str(usage_date)[:10]
                                    
                                    result['forecast_data']['dates'].append(formatted_date)
                                    result['forecast_data']['costs'].append(round(cost, 2))
                                except:
                                    continue
                    
                    result['forecast_data']['monthly_projection'] = round(total_forecast, 2)
                    result['forecast_data']['trend'] = 'stable'
                    result['success'] = True
                    
                    logger.info(f"Retrieved {len(result['forecast_data']['dates'])} days of Azure forecast data")
        
        return result
            
    except Exception as e:
        logger.error(f"Error fetching Azure cost data: {e}")
        return {
            'success': False,
            'error': str(e),
            'historical_data': {'dates': [], 'costs': []},
            'forecast_data': {'dates': [], 'costs': [], 'monthly_projection': 0},
            'service_breakdown': {},
            'recommendations': []
        }

def get_azure_access_token_shell_style(tenant_id, client_id, client_secret):
    """Get Azure access token using client credentials"""
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/token"
    payload = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'resource': 'https://management.azure.com/'
    }
    resp = requests.post(token_url, data=payload)
    resp.raise_for_status()
    token = resp.json().get('access_token')
    if not token:
        raise Exception("Failed to get Azure access token")
    return token

def fetch_azure_recommendations(subscription_id, tenant_id, client_id, client_secret):
    """Fetch Azure cost optimization recommendations using Advisor API"""
    access_token = get_azure_access_token_shell_style(tenant_id, client_id, client_secret)
    url = f"https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.Advisor/recommendations?api-version=2023-01-01"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    
    recommendations = []
    for rec in data.get("value", []):
        props = rec.get("properties", {})
        short_desc = props.get("shortDescription", {})
        extended_props = props.get("extendedProperties", {})
        recommendations.append({
            "title": short_desc.get("solution", "Azure Advisor Recommendation"),
            "description": short_desc.get("problem", ""),
            "action": extended_props.get("savingsAmount", ""),
            "impact": props.get("impact", "Medium"),
            "category": props.get("category", "Cost"),
            "priority": "high" if props.get("impact","").lower() == "high" else "medium",
            "source": "Azure Advisor API",
            "type": "Cost Optimization"
        })
    return recommendations

def fetch_aws_forecast_and_recommendations(access_key, secret_key, region='us-east-1'):
    """Fetch AWS cost forecast and recommendations with enhanced error handling"""
    try:
        ce_client = boto3.client(
            'ce',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )

        forecast_data = {
            'success': False,
            'forecast_period': '30 days',
            'historical_data': {'dates': [], 'costs': []},  # Historical costs
            'forecast_data': {'dates': [], 'costs': [], 'monthly_projection': 0},  # Forecast
            'confidence_level': 'High',
            'source': 'AWS Cost Explorer',
            'recommendations': [],
            'service_breakdown': {},
            'fallback_used': False
        }

        # First, try to get historical data to check if we have enough for forecasting
        today = datetime.utcnow().date()
        historical_start = today - timedelta(days=30)  # Last 30 days of historical data
        
        logger.info(f"Checking historical data availability from {historical_start} to {today}")
        
        try:
            # Check if we have sufficient historical data
            historical_resp = ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': historical_start.strftime('%Y-%m-%d'),
                    'End': today.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['BlendedCost']
            )
            
            # Count days with actual cost data
            days_with_data = 0
            total_historical_cost = 0
            historical_costs = []
            historical_dates = []
            
            for result in historical_resp.get('ResultsByTime', []):
                date = result['TimePeriod']['Start']
                cost = float(result['Total']['BlendedCost']['Amount'])
                historical_dates.append(date)
                historical_costs.append(round(cost, 2))
                if cost > 0:
                    days_with_data += 1
                    total_historical_cost += cost
            
            # Store historical data
            forecast_data['historical_data']['dates'] = historical_dates
            forecast_data['historical_data']['costs'] = historical_costs
            
            logger.info(f"Found {days_with_data} days with cost data out of 30 days")
            
            if days_with_data < 7:
                logger.info("Insufficient historical data for accurate forecasting")
                forecast_data['error'] = f"Insufficient historical data: only {days_with_data} days with cost data. Need at least 7 days for reliable forecasting."
                forecast_data['recommendations'].append({
                    'type': 'data_requirement',
                    'priority': 'high',
                    'title': 'Insufficient Data for Forecasting',
                    'description': f'Only {days_with_data} days of cost data available. AWS Cost Explorer requires at least 7 days of historical cost data for accurate forecasting.',
                    'action': 'Continue using AWS services for a few more days to accumulate sufficient cost history, then try forecasting again.',
                    'source': 'Data Validation',
                    'category': 'Requirements'
                })
                
                # Still try to provide some basic recommendations
                if total_historical_cost > 0:
                    avg_daily_cost = total_historical_cost / max(days_with_data, 1)
                    forecast_data['recommendations'].append({
                        'type': 'cost_awareness',
                        'priority': 'medium',
                        'title': 'Current Spending Pattern',
                        'description': f'Based on {days_with_data} days of data, average daily cost is ${avg_daily_cost:.2f}.',
                        'action': f'Projected monthly cost (if current pattern continues): ${avg_daily_cost * 30:.2f}. Monitor usage and set up billing alerts.',
                        'source': 'Historical Analysis',
                        'category': 'Cost Awareness'
                    })
                
                return forecast_data
        
        except ClientError as hist_error:
            error_code = hist_error.response['Error']['Code']
            if error_code == 'AccessDeniedException':
                logger.info("Access denied for historical data - will try forecast anyway")
            else:
                logger.error(f"Historical data check failed: {hist_error}")

        # Try to get forecast data
        try:
            forecast_start = today + timedelta(days=1)  # Tomorrow
            forecast_end = forecast_start + timedelta(days=30)  # Next 30 days
            
            logger.info(f"Attempting to fetch forecast from {forecast_start} to {forecast_end}")
            
            forecast_resp = ce_client.get_cost_forecast(
                TimePeriod={
                    'Start': forecast_start.strftime('%Y-%m-%d'),
                    'End': forecast_end.strftime('%Y-%m-%d')
                },
                Metric='BLENDED_COST',
                Granularity='DAILY'
            )

            # Process successful forecast response
            total_forecast = 0
            for entry in forecast_resp.get('ForecastResultsByTime', []):
                date = entry['TimePeriod']['Start']
                cost = float(entry['MeanValue'])
                total_forecast += cost
                forecast_data['forecast_data']['dates'].append(date)
                forecast_data['forecast_data']['costs'].append(round(cost, 2))

            forecast_data['forecast_data']['monthly_projection'] = round(total_forecast, 2)
            forecast_data['forecast_data']['trend'] = 'stable'
            forecast_data['success'] = True
            
            logger.info(f"Successfully retrieved forecast with {len(forecast_data['forecast_data']['dates'])} data points")
            
        except ClientError as forecast_error:
            error_code = forecast_error.response['Error']['Code']
            error_message = forecast_error.response['Error']['Message']
            
            logger.error(f"AWS Forecast API Error: {error_code} - {error_message}")
            
            if error_code == 'AccessDeniedException':
                forecast_data['error'] = "AWS Cost Forecast permission denied. Your IAM user needs 'ce:GetCostForecast' permission."
                forecast_data['recommendations'].append({
                    'type': 'permission_required',
                    'priority': 'high',
                    'title': 'AWS Permissions Required',
                    'description': 'Your AWS IAM user/role lacks the necessary permissions to access Cost Explorer forecast.',
                    'action': 'Add the "ce:GetCostForecast" permission to your IAM policy, or ask your AWS administrator to grant Cost Explorer access.',
                    'source': 'AWS IAM',
                    'category': 'Permissions'
                })
            elif error_code == 'DataUnavailableException':
                forecast_data['error'] = "Insufficient cost data for forecasting. AWS requires at least 7 days of cost history."
                forecast_data['recommendations'].append({
                    'type': 'data_requirement',
                    'priority': 'medium',
                    'title': 'More Cost History Needed',
                    'description': 'AWS Cost Explorer needs at least 7 days of cost data to generate forecasts.',
                    'action': 'Continue using AWS services and try forecasting again in a few days once more cost history is available.',
                    'source': 'AWS Cost Explorer',
                    'category': 'Data Requirements'
                })
            else:
                forecast_data['error'] = f"AWS Forecast API error: {error_message}"
        
        # Always add general AWS recommendations regardless of forecast success
        forecast_data['recommendations'].extend([
            {
                'type': 'aws_general',
                'priority': 'low',
                'title': 'AWS Cost Optimization Review',
                'description': 'Regular cost optimization review recommended.',
                'action': 'Use AWS Trusted Advisor, Cost Explorer, and Compute Optimizer for comprehensive cost optimization.',
                'source': 'AWS Best Practices',
                'category': 'General'
            },
            {
                'type': 'aws_monitoring',
                'priority': 'medium',
                'title': 'Set Up Cost Monitoring',
                'description': 'Proactive cost monitoring helps prevent unexpected charges.',
                'action': 'Configure AWS Budgets with alerts, enable Cost Anomaly Detection, and review AWS Cost and Usage Reports.',
                'source': 'AWS Best Practices',
                'category': 'Monitoring'
            }
        ])

        return forecast_data

    except Exception as e:
        logger.error(f"Unexpected error in AWS forecast: {str(e)}")
        return {
            'success': False,
            'error': f'AWS forecast failed: {str(e)}',
            'historical_data': {'dates': [], 'costs': []},
            'forecast_data': {'dates': [], 'costs': [], 'monthly_projection': 0},
            'service_breakdown': {},
            'recommendations': [
                {
                    'type': 'error_recovery',
                    'priority': 'high',
                    'title': 'AWS Forecast Error',
                    'description': f'Unable to retrieve AWS cost forecast: {str(e)}',
                    'action': 'Check AWS credentials, permissions, and ensure you have sufficient cost history (at least 7 days).',
                    'source': 'Error Handler',
                    'category': 'Troubleshooting'
                }
            ]
        }
