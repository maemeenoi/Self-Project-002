"""
Database Connection and Operations
Azure SQL Server connection using pyodbc for async operations
"""

import pyodbc
import asyncio
import logging
from typing import Dict, List, Any, Optional
from decouple import config
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Database Configuration from .env file
DB_CONFIG = {
    "server": config("DB_HOST"),
    "port": config("DB_PORT", default=1433, cast=int),
    "database": config("DB_NAME", default="sqldb-makestuffgo-test-001"),
    "username": config("DB_USER", default="sql_app_backend_test"),
    "password": config("DB_PASSWORD"),
    "driver": config("DB_DRIVER", default="ODBC Driver 18 for SQL Server"),
    "encrypt": config("DB_ENCRYPT", default="true"),
    "trust_server_certificate": config("DB_TRUST_SERVER_CERTIFICATE", default="false"),
    "connection_timeout": config("DB_CONNECTION_TIMEOUT", default=30, cast=int),
    "command_timeout": config("DB_COMMAND_TIMEOUT", default=30, cast=int),
}

# Thread pool for async operations
executor = ThreadPoolExecutor(max_workers=10)

def get_connection_string():
    """Build SQL Server connection string for pyodbc"""
    encrypt_val = "yes" if DB_CONFIG['encrypt'].lower() == "true" else "no"
    trust_cert_val = "yes" if DB_CONFIG['trust_server_certificate'].lower() == "true" else "no"
    
    return (
        f"DRIVER={{{DB_CONFIG['driver']}}};"
        f"SERVER={DB_CONFIG['server']},{DB_CONFIG['port']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID={DB_CONFIG['username']};"
        f"PWD={DB_CONFIG['password']};"
        f"Encrypt={encrypt_val};"
        f"TrustServerCertificate={trust_cert_val};"
        f"Connection Timeout={DB_CONFIG['connection_timeout']};"
    )

def _get_sync_connection():
    """Get synchronous database connection using pyodbc"""
    try:
        connection_string = get_connection_string()
        conn = pyodbc.connect(connection_string)
        conn.timeout = DB_CONFIG['command_timeout']
        logger.info("Azure SQL Database connection established successfully")
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise Exception(f"Failed to connect to Azure SQL Database: {str(e)}")

async def get_connection():
    """Get async database connection"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _get_sync_connection)

def convert_params_to_sql_server(query: str, params: Dict[str, Any]) -> tuple:
    """
    Convert named parameters to positional parameters for SQL Server
    Changes query from using {param_name} to ? and returns ordered params
    """
    if not params:
        return query, []
    
    # Convert {key} to ? for SQL Server positional parameters
    param_values = []
    for key, value in params.items():
        query = query.replace(f"{{{key}}}", "?")
        param_values.append(value)
    
    return query, param_values

def _execute_sync(query: str, params: Optional[Dict[str, Any]] = None) -> bool:
    """Execute SQL query synchronously (INSERT, UPDATE, DELETE)"""
    conn = None
    try:
        conn = _get_sync_connection()
        cursor = conn.cursor()
        
        # Convert parameters for SQL Server
        sql_query, sql_params = convert_params_to_sql_server(query, params or {})
        
        cursor.execute(sql_query, sql_params)
        conn.commit()
        
        logger.info(f"SQL executed successfully: {sql_query[:100]}...")
        return True
        
    except Exception as e:
        logger.error(f"SQL execution failed: {e}")
        if conn:
            conn.rollback()
        return False
        
    finally:
        if conn:
            conn.close()

def _query_one_sync(query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Execute SELECT query and return one row synchronously"""
    conn = None
    try:
        conn = _get_sync_connection()
        cursor = conn.cursor()
        
        # Convert parameters for SQL Server
        sql_query, sql_params = convert_params_to_sql_server(query, params or {})
        
        cursor.execute(sql_query, sql_params)
        row = cursor.fetchone()
        
        if row:
            # Get column names
            columns = [desc[0] for desc in cursor.description]
            return dict(zip(columns, row))
        
        return None
        
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        return None
        
    finally:
        if conn:
            conn.close()

def _query_many_sync(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Execute SELECT query and return multiple rows synchronously"""
    conn = None
    try:
        conn = _get_sync_connection()
        cursor = conn.cursor()
        
        # Convert parameters for SQL Server
        sql_query, sql_params = convert_params_to_sql_server(query, params or {})
        
        cursor.execute(sql_query, sql_params)
        rows = cursor.fetchall()
        
        if rows:
            # Get column names
            columns = [desc[0] for desc in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
        
        return []
        
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        return []
        
    finally:
        if conn:
            conn.close()

async def execute_sql(query: str, params: Optional[Dict[str, Any]] = None) -> bool:
    """Execute SQL query (INSERT, UPDATE, DELETE) - async wrapper"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute_sync, query, params)

async def query_one(query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Execute SELECT query and return one row - async wrapper"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _query_one_sync, query, params)

async def query_many(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Execute SELECT query and return multiple rows - async wrapper"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _query_many_sync, query, params)

# Alias for compatibility
async def query_all(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Alias for query_many - for backward compatibility"""
    return await query_many(query, params)

async def execute_transaction(queries: List[tuple]) -> bool:
    """Execute multiple queries in a transaction - async wrapper"""
    def _execute_transaction_sync(queries_list):
        conn = None
        try:
            conn = _get_sync_connection()
            cursor = conn.cursor()
            
            for query, params in queries_list:
                sql_query, sql_params = convert_params_to_sql_server(query, params or {})
                cursor.execute(sql_query, sql_params)
            
            conn.commit()
            logger.info(f"Transaction executed successfully with {len(queries_list)} queries")
            return True
            
        except Exception as e:
            logger.error(f"Transaction failed: {e}")
            if conn:
                conn.rollback()
            return False
            
        finally:
            if conn:
                conn.close()
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute_transaction_sync, queries)

async def create_tables():
    """Tables should already exist in Azure SQL - this is a no-op"""
    logger.info("Skipping table creation - using existing Azure SQL Database schema")
    return True

# Health check function
async def health_check() -> Dict[str, Any]:
    """Check database health"""
    try:
        result = await query_one("SELECT 1 as test_connection")
        
        if result and result.get("test_connection") == 1:
            return {
                "status": "healthy",
                "database": "azure-sql",
                "server": DB_CONFIG["server"],
                "database_name": DB_CONFIG["database"],
                "connection": "ok"
            }
        else:
            return {
                "status": "unhealthy", 
                "database": "azure-sql",
                "connection": "failed",
                "error": "Test query returned unexpected result"
            }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "azure-sql",
            "connection": "failed", 
            "error": str(e)
        }