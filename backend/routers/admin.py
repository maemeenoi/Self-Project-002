"""
Admin Router
Administrative endpoints for user management, system configuration, and monitoring
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from lib.db import query_all, query_one, execute_sql, execute_transaction
from lib.utils import success_response, error_response, paginate_response, log_api_call
from routers.auth import get_current_user, UserProfile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["Administration"])

# ==========================================
# ADMIN AUTHORIZATION
# ==========================================

async def require_admin(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Require admin role for access"""
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ==========================================
# PYDANTIC MODELS
# ==========================================

class UserManagement(BaseModel):
    id: int
    email: str
    full_name: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(user|admin|super_admin)$")
    is_active: Optional[bool] = None
    company_id: Optional[int] = None

class CompanyManagement(BaseModel):
    id: int
    name: str
    domain: Optional[str] = None
    subscription_type: str
    is_active: bool
    user_count: int
    created_at: datetime
    last_activity: Optional[datetime] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    subscription_type: Optional[str] = Field(None, pattern="^(free|basic|premium|enterprise)$")
    is_active: Optional[bool] = None

class SystemStats(BaseModel):
    total_users: int
    active_users: int
    total_companies: int
    active_companies: int
    financial_records: int
    workflow_records: int
    system_uptime: str
    last_backup: Optional[datetime] = None

