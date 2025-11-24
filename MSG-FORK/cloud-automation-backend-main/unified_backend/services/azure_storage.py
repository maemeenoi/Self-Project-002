"""
Unified Azure Blob Storage Service

This service combines Azure Blob Storage functionality from both
focus_converter and work_processor projects, providing a unified
interface for all blob storage operations.
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, BinaryIO, Union
from pathlib import Path
import json
import pandas as pd
from io import BytesIO, StringIO

from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import AzureError, ResourceNotFoundError
from decouple import config

logger = logging.getLogger(__name__)


class UnifiedAzureBlobStorage:
    """
    Unified Azure Blob Storage client for both focus converter and workflow processor
    """
    
    def __init__(self):
        """Initialize Azure Blob Storage client"""
        try:
            connection_string = config('AZURE_STORAGE_CONNECTION_STRING')
            if not connection_string:
                raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is required")
            
            self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            
            # Container configurations
            self.containers = {
                # Workflow processor containers
                'staging': config('AZURE_BLOB_CONTAINER', default='staging'),
                'cleansed': config('AZURE_BLOB_CONTAINER_CLEANSED', default='cleansed'),
               
            }
            
            logger.info("✅ Azure Blob Storage client initialized successfully")
            self._is_healthy = True
            
            # Ensure containers exist
            asyncio.create_task(self._ensure_containers_exist())
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Azure Blob Storage: {e}")
            raise
    
    async def _ensure_containers_exist(self):
        """Ensure all required containers exist"""
        try:
            for container_name, container_value in self.containers.items():
                try:
                    container_client = self.blob_service_client.get_container_client(container_value)
                    await asyncio.to_thread(container_client.create_container)
                    logger.info(f"✅ Created container: {container_value}")
                except Exception as e:
                    if "ContainerAlreadyExists" in str(e):
                        logger.debug(f"Container already exists: {container_value}")
                    else:
                        logger.warning(f"Could not create container {container_value}: {e}")
        except Exception as e:
            logger.error(f"Error ensuring containers exist: {e}")
    
    # =============================================================================
    # WORKFLOW PROCESSOR METHODS
    # =============================================================================
    
    async def upload_csv_data(
        self, 
        csv_data: str, 
        blob_name: str, 
        container_type: str = 'staging',
        company_id: int = None
    ) -> str:
        """
        Upload CSV data to Azure Blob Storage (workflow processor functionality)
        """
        try:
            container_name = self.containers.get(container_type, self.containers['staging'])
            
            # Add company prefix if provided
            if company_id:
                blob_name = f"company_{company_id}/{blob_name}"
            
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name, 
                blob=blob_name
            )
            
            # Upload data
            await asyncio.to_thread(
                blob_client.upload_blob, 
                csv_data.encode('utf-8'), 
                overwrite=True,
                content_type='text/csv'
            )
            
            blob_url = blob_client.url
            logger.info(f"✅ CSV data uploaded to: {blob_url}")
            return blob_url
            
        except Exception as e:
            logger.error(f"❌ Failed to upload CSV data: {e}")
            raise
    
    async def upload_file(
        self, 
        file_content: Union[bytes, str, BinaryIO], 
        blob_name: str,
        container_type: str = 'staging',
        company_id: int = None,
        content_type: str = None
    ) -> str:
        """
        Upload file to Azure Blob Storage
        """
        try:
            container_name = self.containers.get(container_type, self.containers['staging'])
            
            # Add company prefix if provided
            if company_id:
                blob_name = f"company_{company_id}/{blob_name}"
            
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            # Handle different file content types
            if isinstance(file_content, str):
                file_content = file_content.encode('utf-8')
            elif hasattr(file_content, 'read'):
                file_content = file_content.read()
            
            # Upload with metadata
            metadata = {
                'uploaded_at': datetime.utcnow().isoformat(),
                'company_id': str(company_id) if company_id else None,
                'container_type': container_type
            }
            
            await asyncio.to_thread(
                blob_client.upload_blob,
                file_content,
                overwrite=True,
                content_type=content_type,
                metadata=metadata
            )
            
            blob_url = blob_client.url
            logger.info(f"✅ File uploaded to: {blob_url}")
            return blob_url
            
        except Exception as e:
            logger.error(f"❌ Failed to upload file: {e}")
            raise

    async def upload_data(
        self, 
        data: Union[bytes, str], 
        blob_name: str,
        container_name: str = 'staging',
        company_id: int = None,
        content_type: str = 'application/json'
    ) -> str:
        """
        Upload raw data to Azure Blob Storage (for data ingestion service)
        """
        try:
            # Get the actual container name from our containers dict
            actual_container = self.containers.get(container_name, container_name)
            
            # Add company prefix if provided
            if company_id:
                blob_name = f"company_{company_id}/{blob_name}"
            
            blob_client = self.blob_service_client.get_blob_client(
                container=actual_container,
                blob=blob_name
            )
            
            # Handle different data types
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            # Upload with metadata
            metadata = {
                'uploaded_at': datetime.utcnow().isoformat(),
                'company_id': str(company_id) if company_id else None,
                'content_type': content_type
            }
            
            await asyncio.to_thread(
                blob_client.upload_blob,
                data,
                overwrite=True,
                content_type=content_type,
                metadata=metadata
            )
            
            blob_url = blob_client.url
            logger.info(f"✅ Data uploaded to: {blob_url}")
            return blob_url
            
        except Exception as e:
            logger.error(f"❌ Failed to upload data: {e}")
            raise
    
    async def download_blob(
        self, 
        blob_name: str, 
        container_type: str = 'staging',
        company_id: int = None
    ) -> bytes:
        """
        Download blob content from Azure Blob Storage
        """
        try:
            container_name = self.containers.get(container_type, self.containers['staging'])
            
            # Add company prefix if provided
            if company_id:
                blob_name = f"company_{company_id}/{blob_name}"
            
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            content = await asyncio.to_thread(blob_client.download_blob)
            data = await asyncio.to_thread(content.readall)
            
            logger.info(f"✅ Downloaded blob: {blob_name}")
            return data
            
        except ResourceNotFoundError:
            logger.error(f"❌ Blob not found: {blob_name}")
            raise FileNotFoundError(f"Blob not found: {blob_name}")
        except Exception as e:
            logger.error(f"❌ Failed to download blob: {e}")
            raise
    
    async def download_csv_as_dataframe(
        self, 
        blob_name: str, 
        container_type: str = 'staging',
        company_id: int = None
    ) -> pd.DataFrame:
        """
        Download CSV blob and return as pandas DataFrame
        """
        try:
            csv_data = await self.download_blob(blob_name, container_type, company_id)
            csv_string = csv_data.decode('utf-8')
            df = pd.read_csv(StringIO(csv_string))
            
            logger.info(f"✅ Downloaded CSV as DataFrame: {blob_name} ({len(df)} rows)")
            return df
            
        except Exception as e:
            logger.error(f"❌ Failed to download CSV as DataFrame: {e}")
            raise
    
    async def list_blobs(
        self, 
        container_type: str = 'staging',
        company_id: int = None,
        prefix: str = None
    ) -> List[Dict[str, Any]]:
        """
        List blobs in container with optional filtering
        """
        try:
            container_name = self.containers.get(container_type, self.containers['staging'])
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # Build prefix for filtering
            search_prefix = ""
            if company_id:
                search_prefix = f"company_{company_id}/"
            if prefix:
                search_prefix += prefix
            
            blob_list = []
            blobs = await asyncio.to_thread(
                container_client.list_blobs, 
                name_starts_with=search_prefix if search_prefix else None
            )
            
            for blob in blobs:
                blob_info = {
                    'name': blob.name,
                    'size': blob.size,
                    'last_modified': blob.last_modified.isoformat() if blob.last_modified else None,
                    'content_type': blob.content_settings.content_type if blob.content_settings else None,
                    'url': f"{container_client.url}/{blob.name}",
                    'metadata': blob.metadata or {}
                }
                blob_list.append(blob_info)
            
            logger.info(f"✅ Listed {len(blob_list)} blobs from {container_name}")
            return blob_list
            
        except Exception as e:
            logger.error(f"❌ Failed to list blobs: {e}")
            raise
    
    async def delete_blob(
        self, 
        blob_name: str, 
        container_type: str = 'staging',
        company_id: int = None
    ) -> bool:
        """
        Delete blob from Azure Blob Storage
        """
        try:
            container_name = self.containers.get(container_type, self.containers['staging'])
            
            # Add company prefix if provided
            if company_id:
                blob_name = f"company_{company_id}/{blob_name}"
            
            blob_client = self.blob_service_client.get_blob_client(
                container=container_name,
                blob=blob_name
            )
            
            await asyncio.to_thread(blob_client.delete_blob)
            logger.info(f"✅ Deleted blob: {blob_name}")
            return True
            
        except ResourceNotFoundError:
            logger.warning(f"⚠️ Blob not found for deletion: {blob_name}")
            return False
        except Exception as e:
            logger.error(f"❌ Failed to delete blob: {e}")
            raise
    
    # =============================================================================
    # FOCUS CONVERTER METHODS
    # =============================================================================
    
    async def upload_focus_file(
        self,
        file_content: Union[bytes, str, BinaryIO],
        file_name: str,
        company_id: int,
        file_type: str = 'raw'  # 'raw' or 'converted'
    ) -> str:
        """
        Upload FOCUS-related file (raw cost data or converted FOCUS format)
        """
        container_type = 'staging' if file_type == 'raw' else 'focus_converted'
        
        # Add timestamp to filename to prevent conflicts
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        blob_name = f"{timestamp}_{file_name}"
        
        return await self.upload_file(
            file_content=file_content,
            blob_name=blob_name,
            container_type=container_type,
            company_id=company_id,
            content_type=self._get_content_type(file_name)
        )
    
    async def upload_converted_focus_data(
        self,
        converted_data: bytes,
        original_filename: str,
        company_id: int,
        provider: str
    ) -> str:
        """
        Upload converted FOCUS format data
        """
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        converted_filename = f"converted_{provider}_{timestamp}_{original_filename}"
        
        return await self.upload_file(
            file_content=converted_data,
            blob_name=converted_filename,
            container_type='focus_converted',
            company_id=company_id,
            content_type='application/parquet'
        )
    
    def _get_content_type(self, filename: str) -> str:
        """Get content type based on file extension"""
        ext = Path(filename).suffix.lower()
        content_types = {
            '.csv': 'text/csv',
            '.json': 'application/json',
            '.parquet': 'application/parquet',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain'
        }
        return content_types.get(ext, 'application/octet-stream')
    
    # =============================================================================
    # ANALYTICS AND MONITORING METHODS
    # =============================================================================
    
    async def get_storage_analytics(self, company_id: int = None) -> Dict[str, Any]:
        """
        Get storage analytics for company or overall
        """
        try:
            analytics = {
                'total_containers': len(self.containers),
                'containers': {},
                'total_files': 0,
                'total_size_bytes': 0,
                'by_company': {} if not company_id else None
            }
            
            for container_type, container_name in self.containers.items():
                container_stats = {
                    'name': container_name,
                    'files': 0,
                    'size_bytes': 0,
                    'latest_upload': None
                }
                
                try:
                    blobs = await self.list_blobs(container_type, company_id)
                    container_stats['files'] = len(blobs)
                    container_stats['size_bytes'] = sum(blob['size'] for blob in blobs)
                    
                    if blobs:
                        latest_blob = max(blobs, key=lambda x: x['last_modified'] or '')
                        container_stats['latest_upload'] = latest_blob['last_modified']
                    
                except Exception as e:
                    logger.warning(f"Could not get stats for container {container_name}: {e}")
                
                analytics['containers'][container_type] = container_stats
                analytics['total_files'] += container_stats['files']
                analytics['total_size_bytes'] += container_stats['size_bytes']
            
            # Add human-readable size
            analytics['total_size_mb'] = round(analytics['total_size_bytes'] / (1024 * 1024), 2)
            
            logger.info(f"✅ Generated storage analytics: {analytics['total_files']} files, {analytics['total_size_mb']} MB")
            return analytics
            
        except Exception as e:
            logger.error(f"❌ Failed to get storage analytics: {e}")
            raise
    
    async def cleanup_old_files(self, days_old: int = 30, dry_run: bool = True) -> Dict[str, Any]:
        """
        Clean up files older than specified days
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            cleanup_results = {
                'cutoff_date': cutoff_date.isoformat(),
                'dry_run': dry_run,
                'containers_processed': 0,
                'files_found': 0,
                'files_deleted': 0,
                'size_freed_bytes': 0,
                'errors': []
            }
            
            for container_type, container_name in self.containers.items():
                try:
                    blobs = await self.list_blobs(container_type)
                    cleanup_results['containers_processed'] += 1
                    
                    for blob in blobs:
                        if blob['last_modified']:
                            blob_date = datetime.fromisoformat(blob['last_modified'].replace('Z', '+00:00'))
                            if blob_date < cutoff_date:
                                cleanup_results['files_found'] += 1
                                cleanup_results['size_freed_bytes'] += blob['size']
                                
                                if not dry_run:
                                    try:
                                        await self.delete_blob(blob['name'], container_type)
                                        cleanup_results['files_deleted'] += 1
                                    except Exception as e:
                                        cleanup_results['errors'].append(f"Failed to delete {blob['name']}: {e}")
                                
                except Exception as e:
                    cleanup_results['errors'].append(f"Error processing container {container_name}: {e}")
            
            cleanup_results['size_freed_mb'] = round(cleanup_results['size_freed_bytes'] / (1024 * 1024), 2)
            
            action = "Would delete" if dry_run else "Deleted"
            logger.info(f"✅ Cleanup complete: {action} {cleanup_results['files_found']} files, {cleanup_results['size_freed_mb']} MB")
            
            return cleanup_results
            
        except Exception as e:
            logger.error(f"❌ Failed to cleanup old files: {e}")
            raise
    
    # =============================================================================
    # HEALTH CHECK AND TESTING
    # =============================================================================
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on Azure Blob Storage
        """
        try:
            # Test connection by listing containers
            container_client = self.blob_service_client.get_container_client(self.containers['staging'])
            await asyncio.to_thread(container_client.get_container_properties)
            
            return {
                'status': 'healthy',
                'service': 'azure-blob-storage',
                'containers_configured': len(self.containers),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Azure Blob Storage health check failed: {e}")
            return {
                'status': 'unhealthy',
                'service': 'azure-blob-storage',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    async def test_operations(self, company_id: int = 1) -> Dict[str, Any]:
        """
        Test all major operations
        """
        test_results = {
            'upload_test': False,
            'download_test': False,
            'list_test': False,
            'delete_test': False,
            'errors': []
        }
        
        test_blob_name = f"test_file_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.txt"
        test_content = "This is a test file for Azure Blob Storage operations."
        
        try:
            # Test upload
            await self.upload_file(test_content, test_blob_name, 'staging', company_id, 'text/plain')
            test_results['upload_test'] = True
            
            # Test download
            downloaded_content = await self.download_blob(test_blob_name, 'staging', company_id)
            if downloaded_content.decode('utf-8') == test_content:
                test_results['download_test'] = True
            
            # Test list
            blobs = await self.list_blobs('staging', company_id, test_blob_name)
            if len(blobs) > 0:
                test_results['list_test'] = True
            
            # Test delete
            if await self.delete_blob(test_blob_name, 'staging', company_id):
                test_results['delete_test'] = True
                
        except Exception as e:
            test_results['errors'].append(str(e))
        
        test_results['overall_success'] = all([
            test_results['upload_test'],
            test_results['download_test'],
            test_results['list_test'],
            test_results['delete_test']
        ])
        
        return test_results


# Export the class
AzureBlobStorage = UnifiedAzureBlobStorage


# Test the module
async def test_azure_storage():
    """Test Azure Blob Storage operations"""
    try:
        storage = UnifiedAzureBlobStorage()
        
        # Health check
        health = await storage.health_check()
        print(f"Health check: {health['status']}")
        
        # Test operations
        test_results = await storage.test_operations()
        print(f"Test results: {test_results}")
        
        # Get analytics
        analytics = await storage.get_storage_analytics()
        print(f"Storage analytics: {analytics['total_files']} files, {analytics['total_size_mb']} MB")
        
        print("✅ Azure Blob Storage test completed successfully")
        
    except Exception as e:
        print(f"❌ Azure Blob Storage test failed: {e}")


    async def health_check(self) -> Dict[str, Any]:
        """Check if Azure storage is healthy"""
        try:
            # Simple check - try to list containers
            containers = []
            async for container in self.blob_service_client.list_containers():
                containers.append(container.name)
            
            return {
                "status": "healthy",
                "containers": containers,
                "connection": "active"
            }
        except Exception as e:
            logger.error(f"Azure storage health check failed: {e}")
            return {
                "status": "unhealthy", 
                "error": str(e),
                "connection": "failed"
            }


if __name__ == "__main__":
    asyncio.run(test_azure_storage())