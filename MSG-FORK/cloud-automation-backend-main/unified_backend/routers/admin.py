"""
Admin Router

This router provides administrative endpoints for managing companies, users,
sync batches, and system operations.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
import hashlib
import secrets

from fastapi import APIRouter, HTTPException, Depends, Query, Form, BackgroundTasks
from pydantic import BaseModel

# Import get_current_company function
from utils.auth import get_current_company

from lib.db import (
    query_one, query_many, execute_sql, insert_and_return, health_check,
    get_company_info, get_recent_sync_batches,
    get_workflow_summary, get_financial_summary
)
from services.cloud.azure_storage import UnifiedAzureBlobStorage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ============================================================================
# Utility Functions
# ============================================================================
import bcrypt

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()  # automatically handles random salt
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # store as string

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a bcrypt hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except ValueError:
        return False


# ============================================================================
# Pydantic models
# ============================================================================
class CompanyCreate(BaseModel):
    name: str
    size_label: Optional[str] = None
    industry: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    size_label: Optional[str] = None
    industry: Optional[str] = None
    is_active: Optional[bool] = None

class UserCreate(BaseModel):
    company_id: Optional[int] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: str
    phone: Optional[str] = None
    password: Optional[str] = None
    is_super_admin: bool = False
    is_company_admin: bool = False
    role: str = "user"

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_super_admin: Optional[bool] = None
    is_company_admin: Optional[bool] = None
    role: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    user_id: int
    company_id: Optional[int]
    first_name: str
    middle_name: Optional[str]
    last_name: str
    email: str
    phone: Optional[str]
    is_super_admin: bool
    is_company_admin: Optional[bool] = False
    role: Optional[str] = "user"
    is_active: bool
    department: Optional[str]
    location: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    last_sign_in_at: Optional[datetime]

class SystemHealthResponse(BaseModel):
    overall_status: str
    components: Dict[str, Any]
    timestamp: str


# Initialize services
azure_storage = None

def get_azure_storage():
    """Get Azure storage instance"""
    global azure_storage
    if azure_storage is None:
        azure_storage = UnifiedAzureBlobStorage()
    return azure_storage


# Company management endpoints
@router.get("/companies")
async def list_companies(
    active_only: bool = Query(True),
    limit: int = Query(50, le=1000)
):
    """List all companies"""
    try:
        where_clause = "WHERE IsActive = 1" if active_only else ""
        
        query = f"""
            SELECT TOP ({{{limit}}})
                CompanyID, Name, SizeLabel, Industry, CreatedAt, UpdatedAt, IsActive
            FROM Company 
            {where_clause}
            ORDER BY CreatedAt DESC
        """
        
        companies = await query_many(query, {"limit": limit})
        
        # Get additional stats for each company
        for company in companies:
            company_id = company["CompanyID"]
            
            # Count workflow facts
            workflow_count_query = "SELECT COUNT(*) as count FROM WorkflowFact WHERE CompanyID = {company_id}"
            workflow_result = await query_one(workflow_count_query, {"company_id": company_id})
            company["workflow_facts_count"] = workflow_result.get("count", 0) if workflow_result else 0
            
            # Count financial facts
            financial_count_query = "SELECT COUNT(*) as count FROM FinancialFact WHERE CompanyID = {company_id}"
            financial_result = await query_one(financial_count_query, {"company_id": company_id})
            company["financial_facts_count"] = financial_result.get("count", 0) if financial_result else 0
            
            # Get recent sync batches count
            batch_count_query = "SELECT COUNT(*) as count FROM SyncBatch WHERE CompanyID = {company_id}"
            batch_result = await query_one(batch_count_query, {"company_id": company_id})
            company["sync_batches_count"] = batch_result.get("count", 0) if batch_result else 0
        
        return {
            "companies": companies,
            "count": len(companies),
            "active_only": active_only
        }
        
    except Exception as e:
        logger.error(f"Error listing companies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/companies")
async def create_company(company: CompanyCreate):
    """Create a new company"""
    try:
        # Check if company name already exists
        existing_query = "SELECT CompanyID FROM Company WHERE Name = {name}"
        existing = await query_one(existing_query, {"name": company.name})
        
        if existing:
            raise HTTPException(status_code=400, detail="Company name already exists")
        
        # Create company
        insert_query = """
            INSERT INTO Company (Name, SizeLabel, Industry, CreatedAt, UpdatedAt, IsActive)
            OUTPUT INSERTED.CompanyID
            VALUES ({name}, {size_label}, {industry}, GETDATE(), GETDATE(), 1)
        """
        
        result = await query_one(insert_query, {
            "name": company.name,
            "size_label": company.size_label,
            "industry": company.industry
        })
        
        if not result or "CompanyID" not in result:
            raise HTTPException(status_code=500, detail="Failed to create company")
        
        company_id = result["CompanyID"]
        
        # Fetch the created company
        created_company = await get_company_info(company_id)
        
        return {
            "success": True,
            "message": "Company created successfully",
            "company": created_company
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating company: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/companies/{company_id}")
async def get_company(company_id: int):
    """Get detailed company information"""
    try:
        company = await get_company_info(company_id)
        
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get additional details
        # Recent activity
        recent_batches = await get_recent_sync_batches(company_id, 5)
        
        # Summary statistics
        workflow_summary = await get_workflow_summary(company_id, 30)
        financial_summary = await get_financial_summary(company_id, 30)
        
        return {
            "company": company,
            "recent_batches": recent_batches,
            "workflow_summary": workflow_summary,
            "financial_summary": financial_summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting company {company_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/companies/{company_id}")
async def update_company(company_id: int, updates: CompanyUpdate):
    """Update company information"""
    try:
        # Check if company exists
        existing = await get_company_info(company_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Build update query
        update_fields = []
        params = {"company_id": company_id}
        
        if updates.name is not None:
            update_fields.append("Name = {name}")
            params["name"] = updates.name
        
        if updates.size_label is not None:
            update_fields.append("SizeLabel = {size_label}")
            params["size_label"] = updates.size_label
        
        if updates.industry is not None:
            update_fields.append("Industry = {industry}")
            params["industry"] = updates.industry
        
        if updates.is_active is not None:
            update_fields.append("IsActive = {is_active}")
            params["is_active"] = 1 if updates.is_active else 0
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        update_fields.append("UpdatedAt = GETDATE()")
        
        update_query = f"""
            UPDATE Company 
            SET {', '.join(update_fields)}
            WHERE CompanyID = {{company_id}}
        """
        
        await execute_sql(update_query, params)
        
        # Return updated company
        updated_company = await get_company_info(company_id)
        
        return {
            "success": True,
            "message": "Company updated successfully",
            "company": updated_company
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating company {company_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Sync batch management
@router.get("/sync-batches")
async def list_sync_batches(
    company_id: Optional[int] = Query(None),
    source_system: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=1000)
):
    """List sync batches with optional filtering"""
    try:
        where_conditions = []
        params = {"limit": limit}
        
        if company_id:
            where_conditions.append("CompanyID = {company_id}")
            params["company_id"] = company_id
        
        if source_system:
            where_conditions.append("SourceSystem = {source_system}")
            params["source_system"] = source_system
        
        if status:
            where_conditions.append("Status = {status}")
            params["status"] = status
        
        where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        query = f"""
            SELECT TOP ({{{limit}}})
                sb.BatchID, sb.CompanyID, c.Name as CompanyName,
                sb.SourceSystem, sb.SourceFile, sb.BlobPath,
                sb.StartedAt, sb.CompletedAt, sb.RecordsIngested, sb.RecordsRejected,
                sb.Status, sb.ErrorMessage, sb.ProcessingTimeSeconds
            FROM SyncBatch sb
            LEFT JOIN Company c ON sb.CompanyID = c.CompanyID
            {where_clause}
            ORDER BY sb.StartedAt DESC
        """
        
        batches = await query_many(query, params)
        
        return {
            "sync_batches": batches,
            "count": len(batches),
            "filters": {
                "company_id": company_id,
                "source_system": source_system,
                "status": status
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing sync batches: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync-batches/{batch_id}")
async def get_sync_batch_details(batch_id: int):
    """Get detailed information about a sync batch"""
    try:
        # Get batch info
        batch_query = """
            SELECT sb.*, c.Name as CompanyName
            FROM SyncBatch sb
            LEFT JOIN Company c ON sb.CompanyID = c.CompanyID
            WHERE sb.BatchID = {batch_id}
        """
        
        batch = await query_one(batch_query, {"batch_id": batch_id})
        
        if not batch:
            raise HTTPException(status_code=404, detail="Sync batch not found")
        
        # Get related data counts
        workflow_count_query = "SELECT COUNT(*) as count FROM WorkflowFact WHERE BatchID = {batch_id}"
        workflow_result = await query_one(workflow_count_query, {"batch_id": batch_id})
        
        financial_count_query = "SELECT COUNT(*) as count FROM FinancialFact WHERE BatchID = {batch_id}"
        financial_result = await query_one(financial_count_query, {"batch_id": batch_id})
        
        return {
            "batch": batch,
            "related_data": {
                "workflow_facts": workflow_result.get("count", 0) if workflow_result else 0,
                "financial_facts": financial_result.get("count", 0) if financial_result else 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sync batch {batch_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# System health and monitoring
@router.get("/health", response_model=SystemHealthResponse)
async def system_health():
    """Comprehensive system health check"""
    try:
        # Database health
        db_health = await health_check()
        
        # Azure storage health
        storage = get_azure_storage()
        storage_health = await storage.health_check()
        
        # Get system statistics
        stats_queries = {
            "companies": "SELECT COUNT(*) as count FROM Company WHERE IsActive = 1",
            "workflow_facts": "SELECT COUNT(*) as count FROM WorkflowFact",
            "financial_facts": "SELECT COUNT(*) as count FROM FinancialFact", 
            "sync_batches": "SELECT COUNT(*) as count FROM SyncBatch",
            "active_batches": "SELECT COUNT(*) as count FROM SyncBatch WHERE Status = 'in_progress'"
        }
        
        stats = {}
        for stat_name, query in stats_queries.items():
            try:
                result = await query_one(query, {})
                stats[stat_name] = result.get("count", 0) if result else 0
            except Exception as e:
                logger.warning(f"Could not get {stat_name} count: {e}")
                stats[stat_name] = "unknown"
        
        # Recent activity (last 24 hours)
        recent_activity_query = """
            SELECT COUNT(*) as count 
            FROM SyncBatch 
            WHERE StartedAt >= DATEADD(hour, -24, GETDATE())
        """
        recent_result = await query_one(recent_activity_query, {})
        stats["recent_batches_24h"] = recent_result.get("count", 0) if recent_result else 0
        
        # Overall status
        overall_status = "healthy"
        if (db_health["status"] != "healthy" or 
            storage_health["status"] != "healthy"):
            overall_status = "degraded"
        
        return SystemHealthResponse(
            overall_status=overall_status,
            components={
                "database": db_health,
                "azure_storage": storage_health,
                "statistics": stats,
                "system_info": {
                    "uptime_check": datetime.utcnow().isoformat(),
                    "version": "1.0.0"
                }
            },
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/storage/analytics")
async def get_storage_analytics(company_id: Optional[int] = Query(None)):
    """Get Azure Blob Storage analytics"""
    try:
        storage = get_azure_storage()
        analytics = await storage.get_storage_analytics(company_id)
        
        return {
            "storage_analytics": analytics,
            "company_id": company_id,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting storage analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/storage/cleanup")
async def cleanup_old_storage_files(
    background_tasks: BackgroundTasks,
    days_old: int = Form(30),
    dry_run: bool = Form(True)
):
    """Clean up old files from Azure Blob Storage"""
    try:
        # Run cleanup in background
        background_tasks.add_task(
            run_storage_cleanup,
            days_old=days_old,
            dry_run=dry_run
        )
        
        return {
            "success": True,
            "message": f"Storage cleanup {'simulation' if dry_run else 'operation'} started",
            "parameters": {
                "days_old": days_old,
                "dry_run": dry_run
            }
        }
        
    except Exception as e:
        logger.error(f"Error initiating storage cleanup: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def run_storage_cleanup(days_old: int, dry_run: bool):
    """Background task for storage cleanup"""
    try:
        logger.info(f"Starting storage cleanup: {days_old} days old, dry_run={dry_run}")
        
        storage = get_azure_storage()
        results = await storage.cleanup_old_files(days_old, dry_run)
        
        action = "Would delete" if dry_run else "Deleted"
        logger.info(
            f"✅ Storage cleanup completed: {action} {results['files_found']} files, "
            f"{results['size_freed_mb']} MB"
        )
        
    except Exception as e:
        logger.error(f"❌ Storage cleanup failed: {e}")


# Database maintenance endpoints
@router.get("/database/statistics")
async def get_database_statistics():
    """Get comprehensive database statistics"""
    try:
        stats = {}
        
        # Table row counts
        table_queries = {
            "companies": "SELECT COUNT(*) as count FROM Company",
            "users": "SELECT COUNT(*) as count FROM UserAccount",
            "sync_batches": "SELECT COUNT(*) as count FROM SyncBatch",
            "workflow_facts": "SELECT COUNT(*) as count FROM WorkflowFact",
            "financial_facts": "SELECT COUNT(*) as count FROM FinancialFact"
        }
        
        for table_name, query in table_queries.items():
            try:
                result = await query_one(query, {})
                stats[table_name] = result.get("count", 0) if result else 0
            except Exception as e:
                logger.warning(f"Could not get {table_name} count: {e}")
                stats[table_name] = "error"
        
        # Provider breakdown
        provider_queries = {
            "workflow_providers": """
                SELECT Provider, COUNT(*) as count 
                FROM WorkflowFact 
                GROUP BY Provider
            """,
            "financial_providers": """
                SELECT Provider, COUNT(*) as count 
                FROM FinancialFact 
                GROUP BY Provider
            """
        }
        
        for stat_name, query in provider_queries.items():
            try:
                results = await query_many(query, {})
                stats[stat_name] = {r["Provider"]: r["count"] for r in results}
            except Exception as e:
                logger.warning(f"Could not get {stat_name}: {e}")
                stats[stat_name] = {}
        
        # Recent activity
        recent_activity = {
            "batches_last_24h": """
                SELECT COUNT(*) as count 
                FROM SyncBatch 
                WHERE StartedAt >= DATEADD(hour, -24, GETDATE())
            """,
            "workflow_facts_last_7d": """
                SELECT COUNT(*) as count 
                FROM WorkflowFact 
                WHERE IngestedAt >= DATEADD(day, -7, GETDATE())
            """,
            "financial_facts_last_7d": """
                SELECT COUNT(*) as count 
                FROM FinancialFact 
                WHERE CreatedAt >= DATEADD(day, -7, GETDATE())
            """
        }
        
        for activity_name, query in recent_activity.items():
            try:
                result = await query_one(query, {})
                stats[activity_name] = result.get("count", 0) if result else 0
            except Exception as e:
                logger.warning(f"Could not get {activity_name}: {e}")
                stats[activity_name] = "error"
        
        return {
            "database_statistics": stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting database statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/database/test")
async def test_database_operations():
    """Test database operations"""
    try:
        # Test basic connectivity
        health = await health_check()
        
        # Test company query
        companies = await query_many("SELECT TOP 1 CompanyID, Name FROM Company", {})
        
        # Test sync batch creation (and cleanup)
        test_batch_id = None
        try:
            from lib.db import create_sync_batch, complete_sync_batch
            test_batch_id = await create_sync_batch(1, "admin_test", "test_operation.txt")
            
            if test_batch_id:
                await complete_sync_batch(test_batch_id, 0, 0, "Test operation")
        except Exception as e:
            logger.warning(f"Test batch operation failed: {e}")
        
        return {
            "success": True,
            "tests": {
                "health_check": health["status"] == "healthy",
                "company_query": len(companies) > 0,
                "batch_operations": test_batch_id is not None
            },
            "message": "Database operation tests completed"
        }
        
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# User Management Endpoints
# ============================================================================

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    company_id: int = Depends(get_current_company),
    limit: int = Query(50, le=1000)
):
    """List users for a specific company (excluding super admins)"""
    try:
        # Always require company_id and exclude super admins
        if not company_id:
            raise HTTPException(status_code=400, detail="company_id is required")
            
        query = f"""
            SELECT TOP ({limit})
                UserID, CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                IsSuperAdmin, IsActive, Department, Location, CreatedAt, UpdatedAt, LastSignInAt
            FROM UserAccount 
            WHERE CompanyID = {{company_id}} AND IsSuperAdmin = 0
            ORDER BY CreatedAt DESC
        """
        
        params = {"limit": limit, "company_id": company_id}
            
        users = await query_many(query, params)
        
        result = []
        for user in users:
            result.append(UserResponse(
                user_id=user["UserID"],
                company_id=user["CompanyID"],
                first_name=user.get("FirstName", ""),
                middle_name=user.get("MiddleName"),
                last_name=user.get("LastName", ""),
                email=user["Email"],
                phone=user.get("Phone"),
                is_super_admin=user.get("IsSuperAdmin", False),
                is_active=user.get("IsActive", True),
                department=user.get("Department"),
                location=user.get("Location"),
                created_at=user["CreatedAt"],
                updated_at=user.get("UpdatedAt"),
                last_sign_in_at=user.get("LastSignInAt")
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user"""
    try:
        # Check if user already exists
        existing_query = "SELECT UserID FROM UserAccount WHERE Email = {email}"
        existing = await query_one(existing_query, {"email": user.email})
        
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Hash password if provided
        password_hash = None
        if user.password:
            password_hash = hash_password(user.password)
        
        # Create user
        insert_query = """
            INSERT INTO UserAccount (
                CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                PasswordHash, IsSuperAdmin, CreatedAt, UpdatedAt, IsActive
            )
            OUTPUT INSERTED.UserID
            VALUES (
                {company_id}, {first_name}, {middle_name}, {last_name}, {email}, {phone},
                {password_hash}, {is_super_admin}, GETDATE(), GETDATE(), 1
            )
        """
        
        result = await query_one(insert_query, {
            "company_id": user.company_id,
            "first_name": user.first_name,
            "middle_name": user.middle_name, 
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "password_hash": password_hash,
            "is_super_admin": user.is_super_admin
        })
        
        if not result or "UserID" not in result:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user_id = result["UserID"]
        
        # Fetch the created user
        user_query = """
            SELECT UserID as user_id, CompanyID as company_id, FirstName as first_name, 
                   MiddleName as middle_name, LastName as last_name, Email as email, 
                   Phone as phone, IsSuperAdmin as is_super_admin, Department as department, 
                   Location as location, IsActive as is_active,
                   CreatedAt as created_at, UpdatedAt as updated_at, LastSignInAt as last_sign_in_at
            FROM UserAccount
            WHERE UserID = {user_id}
        """
        created_user = await query_one(user_query, {"user_id": user_id})
        
        logger.info(f"🔧 DEBUG - User ID created: {user_id}")
        logger.info(f"🔧 DEBUG - Retrieved user data: {created_user}")
        
        if not created_user:
            logger.error(f"🔧 DEBUG - Failed to retrieve user with ID {user_id}")
            raise HTTPException(status_code=500, detail="Failed to retrieve created user")
        
        return UserResponse(
            user_id=created_user["user_id"],
            company_id=created_user["company_id"],
            first_name=created_user.get("first_name", ""),
            middle_name=created_user.get("middle_name"),
            last_name=created_user.get("last_name", ""),
            email=created_user["email"],
            phone=created_user.get("phone"),
            is_super_admin=created_user.get("is_super_admin", False),
            is_company_admin=False,  # Column doesn't exist in table
            role="user",  # Column doesn't exist in table, default to user
            department=created_user.get("department"),
            location=created_user.get("location"),
            is_active=created_user.get("is_active", True),
            created_at=created_user["created_at"],
            updated_at=created_user.get("updated_at"),
            last_sign_in_at=created_user.get("last_sign_in_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Get a specific user by ID"""
    try:
        query = """
            SELECT UserID, CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                   IsSuperAdmin, Department, Location, IsActive,
                   CreatedAt, UpdatedAt, LastSignInAt
            FROM UserAccount
            WHERE UserID = {user_id}
        """
        
        user = await query_one(query, {"user_id": user_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            user_id=user["UserID"],
            company_id=user["CompanyID"],
            first_name=user.get("FirstName", ""),
            middle_name=user.get("MiddleName"),
            last_name=user.get("LastName", ""),
            email=user["Email"],
            phone=user.get("Phone"),
            is_super_admin=user.get("IsSuperAdmin", False),
            is_company_admin=False,  # Column doesn't exist in table
            role="user",  # Column doesn't exist in table, default to user
            department=user.get("Department"),
            location=user.get("Location"),
            is_active=user.get("IsActive", True),
            created_at=user["CreatedAt"],
            updated_at=user.get("UpdatedAt"),
            last_sign_in_at=user.get("LastSignInAt")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    company_id: int = Depends(get_current_company)
):
    """Update a user's information"""
    try:
        logger.info(f"🔄 Updating user {user_id} for company {company_id}")
        
        # First, verify the user exists and belongs to the company (unless it's a super admin operation)
        check_query = """
            SELECT UserID, CompanyID, Email, IsSuperAdmin 
            FROM UserAccount 
            WHERE UserID = {user_id}
        """
        existing_user = await query_one(check_query, {"user_id": user_id})
        
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # For non-super-admin operations, ensure the user belongs to the same company
        if not existing_user.get("IsSuperAdmin", False) and existing_user["CompanyID"] != company_id:
            raise HTTPException(status_code=403, detail="Cannot update user from different company")
        
        # Check if email is being changed and if it conflicts with existing users
        if user_update.email and user_update.email != existing_user["Email"]:
            email_check_query = "SELECT UserID FROM UserAccount WHERE Email = {email} AND UserID != {user_id}"
            email_conflict = await query_one(email_check_query, {
                "email": user_update.email,
                "user_id": user_id
            })
            if email_conflict:
                raise HTTPException(status_code=400, detail="Email already exists for another user")
        
        # Build update query with only provided fields
        update_fields = []
        update_params = {"user_id": user_id}
        
        # Map frontend fields to database fields (only include fields that exist in the table)
        field_mapping = {
            "first_name": "FirstName",
            "middle_name": "MiddleName", 
            "last_name": "LastName",
            "email": "Email",
            "phone": "Phone",
            "is_super_admin": "IsSuperAdmin",
            "department": "Department",
            "location": "Location",
            "is_active": "IsActive"
        }
        
        # Build the update query dynamically with unique parameter names
        param_counter = 0
        for field_name, db_column in field_mapping.items():
            field_value = getattr(user_update, field_name)
            if field_value is not None:
                param_key = f"param_{param_counter}"
                update_fields.append(f"{db_column} = {{{param_key}}}")
                update_params[param_key] = field_value
                param_counter += 1
        
        # Handle password update separately if provided
        if user_update.password:
            password_hash = hash_password(user_update.password)
            param_key = f"param_{param_counter}"
            update_fields.append(f"PasswordHash = {{{param_key}}}")
            update_params[param_key] = password_hash
            param_counter += 1
        
        if not update_fields:
            # No fields to update, just return the current user
            return await get_user(user_id)
        
        # Add UpdatedAt timestamp
        update_fields.append("UpdatedAt = GETDATE()")
        
        # Execute the update
        update_query = f"""
            UPDATE UserAccount 
            SET {', '.join(update_fields)}
            WHERE UserID = {{user_id}}
        """
        
        logger.info(f"🔍 Executing update query: {update_query}")
        logger.info(f"🔍 Update params: {update_params}")
        
        await execute_sql(update_query, update_params)
        
        # Return the updated user
        return await get_user(user_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    company_id: int = Depends(get_current_company)
):
    """Delete a user"""
    try:
        logger.info(f"🗑️ Deleting user {user_id} for company {company_id}")
        
        # First, verify the user exists and belongs to the company (unless it's a super admin operation)
        check_query = """
            SELECT UserID, CompanyID, Email, IsSuperAdmin 
            FROM UserAccount 
            WHERE UserID = {user_id}
        """
        existing_user = await query_one(check_query, {"user_id": user_id})
        
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # For non-super-admin operations, ensure the user belongs to the same company
        if not existing_user.get("IsSuperAdmin", False) and existing_user["CompanyID"] != company_id:
            raise HTTPException(status_code=403, detail="Cannot delete user from different company")
        
        # Prevent deletion of super admins
        if existing_user.get("IsSuperAdmin", False):
            raise HTTPException(status_code=403, detail="Cannot delete super admin users")
        
        # Delete the user
        delete_query = "DELETE FROM UserAccount WHERE UserID = {user_id}"
        await execute_sql(delete_query, {"user_id": user_id})
        
        logger.info(f"✅ Successfully deleted user {user_id}")
        
        return {
            "success": True,
            "message": f"User {existing_user['Email']} has been deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ============================================================================
# INTEGRATION OVERVIEW ENDPOINTS
# ============================================================================

@router.get("/github-overview")
async def get_github_overview(company_id: int = Depends(get_current_company)):
    """Get GitHub integration overview data for admin dashboard"""
    try:
        logger.info(f"📊 Getting GitHub overview data for company {company_id}")
        
        # Check if GitHub integration exists and is configured
        integration_check = await query_one(
            "SELECT IntegrationID FROM Integration WHERE CompanyID = {CompanyID} AND IntegrationType = 'github' AND IsActive = 1",
            {"CompanyID": company_id}
        )
        
        if not integration_check:
            return {
                "error": "GitHub integration not configured. Please configure integration first.",
                "configured": False
            }
        
        # Get workflow facts for GitHub
        github_facts = await query_many(
            """SELECT 
                Title, Status, Author, CreatedAt, ProjectOrRepo, Provider,
                ItemType, UpdatedAt
               FROM WorkflowFact 
               WHERE CompanyID = {CompanyID} AND Provider = 'github' 
               ORDER BY CreatedAt DESC""",
            {"CompanyID": company_id}
        )
        
        if not github_facts:
            return {
                "configured": True,
                "totalRepositories": 0,
                "activeRepositories": 0,
                "totalCommits": 0,
                "totalPullRequests": 0,
                "commitsByStatus": {},
                "pullRequestsByStatus": {},
                "repositoryActivity": [],
                "recentActivity": [],
                "lastUpdated": datetime.now().isoformat()
            }
        
        # Process GitHub data
        repositories = set()
        commits = []
        pull_requests = []
        recent_activity = []
        
        for fact in github_facts:
            repositories.add(fact["ProjectOrRepo"])
            
            # Categorize by item type
            if fact["ItemType"] == "commit":
                commits.append(fact)
            elif fact["ItemType"] == "pull_request":
                pull_requests.append(fact)
            
            # Add to recent activity
            recent_activity.append({
                "id": f"github-{fact['CreatedAt'].isoformat()}-{hash(fact['Title'])}",
                "timestamp": fact["CreatedAt"].isoformat(),
                "user": fact["Author"],
                "action": f"{fact['ItemType']} {fact['Status']}",
                "service": "GitHub",
                "status": "Success" if fact["Status"] in ["merged", "closed", "completed"] else "Warning",
                "device": "Web",
                "ipAddress": "192.168.1.1",
                "details": f"{fact['Title']} in {fact['ProjectOrRepo']}"
            })
        
        # Calculate commit stats
        commits_by_status = {}
        for commit in commits:
            status = commit["Status"]
            commits_by_status[status] = commits_by_status.get(status, 0) + 1
        
        # Calculate pull request stats
        pr_by_status = {}
        for pr in pull_requests:
            status = pr["Status"]
            pr_by_status[status] = pr_by_status.get(status, 0) + 1
        
        # Calculate repository activity
        repo_activity = {}
        for fact in github_facts:
            repo = fact["ProjectOrRepo"]
            if repo not in repo_activity:
                repo_activity[repo] = {"name": repo, "commits": 0, "pullRequests": 0, "lastActivity": fact["CreatedAt"]}
            
            if fact["ItemType"] == "commit":
                repo_activity[repo]["commits"] += 1
            elif fact["ItemType"] == "pull_request":
                repo_activity[repo]["pullRequests"] += 1
            
            # Update last activity if this is more recent
            if fact["CreatedAt"] > repo_activity[repo]["lastActivity"]:
                repo_activity[repo]["lastActivity"] = fact["CreatedAt"]
        
        # Convert to list and sort by activity
        repository_activity = list(repo_activity.values())
        repository_activity.sort(key=lambda x: x["lastActivity"], reverse=True)
        
        # Format repository activity for frontend
        formatted_repo_activity = []
        for repo in repository_activity:
            formatted_repo_activity.append({
                "name": repo["name"],
                "commits": repo["commits"],
                "pullRequests": repo["pullRequests"],
                "lastActivity": repo["lastActivity"].isoformat(),
                "totalActivity": repo["commits"] + repo["pullRequests"]
            })
        
        return {
            "configured": True,
            "totalRepositories": len(repositories),
            "activeRepositories": len([r for r in repository_activity if r["commits"] > 0 or r["pullRequests"] > 0]),
            "totalCommits": len(commits),
            "totalPullRequests": len(pull_requests),
            "commitsByStatus": commits_by_status,
            "pullRequestsByStatus": pr_by_status,
            "repositoryActivity": formatted_repo_activity,
            "recentActivity": recent_activity[:10],  # Last 10 activities
            "lastUpdated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get GitHub overview: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get GitHub overview: {str(e)}")


@router.get("/jira-overview")
async def get_jira_overview(company_id: int = Depends(get_current_company)):
    """Get Jira integration overview data for admin dashboard"""
    try:
        logger.info(f"📊 Getting Jira overview data for company {company_id}")
        
        # Check if Jira integration exists and is configured
        integration_check = await query_one(
            "SELECT IntegrationID FROM Integration WHERE CompanyID = {CompanyID} AND IntegrationType = 'jira' AND IsActive = 1",
            {"CompanyID": company_id}
        )
        
        if not integration_check:
            return {
                "error": "Jira integration not configured. Please configure integration first.",
                "configured": False
            }
        
        # Get workflow facts for Jira
        jira_facts = await query_many(
            """SELECT 
                Title, Status, Author, CreatedAt, ProjectOrRepo, Provider,
                ItemType, UpdatedAt
               FROM WorkflowFact 
               WHERE CompanyID = {CompanyID} AND Provider = 'jira' 
               ORDER BY CreatedAt DESC""",
            {"CompanyID": company_id}
        )
        
        if not jira_facts:
            return {
                "configured": True,
                "totalProjects": 0,
                "activeProjects": 0,
                "totalUsers": 0,
                "recentIssues": 0,
                "issuesByStatus": {},
                "issuesByType": {},
                "topActiveProjects": [],
                "projects": [],
                "lastUpdated": datetime.now().isoformat()
            }
        
        # Process Jira data
        projects = set()
        users = set()
        recent_activity = []
        issues_by_status = {}
        issues_by_type = {}
        project_activity = {}
        
        for fact in jira_facts:
            projects.add(fact["ProjectOrRepo"])
            users.add(fact["Author"])
            
            # Count issues by status
            status = fact["Status"]
            issues_by_status[status] = issues_by_status.get(status, 0) + 1
            
            # Count issues by type (use ItemType)
            issue_type = fact["ItemType"] or "Issue"
            issues_by_type[issue_type] = issues_by_type.get(issue_type, 0) + 1
            
            # Track project activity
            project = fact["ProjectOrRepo"]
            if project not in project_activity:
                project_activity[project] = {"name": project, "key": project, "issueCount": 0, "lastActivity": fact["CreatedAt"]}
            
            project_activity[project]["issueCount"] += 1
            
            # Update last activity if this is more recent
            if fact["CreatedAt"] > project_activity[project]["lastActivity"]:
                project_activity[project]["lastActivity"] = fact["CreatedAt"]
            
            # Add to recent activity
            recent_activity.append({
                "id": f"jira-{fact['CreatedAt'].isoformat()}-{hash(fact['Title'])}",
                "timestamp": fact["CreatedAt"].isoformat(),
                "user": fact["Author"],
                "action": f"{fact['ItemType']} {fact['Status']}",
                "service": "Jira",
                "status": "Success" if fact["Status"] in ["done", "closed", "resolved"] else "Warning",
                "device": "Web",
                "ipAddress": "192.168.1.1",
                "details": f"{fact['Title']} in {fact['ProjectOrRepo']}"
            })
        
        # Convert project activity to list and sort
        top_active_projects = list(project_activity.values())
        top_active_projects.sort(key=lambda x: x["issueCount"], reverse=True)
        
        # Format projects list
        projects_list = []
        for project in top_active_projects:
            projects_list.append({
                "key": project["key"],
                "name": project["name"],
                "projectTypeKey": "software",  # Default type
                "lead": "Unknown"  # We don't have lead info
            })
        
        return {
            "configured": True,
            "totalProjects": len(projects),
            "activeProjects": len([p for p in project_activity.values() if p["issueCount"] > 0]),
            "totalUsers": len(users),
            "recentIssues": len([f for f in jira_facts if (datetime.now() - f["CreatedAt"]).days <= 30]),
            "issuesByStatus": issues_by_status,
            "issuesByType": issues_by_type,
            "topActiveProjects": top_active_projects[:5],  # Top 5 active projects
            "projects": projects_list,
            "lastUpdated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get Jira overview: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get Jira overview: {str(e)}")


# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/company/{company_id}/users")
async def get_company_users(
    company_id: int,
    current_user_id: Optional[int] = Query(None)
):
    """Get all users for a specific company"""
    try:
        logger.info(f"Fetching users for company {company_id}")
        
        # Get all users for the company
        users_query = """
            SELECT u.UserID as user_id, u.CompanyID as company_id, 
                   u.FirstName as first_name, u.MiddleName as middle_name, 
                   u.LastName as last_name, u.Email as email, u.Phone as phone,
                   u.IsSuperAdmin as is_super_admin, u.IsActive as is_active,
                   u.CreatedAt as created_at, u.LastSignInAt as last_sign_in_at,
                   u.Department as department, u.Location as location
            FROM UserAccount u
            WHERE u.CompanyID = {company_id}
            ORDER BY u.LastName, u.FirstName
        """
        
        users = await query_many(users_query, {"company_id": company_id})
        
        if not users:
            return []
        
        # Get roles for each user
        result = []
        for user in users:
            # Get user role from UserRole table
            role_query = """
                SELECT r.Name as RoleName
                FROM UserRole ur
                JOIN Role r ON ur.RoleID = r.RoleID
                WHERE ur.UserID = {user_id}
            """
            role_result = await query_one(role_query, {"user_id": user["user_id"]})
            
            result.append({
                "user_id": user["user_id"],
                "company_id": user.get("company_id"),
                "first_name": user["first_name"],
                "middle_name": user.get("middle_name"),
                "last_name": user["last_name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "is_super_admin": user.get("is_super_admin", False),
                "is_active": user.get("is_active", True),
                "created_at": user["created_at"],
                "last_sign_in_at": user.get("last_sign_in_at"),
                "department": user.get("department"),
                "location": user.get("location"),
                "role": role_result.get("RoleName") if role_result else None
            })
        
        logger.info(f"Found {len(result)} users for company {company_id}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to get users for company {company_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.post("/company/{company_id}/users")
async def create_company_user(
    company_id: int,
    user_data: UserCreate,
    current_user_id: Optional[int] = Query(None)
):
    """Create a new user for a specific company"""
    try:
        logger.info(f"Creating new user for company {company_id}: {user_data.email}")
        
        # Validate required fields
        if not user_data.first_name or not user_data.last_name or not user_data.email:
            raise HTTPException(status_code=400, detail="First name, last name, and email are required")
        
        if not user_data.password:
            raise HTTPException(status_code=400, detail="Password is required")
        
        # Check if user with email already exists
        existing_query = "SELECT UserID FROM UserAccount WHERE Email = {email}"
        existing_user = await query_one(existing_query, {"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail=f"User with email '{user_data.email}' already exists")
        
        # Hash the password
        password_hash = hash_password(user_data.password)
        
        # Use the same approach as SuperAdmin endpoint - separate committed operations
        try:
            # Create user using insert_and_return (which commits immediately)
            create_user_query = """
                INSERT INTO UserAccount (CompanyID, FirstName, MiddleName, LastName, Email, PasswordHash,
                                       Phone, Department, Location, IsSuperAdmin, IsActive, CreatedAt, UpdatedAt)
                OUTPUT INSERTED.UserID, INSERTED.FirstName, INSERTED.MiddleName, INSERTED.LastName, 
                       INSERTED.Email, INSERTED.CompanyID, INSERTED.IsSuperAdmin, INSERTED.IsActive, 
                       INSERTED.CreatedAt, INSERTED.Department, INSERTED.Location
                VALUES ({company_id}, {first_name}, {middle_name}, {last_name}, {email}, {password_hash},
                        {phone}, {department}, {location}, {is_super_admin}, {is_active}, 
                        SYSUTCDATETIME(), SYSUTCDATETIME())
            """
            
            user_result = await insert_and_return(create_user_query, {
                "company_id": company_id,
                "first_name": user_data.first_name,
                "middle_name": user_data.middle_name if user_data.middle_name else None,
                "last_name": user_data.last_name,
                "email": user_data.email,
                "password_hash": password_hash,
                "phone": user_data.phone if user_data.phone else None,
                "department": user_data.department if hasattr(user_data, 'department') else None,
                "location": user_data.location if hasattr(user_data, 'location') else None,
                "is_super_admin": 1 if user_data.is_super_admin else 0,
                "is_active": 1
            })
            
            if not user_result:
                raise HTTPException(status_code=500, detail="Failed to create user")

            created_user_id = user_result["UserID"]
            logger.info(f"✅ Created user {created_user_id}")
            
            # Assign role if specified - using execute_sql (separate committed operation)
            if user_data.role:
                logger.info(f"Assigning role '{user_data.role}' to user ID: {created_user_id}")
                
                # Find role by name
                role_query = "SELECT RoleID FROM Role WHERE Name = {role_name}"
                role_result = await query_one(role_query, {"role_name": user_data.role})
                
                if role_result:
                    # Assign role to user
                    assign_role_query = """
                        INSERT INTO UserRole (UserID, RoleID)
                        VALUES ({user_id}, {role_id})
                    """
                    await execute_sql(assign_role_query, {
                        "user_id": created_user_id,
                        "role_id": role_result["RoleID"]
                    })
                    logger.info(f"✅ Role '{user_data.role}' assigned to user {created_user_id}")
                else:
                    logger.warning(f"Role '{user_data.role}' not found, skipping role assignment")
            else:
                logger.info("No role specified for user creation")
                
        except Exception as e:
            logger.error(f"Error in user creation: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")
        
        logger.info(f"Successfully created user {user_data.email} with ID {created_user_id}")
        
        return {
            "user_id": created_user_id,
            "first_name": user_result["FirstName"],
            "last_name": user_result["LastName"],
            "email": user_result["Email"],
            "company_id": user_result["CompanyID"],
            "is_active": user_result["IsActive"],
            "created_at": user_result["CreatedAt"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create user for company {company_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate
):
    """Update user details"""
    try:
        logger.info(f"Updating user {user_id}")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = {"user_id": user_id}
        
        if user_data.first_name is not None:
            update_fields.append("FirstName = {first_name}")
            params["first_name"] = user_data.first_name
            
        if user_data.last_name is not None:
            update_fields.append("LastName = {last_name}")
            params["last_name"] = user_data.last_name
            
        if user_data.email is not None:
            update_fields.append("Email = {email}")
            params["email"] = user_data.email
            
        if user_data.phone is not None:
            update_fields.append("Phone = {phone}")
            params["phone"] = user_data.phone
            
        if user_data.department is not None:
            update_fields.append("Department = {department}")
            params["department"] = user_data.department
            
        if user_data.location is not None:
            update_fields.append("Location = {location}")
            params["location"] = user_data.location
            
        if user_data.is_active is not None:
            update_fields.append("IsActive = {is_active}")
            params["is_active"] = 1 if user_data.is_active else 0
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add UpdatedAt field
        update_fields.append("UpdatedAt = SYSUTCDATETIME()")
        
        update_query = f"""
            UPDATE UserAccount 
            SET {', '.join(update_fields)}
            OUTPUT INSERTED.UserID, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email,
                   INSERTED.Phone, INSERTED.Department, INSERTED.Location, INSERTED.IsActive
            WHERE UserID = {{user_id}}
        """
        
        result = await query_one(update_query, params)
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Successfully updated user {user_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Delete a user"""
    try:
        logger.info(f"Deleting user {user_id}")
        
        # First check if user exists
        check_query = "SELECT UserID, Email FROM UserAccount WHERE UserID = {user_id}"
        user = await query_one(check_query, {"user_id": user_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete user roles first (foreign key constraint)
        delete_roles_query = "DELETE FROM UserRole WHERE UserID = {user_id}"
        await execute_sql(delete_roles_query, {"user_id": user_id})
        
        # Delete the user
        delete_query = "DELETE FROM UserAccount WHERE UserID = {user_id}"
        await execute_sql(delete_query, {"user_id": user_id})
        
        logger.info(f"Successfully deleted user {user_id} ({user['Email']})")
        return {"message": f"User {user['Email']} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


@router.get("/roles")
async def get_available_roles():
    """Get all available roles in the system for admin users"""
    try:
        roles_query = "SELECT RoleID, Name FROM Role ORDER BY Name"
        roles = await query_many(roles_query, {})
        
        if not roles:
            # Return default roles if none exist
            return [
                {"role_id": 1, "name": "User"},
                {"role_id": 2, "name": "Client Admin"}
            ]
        
        return [{"role_id": role["RoleID"], "name": role["Name"]} for role in roles]
        
    except Exception as e:
        logger.error(f"Failed to get roles: {e}")
        # Return basic roles as fallback
        return [
            {"role_id": 1, "name": "User"},
            {"role_id": 2, "name": "Client Admin"}
        ]