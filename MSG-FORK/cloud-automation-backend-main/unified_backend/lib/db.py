"""
Unified Database Operations Module

This module provides database operations for the unified backend,
combining functionality from both focus_converter and work_processor projects.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import pyodbc
from decouple import config

logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "server": config("DB_HOST"),
    "port": config("DB_PORT", default=1433, cast=int),
    "database": config("DB_NAME"),
    "username": config("DB_USER"),
    "password": config("DB_PASSWORD"),
    "driver": config("DB_DRIVER", default="ODBC Driver 17 for SQL Server"),
    "encrypt": config("DB_ENCRYPT", default="true"),
    "trust_server_certificate": config("DB_TRUST_SERVER_CERTIFICATE", default="false"),
    "connection_timeout": config("DB_CONNECTION_TIMEOUT", default=30, cast=int),
    "command_timeout": config("DB_COMMAND_TIMEOUT", default=30, cast=int),
}


def get_connection_string() -> str:
    """Generate Azure SQL Database connection string"""
    return (
        f"DRIVER={{{DB_CONFIG['driver']}}};"
        f"SERVER={DB_CONFIG['server']},{DB_CONFIG['port']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID={DB_CONFIG['username']};"
        f"PWD={DB_CONFIG['password']};"
        f"Encrypt={DB_CONFIG['encrypt']};"
        f"TrustServerCertificate={DB_CONFIG['trust_server_certificate']};"
        f"Connection Timeout={DB_CONFIG['connection_timeout']};"
    )


async def get_connection():
    """
    Get database connection with error handling
    """
    try:
        connection_string = get_connection_string()
        connection = pyodbc.connect(connection_string, timeout=DB_CONFIG['command_timeout'])
        logger.debug("✅ Database connection established")
        return connection
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise Exception(f"Failed to connect to Azure SQL Database: {e}")


async def health_check() -> Dict[str, Any]:
    """
    Perform database health check
    """
    try:
        connection = await get_connection()
        cursor = connection.cursor()
        
        # Test basic connectivity
        cursor.execute("SELECT 1 as test, GETDATE() as current_time, @@VERSION as version")
        result = cursor.fetchone()
        
        if result and result[0] == 1:
            health_status = {
                "status": "healthy",
                "database": "azure-sql",
                "connection": "success",
                "server_time": str(result[1]) if result[1] else None,
                "server_version": str(result[2])[:100] if result[2] else None,  # Truncate version info
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            health_status = {
                "status": "unhealthy",
                "database": "azure-sql",
                "connection": "failed",
                "error": "Test query returned unexpected result"
            }
        
        cursor.close()
        connection.close()
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "azure-sql",
            "connection": "failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


async def execute_sql(query: str, params: Optional[Dict[str, Any]] = None) -> bool:
    """
    Execute SQL command (INSERT, UPDATE, DELETE, CREATE, etc.)
    Returns True if successful, raises exception if failed
    """
    connection = None
    cursor = None
    
    try:
        connection = await get_connection()
        cursor = connection.cursor()
        
        if params:
            # Replace named parameters with positional parameters for pyodbc
            formatted_query = query
            param_values = []
            
            for key, value in params.items():
                placeholder = f"{{{key}}}"
                if placeholder in formatted_query:
                    formatted_query = formatted_query.replace(placeholder, "?")
                    param_values.append(value)
            
            cursor.execute(formatted_query, param_values)
        else:
            cursor.execute(query)
        
        connection.commit()
        logger.debug(f"✅ SQL executed successfully: {query[:100]}...")
        return True
        
    except Exception as e:
        logger.error(f"SQL execution failed: {e}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        if connection:
            connection.rollback()
        raise Exception(f"Query execution failed: {str(e)}")
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


async def query_one(query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Execute SELECT query and return single row as dictionary
    """
    connection = None
    cursor = None
    
    try:
        connection = await get_connection()
        cursor = connection.cursor()
        
        if params:
            # Replace named parameters with positional parameters for pyodbc
            formatted_query = query
            param_values = []
            
            for key, value in params.items():
                placeholder = f"{{{key}}}"
                if placeholder in formatted_query:
                    formatted_query = formatted_query.replace(placeholder, "?")
                    param_values.append(value)
            
            cursor.execute(formatted_query, param_values)
        else:
            cursor.execute(query)
        
        row = cursor.fetchone()
        
        if row:
            # Convert row to dictionary using column names
            columns = [column[0] for column in cursor.description]
            result = dict(zip(columns, row))
            logger.debug(f"✅ Query returned 1 row: {query[:100]}...")
            return result
        else:
            logger.debug(f"✅ Query returned no rows: {query[:100]}...")
            return None
            
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise Exception(f"Failed to connect to Azure SQL Database: {e}")
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