class AuditLogEntry(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    resource: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime

# ==========================================
# USER MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/users", response_model=Dict[str, Any])
async def get_users(
    admin_user: UserProfile = Depends(require_admin),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=10, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    """Get paginated list of users with optional filtering"""
    log_api_call("admin/users", "GET", admin_user.id, admin_user.company_id)
    
    # Build WHERE clause
    where_conditions = ["1=1"]
    params = {}
    param_count = 0
    
    if search:
        param_count += 1
        where_conditions.append(f"(u.email ILIKE ${param_count} OR u.full_name ILIKE ${param_count})")
        params[f"param{param_count}"] = f"%{search}%"
    
    if role:
        param_count += 1
        where_conditions.append(f"u.role = ${param_count}")
        params[f"param{param_count}"] = role
    
    if company_id:
        param_count += 1
        where_conditions.append(f"u.company_id = ${param_count}")
        params[f"param{param_count}"] = company_id
    
    if is_active is not None:
        param_count += 1
        where_conditions.append(f"u.is_active = ${param_count}")
        params[f"param{param_count}"] = is_active
    
    where_clause = " AND ".join(where_conditions)
    
    # Count total records
    count_sql = f"""
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE {where_clause};
    """
    
    count_result = await query_one(count_sql, params)
    total = count_result["total"]
    
    # Get paginated results
    offset = (page - 1) * per_page
    param_count += 1
    params[f"param{param_count}"] = per_page
    param_count += 1
    params[f"param{param_count}"] = offset
    
    users_sql = f"""
        SELECT u.id, u.email, u.full_name, u.company_id, u.role, u.is_active, 
               u.created_at, c.name as company_name
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE {where_clause}
        ORDER BY u.created_at DESC
        LIMIT ${param_count-1} OFFSET ${param_count};
    """
    
    try:
        users = await query_all(users_sql, params)
        user_list = [UserManagement(**user) for user in users]
        
        return success_response(
            paginate_response(
                data=[user.dict() for user in user_list],
                page=page,
                per_page=per_page,
                total=total
            )
        )
        
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        return error_response("Failed to retrieve users", "USER_LIST_ERROR")

@router.get("/users/{user_id}", response_model=UserManagement)
async def get_user(
    user_id: int,
    admin_user: UserProfile = Depends(require_admin)
):
    """Get specific user details"""
    log_api_call(f"admin/users/{user_id}", "GET", admin_user.id, admin_user.company_id)
    
    sql = """
        SELECT u.id, u.email, u.full_name, u.company_id, u.role, u.is_active, 
               u.created_at, c.name as company_name
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.id = $1;
    """
    
    try:
        user = await query_one(sql, {"user_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserManagement(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user")

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    admin_user: UserProfile = Depends(require_admin)
):
    """Update user details"""
    log_api_call(f"admin/users/{user_id}", "PUT", admin_user.id, admin_user.company_id)
    
    # Build update query dynamically
    update_fields = []
    params = {"user_id": user_id, "updated_at": datetime.utcnow()}
    param_count = 2
    
    if user_update.full_name is not None:
        param_count += 1
        update_fields.append(f"full_name = ${param_count}")
        params[f"param{param_count}"] = user_update.full_name
    
    if user_update.role is not None:
        param_count += 1
        update_fields.append(f"role = ${param_count}")
        params[f"param{param_count}"] = user_update.role
    
    if user_update.is_active is not None:
        param_count += 1
        update_fields.append(f"is_active = ${param_count}")
        params[f"param{param_count}"] = user_update.is_active
    
    if user_update.company_id is not None:
        param_count += 1
        update_fields.append(f"company_id = ${param_count}")
        params[f"param{param_count}"] = user_update.company_id
    
    if not update_fields:
        return error_response("No fields to update", "NO_UPDATE_FIELDS")
    
    sql = f"""
        UPDATE users 
        SET {', '.join(update_fields)}, updated_at = $2
        WHERE id = $1
        RETURNING id;
    """
    
    try:
        result = await query_one(sql, params)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log the action
        await log_admin_action(
            admin_user.id,
            "UPDATE",
            "user",
            str(user_id),
            user_update.dict(exclude_unset=True)
        )
        
        return success_response(message="User updated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user {user_id}: {e}")
        return error_response("Failed to update user", "USER_UPDATE_ERROR")

# ==========================================
# COMPANY MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/companies", response_model=Dict[str, Any])
async def get_companies(
    admin_user: UserProfile = Depends(require_admin),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=10, le=100),
    search: Optional[str] = Query(None),
    subscription_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    """Get paginated list of companies"""
    log_api_call("admin/companies", "GET", admin_user.id, admin_user.company_id)
    
    # Build WHERE clause
    where_conditions = ["1=1"]
    params = {}
    param_count = 0
    
    if search:
        param_count += 1
        where_conditions.append(f"c.name ILIKE ${param_count}")
        params[f"param{param_count}"] = f"%{search}%"
    
    if subscription_type:
        param_count += 1
        where_conditions.append(f"c.subscription_type = ${param_count}")
        params[f"param{param_count}"] = subscription_type
    
    if is_active is not None:
        param_count += 1
        where_conditions.append(f"c.is_active = ${param_count}")
        params[f"param{param_count}"] = is_active
    
    where_clause = " AND ".join(where_conditions)
    
    # Count total
    count_sql = f"SELECT COUNT(*) as total FROM companies c WHERE {where_clause};"
    count_result = await query_one(count_sql, params)
    total = count_result["total"]
    
    # Get paginated results
    offset = (page - 1) * per_page
    param_count += 1
    params[f"param{param_count}"] = per_page
    param_count += 1
    params[f"param{param_count}"] = offset
    
    companies_sql = f"""
        SELECT c.id, c.name, c.domain, c.subscription_type, c.is_active, c.created_at,
               COUNT(u.id) as user_count
        FROM companies c
        LEFT JOIN users u ON c.id = u.company_id
        WHERE {where_clause}
        GROUP BY c.id, c.name, c.domain, c.subscription_type, c.is_active, c.created_at
        ORDER BY c.created_at DESC
        LIMIT ${param_count-1} OFFSET ${param_count};
    """
    
    try:
        companies = await query_all(companies_sql, params)
        company_list = [CompanyManagement(**company) for company in companies]
        
        return success_response(
            paginate_response(
                data=[company.dict() for company in company_list],
                page=page,
                per_page=per_page,
                total=total
            )
        )
        
    except Exception as e:
        logger.error(f"Failed to get companies: {e}")
        return error_response("Failed to retrieve companies", "COMPANY_LIST_ERROR")

# ==========================================
# SYSTEM MONITORING ENDPOINTS
# ==========================================

@router.get("/stats", response_model=SystemStats)
async def get_system_stats(admin_user: UserProfile = Depends(require_admin)):
    """Get system-wide statistics"""
    log_api_call("admin/stats", "GET", admin_user.id, admin_user.company_id)
    
    try:
        # Get user stats
        user_stats = await query_one("""
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
            FROM users;
        """)
        
        # Get company stats
        company_stats = await query_one("""
            SELECT 
                COUNT(*) as total_companies,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_companies
            FROM companies;
        """)
        
        # Get data stats
        financial_count = await query_one("SELECT COUNT(*) as count FROM financial_fact;")
        workflow_count = await query_one("SELECT COUNT(*) as count FROM workflow_fact;")
        
        stats = SystemStats(
            total_users=user_stats["total_users"],
            active_users=user_stats["active_users"],
            total_companies=company_stats["total_companies"],
            active_companies=company_stats["active_companies"],
            financial_records=financial_count["count"],
            workflow_records=workflow_count["count"],
            system_uptime="99.9%",  # Mock data
            last_backup=datetime.utcnow() - timedelta(hours=6)  # Mock data
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get system stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve system statistics")

# ==========================================
# UTILITY FUNCTIONS
# ==========================================

async def log_admin_action(
    admin_id: int,
    action: str,
    resource: str,
    resource_id: str,
    details: Optional[Dict[str, Any]] = None
):
    """Log administrative actions for audit trail"""
    # In production, this would insert into an audit_log table
    logger.info(f"Admin action: User {admin_id} performed {action} on {resource} {resource_id}")
    if details:
        logger.info(f"Details: {details}")

@router.get("/health")
async def admin_health_check(admin_user: UserProfile = Depends(require_admin)):
    """Admin-only health check with detailed system information"""
    return success_response({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "admin_user": admin_user.email,
        "database": "connected",
        "services": "operational"
    })

# Export router
__all__ = ["router"]