"""
General Admin Router

This router provides company-level admin endpoints for managing users within 
a specific company. General admins can only manage users within their own company,
unlike superadmins who can manage all companies.

Permission Hierarchy:
- SuperAdmin: Can manage all companies and users
- CompanyAdmin (General Admin): Can manage users within their own company only
- User: Can only view/edit their own profile
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from lib.db import (
    query_one, query_many, execute_sql, insert_and_return, health_check,
    get_company_info, get_recent_sync_batches,
    get_workflow_summary, get_financial_summary
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["general-admin"])

# ============================================================================
# Pydantic Models for General Admin API Requests/Responses
# ============================================================================

class CompanyAdminUserCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: str
    phone: Optional[str] = None
    password: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    role: str = "user"  # user, viewer, analyst
    is_company_admin: bool = False

class CompanyAdminUserUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None
    is_company_admin: Optional[bool] = None
    is_active: Optional[bool] = None

class CompanyAdminUserResponse(BaseModel):
    user_id: int
    company_id: int
    first_name: str
    middle_name: Optional[str]
    last_name: str
    email: str
    phone: Optional[str]
    department: Optional[str]
    location: Optional[str]
    role: str
    is_company_admin: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime]

class CompanyStatsResponse(BaseModel):
    company_id: int
    company_name: str
    total_users: int
    active_users: int
    inactive_users: int
    admin_users: int
    recent_logins: int  # users who logged in last 30 days

class CompanyAdminDashboardResponse(BaseModel):
    company_stats: CompanyStatsResponse
    recent_users: List[CompanyAdminUserResponse]
    user_activity: Dict[str, Any]

# ============================================================================
# Permission Check Functions
# ============================================================================

async def check_company_admin_permission(user_id: int, company_id: int) -> bool:
    """Check if user is a company admin for the specified company"""
    try:
        # First check if user is a SuperAdmin
        user_query = """
            SELECT IsSuperAdmin, CompanyID
            FROM UserAccount
            WHERE UserID = {user_id}
        """
        user = await query_one(user_query, {"user_id": user_id})
        
        if not user:
            return False
        
        # SuperAdmins can access any company
        if user.get("IsSuperAdmin"):
            return True
        
        # Check if user is in the same company and has Client Admin role
        if user.get("CompanyID") == company_id:
            role_query = """
                SELECT r.Name
                FROM UserAccount u
                INNER JOIN UserRole ur ON u.UserID = ur.UserID
                INNER JOIN Role r ON ur.RoleID = r.RoleID
                WHERE u.UserID = {user_id} AND r.Name IN ('Client Admin', 'Admin')
            """
            role_result = await query_one(role_query, {"user_id": user_id})
            return role_result is not None
        
        return False
    except Exception as e:
        logger.error(f"Error checking company admin permission: {e}")
        return False

async def get_current_user_company(user_id: int) -> Optional[int]:
    """Get the company ID for the current user"""
    try:
        query = "SELECT CompanyID FROM UserAccount WHERE UserID = {user_id}"
        user = await query_one(query, {"user_id": user_id})
        return user.get("CompanyID") if user else None
    except Exception as e:
        logger.error(f"Error getting user company: {e}")
        return None

# ============================================================================
# Company Admin Dashboard Endpoints
# ============================================================================

@router.get("/company/{company_id}/dashboard", response_model=CompanyAdminDashboardResponse)
async def get_company_admin_dashboard(
    company_id: int,
    current_user_id: int = Query(..., description="Current user ID for permission check")
):
    """Get company admin dashboard with company-specific statistics and user management"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        # Get company information
        company_query = "SELECT CompanyID, Name FROM Company WHERE CompanyID = {company_id}"
        company = await query_one(company_query, {"company_id": company_id})
        
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get company statistics
        stats_queries = {
            "total_users": "SELECT COUNT(*) as count FROM UserAccount WHERE CompanyID = {company_id}",
            "active_users": "SELECT COUNT(*) as count FROM UserAccount WHERE CompanyID = {company_id} AND IsActive = 1",
            "admin_users": """
                SELECT COUNT(DISTINCT u.UserID) as count 
                FROM UserAccount u
                INNER JOIN UserRole ur ON u.UserID = ur.UserID
                INNER JOIN Role r ON ur.RoleID = r.RoleID
                WHERE u.CompanyID = {company_id} AND r.Name IN ('Client Admin', 'Admin')
            """,
            "recent_logins": """
                SELECT COUNT(*) as count FROM UserAccount 
                WHERE CompanyID = {company_id} 
                AND LastSignInAt >= DATEADD(day, -30, GETDATE())
            """
        }
        
        stats = {}
        for stat_name, query_str in stats_queries.items():
            result = await query_one(query_str, {"company_id": company_id})
            stats[stat_name] = result.get("count", 0) if result else 0
        
        stats["inactive_users"] = stats["total_users"] - stats["active_users"]
        
        company_stats = CompanyStatsResponse(
            company_id=company_id,
            company_name=company["Name"],
            total_users=stats["total_users"],
            active_users=stats["active_users"],
            inactive_users=stats["inactive_users"],
            admin_users=stats["admin_users"],
            recent_logins=stats["recent_logins"]
        )
        
        # Get recent users (last 10)
        recent_users_query = """
            SELECT TOP 10
                u.UserID, u.CompanyID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.Phone,
                u.Department, u.Location, u.IsActive, u.CreatedAt, u.LastSignInAt,
                r.Name as RoleName
            FROM UserAccount u
            LEFT JOIN UserRole ur ON u.UserID = ur.UserID
            LEFT JOIN Role r ON ur.RoleID = r.RoleID
            WHERE u.CompanyID = {company_id}
            ORDER BY u.CreatedAt DESC
        """
        
        recent_users_data = await query_many(recent_users_query, {"company_id": company_id})
        recent_users = []
        
        for user_data in recent_users_data:
            is_admin = user_data.get("RoleName") in ['Client Admin', 'Admin'] if user_data.get("RoleName") else False
            recent_users.append(CompanyAdminUserResponse(
                user_id=user_data["UserID"],
                company_id=user_data["CompanyID"],
                first_name=user_data.get("FirstName", ""),
                middle_name=user_data.get("MiddleName"),
                last_name=user_data.get("LastName", ""),
                email=user_data["Email"],
                phone=user_data.get("Phone"),
                department=user_data.get("Department"),
                location=user_data.get("Location"),
                role=user_data.get("RoleName", "User"),
                is_company_admin=is_admin,
                is_active=user_data.get("IsActive", True),
                created_at=user_data["CreatedAt"],
                last_login_at=user_data.get("LastSignInAt")
            ))
        
        # User activity summary
        user_activity = {
            "new_users_this_month": 0,  # You can implement this with date filtering
            "active_sessions": stats["recent_logins"],
            "pending_invitations": 0,  # Implement if you have invitation system
        }
        
        return CompanyAdminDashboardResponse(
            company_stats=company_stats,
            recent_users=recent_users,
            user_activity=user_activity
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting company admin dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

# ============================================================================
# Company-Scoped User Management Endpoints
# ============================================================================

@router.get("/company/{company_id}/users", response_model=List[CompanyAdminUserResponse])
async def list_company_users(
    company_id: int,
    current_user_id: int = Query(..., description="Current user ID for permission check"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    active_only: bool = Query(True)
):
    """List users within a specific company (company admin access only)"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        where_clause = "WHERE CompanyID = {company_id}"
        if active_only:
            where_clause += " AND IsActive = 1"
        
        query = f"""
            SELECT 
                u.UserID, u.CompanyID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.Phone,
                u.Department, u.Location, u.IsActive, u.CreatedAt, u.LastSignInAt,
                r.Name as RoleName
            FROM UserAccount u
            LEFT JOIN UserRole ur ON u.UserID = ur.UserID
            LEFT JOIN Role r ON ur.RoleID = r.RoleID
            {where_clause.replace('CompanyID', 'u.CompanyID').replace('IsActive', 'u.IsActive')}
            ORDER BY u.CreatedAt DESC
            OFFSET {skip} ROWS
            FETCH NEXT {limit} ROWS ONLY
        """
        
        users_data = await query_many(query, {"company_id": company_id})
        
        users = []
        for user_data in users_data:
            is_admin = user_data.get("RoleName") in ['Client Admin', 'Admin'] if user_data.get("RoleName") else False
            users.append(CompanyAdminUserResponse(
                user_id=user_data["UserID"],
                company_id=user_data["CompanyID"],
                first_name=user_data.get("FirstName", ""),
                middle_name=user_data.get("MiddleName"),
                last_name=user_data.get("LastName", ""),
                email=user_data["Email"],
                phone=user_data.get("Phone"),
                department=user_data.get("Department"),
                location=user_data.get("Location"),
                role=user_data.get("RoleName", "User"),
                is_company_admin=is_admin,
                is_active=user_data.get("IsActive", True),
                created_at=user_data["CreatedAt"],
                last_login_at=user_data.get("LastSignInAt")
            ))
        
        return users
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing company users: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")


@router.post("/company/{company_id}/users", response_model=CompanyAdminUserResponse)
async def create_company_user(
    company_id: int,
    user: CompanyAdminUserCreate,
    current_user_id: int = Query(..., description="Current user ID for permission check")
):
    """Create a new user within a specific company (company admin access only)"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        # Check if user already exists
        existing_query = "SELECT UserID FROM UserAccount WHERE Email = {email}"
        existing = await query_one(existing_query, {"email": user.email})
        
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Hash password if provided
        password_hash = None
        if user.password:
            # Import hash function from admin router
            from routers.admin import hash_password
            password_hash = hash_password(user.password)
        
        # Create user
        insert_query = """
            INSERT INTO UserAccount (
                CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                Department, Location, PasswordHash, IsSuperAdmin,
                CreatedAt, UpdatedAt, IsActive
            )
            OUTPUT INSERTED.UserID
            VALUES (
                {company_id}, {first_name}, {middle_name}, {last_name}, {email}, {phone},
                {department}, {location}, {password_hash}, 0,
                SYSUTCDATETIME(), SYSUTCDATETIME(), 1
            )
        """
        
        result = await insert_and_return(insert_query, {
            "company_id": company_id,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "department": user.department,
            "location": user.location,
            "password_hash": password_hash
        })
        
        if not result or "UserID" not in result:
            logger.error(f"Failed to create user. Result: {result}")
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user_id = result["UserID"]
        logger.info(f"✅ Created user with ID: {user_id}")
        
        # Assign role to the user
        if user.role:
            logger.info(f"Assigning role '{user.role}' to user {user_id}")
            # Find or create the specified role
            role_query = "SELECT RoleID FROM Role WHERE Name = {role_name}"
            role_result = await query_one(role_query, {"role_name": user.role})
            logger.info(f"Role query result: {role_result}")
            
            if not role_result:
                logger.info(f"Creating new role: {user.role}")
                # Create the role if it doesn't exist
                create_role_query = """
                    INSERT INTO Role (Name, IsSystemRole)
                    OUTPUT INSERTED.RoleID
                    VALUES ({role_name}, 0)
                """
                role_result = await insert_and_return(create_role_query, {"role_name": user.role})
                logger.info(f"Created role result: {role_result}")
            
            if role_result:
                logger.info(f"Assigning role {role_result['RoleID']} to user {user_id}")
                # Assign the role to the user
                assign_role_query = """
                    INSERT INTO UserRole (UserID, RoleID)
                    VALUES ({user_id}, {role_id})
                """
                await execute_sql(assign_role_query, {
                    "user_id": user_id,
                    "role_id": role_result["RoleID"]
                })
                logger.info("✅ Role assigned successfully")
            else:
                logger.error("Failed to create or find role")
        
        # Fetch the created user
        user_query = """
            SELECT UserID, CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                   Department, Location, IsActive, CreatedAt, LastSignInAt
            FROM UserAccount
            WHERE UserID = {user_id}
        """
        created_user = await query_one(user_query, {"user_id": user_id})
        
        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to retrieve created user")
        
        return CompanyAdminUserResponse(
            user_id=created_user["UserID"],
            company_id=created_user["CompanyID"],
            first_name=created_user.get("FirstName", ""),
            middle_name=created_user.get("MiddleName"),
            last_name=created_user.get("LastName", ""),
            email=created_user["Email"],
            phone=created_user.get("Phone"),
            department=created_user.get("Department"),
            location=created_user.get("Location"),
            role=user.role,  # Use the role from the request since we just assigned it
            is_company_admin=user.is_company_admin,
            is_active=created_user.get("IsActive", True),
            created_at=created_user["CreatedAt"],
            last_login_at=created_user.get("LastSignInAt")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create company user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/company/{company_id}/users/{user_id}", response_model=CompanyAdminUserResponse)
async def get_company_user(
    company_id: int,
    user_id: int,
    current_user_id: int = Query(..., description="Current user ID for permission check")
):
    """Get a specific user within a company (company admin access only)"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        query = """
            SELECT UserID, CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                   Role, IsSuperAdmin, IsActive, CreatedAt, LastSignInAt
            FROM UserAccount
            WHERE UserID = {user_id} AND CompanyID = {company_id}
        """
        
        user = await query_one(query, {"user_id": user_id, "company_id": company_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found in this company")
        
        return CompanyAdminUserResponse(
            user_id=user["UserID"],
            company_id=user["CompanyID"],
            first_name=user.get("FirstName", ""),
            middle_name=user.get("MiddleName"),
            last_name=user.get("LastName", ""),
            email=user["Email"],
            phone=user.get("Phone"),
            role=user.get("Role", "user"),
            is_super_admin=user.get("IsSuperAdmin", False),
            is_active=user.get("IsActive", True),
            created_at=user["CreatedAt"],
            last_sign_in_at=user.get("LastSignInAt")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get company user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/company/{company_id}/users/{user_id}", response_model=CompanyAdminUserResponse)
async def update_company_user(
    company_id: int,
    user_id: int,
    user_update: CompanyAdminUserUpdate,
    current_user_id: int = Query(..., description="Current user ID for permission check")
):
    """Update a specific user within a company (company admin access only)"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    try:
        # First check if user exists in this company
        check_query = """
            SELECT UserID FROM UserAccount 
            WHERE UserID = {user_id} AND CompanyID = {company_id}
        """
        existing = await query_one(check_query, {"user_id": user_id, "company_id": company_id})
        
        if not existing:
            raise HTTPException(status_code=404, detail="User not found in this company")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        params = {"user_id": user_id, "company_id": company_id}
        
        if user_update.first_name is not None:
            update_fields.append("FirstName = {first_name}")
            params["first_name"] = user_update.first_name
        if user_update.middle_name is not None:
            update_fields.append("MiddleName = {middle_name}")
            params["middle_name"] = user_update.middle_name
        if user_update.last_name is not None:
            update_fields.append("LastName = {last_name}")
            params["last_name"] = user_update.last_name
        if user_update.email is not None:
            update_fields.append("Email = {email}")
            params["email"] = user_update.email
        if user_update.phone is not None:
            update_fields.append("Phone = {phone}")
            params["phone"] = user_update.phone
        if user_update.role is not None:
            update_fields.append("Role = {role}")
            params["role"] = user_update.role
        if user_update.is_super_admin is not None:
            update_fields.append("IsSuperAdmin = {is_super_admin}")
            params["is_super_admin"] = user_update.is_super_admin
        if user_update.is_active is not None:
            update_fields.append("IsActive = {is_active}")
            params["is_active"] = user_update.is_active
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_fields.append("UpdatedAt = GETDATE()")
        
        update_query = f"""
            UPDATE UserAccount 
            SET {', '.join(update_fields)}
            WHERE UserID = {{user_id}} AND CompanyID = {{company_id}}
        """
        
        await execute_sql(update_query, params)
        
        # Fetch updated user
        fetch_query = """
            SELECT UserID, CompanyID, FirstName, MiddleName, LastName, Email, Phone,
                   Role, IsSuperAdmin, IsActive, CreatedAt, LastSignInAt
            FROM UserAccount
            WHERE UserID = {user_id} AND CompanyID = {company_id}
        """
        
        updated_user = await query_one(fetch_query, {"user_id": user_id, "company_id": company_id})
        
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated user")
        
        return CompanyAdminUserResponse(
            user_id=updated_user["UserID"],
            company_id=updated_user["CompanyID"],
            first_name=updated_user.get("FirstName", ""),
            middle_name=updated_user.get("MiddleName"),
            last_name=updated_user.get("LastName", ""),
            email=updated_user["Email"],
            phone=updated_user.get("Phone"),
            role=updated_user.get("Role", "user"),
            is_super_admin=updated_user.get("IsSuperAdmin", False),
            is_active=updated_user.get("IsActive", True),
            created_at=updated_user["CreatedAt"],
            last_login_at=updated_user.get("LastSignInAt")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update company user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/company/{company_id}/users/{user_id}")
async def delete_company_user(
    company_id: int,
    user_id: int,
    current_user_id: int = Query(..., description="Current user ID for permission check")
):
    """Delete (deactivate) a specific user within a company (company admin access only)"""
    
    # Check permissions
    if not await check_company_admin_permission(current_user_id, company_id):
        raise HTTPException(status_code=403, detail="Access denied. Company admin privileges required.")
    
    # Prevent self-deletion
    if current_user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    try:
        # Check if user exists in this company
        check_query = """
            SELECT UserID FROM UserAccount 
            WHERE UserID = {user_id} AND CompanyID = {company_id}
        """
        existing = await query_one(check_query, {"user_id": user_id, "company_id": company_id})
        
        if not existing:
            raise HTTPException(status_code=404, detail="User not found in this company")
        
        # Soft delete by setting IsActive = False
        delete_query = """
            UPDATE UserAccount 
            SET IsActive = 0, UpdatedAt = GETDATE()
            WHERE UserID = {user_id} AND CompanyID = {company_id}
        """
        
        await execute_sql(delete_query, {"user_id": user_id, "company_id": company_id})
        
        return {"message": "User successfully deactivated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete company user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")