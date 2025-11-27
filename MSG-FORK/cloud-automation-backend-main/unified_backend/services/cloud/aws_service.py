"""
AWS Cost Explorer Service for Financial Data Ingestion
Fetches real cost data from AWS Cost and Usage Reports
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)

class AWSService:
    """Service for fetching AWS cost data using Cost Explorer API"""
    
    def __init__(self, aws_access_key_id: str, aws_secret_access_key: str, region: str = "us-east-1"):
        """
        Initialize AWS service with credentials
        
        Args:
            aws_access_key_id: AWS Access Key ID
            aws_secret_access_key: AWS Secret Access Key
            region: AWS region (default: us-east-1)
        """
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key
        self.region = region
        self.session = None
        self.ce_client = None
        
    def _initialize_session(self):
        """Initialize AWS session and Cost Explorer client"""
        try:
            self.session = boto3.Session(
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.region
            )
            self.ce_client = self.session.client('ce')
            logger.info(f"✅ AWS session initialized for region {self.region}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize AWS session: {e}")
            raise
    
    async def test_connection(self) -> bool:
        """Test AWS credentials and connection"""
        try:
            if not self.ce_client:
                self._initialize_session()
            
            # Test with a simple get_cost_and_usage call for last day
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=1)
            
            response = self.ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['BlendedCost']
            )
            
            logger.info("✅ AWS Cost Explorer connection test successful")
            return True
            
        except NoCredentialsError:
            logger.error("❌ AWS credentials not found or invalid")
            return False
        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error(f"❌ AWS API error: {error_code} - {e.response['Error']['Message']}")
            return False
        except Exception as e:
            logger.error(f"❌ AWS connection test failed: {e}")
            return False
    
    async def fetch_cost_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch AWS cost data for the specified number of days
        
        Args:
            days: Number of days to fetch data for (default: 30)
            
        Returns:
            List of cost records with AWS-specific structure
        """
        try:
            if not self.ce_client:
                self._initialize_session()
            
            # Calculate date range
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            logger.info(f"🔍 Fetching AWS cost data from {start_date} to {end_date}")
            
            # Fetch cost and usage data with detailed breakdown
            response = self.ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['BlendedCost', 'UnblendedCost', 'UsageQuantity'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'REGION'}
                    # Note: AWS Cost Explorer only allows max 2 GroupBy dimensions
                ]
            )
            
            # Process the response into standardized format
            cost_records = self._process_cost_response(response)
            
            logger.info(f"✅ Fetched {len(cost_records)} AWS cost records")
            return cost_records
            
        except NoCredentialsError:
            logger.error("❌ AWS credentials not found or invalid")
            raise Exception("AWS credentials not found or invalid")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"❌ AWS Cost Explorer API error: {error_code} - {error_message}")
            raise Exception(f"AWS API error: {error_code} - {error_message}")
        except Exception as e:
            logger.error(f"❌ Failed to fetch AWS cost data: {e}")
            raise Exception(f"Failed to fetch AWS cost data: {str(e)}")
    
    def _process_cost_response(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Process AWS Cost Explorer response into standardized cost records
        
        Args:
            response: Raw AWS Cost Explorer API response
            
        Returns:
            List of standardized cost records
        """
        cost_records = []
        
        for result in response.get('ResultsByTime', []):
            date = result['TimePeriod']['Start']
            
            # Convert date to proper format
            billing_date = datetime.strptime(date, '%Y-%m-%d').date()
            
            for group in result.get('Groups', []):
                try:
                    # Extract dimensions (only 2 now: SERVICE and REGION)
                    keys = group.get('Keys', [])
                    service_name = keys[0] if len(keys) > 0 else 'Unknown'
                    region = keys[1] if len(keys) > 1 else 'Unknown'
                    usage_type = 'Standard'  # Default since we can't get USAGE_TYPE with 2 GroupBy limit
                    
                    # Extract metrics
                    metrics = group.get('Metrics', {})
                    blended_cost = float(metrics.get('BlendedCost', {}).get('Amount', 0))
                    unblended_cost = float(metrics.get('UnblendedCost', {}).get('Amount', 0))
                    usage_quantity = float(metrics.get('UsageQuantity', {}).get('Amount', 0))
                    
                    # Get currency
                    currency = metrics.get('BlendedCost', {}).get('Unit', 'USD')
                    
                    # Create standardized record
                    cost_record = {
                        # AWS-specific fields
                        'billing_account_id': '',  # Will be populated from account info
                        'service_name': service_name,
                        'resource_id': f"{service_name}_{region}_{usage_type}_{date}",
                        'region': region,
                        'usage_type': usage_type,
                        'billed_cost': blended_cost,
                        'unblended_cost': unblended_cost,
                        'effective_cost': blended_cost,  # Use blended cost as effective cost
                        'list_cost': unblended_cost,    # Use unblended cost as list cost
                        'usage_quantity': usage_quantity,
                        
                        # Standard fields
                        'billing_currency': currency,
                        'billing_period_start': billing_date.strftime('%Y-%m-%d'),
                        'billing_period_end': billing_date.strftime('%Y-%m-%d'),
                        'charge_period_start': billing_date.strftime('%Y-%m-%d'),
                        'charge_period_end': billing_date.strftime('%Y-%m-%d'),
                        'charge_category': 'Usage',
                        'pricing_category': 'On-Demand',
                        
                        # Metadata
                        'provider': 'aws',
                        'fetched_at': datetime.now(timezone.utc).isoformat(),
                        'raw_data': group  # Keep original data for debugging
                    }
                    
                    # Only include records with actual cost
                    if blended_cost > 0 or unblended_cost > 0:
                        cost_records.append(cost_record)
                        
                except Exception as e:
                    logger.warning(f"Failed to process cost record: {e}")
                    continue
        
        return cost_records
    
    async def get_account_info(self) -> Dict[str, Any]:
        """
        Get AWS account information
        
        Returns:
            Dictionary with account ID and other metadata
        """
        try:
            if not self.session:
                self._initialize_session()
            
            # Get account ID using STS
            sts_client = self.session.client('sts')
            identity = sts_client.get_caller_identity()
            
            account_id = identity.get('Account', '')
            user_arn = identity.get('Arn', '')
            
            logger.info(f"✅ Retrieved AWS account info: {account_id}")
            
            return {
                'account_id': account_id,
                'user_arn': user_arn,
                'region': self.region
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get AWS account info: {e}")
            return {
                'account_id': '',
                'user_arn': '',
                'region': self.region
            }
    
    async def fetch_account_info(self) -> Dict[str, Any]:
        """
        Backwards-compatible wrapper used by integrations expecting `fetch_account_info`.
        """
        return await self.get_account_info()
    
    async def fetch_raw_api_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch raw AWS API response data without any processing for staging storage
        
        Args:
            days: Number of days to fetch data for (default: 30)
            
        Returns:
            List of raw API response records (flattened for CSV storage)
        """
        try:
            if not self.ce_client:
                self._initialize_session()
            
            # Calculate date range
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            logger.info(f"🔍 Fetching raw AWS API data from {start_date} to {end_date}")
            
            # Fetch cost and usage data
            response = self.ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['BlendedCost', 'UnblendedCost', 'UsageQuantity'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'REGION'}
                ]
            )
            
            # Flatten AWS API response for CSV storage (raw staging)
            raw_records = []
            for result in response.get('ResultsByTime', []):
                date = result['TimePeriod']['Start']
                
                for group in result.get('Groups', []):
                    # Create raw record with minimal flattening for CSV compatibility
                    raw_record = {
                        'TimePeriod_Start': result['TimePeriod']['Start'],
                        'TimePeriod_End': result['TimePeriod']['End'],
                        'Keys': ','.join(group.get('Keys', [])),  # Flatten array for CSV
                        'BlendedCost_Amount': group.get('Metrics', {}).get('BlendedCost', {}).get('Amount', ''),
                        'BlendedCost_Unit': group.get('Metrics', {}).get('BlendedCost', {}).get('Unit', ''),
                        'UnblendedCost_Amount': group.get('Metrics', {}).get('UnblendedCost', {}).get('Amount', ''),
                        'UnblendedCost_Unit': group.get('Metrics', {}).get('UnblendedCost', {}).get('Unit', ''),
                        'UsageQuantity_Amount': group.get('Metrics', {}).get('UsageQuantity', {}).get('Amount', ''),
                        'UsageQuantity_Unit': group.get('Metrics', {}).get('UsageQuantity', {}).get('Unit', ''),
                        'API_FetchedAt': datetime.now(timezone.utc).isoformat(),
                        'API_Source': 'aws_cost_explorer'
                    }
                    raw_records.append(raw_record)
            
            logger.info(f"✅ Fetched {len(raw_records)} raw AWS API records")
            return raw_records
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch raw AWS API data: {e}")
            raise Exception(f"Failed to fetch raw AWS API data: {str(e)}")

    async def fetch_all_data(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Fetch comprehensive AWS cost data (same pattern as Azure)
        
        Returns:
            List of cost records with AWS metadata
        """
        try:
            days = kwargs.get('days', 30)
            logger.info(f"🔍 Fetching all AWS data for {days} days")
            
            # 1. Fetch account information
            account_info = await self.fetch_account_info()
            
            # 2. Fetch cost data
            cost_data = await self.fetch_cost_data(days=days)
            
            # 3. Add AWS metadata to all records (same as Azure pattern)
            for record in cost_data:
                record.update(account_info)
                record['billing_account_id'] = account_info.get('account_id', '')
                record['sub_account_id'] = record.get('service_name', '')
                
            logger.info(f"✅ Fetched {len(cost_data)} AWS cost records")
            return cost_data
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch comprehensive AWS data: {e}")
            raise Exception(f"Failed to fetch comprehensive AWS data: {str(e)}")