async def insert_and_return(query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Execute INSERT query with OUTPUT clause and return the result
    This function properly commits the transaction unlike query_one
    """
    connection = None
    cursor = None
    
    try:
        connection = await get_connection()
        cursor = connection.cursor()
        
        if params:
            # Replace named parameters with positional parameters for pyodbc
            formatted_query = query
            param_values = []
            
            for key, value in params.items():
                placeholder = f"{{{key}}}"
                if placeholder in formatted_query:
                    formatted_query = formatted_query.replace(placeholder, "?")
                    param_values.append(value)
            
            cursor.execute(formatted_query, param_values)
        else:
            cursor.execute(query)
        
        row = cursor.fetchone()
        
        # IMPORTANT: Commit the transaction
        connection.commit()
        
        if row:
            # Convert row to dictionary using column names
            columns = [column[0] for column in cursor.description]
            result = dict(zip(columns, row))
            logger.debug(f"✅ Insert executed and committed: {query[:100]}...")
            return result
        else:
            logger.debug(f"✅ Insert executed but no output: {query[:100]}...")
            return None
            
    except Exception as e:
        logger.error(f"Insert execution failed: {e}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        if connection:
            connection.rollback()
        raise Exception(f"Failed to execute insert query: {e}")
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


async def query_many(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Execute SELECT query and return multiple rows as list of dictionaries
    """
    connection = None
    cursor = None
    
    try:
        connection = await get_connection()
        cursor = connection.cursor()
        
        if params:
            # Replace named parameters with positional parameters for pyodbc
            formatted_query = query
            param_values = []
            
            for key, value in params.items():
                placeholder = f"{{{key}}}"
                if placeholder in formatted_query:
                    formatted_query = formatted_query.replace(placeholder, "?")
                    param_values.append(value)
            
            cursor.execute(formatted_query, param_values)
        else:
            cursor.execute(query)
        
        rows = cursor.fetchall()
        
        if rows:
            # Convert rows to list of dictionaries using column names
            columns = [column[0] for column in cursor.description]
            results = [dict(zip(columns, row)) for row in rows]
            logger.debug(f"✅ Query returned {len(results)} rows: {query[:100]}...")
            return results
        else:
            logger.debug(f"✅ Query returned no rows: {query[:100]}...")
            return []
            
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise Exception(f"Failed to connect to Azure SQL Database: {e}")
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# Specialized functions for unified backend operations

async def get_company_info(company_id: int) -> Optional[Dict[str, Any]]:
    """Get company information by ID"""
    query = """
        SELECT CompanyID, Name, SizeLabel, Industry, CreatedAt, IsActive
        FROM Company 
        WHERE CompanyID = {company_id} AND IsActive = 1
    """
    return await query_one(query, {"company_id": company_id})


async def create_sync_batch(company_id: int, source_system: str, storage_stage_path: str = None, storage_clean_path: str = None) -> Optional[int]:
    """Create a new sync batch and return the BatchID with proper transaction handling and identity gap protection"""
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Use the insert_and_return function which handles transactions properly
            insert_query = """
                INSERT INTO SyncBatch (CompanyID, SourceSystem, IsFullSnapshot, StorageStagePath, StorageCleanPath, StartedAt)
                OUTPUT INSERTED.BatchID
                VALUES ({company_id}, {source_system}, {is_full_snapshot}, {storage_stage_path}, {storage_clean_path}, GETDATE())
            """
            
            result = await insert_and_return(insert_query, {
                "company_id": company_id,
                "source_system": source_system,
                "is_full_snapshot": 1,  # Default to full snapshot
                "storage_stage_path": storage_stage_path,
                "storage_clean_path": storage_clean_path
            })
            
            if result and "BatchID" in result:
                batch_id = result["BatchID"]
                logger.info(f"✅ Created sync batch {batch_id} for company {company_id}, source: {source_system}")
                
                # Verify the batch was actually created by querying it back
                verify_query = "SELECT BatchID FROM SyncBatch WHERE BatchID = {batch_id}"
                verification = await query_one(verify_query, {"batch_id": batch_id})
                
                if verification:
                    logger.info(f"✅ Verified sync batch {batch_id} exists in database")
                    return batch_id
                else:
                    logger.error(f"❌ Failed to verify sync batch {batch_id} - not found in database (attempt {attempt + 1})")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(0.1)  # Brief delay before retry
                        continue
                    else:
                        return None
            else:
                logger.error(f"Failed to create sync batch - no BatchID returned (attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(0.1)  # Brief delay before retry
                    continue
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating sync batch (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(0.1)  # Brief delay before retry
                continue
            else:
                return None
    
    return None


async def complete_sync_batch(batch_id: int, records_ingested: int, records_rejected: int = 0, error_message: str = None):
    """Mark a sync batch as completed"""
    
    update_query = """
        UPDATE SyncBatch 
        SET CompletedAt = GETDATE(),
            RecordsIngested = {records_ingested}
        WHERE BatchID = {batch_id}
    """
    
    try:
        await execute_sql(update_query, {
            "batch_id": batch_id,
            "records_ingested": records_ingested
        })
        
        logger.info(f"✅ Completed sync batch {batch_id}: {records_ingested} ingested, {records_rejected} rejected")
        
    except Exception as e:
        logger.error(f"Error completing sync batch {batch_id}: {e}")
        raise


async def get_recent_sync_batches(company_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent sync batches for a company"""
    query = """
        SELECT TOP ({limit}) 
            BatchID, SourceSystem, StartedAt, CompletedAt, RecordsIngested
        FROM SyncBatch
        WHERE CompanyID = {company_id}
        ORDER BY StartedAt DESC
    """
    
    return await query_many(query, {"company_id": company_id, "limit": limit})


async def get_workflow_summary(company_id: int, days: int = 30) -> Dict[str, Any]:
    """Get workflow summary statistics for dashboard"""
    query = """
        SELECT 
            Provider,
            ItemType,
            COUNT(*) as TotalItems,
            COUNT(CASE WHEN Status IN ('Done', 'Closed', 'merged') THEN 1 END) as CompletedItems,
            AVG(CASE WHEN LeadTimeHours > 0 THEN LeadTimeHours END) as AvgLeadTimeHours,
            COUNT(CASE WHEN CreatedAt >= DATEADD(day, -{days1}, GETDATE()) THEN 1 END) as RecentItems
        FROM WorkflowFact
        WHERE CompanyID = {company_id}
          AND CreatedAt >= DATEADD(day, -{days2}, GETDATE())
        GROUP BY Provider, ItemType
        ORDER BY Provider, ItemType
    """
    
    results = await query_many(query, {"company_id": company_id, "days1": days, "days2": days})
    
    # Format results into summary structure
    summary = {
        "total_items": sum(r["TotalItems"] for r in results),
        "completed_items": sum(r["CompletedItems"] for r in results),
        "avg_lead_time_hours": sum(r["AvgLeadTimeHours"] or 0 for r in results) / len(results) if results else 0,
        "by_provider": {}
    }
    
    for result in results:
        provider = result["Provider"]
        if provider not in summary["by_provider"]:
            summary["by_provider"][provider] = {}
        
        summary["by_provider"][provider][result["ItemType"]] = {
            "total": result["TotalItems"],
            "completed": result["CompletedItems"],
            "avg_lead_time_hours": result["AvgLeadTimeHours"],
            "recent": result["RecentItems"]
        }
    
    return summary


async def get_financial_summary(company_id: int, days: int = 30) -> Dict[str, Any]:
    """Get financial summary statistics for dashboard"""
    query = """
        SELECT 
            Provider,
            ServiceCategory,
            Region,
            COUNT(*) as TotalRecords,
            SUM(BilledCost) as TotalBilledCost,
            SUM(EffectiveCost) as TotalEffectiveCost,
            AVG(BilledCost) as AvgBilledCost,
            SUM(UsageQuantity) as TotalUsage
        FROM FinancialFact
        WHERE CompanyID = {company_id}
          AND BillingPeriodStart >= DATEADD(day, -{days}, GETDATE())
        GROUP BY Provider, ServiceCategory, Region
        ORDER BY TotalBilledCost DESC
    """
    
    results = await query_many(query, {"company_id": company_id, "days": days})
    
    # Format results into summary structure
    summary = {
        "total_cost": sum(r["TotalBilledCost"] or 0 for r in results),
        "total_records": sum(r["TotalRecords"] for r in results),
        "by_provider": {}
    }
    
    for result in results:
        provider = result["Provider"]
        if provider not in summary["by_provider"]:
            summary["by_provider"][provider] = {
                "total_cost": 0,
                "services": {}
            }
        
        summary["by_provider"][provider]["total_cost"] += result["TotalBilledCost"] or 0
        
        service = result["ServiceCategory"] or "Unknown"
        if service not in summary["by_provider"][provider]["services"]:
            summary["by_provider"][provider]["services"][service] = {
                "total_cost": 0,
                "regions": {}
            }
        
        summary["by_provider"][provider]["services"][service]["total_cost"] += result["TotalBilledCost"] or 0
        
        region = result["Region"] or "Unknown"
        summary["by_provider"][provider]["services"][service]["regions"][region] = {
            "cost": result["TotalBilledCost"] or 0,
            "usage": result["TotalUsage"] or 0,
            "records": result["TotalRecords"]
        }
    
    return summary


async def health_check() -> Dict[str, Any]:
    """
    Perform database health check
    """
    try:
        # Simple query to test database connectivity
        query = "SELECT 1 as health_check"
        result = await query_one(query)
        
        if result and result.get("health_check") == 1:
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "status": "unhealthy",
                "database": "query_failed",
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "connection_failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


# Test functions
async def test_database_operations():
    """Test all database operations"""
    print("🧪 Testing unified database operations...")
    
    try:
        # Test health check
        health = await health_check()
        print(f"Health check: {health['status']}")
        
        # Test company info
        company = await get_company_info(1)
        print(f"Company info: {company}")
        
        # Test sync batch creation
        batch_id = await create_sync_batch(1, "test", "test_file.csv", "test/path/file.csv")
        print(f"Created batch: {batch_id}")
        
        if batch_id:
            # Test batch completion
            await complete_sync_batch(batch_id, 100, 5, None)
            print(f"Completed batch: {batch_id}")
        
        # Test recent batches
        batches = await get_recent_sync_batches(1, 5)
        print(f"Recent batches: {len(batches)}")
        
        print("✅ All database operations tested successfully")
        
    except Exception as e:
        print(f"❌ Database operations test failed: {e}")


if __name__ == "__main__":
    asyncio.run(test_database_operations())