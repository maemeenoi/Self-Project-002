"""
Data Ingestion Service for Unified Backend

Handles the complete data processing pipeline:
1. Standardize and clean raw data from integrations
2. Upload raw data to Azure staging storage
3. Process and cleanse data 
4. Upload cleansed data to Azure cleansed storage
5. Insert data into SQL database
6. Track sync batches and metadata
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import json
import csv
from io import StringIO, BytesIO

# Database imports
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'lib'))
from lib.db import query_one, query_many, execute_sql, insert_and_return

# Services
from services.cloud.azure_storage import UnifiedAzureBlobStorage

logger = logging.getLogger(__name__)


class DataIngestionService:
    """
    Complete data ingestion pipeline for integration data
    Supports both workflow data (GitHub/Jira -> WorkflowFact) and financial data (AWS/Azure/GCP -> FinancialFact)
    """
    
    def __init__(self):
        """Initialize the data ingestion service"""
        self.storage = UnifiedAzureBlobStorage()
        
    async def process_raw_data(self, company_id: int, source: str, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Main processing function that handles the complete data flow (original approach):
        1. Create sync batch record
        2. Save raw data as comprehensive CSV (all original columns)
        3. Standardize and clean data for database
        4. Upload cleansed data as standardized CSV
        5. Insert into SQL database
        6. Update batch completion
        
        Args:
            company_id: Company identifier
            source: 'jira' or 'github'
            raw_data: List of raw data records from integration (full detail)
            
        Returns:
            Dictionary with processing results and statistics
        """
        batch_id = None
        
        try:
            logger.info(f"🔍 DATA INGESTION DEBUG: Starting data processing for {source} - Company {company_id} - {len(raw_data)} records")
            logger.info(f"🔍 DATA INGESTION DEBUG: Sample raw data: {raw_data[0] if raw_data else 'NO RAW DATA'}")
            
            # Step 1: Create batch record
            batch_id = await self._create_sync_batch(company_id, source, len(raw_data))
            logger.info(f"🔍 DATA INGESTION DEBUG: Created sync batch {batch_id}")
            
            # Step 2: Save raw data to staging as comprehensive CSV (all original columns preserved)
            staging_blob_name = await self._upload_raw_data(raw_data, source, batch_id, company_id)
            logger.info(f"Uploaded raw data to staging: {staging_blob_name}")
            
            # Step 3: Standardize and clean data for database
            cleansed_data = self._standardize_data(raw_data, source, company_id, batch_id)
            logger.info(f"Standardized {len(cleansed_data)} records")
            
            # Step 4: Upload cleansed data as standardized CSV 
            cleansed_blob_name = await self._upload_cleansed_standardized_data(cleansed_data, source, batch_id, company_id)
            logger.info(f"Uploaded cleansed data: {cleansed_blob_name}")
            
            # Step 5: Insert into SQL database
            inserted_count = await self._insert_into_database(cleansed_data, source)
            logger.info(f"Inserted {inserted_count} records into database")
            
            # Step 6: Update batch completion
            await self._complete_sync_batch(batch_id, inserted_count, staging_blob_name, cleansed_blob_name)
            logger.info(f"Completed sync batch {batch_id}")
            
            result = {
                "success": True,
                "batch_id": batch_id,
                "source": source,
                "company_id": company_id,
                "raw_records": len(raw_data),
                "cleansed_records": len(cleansed_data),
                "inserted_records": inserted_count,
                "staging_blob": staging_blob_name,
                "cleansed_blob": cleansed_blob_name,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            logger.info(f"Data processing completed successfully: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Data processing failed: {str(e)}")
            # Update batch with error status
            if batch_id:
                await self._fail_sync_batch(batch_id, str(e))
            raise Exception(f"Data ingestion failed: {str(e)}")
    
    async def process_financial_data_with_separation(self, company_id: int, source: str, raw_data: List[Dict[str, Any]], processed_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process financial/cost data with pre-separated raw and processed data:
        1. Create sync batch record
        2. Save raw data as comprehensive CSV (truly raw API response)
        3. Standardize processed data for database (FinancialFact schema)
        4. Upload cleansed data as standardized CSV
        5. Insert into SQL database (FinancialFact table)
        6. Update batch completion
        
        Args:
            company_id: Company identifier
            source: 'aws', 'azure', or 'gcp'
            raw_data: Raw API response data for staging storage
            processed_data: Pre-processed data ready for standardization and database insertion
            
        Returns:
            Dictionary with processing results and statistics
        """
        batch_id = None
        
        try:
            logger.info(f"🔍 FINANCIAL DATA INGESTION (SEPARATED): Starting financial data processing for {source} - Company {company_id}")
            logger.info(f"🔍 Raw records: {len(raw_data)}, Processed records: {len(processed_data)}")
            
            # Step 1: Create batch record
            batch_id = await self._create_sync_batch(company_id, source, len(processed_data))
            logger.info(f"🔍 FINANCIAL DATA INGESTION: Created sync batch {batch_id}")
            
            # Step 2: Save raw data to staging as comprehensive CSV (truly raw API response)
            staging_blob_name = await self._upload_raw_financial_data(raw_data, source, batch_id, company_id)
            logger.info(f"Uploaded truly raw financial data to staging: {staging_blob_name}")
            
            # Step 3: Standardize processed data for FinancialFact database
            cleansed_data = self._standardize_financial_data(processed_data, source, company_id, batch_id)
            logger.info(f"Standardized {len(cleansed_data)} financial records")
            
            # Step 4: Upload cleansed data as standardized CSV 
            cleansed_blob_name = await self._upload_cleansed_financial_data(cleansed_data, source, batch_id, company_id)
            logger.info(f"Uploaded cleansed financial data: {cleansed_blob_name}")
            
            # Step 5: Insert into FinancialFact table
            inserted_count = await self._insert_financial_into_database(cleansed_data, source)
            logger.info(f"Inserted {inserted_count} financial records into database")
            
            # Step 6: Update batch completion
            await self._complete_sync_batch(batch_id, inserted_count, staging_blob_name, cleansed_blob_name)
            logger.info(f"Completed financial sync batch {batch_id}")
            
            result = {
                "success": True,
                "batch_id": batch_id,
                "source": source,
                "company_id": company_id,
                "raw_records": len(raw_data),
                "processed_records": len(processed_data),
                "cleansed_records": len(cleansed_data),
                "inserted_records": inserted_count,
                "staging_blob": staging_blob_name,
                "cleansed_blob": cleansed_blob_name,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data_type": "financial",
                "processing_mode": "separated_raw_processed"
            }
            
            logger.info(f"Financial data processing (separated) completed successfully: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Financial data processing (separated) failed: {str(e)}")
            # Update batch with error status
            if batch_id:
                await self._fail_sync_batch(batch_id, str(e))
            raise Exception(f"Financial data ingestion (separated) failed: {str(e)}")

    async def process_financial_data(self, company_id: int, source: str, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process financial/cost data from cloud providers (AWS, Azure, GCP):
        1. Create sync batch record
        2. Save raw data as comprehensive CSV (all original columns)
        3. Standardize and clean data for database (FinancialFact schema)
        4. Upload cleansed data as standardized CSV
        5. Insert into SQL database (FinancialFact table)
        6. Update batch completion
        
        Args:
            company_id: Company identifier
            source: 'aws', 'azure', or 'gcp'
            raw_data: List of raw cost/billing data records from cloud provider API
            
        Returns:
            Dictionary with processing results and statistics
        """
        batch_id = None
        
        try:
            logger.info(f"🔍 FINANCIAL DATA INGESTION: Starting financial data processing for {source} - Company {company_id} - {len(raw_data)} records")
            logger.info(f"🔍 FINANCIAL DATA INGESTION: Sample raw data: {raw_data[0] if raw_data else 'NO RAW DATA'}")
            
            # Step 1: Create batch record
            batch_id = await self._create_sync_batch(company_id, source, len(raw_data))
            logger.info(f"🔍 FINANCIAL DATA INGESTION: Created sync batch {batch_id}")
            
            # Step 2: Save raw data to staging as comprehensive CSV (all original columns preserved)
            staging_blob_name = await self._upload_raw_financial_data(raw_data, source, batch_id, company_id)
            logger.info(f"Uploaded raw financial data to staging: {staging_blob_name}")
            
            # Step 3: Standardize and clean data for FinancialFact database
            cleansed_data = self._standardize_financial_data(raw_data, source, company_id, batch_id)
            logger.info(f"Standardized {len(cleansed_data)} financial records")
            
            # Step 4: Upload cleansed data as standardized CSV 
            cleansed_blob_name = await self._upload_cleansed_financial_data(cleansed_data, source, batch_id, company_id)
            logger.info(f"Uploaded cleansed financial data: {cleansed_blob_name}")
            
            # Step 5: Insert into FinancialFact table
            inserted_count = await self._insert_financial_into_database(cleansed_data, source)
            logger.info(f"Inserted {inserted_count} financial records into database")
            
            # Step 6: Update batch completion
            await self._complete_sync_batch(batch_id, inserted_count, staging_blob_name, cleansed_blob_name)
            logger.info(f"Completed financial sync batch {batch_id}")
            
            result = {
                "success": True,
                "batch_id": batch_id,
                "source": source,
                "company_id": company_id,
                "raw_records": len(raw_data),
                "cleansed_records": len(cleansed_data),
                "inserted_records": inserted_count,
                "staging_blob": staging_blob_name,
                "cleansed_blob": cleansed_blob_name,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data_type": "financial"
            }
            
            logger.info(f"Financial data processing completed successfully: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Financial data processing failed: {str(e)}")
            # Update batch with error status
            if batch_id:
                await self._fail_sync_batch(batch_id, str(e))
            raise Exception(f"Financial data ingestion failed: {str(e)}")
    
    async def _create_sync_batch(self, company_id: int, source: str, record_count: int) -> int:
        """Create a sync batch record and return the batch ID"""
        try:
            batch_data = {
                "CompanyID": company_id,
                "SourceSystem": source,
                "IsFullSnapshot": 1,  # Default to full snapshot
                "StartedAt": datetime.utcnow(),
                "RecordsIngested": 0
            }
            
            query = """
                INSERT INTO SyncBatch (CompanyID, SourceSystem, IsFullSnapshot, StartedAt)
                OUTPUT INSERTED.BatchID
                VALUES ({CompanyID}, {SourceSystem}, {IsFullSnapshot}, {StartedAt})
            """
            
            result = await insert_and_return(query, batch_data)
            return result["BatchID"]
            
        except Exception as e:
            logger.error(f"Failed to create sync batch: {e}")
            raise Exception(f"Failed to create sync batch: {str(e)}")
    
    async def _upload_raw_data(self, raw_data: List[Dict[str, Any]], source: str, batch_id: int, company_id: int) -> str:
        """Upload raw data to Azure staging storage as comprehensive CSV"""
        try:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            blob_name = f"company_{company_id}/{source}/batch_{batch_id}_{timestamp}.csv"
            
            # Convert to comprehensive CSV format based on source
            if raw_data:
                if source == "jira":
                    # Enrich Jira data with comprehensive columns
                    enriched_data = self._enrich_jira_staging_data(raw_data, batch_id)
                    csv_content = self._create_comprehensive_jira_csv(enriched_data)
                else:
                    # For other sources, use the original approach
                    all_columns = set()
                    for record in raw_data:
                        all_columns.update(record.keys())
                    
                    output = StringIO()
                    writer = csv.DictWriter(output, fieldnames=sorted(all_columns))
                    writer.writeheader()
                    writer.writerows(raw_data)
                    csv_content = output.getvalue()
                    output.close()
                
                # Log upload size for monitoring
                size_mb = len(csv_content.encode('utf-8')) / (1024 * 1024)
                logger.info(f"Uploading {len(raw_data)} records ({size_mb:.2f} MB) to Azure staging as CSV")
                
                # Upload CSV to staging container
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="staging",
                    company_id=company_id
                )
            else:
                # Handle empty data case
                csv_content = ""
                logger.info(f"Uploading 0 records (empty file) to Azure staging as CSV")
                
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="staging",
                    company_id=company_id
                )
            
            logger.info(f"Successfully uploaded raw data to {blob_name}")
            return f"company_{company_id}/{blob_name}"
            
        except Exception as e:
            logger.error(f"Failed to upload raw data: {e}")
            raise Exception(f"Failed to upload raw data: {str(e)}")
    
    def _enrich_jira_staging_data(self, raw_data: List[Dict[str, Any]], batch_id: int) -> List[Dict[str, Any]]:
        """Enrich Jira raw data with comprehensive columns for staging CSV"""
        enriched_data = []
        current_time = datetime.now(timezone.utc).isoformat()
        
        for record in raw_data:
            # Start with original data
            enriched_record = {}
            
            # Extract fields from nested structure
            fields = record.get('fields', {})
            
            # Basic required columns
            enriched_record['provider'] = 'jira'
            enriched_record['item_key'] = record.get('key', '')
            enriched_record['item_id'] = record.get('id', '')
            enriched_record['title'] = fields.get('summary', '')
            enriched_record['body'] = fields.get('description', '')
            enriched_record['status'] = fields.get('status', {}).get('name', '') if fields.get('status') else ''
            enriched_record['type'] = fields.get('issuetype', {}).get('name', '') if fields.get('issuetype') else ''
            enriched_record['project_or_repo'] = fields.get('project', {}).get('key', '') if fields.get('project') else ''
            enriched_record['created_at'] = fields.get('created', '')
            enriched_record['updated_at'] = fields.get('updated', '')
            enriched_record['closed_at'] = fields.get('resolutiondate', '')
            
            # Assignee information
            assignee = fields.get('assignee', {}) if fields.get('assignee') else {}
            enriched_record['assignee_login'] = assignee.get('accountId', '') if assignee else ''
            enriched_record['assignee_email'] = assignee.get('emailAddress', '') if assignee else ''
            enriched_record['assignee_name'] = assignee.get('displayName', '') if assignee else ''
            
            # Creator/Reporter information  
            reporter = fields.get('reporter', {}) if fields.get('reporter') else {}
            enriched_record['creator_login'] = reporter.get('accountId', '') if reporter else ''
            enriched_record['creator_email'] = reporter.get('emailAddress', '') if reporter else ''
            enriched_record['creator_name'] = reporter.get('displayName', '') if reporter else ''
            
            # Priority
            priority = fields.get('priority', {}) if fields.get('priority') else {}
            enriched_record['priority'] = priority.get('name', '') if priority else ''
            
            # Comprehensive Jira columns
            enriched_record['Summary'] = fields.get('summary', '')
            enriched_record['Issue key'] = record.get('key', '')
            enriched_record['Issue id'] = record.get('id', '')
            enriched_record['Issue Type'] = fields.get('issuetype', {}).get('name', '') if fields.get('issuetype') else ''
            enriched_record['Status'] = fields.get('status', {}).get('name', '') if fields.get('status') else ''
            
            # Project information
            project = fields.get('project', {}) if fields.get('project') else {}
            enriched_record['Project key'] = project.get('key', '') if project else ''
            enriched_record['Project name'] = project.get('name', '') if project else ''
            enriched_record['Project type'] = project.get('projectTypeKey', '') if project else ''
            enriched_record['Project lead'] = project.get('lead', {}).get('displayName', '') if project.get('lead') else ''
            enriched_record['Project lead id'] = project.get('lead', {}).get('accountId', '') if project.get('lead') else ''
            enriched_record['Project description'] = project.get('description', '') if project else ''
            
            # Additional fields
            enriched_record['Priority'] = priority.get('name', '') if priority else ''
            enriched_record['Resolution'] = fields.get('resolution', {}).get('name', '') if fields.get('resolution') else ''
            enriched_record['Assignee'] = assignee.get('displayName', '') if assignee else ''
            enriched_record['Assignee Id'] = assignee.get('accountId', '') if assignee else ''
            enriched_record['Reporter'] = reporter.get('displayName', '') if reporter else ''
            enriched_record['Reporter Id'] = reporter.get('accountId', '') if reporter else ''
            enriched_record['Creator'] = reporter.get('displayName', '') if reporter else ''
            enriched_record['Creator Id'] = reporter.get('accountId', '') if reporter else ''
            
            # Dates
            enriched_record['Created'] = fields.get('created', '')
            enriched_record['Updated'] = fields.get('updated', '')
            enriched_record['Last Viewed'] = fields.get('lastViewed', '')
            enriched_record['Resolved'] = fields.get('resolutiondate', '')
            enriched_record['Due date'] = fields.get('duedate', '')
            
            # Additional metadata
            enriched_record['Votes'] = fields.get('votes', {}).get('votes', 0) if fields.get('votes') else 0
            enriched_record['Labels'] = ','.join(fields.get('labels', []))
            enriched_record['Description'] = fields.get('description', '')
            enriched_record['Environment'] = fields.get('environment', '')
            enriched_record['Security Level'] = fields.get('security', {}).get('name', '') if fields.get('security') else ''
            enriched_record['Status Category'] = fields.get('status', {}).get('statusCategory', {}).get('name', '') if fields.get('status', {}).get('statusCategory') else ''
            enriched_record['Original estimate'] = fields.get('originalEstimate', '')
            enriched_record['Remaining Estimate'] = fields.get('remainingEstimate', '')
            enriched_record['Time Spent'] = fields.get('timeSpent', '')
            enriched_record['Work Ratio'] = fields.get('workRatio', '')
            enriched_record['Sum Original Estimate'] = fields.get('aggregateOriginalEstimate', '')
            enriched_record['Sum Remaining Estimate'] = fields.get('aggregateRemainingEstimate', '')
            enriched_record['Sum Time Spent'] = fields.get('aggregateTimeSpent', '')
            
            # Components and watchers
            components = fields.get('components', [])
            enriched_record['Components'] = ','.join([comp.get('name', '') for comp in components]) if components else ''
            watchers = fields.get('watches', {}) if fields.get('watches') else {}
            enriched_record['Watchers'] = watchers.get('watchCount', 0) if watchers else 0
            enriched_record['Watchers Id'] = ''  # Would need separate API call
            
            # Attachments and comments 
            enriched_record['Attachment'] = len(fields.get('attachment', [])) if fields.get('attachment') else 0
            enriched_record['Comment'] = fields.get('comment', {}).get('total', 0) if fields.get('comment') else 0
            
            # Parent information
            parent = fields.get('parent', {}) if fields.get('parent') else {}
            enriched_record['Parent'] = parent.get('id', '') if parent else ''
            enriched_record['Parent key'] = parent.get('key', '') if parent else ''
            enriched_record['Parent summary'] = parent.get('fields', {}).get('summary', '') if parent.get('fields') else ''
            
            # Metadata
            enriched_record['fetched_at'] = current_time
            enriched_record['api_response_time'] = 0  # Would be set by API timing
            
            # Add all custom fields (customfield_*)
            for field_key, field_value in fields.items():
                if field_key.startswith('customfield_'):
                    enriched_record[f'custom_{field_key}'] = str(field_value) if field_value else ''
            
            # Additional tracking fields
            enriched_record['unique_identifier'] = f"{record.get('key', '')}_{batch_id}"
            enriched_record['batch_id'] = batch_id
            enriched_record['test_run_marker'] = ''
            enriched_record['enhanced_item_key'] = record.get('key', '')
            
            enriched_data.append(enriched_record)
        
        return enriched_data
    
    def _create_comprehensive_jira_csv(self, enriched_data: List[Dict[str, Any]]) -> str:
        """Create comprehensive CSV with all required Jira columns"""
        # Define the complete column order as specified
        comprehensive_columns = [
            'provider', 'item_key', 'item_id', 'title', 'body', 'status', 'type', 'project_or_repo',
            'created_at', 'updated_at', 'closed_at', 'assignee_login', 'assignee_email', 'assignee_name',
            'creator_login', 'creator_email', 'creator_name', 'priority', 'Summary', 'Issue key', 'Issue id',
            'Issue Type', 'Status', 'Project key', 'Project name', 'Project type', 'Project lead',
            'Project lead id', 'Project description', 'Priority', 'Resolution', 'Assignee', 'Assignee Id',
            'Reporter', 'Reporter Id', 'Creator', 'Creator Id', 'Created', 'Updated', 'Last Viewed',
            'Resolved', 'Due date', 'Votes', 'Labels', 'Description', 'Environment', 'Security Level',
            'Status Category', 'Original estimate', 'Remaining Estimate', 'Time Spent', 'Work Ratio',
            'Sum Original Estimate', 'Sum Remaining Estimate', 'Sum Time Spent', 'Components', 'Watchers',
            'Watchers Id', 'Attachment', 'Comment', 'Parent', 'Parent key', 'Parent summary', 'fetched_at',
            'api_response_time', 'custom_customfield_10110', 'custom_customfield_10111', 'custom_customfield_10112',
            'custom_customfield_10113', 'custom_customfield_10114', 'custom_customfield_10104', 'custom_customfield_10027',
            'custom_customfield_10105', 'custom_customfield_10106', 'custom_customfield_10107', 'custom_customfield_10108',
            'custom_customfield_10109', 'custom_customfield_10100', 'custom_customfield_10101', 'custom_customfield_10102',
            'custom_customfield_10103', 'custom_customfield_10019', 'custom_customfield_10091', 'custom_customfield_10092',
            'custom_customfield_10093', 'custom_customfield_10094', 'custom_customfield_10095', 'custom_customfield_10096',
            'custom_customfield_10097', 'custom_customfield_10098', 'custom_customfield_10099', 'custom_customfield_10015',
            'custom_customfield_10001', 'custom_customfield_10115', 'custom_customfield_10116', 'unique_identifier',
            'batch_id', 'test_run_marker', 'enhanced_item_key', 'custom_customfield_10030', 'custom_customfield_10031',
            'custom_customfield_10033', 'custom_customfield_10034', 'custom_customfield_10035', 'custom_customfield_10028',
            'custom_customfield_10029', 'custom_customfield_10020', 'custom_customfield_10021', 'custom_customfield_10022',
            'custom_customfield_10023', 'custom_customfield_10024', 'custom_customfield_10025', 'custom_customfield_10026',
            'custom_customfield_10016', 'custom_customfield_10017', 'custom_customfield_10010', 'custom_customfield_10058',
            'custom_customfield_10014', 'custom_customfield_10005', 'custom_customfield_10006', 'custom_customfield_10007',
            'custom_customfield_10008', 'custom_customfield_10009', 'custom_customfield_10002', 'custom_customfield_10003',
            'custom_customfield_10124', 'custom_customfield_10004', 'custom_customfield_10117', 'custom_customfield_10036',
            'custom_customfield_10011', 'custom_customfield_10012', 'custom_customfield_10013', 'custom_customfield_10118'
        ]
        
        # Create CSV with comprehensive columns
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=comprehensive_columns, extrasaction='ignore')
        writer.writeheader()
        
        # Write data, filling in missing columns with empty strings
        for record in enriched_data:
            complete_record = {}
            for col in comprehensive_columns:
                complete_record[col] = record.get(col, '')
            writer.writerow(complete_record)
        
        csv_content = output.getvalue()
        output.close()
        return csv_content
    
    def _standardize_data(self, raw_data: List[Dict], source: str, company_id: int, batch_id: int) -> List[Dict]:
        """
        Standardize raw data into WorkflowFact schema format (using original backend approach)
        
        Args:
            raw_data: Raw data from integration APIs
            source: 'github' or 'jira'
            company_id: Company identifier
            batch_id: Sync batch identifier
            
        Returns:
            List of standardized records ready for database insertion
        """
        try:
            standardized_records = []
            
            for record in raw_data:
                try:
                    # Add batch_id to raw record for staging
                    record["batch_id"] = batch_id
                    
                    # Add GitHub staging enrichment based on data type
                    if source == 'github':
                        record = self._enrich_github_staging_data(record)
                    
                    # Standardize based on source
                    if source == 'github':
                        standardized = self._standardize_github_record(record, company_id, batch_id)
                    elif source == 'jira':
                        standardized = self._standardize_jira_record(record, company_id, batch_id)
                    else:
                        logger.warning(f"Unknown source: {source}")
                        continue
                    
                    if standardized:
                        # Add additional fields for cleansed format
                        standardized["SourceSystem"] = source
                        standardized["ProcessedAt"] = datetime.now(timezone.utc).isoformat()
                        standardized["QualityScore"] = None  # Can be calculated later
                        standardized["batch_id"] = batch_id
                        standardized["test_run_marker"] = ""
                        standardized["unique_identifier"] = record.get("unique_identifier", "")
                        
                        standardized_records.append(standardized)
                        
                except Exception as e:
                    logger.warning(f"Failed to standardize record: {e}")
                    continue
            
            logger.info(f"Standardized {len(standardized_records)}/{len(raw_data)} records")
            return standardized_records
            
        except Exception as e:
            logger.error(f"Data standardization failed: {e}")
            raise Exception(f"Data standardization failed: {str(e)}")
    
    async def _upload_cleansed_standardized_data(self, cleansed_data: List[Dict[str, Any]], source: str, batch_id: int, company_id: int) -> str:
        """Upload cleansed data to Azure cleansed storage as CSV"""
        try:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            blob_name = f"company_{company_id}/{source}/cleansed/batch_{batch_id}_{timestamp}.csv"
            
            # Convert to CSV format
            if cleansed_data:
                # Get all unique column names from all records
                all_columns = set()
                for record in cleansed_data:
                    all_columns.update(record.keys())
                
                # Create CSV content
                output = StringIO()
                writer = csv.DictWriter(output, fieldnames=sorted(all_columns))
                writer.writeheader()
                writer.writerows(cleansed_data)
                csv_content = output.getvalue()
                output.close()
                
                logger.info(f"Uploading {len(cleansed_data)} cleansed records as CSV")
                
                # Upload CSV to cleansed container
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="cleansed",
                    company_id=company_id
                )
            else:
                # Handle empty data case
                csv_content = ""
                logger.info(f"Uploading 0 cleansed records (empty file) as CSV")
                
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="cleansed",
                    company_id=company_id
                )
            
            return blob_name
            
        except Exception as e:
            logger.error(f"Failed to upload cleansed data: {e}")
            raise Exception(f"Failed to upload cleansed data: {str(e)}")
    
    async def _insert_into_database(self, cleansed_data: List[Dict[str, Any]], source: str) -> int:
        """Insert cleansed data into SQL database with batch verification"""
        try:
            inserted_count = 0
            
            # First, verify the batch exists (get the BatchID from the first record)
            if not cleansed_data:
                logger.warning("No data to insert into database")
                return 0
                
            batch_id = cleansed_data[0].get('BatchID')
            if not batch_id:
                logger.error("No BatchID found in cleansed data")
                return 0
                
            # Verify batch exists before inserting workflow facts
            batch_verification = await query_one("SELECT BatchID FROM SyncBatch WHERE BatchID = {batch_id}", {"batch_id": batch_id})
            if not batch_verification:
                logger.error(f"❌ Batch {batch_id} not found in SyncBatch table - cannot insert WorkflowFact records")
                return 0
            
            logger.info(f"✅ Verified batch {batch_id} exists, proceeding with WorkflowFact insertion")
            
            for record in cleansed_data:
                try:
                    # Insert into WorkflowFact table
                    insert_query = """
                        INSERT INTO WorkflowFact (
                            CompanyID, BatchID, Provider, ItemType, ItemKey, ProjectOrRepo,
                            Title, Status, CreatedAt, ClosedAt, LeadTimeHours, CycleTimeHours, 
                            StoryPoints, Author, Assignee, Labels
                        ) VALUES (
                            {CompanyID}, {BatchID}, {Provider}, {ItemType}, {ItemKey}, {ProjectOrRepo},
                            {Title}, {Status}, {CreatedAt}, {ClosedAt}, {LeadTimeHours}, {CycleTimeHours},
                            {StoryPoints}, {Author}, {Assignee}, {Labels}
                        )
                    """
                    
                    await execute_sql(insert_query, record)
                    inserted_count += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to insert record {record.get('ItemKey')}: {e}")
                    continue
            
            logger.info(f"Inserted {inserted_count} records into database")
            return inserted_count
            
        except Exception as e:
            logger.error(f"Database insertion failed: {e}")
            raise Exception(f"Database insertion failed: {str(e)}")
    
    async def _complete_sync_batch(self, batch_id: int, inserted_count: int, staging_blob: str, cleansed_blob: str):
        """Update sync batch with completion details"""
        try:
            # Use literal values to avoid parameter binding issues with datetime
            completed_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            
            update_query = f"""
                UPDATE SyncBatch 
                SET 
                    CompletedAt = '{completed_at}',
                    RecordsIngested = {inserted_count},
                    StorageStagePath = '{staging_blob}',
                    StorageCleanPath = '{cleansed_blob}'
                WHERE BatchID = {batch_id}
            """
            
            await execute_sql(update_query, {})
            
        except Exception as e:
            logger.error(f"Failed to complete sync batch {batch_id}: {e}")
            raise Exception(f"Failed to complete sync batch: {str(e)}")
    
    async def _fail_sync_batch(self, batch_id: int, error_message: str):
        """Update sync batch with failure details"""
        try:
            # Use literal values to avoid parameter binding issues with datetime
            completed_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            
            update_query = f"""
                UPDATE SyncBatch 
                SET 
                    CompletedAt = '{completed_at}'
                WHERE BatchID = {batch_id}
            """
            
            await execute_sql(update_query, {})
            
        except Exception as e:
            logger.error(f"Failed to update batch failure {batch_id}: {e}")
    
    def _standardize_github_record(self, record: Dict, company_id: int, batch_id: int) -> Dict:
        """Standardize a GitHub record to WorkflowFact schema (from original backend)"""
        try:
            # Parse dates
            created_at = self._parse_datetime(record.get('created_at'))
            closed_at = self._parse_datetime(record.get('closed_at'))
            updated_at = self._parse_datetime(record.get('updated_at'))
            
            # Calculate lead time and cycle time
            lead_time_hours = None
            cycle_time_hours = None
            
            if created_at and closed_at:
                lead_time_hours = (closed_at - created_at).total_seconds() / 3600
            
            if updated_at and closed_at:
                cycle_time_hours = (closed_at - updated_at).total_seconds() / 3600
            
            # Determine item type (issue vs pull request)
            item_type = 'pull_request' if 'pull_request' in record else 'issue'
            
            # Normalize status
            state = record.get('state', '')
            status = self._normalize_status(state, 'github')
            
            # Extract labels
            labels_list = record.get('labels', [])
            if isinstance(labels_list, list):
                labels = ','.join([label.get('name', '') if isinstance(label, dict) else str(label) for label in labels_list])
            else:
                labels = None
            
            # Extract assignee and author
            assignee_obj = record.get('assignee', {})
            assignee = assignee_obj.get('login') if assignee_obj else None
            
            user_obj = record.get('user', {})
            author = user_obj.get('login') if user_obj else None
            
            # Extract repository info
            repo_info = record.get('repository', {}) or record.get('base', {}).get('repo', {})
            project_repo = repo_info.get('full_name', '') or repo_info.get('name', '') or record.get('project_or_repo', '')
            
            return {
                'CompanyID': company_id,
                'BatchID': batch_id,
                'Provider': 'github',
                'ItemType': item_type,
                'ItemKey': f"{project_repo}#{record.get('number', '')}",
                'ProjectOrRepo': project_repo,
                'Title': record.get('title', ''),
                'Status': status,
                'CreatedAt': created_at.isoformat() if created_at else None,
                'ClosedAt': closed_at.isoformat() if closed_at else None,
                'LeadTimeHours': round(lead_time_hours, 3) if lead_time_hours else None,
                'CycleTimeHours': round(cycle_time_hours, 3) if cycle_time_hours else None,
                'StoryPoints': None,  # GitHub doesn't have story points
                'Author': author,
                'Assignee': assignee,
                'Labels': labels
            }
            
        except Exception as e:
            logger.error(f"Failed to standardize GitHub record {record.get('number', 'unknown')}: {str(e)}")
            return None

    def _standardize_jira_record(self, record: Dict, company_id: int, batch_id: int) -> Dict:
        """Standardize a Jira record to WorkflowFact schema (from original backend)"""
        try:
            # Extract fields safely
            fields = record.get('fields', {})
            
            # Parse dates
            created_at = self._parse_datetime(record.get('created') or fields.get('created'))
            updated_at = self._parse_datetime(record.get('updated') or fields.get('updated'))
            resolved_at = self._parse_datetime(fields.get('resolutiondate'))
            
            # Calculate lead time and cycle time
            lead_time_hours = None
            cycle_time_hours = None
            
            if created_at and resolved_at:
                lead_time_hours = (resolved_at - created_at).total_seconds() / 3600
            
            if updated_at and resolved_at:
                cycle_time_hours = (resolved_at - updated_at).total_seconds() / 3600
            
            # Extract story points
            story_points = None
            story_points_field = fields.get('customfield_10016') or fields.get('storyPoints')
            if story_points_field:
                try:
                    story_points = float(story_points_field)
                except (ValueError, TypeError):
                    pass
            
            # Normalize status
            status_obj = fields.get('status', {})
            status = self._normalize_status(status_obj.get('name', ''), 'jira')
            
            # Normalize item type
            issue_type_obj = fields.get('issuetype', {})
            item_type = self._normalize_item_type(issue_type_obj.get('name', ''), 'jira')
            
            # Extract labels
            labels_list = fields.get('labels', [])
            labels = ','.join(labels_list) if labels_list else None
            
            # Extract assignee and author
            assignee_obj = fields.get('assignee', {})
            assignee = assignee_obj.get('displayName') or assignee_obj.get('emailAddress') if assignee_obj else None
            
            reporter_obj = fields.get('reporter', {})
            author = reporter_obj.get('displayName') or reporter_obj.get('emailAddress') if reporter_obj else None
            
            # Extract project info
            project_obj = fields.get('project', {})
            project_repo = project_obj.get('key', '') if project_obj else ''
            
            return {
                'CompanyID': company_id,
                'BatchID': batch_id,
                'Provider': 'jira',
                'ItemType': item_type,
                'ItemKey': record.get('key', ''),
                'ProjectOrRepo': project_repo,
                'Title': fields.get('summary', ''),
                'Status': status,
                'CreatedAt': created_at.isoformat() if created_at else None,
                'ClosedAt': resolved_at.isoformat() if resolved_at else None,
                'LeadTimeHours': round(lead_time_hours, 3) if lead_time_hours else None,
                'CycleTimeHours': round(cycle_time_hours, 3) if cycle_time_hours else None,
                'StoryPoints': story_points,
                'Author': author,
                'Assignee': assignee,
                'Labels': labels
            }
            
        except Exception as e:
            logger.error(f"Failed to standardize Jira record {record.get('key', 'unknown')}: {str(e)}")
            return None

    def _normalize_status(self, status: str, source: str) -> str:
        """Normalize status values across different systems"""
        if not status:
            return 'unknown'
        
        status_lower = status.lower()
        
        # Common status mappings
        if status_lower in ['open', 'new', 'created', 'to do', 'backlog']:
            return 'open'
        elif status_lower in ['in progress', 'in review', 'in development', 'doing']:
            return 'in_progress'
        elif status_lower in ['closed', 'done', 'resolved', 'completed']:
            return 'closed'
        elif status_lower in ['cancelled', 'rejected', 'wontfix']:
            return 'cancelled'
        else:
            return status_lower.replace(' ', '_')

    def _normalize_item_type(self, item_type: str, source: str) -> str:
        """Normalize item type values across different systems"""
        if not item_type:
            return 'unknown'
        
        item_type_lower = item_type.lower()
        
        # Common type mappings
        if item_type_lower in ['story', 'user story']:
            return 'story'
        elif item_type_lower in ['task']:
            return 'task'
        elif item_type_lower in ['bug', 'defect']:
            return 'bug'
        elif item_type_lower in ['epic']:
            return 'epic'
        elif item_type_lower in ['issue']:
            return 'issue'
        elif item_type_lower in ['pull_request', 'pull request', 'pr']:
            return 'pull_request'
        else:
            return item_type_lower.replace(' ', '_')

    def _enrich_github_staging_data(self, record: Dict) -> Dict:
        """Enrich GitHub raw data with staging format fields"""
        try:
            data_type = record.get("_data_type", "unknown")
            repo_name = record.get("_repo_name", "")
            
            # Common fields for all GitHub data
            record["provider"] = "github"
            record["project_or_repo"] = repo_name
            record["api_rate_limit_remaining"] = 1000  # Placeholder
            record["api_response_time"] = 0
            record["fetched_at"] = datetime.now(timezone.utc).isoformat()
            record["test_run_marker"] = ""
            
            if data_type == "issues":
                # Issue/PR specific enrichment
                record["item_type"] = "pull_request" if record.get("pull_request") else "issue"
                record["item_key"] = f"{repo_name}#{record.get('number', '')}"
                record["enhanced_item_key"] = record["item_key"]
                record["unique_identifier"] = f"github_{record.get('id', '')}"
                
                # Issue/PR fields
                record["author"] = record.get("user", {}).get("login", "")
                record["author_id"] = record.get("user", {}).get("id", "")
                record["author_type"] = record.get("user", {}).get("type", "")
                record["assignee"] = record.get("assignee", {}).get("login", "") if record.get("assignee") else ""
                record["assignee_id"] = record.get("assignee", {}).get("id", "") if record.get("assignee") else ""
                record["assignees"] = [a.get("login", "") for a in record.get("assignees", [])]
                record["assignees_count"] = len(record.get("assignees", []))
                
                # Labels
                labels = record.get("labels", [])
                record["labels"] = [label.get("name", "") if isinstance(label, dict) else str(label) for label in labels]
                record["labels_count"] = len(labels)
                
                # Content
                record["body"] = record.get("body", "")
                record["body_length"] = len(record.get("body", ""))
                record["status"] = record.get("state", "")
                record["title"] = record.get("title", "")
                
                # Additional fields
                record["active_lock_reason"] = record.get("active_lock_reason", "")
                record["locked"] = record.get("locked", False)
                record["comments"] = record.get("comments", 0)
                record["state_reason"] = record.get("state_reason", "")
                
            elif data_type == "commits":
                # Commit specific enrichment
                record["item_type"] = "commit"
                record["item_key"] = f"{repo_name}#{record.get('sha', '')[:8]}"
                record["enhanced_item_key"] = record["item_key"]
                record["unique_identifier"] = f"github_{record.get('sha', '')}"
                
                # Commit fields
                commit_info = record.get("commit", {})
                author_info = commit_info.get("author", {})
                record["author"] = author_info.get("name", "")
                record["author_id"] = record.get("author", {}).get("id", "") if record.get("author") else ""
                record["author_type"] = "User"
                record["assignee"] = ""
                record["assignee_id"] = ""
                record["assignees"] = []
                record["assignees_count"] = 0
                
                # Content
                record["title"] = commit_info.get("message", "").split('\n')[0][:500] if commit_info.get("message") else ""
                record["body"] = commit_info.get("message", "")
                record["body_length"] = len(commit_info.get("message", ""))
                record["status"] = "completed"
                record["labels"] = []
                record["labels_count"] = 0
                
                # Additional fields
                record["active_lock_reason"] = ""
                record["locked"] = False
                record["comments"] = 0
                record["state_reason"] = ""
            
            return record
            
        except Exception as e:
            logger.warning(f"Failed to enrich GitHub staging data: {e}")
            return record

    def _clean_text(self, text: Any) -> Optional[str]:
        """Clean and truncate text data"""
        if text is None:
            return None
            
        text_str = str(text).strip()
        if not text_str:
            return None
            
        # Truncate long text
        return text_str[:500] if len(text_str) > 500 else text_str
    
    def _parse_datetime(self, date_str: Any) -> Optional[datetime]:
        """Parse various datetime formats to UTC datetime (from original backend)"""
        if not date_str:
            return None
        
        # Convert to string if needed
        date_str = str(date_str)
        
        # Common datetime formats
        formats = [
            "%Y-%m-%dT%H:%M:%S.%fZ",      # ISO with microseconds
            "%Y-%m-%dT%H:%M:%SZ",         # ISO without microseconds
            "%Y-%m-%dT%H:%M:%S%z",        # ISO with timezone
            "%Y-%m-%dT%H:%M:%S.%f%z",     # ISO with microseconds and timezone
            "%Y-%m-%d %H:%M:%S",          # Simple format
            "%Y-%m-%d"                    # Date only
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                # Ensure timezone-aware
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except ValueError:
                continue
        
        logger.warning(f"Could not parse datetime: {date_str}")
        return None
    
    def _format_labels(self, labels: Any) -> Optional[str]:
        """Format labels for storage"""
        if not labels:
            return None
            
        if isinstance(labels, list):
            return json.dumps(labels) if labels else None
        else:
            return str(labels)[:500]
    
    # =========================================
    # Financial Data Processing Methods
    # =========================================
    
    async def _upload_raw_financial_data(self, raw_data: List[Dict[str, Any]], source: str, batch_id: int, company_id: int) -> str:
        """Upload raw financial data to Azure staging storage as comprehensive CSV"""
        try:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            blob_name = f"company_{company_id}/{source}/financial/batch_{batch_id}_{timestamp}.csv"
            
            # Convert to CSV format - save RAW data exactly as received from APIs
            if raw_data:
                # For staging, save the raw data EXACTLY as received from cloud provider APIs
                # No enrichment, no transformation - pure raw data
                all_columns = set()
                for record in raw_data:
                    all_columns.update(record.keys())
                
                output = StringIO()
                writer = csv.DictWriter(output, fieldnames=sorted(all_columns))
                writer.writeheader()
                writer.writerows(raw_data)  # Save original raw data without any modifications
                csv_content = output.getvalue()
                output.close()
                
                # Log upload size for monitoring
                size_mb = len(csv_content.encode('utf-8')) / (1024 * 1024)
                logger.info(f"Uploading {len(raw_data)} financial records ({size_mb:.2f} MB) to Azure staging as CSV")
                
                # Upload CSV to staging container
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="staging",
                    company_id=company_id
                )
            else:
                # Handle empty data case
                csv_content = ""
                logger.info(f"Uploading 0 financial records (empty file) to Azure staging as CSV")
                
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="staging",
                    company_id=company_id
                )
            
            logger.info(f"Successfully uploaded raw financial data to {blob_name}")
            return f"company_{company_id}/{blob_name}"
            
        except Exception as e:
            logger.error(f"Failed to upload raw financial data: {e}")
            raise Exception(f"Failed to upload raw financial data: {str(e)}")
    
    def _enrich_financial_staging_data(self, raw_data: List[Dict[str, Any]], source: str, batch_id: int) -> List[Dict[str, Any]]:
        """Enrich financial raw data with comprehensive columns for staging CSV"""
        enriched_data = []
        current_time = datetime.now(timezone.utc).isoformat()
        
        for record in raw_data:
            # Start with original data
            enriched_record = dict(record)  # Copy all original fields
            
            # Add common enrichment fields
            enriched_record['provider'] = source
            enriched_record['fetched_at'] = current_time
            enriched_record['batch_id'] = batch_id
            enriched_record['test_run_marker'] = ''
            enriched_record['unique_identifier'] = f"{source}_{record.get('resource_id', record.get('ResourceId', ''))}__{batch_id}"
            
            # Source-specific enrichment
            if source == 'aws':
                enriched_record['billing_account_id'] = record.get('billing_account_id', record.get('BillingAccountId', ''))
                enriched_record['service_name'] = record.get('service_name', record.get('ServiceName', ''))
                enriched_record['resource_id'] = record.get('resource_id', record.get('ResourceId', ''))
                enriched_record['region'] = record.get('region', record.get('Region', ''))
                enriched_record['billed_cost'] = record.get('billed_cost', record.get('BilledCost', 0))
                
            elif source == 'azure':
                enriched_record['subscription_id'] = record.get('subscription_id', record.get('SubscriptionId', ''))
                enriched_record['resource_group'] = record.get('resource_group', record.get('ResourceGroup', ''))
                enriched_record['service_name'] = record.get('service_name', record.get('ServiceName', ''))
                enriched_record['resource_id'] = record.get('resource_id', record.get('ResourceId', ''))
                enriched_record['location'] = record.get('location', record.get('Location', ''))
                enriched_record['cost'] = record.get('cost', record.get('Cost', 0))
                
            elif source == 'gcp':
                enriched_record['project_id'] = record.get('project_id', record.get('ProjectId', ''))
                enriched_record['service_description'] = record.get('service_description', record.get('ServiceDescription', ''))
                enriched_record['sku_description'] = record.get('sku_description', record.get('SkuDescription', ''))
                enriched_record['location'] = record.get('location', record.get('Location', ''))
                enriched_record['cost'] = record.get('cost', record.get('Cost', 0))
            
            enriched_data.append(enriched_record)
        
        return enriched_data
    
    def _create_comprehensive_financial_csv(self, enriched_data: List[Dict[str, Any]]) -> str:
        """Create comprehensive CSV with all financial data columns"""
        if not enriched_data:
            return ""
        
        # Get all unique column names from all records
        all_columns = set()
        for record in enriched_data:
            all_columns.update(record.keys())
        
        # Create CSV content
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=sorted(all_columns))
        writer.writeheader()
        writer.writerows(enriched_data)
        csv_content = output.getvalue()
        output.close()
        return csv_content
    
    def _standardize_financial_data(self, raw_data: List[Dict], source: str, company_id: int, batch_id: int) -> List[Dict]:
        """
        Standardize raw financial data into FinancialFact schema format
        
        Args:
            raw_data: Raw cost/billing data from cloud provider APIs
            source: 'aws', 'azure', or 'gcp'
            company_id: Company identifier
            batch_id: Sync batch identifier
            
        Returns:
            List of standardized records ready for FinancialFact table insertion
        """
        try:
            standardized_records = []
            
            for record in raw_data:
                try:
                    # Add batch_id to raw record for staging
                    record["batch_id"] = batch_id
                    
                    # Standardize based on source
                    if source == 'aws':
                        standardized = self._standardize_aws_record(record, company_id, batch_id)
                    elif source == 'azure':
                        standardized = self._standardize_azure_record(record, company_id, batch_id)
                    elif source == 'gcp':
                        standardized = self._standardize_gcp_record(record, company_id, batch_id)
                    else:
                        logger.warning(f"Unknown financial source: {source}")
                        continue
                    
                    if standardized:
                        # Add additional fields for cleansed format
                        standardized["SourceSystem"] = source
                        standardized["ProcessedAt"] = datetime.now(timezone.utc).isoformat()
                        standardized["batch_id"] = batch_id
                        standardized["test_run_marker"] = ""
                        standardized["unique_identifier"] = record.get("unique_identifier", "")
                        
                        standardized_records.append(standardized)
                        
                except Exception as e:
                    logger.warning(f"Failed to standardize financial record: {e}")
                    continue
            
            logger.info(f"Standardized {len(standardized_records)}/{len(raw_data)} financial records")
            return standardized_records
            
        except Exception as e:
            logger.error(f"Financial data standardization failed: {e}")
            raise Exception(f"Financial data standardization failed: {str(e)}")
    
    def _standardize_aws_record(self, record: Dict, company_id: int, batch_id: int) -> Dict:
        """Standardize an AWS cost record to FinancialFact schema"""
        try:
            # Parse dates
            billing_period_start = self._parse_date(record.get('billing_period_start', record.get('BillingPeriodStart')))
            billing_period_end = self._parse_date(record.get('billing_period_end', record.get('BillingPeriodEnd')))
            charge_period_start = self._parse_date(record.get('charge_period_start', record.get('ChargePeriodStart'))) or billing_period_start
            charge_period_end = self._parse_date(record.get('charge_period_end', record.get('ChargePeriodEnd'))) or billing_period_end
            
            return {
                'CompanyID': company_id,
                'BatchID': batch_id,
                'BilledCost': float(record.get('billed_cost', record.get('BilledCost', 0))),
                'BillingAccountId': str(record.get('billing_account_id', record.get('BillingAccountId', ''))),
                'BillingCurrency': str(record.get('billing_currency', record.get('BillingCurrency', 'USD'))),
                'BillingPeriodEnd': billing_period_end.strftime('%Y-%m-%d') if billing_period_end else None,
                'BillingPeriodStart': billing_period_start.strftime('%Y-%m-%d') if billing_period_start else None,
                'ChargeCategory': str(record.get('charge_category', record.get('ChargeCategory', ''))),
                'ChargePeriodEnd': charge_period_end.strftime('%Y-%m-%d') if charge_period_end else None,
                'ChargePeriodStart': charge_period_start.strftime('%Y-%m-%d') if charge_period_start else None,
                'EffectiveCost': float(record.get('effective_cost', record.get('EffectiveCost', 0))) if record.get('effective_cost') or record.get('EffectiveCost') else None,
                'InvoiceIssuer': 'AWS',
                'ListCost': float(record.get('list_cost', record.get('ListCost', 0))) if record.get('list_cost') or record.get('ListCost') else None,
                'PricingCategory': str(record.get('pricing_category', record.get('PricingCategory', ''))),
                'Provider': 'aws',
                'Publisher': 'AWS',
                'Region': str(record.get('region', record.get('Region', ''))),
                'ResourceId': str(record.get('resource_id', record.get('ResourceId', ''))),
                'ResourceLocation': str(record.get('resource_location', record.get('ResourceLocation', record.get('region', record.get('Region', ''))))),
                'ServiceName': str(record.get('service_name', record.get('ServiceName', ''))),
                'SubAccountId': str(record.get('sub_account_id', record.get('SubAccountId', ''))),
                'UnblendedCost': float(record.get('unblended_cost', record.get('UnblendedCost', 0))) if record.get('unblended_cost') or record.get('UnblendedCost') else None,
            }
            
        except Exception as e:
            logger.error(f"Failed to standardize AWS record: {str(e)}")
            return None
    
    def _standardize_azure_record(self, record: Dict, company_id: int, batch_id: int) -> Dict:
        """Standardize an Azure cost record to FinancialFact schema"""
        try:
            # Parse dates
            billing_period_start = self._parse_date(record.get('billing_period_start', record.get('BillingPeriodStart')))
            billing_period_end = self._parse_date(record.get('billing_period_end', record.get('BillingPeriodEnd')))
            charge_period_start = self._parse_date(record.get('charge_period_start', record.get('ChargePeriodStart'))) or billing_period_start
            charge_period_end = self._parse_date(record.get('charge_period_end', record.get('ChargePeriodEnd'))) or billing_period_end
            
            return {
                'CompanyID': company_id,
                'BatchID': batch_id,
                'BilledCost': float(record.get('cost', record.get('Cost', record.get('billed_cost', record.get('BilledCost', 0))))),
                'BillingAccountId': str(record.get('subscription_id', record.get('SubscriptionId', ''))),
                'BillingCurrency': str(record.get('billing_currency', record.get('BillingCurrency', 'USD'))),
                'BillingPeriodEnd': billing_period_end.strftime('%Y-%m-%d') if billing_period_end else None,
                'BillingPeriodStart': billing_period_start.strftime('%Y-%m-%d') if billing_period_start else None,
                'ChargeCategory': str(record.get('charge_category', record.get('ChargeCategory', ''))),
                'ChargePeriodEnd': charge_period_end.strftime('%Y-%m-%d') if charge_period_end else None,
                'ChargePeriodStart': charge_period_start.strftime('%Y-%m-%d') if charge_period_start else None,
                'EffectiveCost': float(record.get('effective_cost', record.get('EffectiveCost', 0))) if record.get('effective_cost') or record.get('EffectiveCost') else None,
                'InvoiceIssuer': 'Microsoft',
                'ListCost': float(record.get('list_cost', record.get('ListCost', 0))) if record.get('list_cost') or record.get('ListCost') else None,
                'PricingCategory': str(record.get('pricing_category', record.get('PricingCategory', ''))),
                'Provider': 'azure',
                'Publisher': 'Microsoft',
                'Region': str(record.get('location', record.get('Location', record.get('region', record.get('Region', ''))))),
                'ResourceId': str(record.get('resource_id', record.get('ResourceId', ''))),
                'ResourceLocation': str(record.get('location', record.get('Location', record.get('resource_location', record.get('ResourceLocation', ''))))),
                'ServiceName': str(record.get('service_name', record.get('ServiceName', ''))),
                'SubAccountId': str(record.get('resource_group', record.get('ResourceGroup', record.get('sub_account_id', record.get('SubAccountId', ''))))),
                'UnblendedCost': float(record.get('unblended_cost', record.get('UnblendedCost', 0))) if record.get('unblended_cost') or record.get('UnblendedCost') else None,
            }
            
        except Exception as e:
            logger.error(f"Failed to standardize Azure record: {str(e)}")
            return None
    
    def _standardize_gcp_record(self, record: Dict, company_id: int, batch_id: int) -> Dict:
        """Standardize a GCP cost record to FinancialFact schema"""
        try:
            # Parse dates
            billing_period_start = self._parse_date(record.get('billing_period_start', record.get('BillingPeriodStart')))
            billing_period_end = self._parse_date(record.get('billing_period_end', record.get('BillingPeriodEnd')))
            charge_period_start = self._parse_date(record.get('charge_period_start', record.get('ChargePeriodStart'))) or billing_period_start
            charge_period_end = self._parse_date(record.get('charge_period_end', record.get('ChargePeriodEnd'))) or billing_period_end
            
            return {
                'CompanyID': company_id,
                'BatchID': batch_id,
                'BilledCost': float(record.get('cost', record.get('Cost', record.get('billed_cost', record.get('BilledCost', 0))))),
                'BillingAccountId': str(record.get('project_id', record.get('ProjectId', ''))),
                'BillingCurrency': str(record.get('billing_currency', record.get('BillingCurrency', 'USD'))),
                'BillingPeriodEnd': billing_period_end.strftime('%Y-%m-%d') if billing_period_end else None,
                'BillingPeriodStart': billing_period_start.strftime('%Y-%m-%d') if billing_period_start else None,
                'ChargeCategory': str(record.get('charge_category', record.get('ChargeCategory', ''))),
                'ChargePeriodEnd': charge_period_end.strftime('%Y-%m-%d') if charge_period_end else None,
                'ChargePeriodStart': charge_period_start.strftime('%Y-%m-%d') if charge_period_start else None,
                'EffectiveCost': float(record.get('effective_cost', record.get('EffectiveCost', 0))) if record.get('effective_cost') or record.get('EffectiveCost') else None,
                'InvoiceIssuer': 'Google',
                'ListCost': float(record.get('list_cost', record.get('ListCost', 0))) if record.get('list_cost') or record.get('ListCost') else None,
                'PricingCategory': str(record.get('pricing_category', record.get('PricingCategory', ''))),
                'Provider': 'gcp',
                'Publisher': 'Google',
                'Region': str(record.get('location', record.get('Location', record.get('region', record.get('Region', ''))))),
                'ResourceId': str(record.get('resource_id', record.get('ResourceId', ''))),
                'ResourceLocation': str(record.get('location', record.get('Location', record.get('resource_location', record.get('ResourceLocation', ''))))),
                'ServiceName': str(record.get('service_description', record.get('ServiceDescription', record.get('service_name', record.get('ServiceName', ''))))),
                'SubAccountId': str(record.get('sub_account_id', record.get('SubAccountId', ''))),
                'UnblendedCost': float(record.get('unblended_cost', record.get('UnblendedCost', 0))) if record.get('unblended_cost') or record.get('UnblendedCost') else None,
            }
            
        except Exception as e:
            logger.error(f"Failed to standardize GCP record: {str(e)}")
            return None
    
    async def _upload_cleansed_financial_data(self, cleansed_data: List[Dict[str, Any]], source: str, batch_id: int, company_id: int) -> str:
        """Upload cleansed financial data to Azure cleansed storage as CSV"""
        try:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            blob_name = f"company_{company_id}/{source}/financial/cleansed/batch_{batch_id}_{timestamp}.csv"
            
            # Convert to CSV format
            if cleansed_data:
                # Get all unique column names from all records
                all_columns = set()
                for record in cleansed_data:
                    all_columns.update(record.keys())
                
                # Create CSV content
                output = StringIO()
                writer = csv.DictWriter(output, fieldnames=sorted(all_columns))
                writer.writeheader()
                writer.writerows(cleansed_data)
                csv_content = output.getvalue()
                output.close()
                
                logger.info(f"Uploading {len(cleansed_data)} cleansed financial records as CSV")
                
                # Upload CSV to cleansed container
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="cleansed",
                    company_id=company_id
                )
            else:
                # Handle empty data case
                csv_content = ""
                logger.info(f"Uploading 0 cleansed financial records (empty file) as CSV")
                
                await self.storage.upload_csv_data(
                    csv_data=csv_content,
                    blob_name=blob_name,
                    container_type="cleansed",
                    company_id=company_id
                )
            
            return blob_name
            
        except Exception as e:
            logger.error(f"Failed to upload cleansed financial data: {e}")
            raise Exception(f"Failed to upload cleansed financial data: {str(e)}")
    
    async def _insert_financial_into_database(self, cleansed_data: List[Dict[str, Any]], source: str) -> int:
        """Insert cleansed financial data into FinancialFact table with batch verification"""
        try:
            inserted_count = 0
            
            # First, verify the batch exists
            if not cleansed_data:
                logger.warning("No financial data to insert into database")
                return 0
                
            batch_id = cleansed_data[0].get('BatchID')
            if not batch_id:
                logger.error("No BatchID found in cleansed financial data")
                return 0
                
            # Verify batch exists before inserting financial facts
            batch_verification = await query_one("SELECT BatchID FROM SyncBatch WHERE BatchID = {batch_id}", {"batch_id": batch_id})
            if not batch_verification:
                logger.error(f"❌ Batch {batch_id} not found in SyncBatch table - cannot insert FinancialFact records")
                return 0
            
            logger.info(f"✅ Verified batch {batch_id} exists, proceeding with FinancialFact insertion")
            
            for record in cleansed_data:
                try:
                    # Insert into FinancialFact table
                    insert_query = """
                        INSERT INTO FinancialFact (
                            CompanyID, BatchID, BilledCost, BillingAccountId, BillingCurrency,
                            BillingPeriodEnd, BillingPeriodStart, ChargeCategory, ChargePeriodEnd, ChargePeriodStart,
                            EffectiveCost, InvoiceIssuer, ListCost, PricingCategory, Provider,
                            Publisher, Region, ResourceId, ResourceLocation, ServiceName,
                            SubAccountId, UnblendedCost
                        ) VALUES (
                            {CompanyID}, {BatchID}, {BilledCost}, {BillingAccountId}, {BillingCurrency},
                            {BillingPeriodEnd}, {BillingPeriodStart}, {ChargeCategory}, {ChargePeriodEnd}, {ChargePeriodStart},
                            {EffectiveCost}, {InvoiceIssuer}, {ListCost}, {PricingCategory}, {Provider},
                            {Publisher}, {Region}, {ResourceId}, {ResourceLocation}, {ServiceName},
                            {SubAccountId}, {UnblendedCost}
                        )
                    """
                    
                    await execute_sql(insert_query, record)
                    inserted_count += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to insert financial record {record.get('ResourceId')}: {e}")
                    continue
            
            logger.info(f"Inserted {inserted_count} financial records into database")
            return inserted_count
            
        except Exception as e:
            logger.error(f"Financial database insertion failed: {e}")
            raise Exception(f"Financial database insertion failed: {str(e)}")
    
    def _parse_date(self, date_str: Any) -> Optional[datetime]:
        """Parse various date formats to datetime (simpler than datetime parsing)"""
        if not date_str:
            return None
        
        # Convert to string if needed
        date_str = str(date_str)
        
        # Common date formats
        formats = [
            "%Y-%m-%d",                   # ISO date
            "%Y-%m-%dT%H:%M:%S.%fZ",      # ISO datetime with microseconds
            "%Y-%m-%dT%H:%M:%SZ",         # ISO datetime without microseconds
            "%Y-%m-%dT%H:%M:%S%z",        # ISO datetime with timezone
            "%Y-%m-%dT%H:%M:%S.%f%z",     # ISO datetime with microseconds and timezone
            "%Y-%m-%d %H:%M:%S",          # Simple datetime format
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                # Ensure timezone-aware
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            except ValueError:
                continue
        
        logger.warning(f"Could not parse date: {date_str}")
        return None