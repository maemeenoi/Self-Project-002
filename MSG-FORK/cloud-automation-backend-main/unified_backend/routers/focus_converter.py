"""
Focus Converter Router

This router provides endpoints for cloud cost data analysis and FOCUS format conversion.
It integrates with the focus_converter library to process multi-cloud cost data.
"""

import sys
import asyncio
import logging
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from io import BytesIO

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

# Add focus_converter to path
sys.path.append(str(Path(__file__).parent.parent.parent / "focus_converter" / "focus_converter_base"))

from lib.db import create_sync_batch, complete_sync_batch, query_many, execute_sql
from services.cloud.azure_storage import UnifiedAzureBlobStorage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/focus", tags=["focus-converter"])

# Pydantic models
class FocusConversionRequest(BaseModel):
    provider: str  # aws, azure, gcp, oci
    include_source_columns: bool = False
    company_id: Optional[int] = None

class FocusConversionResponse(BaseModel):
    success: bool
    message: str
    batch_id: Optional[int] = None
    converted_file_url: Optional[str] = None
    processing_time_seconds: Optional[float] = None
    records_processed: Optional[int] = None

class FinancialDataQuery(BaseModel):
    company_id: Optional[int] = None
    provider: Optional[str] = None
    start_date: Optional[str] = None  # ISO format
    end_date: Optional[str] = None
    limit: int = 1000

class ProviderAnalysisRequest(BaseModel):
    company_id: Optional[int] = None
    analysis_type: str = "cost_summary"  # cost_summary, usage_trends, service_breakdown
    time_period_days: int = 30


# Initialize services
azure_storage = None

def get_azure_storage():
    """Get Azure storage instance"""
    global azure_storage
    if azure_storage is None:
        azure_storage = UnifiedAzureBlobStorage()
    return azure_storage

def get_focus_converter():
    """Get FOCUS converter instance"""
    try:
        from focus_converter.converter import FocusConverter
        from focus_converter.data_loaders.data_loader import DataFormats
        from focus_converter.data_loaders.provider_sensor import ProviderSensor
        
        converter = FocusConverter()
        converter.load_provider_conversion_configs()
        return converter, DataFormats, ProviderSensor
    except ImportError as e:
        logger.error(f"FOCUS converter not available: {e}")
        raise HTTPException(status_code=503, detail="FOCUS converter service not available")


@router.get("/providers")
async def get_supported_providers():
    """Get list of supported cloud providers"""
    try:
        converter, _, _ = get_focus_converter()
        providers = list(converter.plans.keys()) if hasattr(converter, 'plans') else []
        
        return {
            "providers": providers,
            "default_providers": ["aws", "azure", "gcp", "oci"],
            "description": "Supported cloud cost data providers for FOCUS conversion"
        }
    except Exception as e:
        logger.error(f"Error getting providers: {e}")
        return {
            "providers": ["aws", "azure", "gcp", "oci"],
            "note": "Default providers list (FOCUS converter not fully initialized)"
        }


