"""
Azure Cost Management Service for Financial Data Ingestion
Fetches real cost data from Azure Cost Management APIs
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class AzureService:
    """Service for fetching Azure cost data using Cost Management API"""
    
    def __init__(self, client_id: str, client_secret: str, tenant_id: str, subscription_id: str):
        """
        Initialize Azure service with credentials
        
        Args:
            client_id: Azure Application (client) ID
            client_secret: Azure client secret
            tenant_id: Azure tenant ID
            subscription_id: Azure subscription ID
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.tenant_id = tenant_id
        self.subscription_id = subscription_id
        self.access_token = None
        
    async def _get_access_token(self) -> str:
        """Get Azure access token for authentication"""
        try:
            import requests
            
            # Azure OAuth2 token endpoint
            token_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
            
            token_data = {
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'scope': 'https://management.azure.com/.default'
            }
            
            response = requests.post(token_url, data=token_data)
            response.raise_for_status()
            
            token_info = response.json()
            self.access_token = token_info['access_token']
            
            logger.info("✅ Azure access token obtained successfully")
            return self.access_token
            
        except Exception as e:
            logger.error(f"❌ Failed to get Azure access token: {e}")
            raise Exception(f"Failed to authenticate with Azure: {str(e)}")
    
    async def test_connection(self) -> bool:
        """Test Azure credentials and connection"""
        try:
            access_token = await self._get_access_token()
            
            # Test with a simple cost management API call
            import requests
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test endpoint - get subscription info
            test_url = f"https://management.azure.com/subscriptions/{self.subscription_id}?api-version=2020-01-01"
            response = requests.get(test_url, headers=headers)
            response.raise_for_status()
            
            logger.info("✅ Azure connection test successful")
            return True
            
        except Exception as e:
            logger.error(f"❌ Azure connection test failed: {e}")
            return False
    
    async def fetch_cost_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch Azure cost data for the specified number of days
        
        Args:
            days: Number of days to fetch data for (default: 30)
            
        Returns:
            List of cost records with Azure-specific structure
        """
        try:
            access_token = await self._get_access_token()
            
            # Calculate date range
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            logger.info(f"🔍 Fetching Azure cost data from {start_date} to {end_date}")
            
            import requests
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Azure Cost Management API endpoint
            cost_url = f"https://management.azure.com/subscriptions/{self.subscription_id}/providers/Microsoft.CostManagement/query?api-version=2021-10-01"
            
            # Query payload for cost data
            query_payload = {
                "type": "ActualCost",
                "timeframe": "Custom",
                "timePeriod": {
                    "from": start_date.strftime('%Y-%m-%d'),
                    "to": end_date.strftime('%Y-%m-%d')
                },
                "dataset": {
                    "granularity": "Daily",
                    "aggregation": {
                        "totalCost": {
                            "name": "Cost",
                            "function": "Sum"
                        }
                    },
                    "grouping": [
                        {
                            "type": "Dimension",
                            "name": "ServiceName"
                        },
                        {
                            "type": "Dimension", 
                            "name": "ResourceLocation"
                        },
                        {
                            "type": "Dimension",
                            "name": "ResourceGroupName"
                        }
                    ]
                }
            }
            
            response = requests.post(cost_url, headers=headers, json=query_payload)
            response.raise_for_status()
            
            cost_data = response.json()
            
            # Process the response into standardized format
            cost_records = self._process_cost_response(cost_data)
            
            logger.info(f"✅ Fetched {len(cost_records)} Azure cost records")
            return cost_records
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch Azure cost data: {e}")
            raise Exception(f"Failed to fetch Azure cost data: {str(e)}")
    
    def _process_cost_response(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Process Azure Cost Management response into standardized cost records
        
        Args:
            response: Raw Azure Cost Management API response
            
        Returns:
            List of standardized cost records
        """
        cost_records = []
        
        properties = response.get('properties', {})
        rows = properties.get('rows', [])
        columns = properties.get('columns', [])
        
        # Create column mapping
        column_map = {col['name']: idx for idx, col in enumerate(columns)}
        
        for row in rows:
            try:
                # Extract data based on column mapping
                cost = float(row[column_map.get('Cost', 0)]) if 'Cost' in column_map else 0.0
                date_val = row[column_map.get('UsageDate', 1)] if 'UsageDate' in column_map else None
                service_name = row[column_map.get('ServiceName', 2)] if 'ServiceName' in column_map else 'Unknown'
                location = row[column_map.get('ResourceLocation', 3)] if 'ResourceLocation' in column_map else 'Unknown'
                resource_group = row[column_map.get('ResourceGroupName', 4)] if 'ResourceGroupName' in column_map else 'Unknown'
                
                # Extract currency from Azure response (check multiple possible column names)
                currency = 'USD'  # Default fallback
                for currency_col in ['Currency', 'BillingCurrency', 'CurrencyCode']:
                    if currency_col in column_map and len(row) > column_map[currency_col]:
                        currency = str(row[column_map[currency_col]]) or 'USD'
                        break
                
                # Parse date with better handling
                if date_val:
                    try:
                        if isinstance(date_val, str):
                            # Handle various string formats
                            if 'T' in date_val:  # ISO format: "2025-11-05T00:00:00Z"
                                billing_date = datetime.fromisoformat(date_val.replace('Z', '+00:00')).date()
                            else:  # Simple date: "2025-11-05"
                                billing_date = datetime.strptime(date_val[:10], '%Y-%m-%d').date()
                        elif isinstance(date_val, int):
                            # Handle timestamp - but Azure might return date as YYYYMMDD integer
                            if date_val > 19000000 and date_val < 99999999:  # Format: YYYYMMDD (20251105)
                                date_str = str(date_val)
                                billing_date = datetime.strptime(date_str, '%Y%m%d').date()
                            elif date_val > 1000000000000:  # Milliseconds timestamp
                                billing_date = datetime.fromtimestamp(date_val / 1000).date()
                            elif date_val > 1000000000:  # Seconds timestamp
                                billing_date = datetime.fromtimestamp(date_val).date()
                            else:
                                # If it's a small number, it might be days since epoch
                                billing_date = datetime(1970, 1, 1).date() + timedelta(days=date_val)
                        elif hasattr(date_val, 'date'):
                            # It's a datetime object
                            billing_date = date_val.date()
                        elif hasattr(date_val, 'strftime'):
                            # It's already a date object
                            billing_date = date_val
                        else:
                            logger.warning(f"Unknown date format for Azure: {date_val} (type: {type(date_val)})")
                            billing_date = datetime.now().date()
                    except Exception as date_error:
                        logger.warning(f"Failed to parse Azure date '{date_val}': {date_error}")
                        billing_date = datetime.now().date()
                else:
                    billing_date = datetime.now().date()
                
                # Create standardized record
                cost_record = {
                    # Azure-specific fields
                    'subscription_id': self.subscription_id,
                    'resource_group': resource_group,
                    'service_name': service_name,
                    'resource_id': f"{service_name}_{resource_group}_{location}_{billing_date}",
                    'location': location,
                    'cost': cost,
                    'billed_cost': cost,
                    'effective_cost': cost,
                    
                    # Standard fields
                    'billing_currency': currency,  # Use actual currency from Azure response
                    'billing_period_start': billing_date.strftime('%Y-%m-%d'),
                    'billing_period_end': billing_date.strftime('%Y-%m-%d'),
                    'charge_period_start': billing_date.strftime('%Y-%m-%d'),
                    'charge_period_end': billing_date.strftime('%Y-%m-%d'),
                    'charge_category': 'Usage',
                    'pricing_category': 'On-Demand',
                    
                    # Metadata
                    'provider': 'azure',
                    'fetched_at': datetime.now(timezone.utc).isoformat(),
                    'raw_data': row  # Keep original data for debugging
                }
                
                # Only include records with actual cost
                if cost > 0:
                    cost_records.append(cost_record)
                    
            except Exception as e:
                logger.warning(f"Failed to process Azure cost record: {e}")
                continue
        
        return cost_records
    
    async def fetch_all_data(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Fetch comprehensive Azure cost data
        
        Returns:
            List of cost records with Azure metadata
        """
        try:
            days = kwargs.get('days', 30)
            cost_records = await self.fetch_cost_data(days=days)
            
            # Add Azure metadata to all records
            for record in cost_records:
                record['billing_account_id'] = self.subscription_id
                record['sub_account_id'] = record.get('resource_group', '')
                record['tenant_id'] = self.tenant_id
            
            logger.info(f"✅ Fetched {len(cost_records)} Azure cost records")
            return cost_records
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch comprehensive Azure data: {e}")
            raise