@router.post("/detect-provider")
async def detect_provider(file: UploadFile = File(...)):
    """
    Detect cloud provider from uploaded cost data file
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            _, _, ProviderSensor = get_focus_converter()
            
            # Use ProviderSensor to detect provider
            sensor = ProviderSensor(temp_file_path)
            sensor._ProviderSensor__sense_file_format__()
            
            detection_result = {
                "filename": file.filename,
                "file_size_bytes": len(content),
                "detected_provider": None,
                "confidence": "unknown",
                "data_format": None,
                "suggestions": []
            }
            
            # Extract detection results
            if hasattr(sensor, 'provider') and sensor.provider:
                detection_result["detected_provider"] = sensor.provider
                detection_result["confidence"] = "high"
            
            if hasattr(sensor, 'data_format') and sensor.data_format:
                detection_result["data_format"] = str(sensor.data_format)
            
            # Add suggestions based on filename patterns
            filename_lower = file.filename.lower()
            if "aws" in filename_lower or "cur" in filename_lower:
                detection_result["suggestions"].append("aws")
            elif "azure" in filename_lower or "ea" in filename_lower:
                detection_result["suggestions"].append("azure")
            elif "gcp" in filename_lower or "billing" in filename_lower:
                detection_result["suggestions"].append("gcp")
            elif "oci" in filename_lower:
                detection_result["suggestions"].append("oci")
            
            return detection_result
            
        finally:
            # Clean up temp file
            Path(temp_file_path).unlink(missing_ok=True)
            
    except Exception as e:
        logger.error(f"Error detecting provider: {e}")
        raise HTTPException(status_code=500, detail=f"Provider detection failed: {str(e)}")


@router.post("/convert", response_model=FocusConversionResponse)
async def convert_to_focus(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    provider: str = Form(...),
    include_source_columns: bool = Form(False),
    company_id: int = Form(1)
):
    """
    Convert cloud cost data file to FOCUS format
    """
    start_time = datetime.utcnow()
    batch_id = None
    
    try:
        # Validate provider
        supported_providers = ["aws", "azure", "gcp", "oci"]
        if provider not in supported_providers:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        # Create sync batch
        batch_id = await create_sync_batch(
            company_id=company_id,
            source_system="focus_converter",
            source_file=file.filename
        )
        
        if not batch_id:
            raise HTTPException(status_code=500, detail="Failed to create processing batch")
        
        # Read file content
        file_content = await file.read()
        
        # Upload original file to Azure storage
        storage = get_azure_storage()
        original_blob_url = await storage.upload_focus_file(
            file_content=file_content,
            file_name=file.filename,
            company_id=company_id,
            file_type='raw'
        )
        
        # Process conversion in background
        background_tasks.add_task(
            process_focus_conversion,
            file_content=file_content,
            filename=file.filename,
            provider=provider,
            include_source_columns=include_source_columns,
            company_id=company_id,
            batch_id=batch_id,
            original_blob_url=original_blob_url
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return FocusConversionResponse(
            success=True,
            message=f"FOCUS conversion started for {provider} data",
            batch_id=batch_id,
            processing_time_seconds=processing_time
        )
        
    except Exception as e:
        logger.error(f"FOCUS conversion failed: {e}")
        
        if batch_id:
            await complete_sync_batch(batch_id, 0, 0, str(e))
        
        raise HTTPException(status_code=500, detail=f"FOCUS conversion failed: {str(e)}")


async def process_focus_conversion(
    file_content: bytes,
    filename: str,
    provider: str,
    include_source_columns: bool,
    company_id: int,
    batch_id: int,
    original_blob_url: str
):
    """
    Background task to process FOCUS conversion
    """
    try:
        logger.info(f"Starting FOCUS conversion for batch {batch_id}")
        
        # Initialize FOCUS converter
        converter, DataFormats, _ = get_focus_converter()
        
        # Create temporary files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write input file
            input_file_path = Path(temp_dir) / filename
            with open(input_file_path, 'wb') as f:
                f.write(file_content)
            
            # Set up output directory
            output_dir = Path(temp_dir) / "output"
            output_dir.mkdir(exist_ok=True)
            
            # Configure converter
            converter.load_data(
                data_path=str(input_file_path),
                data_format=DataFormats.CSV,  # Assume CSV for now
                parquet_data_format=None
            )
            
            converter.configure_data_export(
                export_path=str(output_dir),
                export_include_source_columns=include_source_columns
            )
            
            # Prepare conversion plan
            converter.prepare_horizontal_conversion_plan(provider=provider)
            
            # Run conversion
            converter.convert()
            
            # Find output files
            output_files = list(output_dir.rglob("*.parquet"))
            if not output_files:
                raise Exception("No output files generated")
            
            # Upload converted files to Azure storage
            storage = get_azure_storage()
            converted_file_urls = []
            total_records = 0
            
            for output_file in output_files:
                with open(output_file, 'rb') as f:
                    converted_content = f.read()
                
                converted_url = await storage.upload_converted_focus_data(
                    converted_data=converted_content,
                    original_filename=filename,
                    company_id=company_id,
                    provider=provider
                )
                converted_file_urls.append(converted_url)
                
                # Count records (approximate)
                try:
                    import pandas as pd
                    df = pd.read_parquet(output_file)
                    total_records += len(df)
                    
                    # Store financial facts in database
                    await store_financial_facts(df, company_id, batch_id, provider)
                    
                except Exception as e:
                    logger.warning(f"Could not process output file {output_file}: {e}")
            
            # Complete sync batch
            await complete_sync_batch(batch_id, total_records, 0, None)
            
            logger.info(f"✅ FOCUS conversion completed for batch {batch_id}: {total_records} records")
            
    except Exception as e:
        logger.error(f"❌ FOCUS conversion failed for batch {batch_id}: {e}")
        await complete_sync_batch(batch_id, 0, 0, str(e))


async def store_financial_facts(df, company_id: int, batch_id: int, provider: str):
    """
    Store converted FOCUS data as financial facts in database
    """
    try:
        # Prepare bulk insert data
        records = []
        for _, row in df.iterrows():
            record = {
                'company_id': company_id,
                'batch_id': batch_id,
                'provider': provider,
                'service_name': row.get('ServiceName'),
                'service_category': row.get('ServiceCategory'),
                'region': row.get('Region'),
                'availability_zone': row.get('AvailabilityZone'),
                'billed_cost': float(row.get('BilledCost', 0)) if row.get('BilledCost') else None,
                'effective_cost': float(row.get('EffectiveCost', 0)) if row.get('EffectiveCost') else None,
                'usage_quantity': float(row.get('UsageQuantity', 0)) if row.get('UsageQuantity') else None,
                'usage_unit': row.get('UsageUnit'),
                'resource_id': row.get('ResourceId'),
                'resource_name': row.get('ResourceName'),
                'billing_period_start': row.get('BillingPeriodStart'),
                'billing_period_end': row.get('BillingPeriodEnd'),
                'billing_currency': row.get('BillingCurrency'),
                'charge_type': row.get('ChargeType')
            }
            records.append(record)
        
        # Batch insert records
        if records:
            # Use bulk insert approach
            insert_query = """
                INSERT INTO FinancialFact (
                    CompanyID, BatchID, Provider, ServiceName, ServiceCategory, Region,
                    AvailabilityZone, BilledCost, EffectiveCost, UsageQuantity, UsageUnit,
                    ResourceId, ResourceName, BillingPeriodStart, BillingPeriodEnd,
                    BillingCurrency, ChargeType, CreatedAt
                ) VALUES
            """
            
            # Build values for bulk insert (simplified approach)
            # In production, consider using pandas.to_sql or SQLAlchemy bulk operations
            logger.info(f"✅ Would insert {len(records)} financial fact records (implementation pending)")
            
    except Exception as e:
        logger.error(f"Error storing financial facts: {e}")
        raise


@router.get("/conversion-status/{batch_id}")
async def get_conversion_status(batch_id: int):
    """
    Get status of a FOCUS conversion batch
    """
    try:
        query = """
            SELECT BatchID, SourceSystem, SourceFile, StartedAt, CompletedAt,
                   RecordsIngested, Status, ErrorMessage, ProcessingTimeSeconds
            FROM SyncBatch
            WHERE BatchID = {batch_id}
        """
        
        from lib.db import query_one
        result = await query_one(query, {"batch_id": batch_id})
        
        if not result:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        return {
            "batch_id": result["BatchID"],
            "status": result["Status"],
            "source_file": result["SourceFile"],
            "started_at": result["StartedAt"],
            "completed_at": result["CompletedAt"],
            "records_processed": result["RecordsIngested"],
            "processing_time_seconds": result["ProcessingTimeSeconds"],
            "error_message": result["ErrorMessage"]
        }
        
    except Exception as e:
        logger.error(f"Error getting conversion status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/financial-data")
async def get_financial_data(
    company_id: int = 1,
    provider: Optional[str] = None,
    limit: int = 100
):
    """
    Get financial data from database
    """
    try:
        # Build query with optional filters
        where_conditions = ["CompanyID = {company_id}"]
        params = {"company_id": company_id, "limit": limit}
        
        if provider:
            where_conditions.append("Provider = {provider}")
            params["provider"] = provider
        
        query = f"""
            SELECT TOP ({{{limit}}})
                Provider, ServiceName, ServiceCategory, Region,
                BilledCost, EffectiveCost, UsageQuantity, UsageUnit,
                ResourceId, ResourceName, BillingPeriodStart, BillingPeriodEnd,
                CreatedAt
            FROM FinancialFact
            WHERE {' AND '.join(where_conditions)}
            ORDER BY CreatedAt DESC
        """
        
        results = await query_many(query, params)
        
        return {
            "financial_data": results,
            "count": len(results),
            "filters": {
                "company_id": company_id,
                "provider": provider,
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting financial data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/cost-summary")
async def get_cost_summary(
    company_id: int = 1,
    days: int = 30
):
    """
    Get cost summary analytics
    """
    try:
        from lib.db import get_financial_summary
        summary = await get_financial_summary(company_id, days)
        
        return {
            "cost_summary": summary,
            "period_days": days,
            "company_id": company_id,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting cost summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def focus_health_check():
    """Health check for focus converter service"""
    try:
        converter, _, _ = get_focus_converter()
        storage = get_azure_storage()
        
        storage_health = await storage.health_check()
        
        return {
            "status": "healthy",
            "focus_converter": "available",
            "azure_storage": storage_health["status"],
            "supported_providers": list(converter.plans.keys()) if hasattr(converter, 'plans') else [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Focus converter health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }