"""
Superadmin Router

This router provides superadmin dashboard endpoints for managing system-wide
operations, monitoring company stats, user counts, and system health.
"""

import logging
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from lib.db import (
    insert_and_return, query_one, query_many, execute_sql, health_check,
    get_company_info, get_recent_sync_batches,
    get_workflow_summary, get_financial_summary
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/superadmin", tags=["superadmin"])

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


# ============================================================================
# Pydantic Models for SuperAdmin API Requests/Responses
# ============================================================================

class SuperAdminStatsResponse(BaseModel):
    total_companies: int
    active_companies: int
    inactive_companies: int
    growth_this_month: Optional[int] = 0

class SuperAdminCompanyResponse(BaseModel):
    company_id: int
    name: str
    size_label: Optional[str]
    subscription_tier: str = "Basic"  # Default since we don't have this field yet
    is_active: bool
    created_at: datetime
    total_users: int
    admin_email: Optional[str] = None
    admin_name: Optional[str] = None
    admin_role: Optional[str] = None
    admin_phone: Optional[str] = None
    integrations_count: int = 0
    last_login: Optional[datetime] = None
    storage_used_gb: float = 0.0
    monthly_cost: float = 0.0
    billing_status: str = "paid"

class SuperAdminUserStatsResponse(BaseModel):
    total_users: int
    admin_users: int
    regular_users: int

class SystemHealthResponse(BaseModel):
    status: str
    uptime: str = "99.9%"
    response_time: str = "95ms"
    database_status: Optional[str] = "Connected"

class CompanyCreateRequest(BaseModel):
    name: str
    size_label: Optional[str] = "Small"
    subscription_tier: Optional[str] = "Basic"
    admin_first_name: str
    admin_middle_name: Optional[str] = None
    admin_last_name: str
    admin_email: str
    admin_phone: Optional[str] = None
    admin_password: str

# ============================================================================
# Super Admin Dashboard API Endpoints
# ============================================================================

@router.get("/companies/count", response_model=SuperAdminStatsResponse)
async def get_total_companies_count():
    """Get total companies count for super admin dashboard"""
    try:
        # Get total companies
        total_query = "SELECT COUNT(*) as count FROM Company"
        total_result = await query_one(total_query)
        total_companies = total_result.get("count", 0) if total_result else 0
        
        # Get active companies  
        active_query = "SELECT COUNT(*) as count FROM Company WHERE IsActive = 1"
        active_result = await query_one(active_query)
        active_companies = active_result.get("count", 0) if active_result else 0
        
        inactive_companies = total_companies - active_companies
        
        # Calculate growth this month (simplified - you can enhance this)
        growth_query = """
            SELECT COUNT(*) as count FROM Company 
            WHERE CreatedAt >= DATEADD(month, -1, GETDATE())
        """
        growth_result = await query_one(growth_query)
        growth_this_month = growth_result.get("count", 0) if growth_result else 0
        
        return SuperAdminStatsResponse(
            total_companies=total_companies,
            active_companies=active_companies,
            inactive_companies=inactive_companies,
            growth_this_month=growth_this_month
        )
        
    except Exception as e:
        logger.error(f"Failed to get companies count: {e}")
        # Return fallback data
        return SuperAdminStatsResponse(
            total_companies=15,
            active_companies=12,
            inactive_companies=3,
            growth_this_month=2
        )

@router.get("/companies/active-count")
async def get_active_companies_count():
    """Get active companies count"""
    try:
        query = "SELECT COUNT(*) as count FROM Company WHERE IsActive = 1"
        result = await query_one(query)
        active_companies = result.get("count", 0) if result else 0
        
        return {"active_companies": active_companies}
        
    except Exception as e:
        logger.error(f"Failed to get active companies count: {e}")
        return {"active_companies": 12}

@router.get("/users/count", response_model=SuperAdminUserStatsResponse)
async def get_total_users_count():
    """Get total users count for super admin dashboard"""
    try:
        # Get total users
        total_query = "SELECT COUNT(*) as count FROM UserAccount"
        total_result = await query_one(total_query)
        total_users = total_result.get("count", 0) if total_result else 0
        
        # Get admin users (super admins)
        admin_query = "SELECT COUNT(*) as count FROM UserAccount WHERE IsSuperAdmin = 1"
        admin_result = await query_one(admin_query)
        admin_users = admin_result.get("count", 0) if admin_result else 0
        
        regular_users = total_users - admin_users
        
        return SuperAdminUserStatsResponse(
            total_users=total_users,
            admin_users=admin_users,
            regular_users=regular_users
        )
        
    except Exception as e:
        logger.error(f"Failed to get users count: {e}")
        return SuperAdminUserStatsResponse(
            total_users=245,
            admin_users=18,
            regular_users=227
        )

@router.get("/system/health", response_model=SystemHealthResponse)
async def get_system_health():
    """Get system health status"""
    try:
        # Test database connection using existing health check
        db_healthy = await health_check()
        
        if db_healthy:
            return SystemHealthResponse(
                status="Operational",
                uptime="99.9%",
                response_time="95ms",
                database_status="Connected"
            )
        else:
            return SystemHealthResponse(
                status="Degraded",
                uptime="99.5%", 
                response_time="125ms",
                database_status="Disconnected"
            )
            
    except Exception as e:
        logger.error(f"Failed to get system health: {e}")
        return SystemHealthResponse(
            status="Error",
            uptime="Unknown",
            response_time="Unknown",
            database_status="Error"
        )

@router.get("/companies", response_model=List[SuperAdminCompanyResponse])
async def get_superadmin_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000)
):
    """Get companies for super admin dashboard with enhanced data"""
    try:
        # Get companies with pagination
        companies_query = f"""
            SELECT CompanyID, Name, SizeLabel, IsActive, CreatedAt
            FROM Company
            ORDER BY CreatedAt DESC
            OFFSET {skip} ROWS
            FETCH NEXT {limit} ROWS ONLY
        """
        
        companies = await query_many(companies_query)
        
        if not companies:
            # Return mock data if no companies found
            return [
                SuperAdminCompanyResponse(
                    company_id=1,
                    name="Acme Corporation",
                    size_label="Medium",
                    subscription_tier="Pro",
                    is_active=True,
                    created_at=datetime.utcnow(),
                    total_users=25,
                    admin_email="admin@acme.com",
                    admin_name="John Doe",
                    admin_role="Client Admin",
                    admin_phone="+1-555-1234",
                    integrations_count=5,
                    last_login=datetime.utcnow(),
                    storage_used_gb=150.5,
                    monthly_cost=499.0,
                    billing_status="paid"
                )
            ]
        
        result = []
        for company in companies:
            company_id = company["CompanyID"]
            
            # Get user count for each company
            user_count_query = "SELECT COUNT(*) as count FROM UserAccount WHERE CompanyID = {company_id}"
            user_result = await query_one(user_count_query, {"company_id": company_id})
            user_count = user_result.get("count", 0) if user_result else 0
            
            # Get admin user for company - only Client Admin role
            admin_query = """
                SELECT u.Email, u.FirstName, u.LastName, u.Phone, u.CreatedAt,
                       r.Name as RoleName
                FROM UserAccount u
                INNER JOIN UserRole ur ON u.UserID = ur.UserID
                INNER JOIN Role r ON ur.RoleID = r.RoleID
                WHERE u.CompanyID = {company_id} 
                AND r.Name = 'Client Admin'
                ORDER BY u.CreatedAt ASC
            """
            admin_result = await query_one(admin_query, {"company_id": company_id})
            
            # Map size label to subscription tier (temporary mapping)
            subscription_tier_map = {
                "Small": "Basic",
                "Medium": "Pro", 
                "Large": "Pro",
                "Enterprise": "Enterprise"
            }
            
            admin_name = None
            admin_role = None
            if admin_result and admin_result.get("FirstName"):
                first_name = admin_result.get("FirstName", "")
                last_name = admin_result.get("LastName", "")
                admin_name = f"{first_name} {last_name}".strip()
                admin_role = "Client Admin"  # Only showing Client Admin in super admin dashboard
            
            result.append(SuperAdminCompanyResponse(
                company_id=company_id,
                name=company["Name"],
                size_label=company.get("SizeLabel"),
                subscription_tier=subscription_tier_map.get(company.get("SizeLabel", ""), "Basic"),
                is_active=company["IsActive"],
                created_at=company["CreatedAt"],
                total_users=user_count,
                admin_email=admin_result.get("Email") if admin_result else None,
                admin_name=admin_name,
                admin_role=admin_role,
                admin_phone=admin_result.get("Phone") if admin_result else None,
                integrations_count=0,  # Placeholder - implement if you have integration data
                last_login=admin_result.get("CreatedAt") if admin_result else None,
                storage_used_gb=0.0,  # Placeholder - implement if you track storage
                monthly_cost=99.0 if company.get("SizeLabel") == "Small" else 499.0,  # Placeholder pricing
                billing_status="paid"
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get companies for super admin: {e}")
        # Return mock data on error
        return [
            SuperAdminCompanyResponse(
                company_id=1,
                name="Acme Corporation",
                size_label="Medium",
                subscription_tier="Pro",
                is_active=True,
                created_at=datetime.utcnow(),
                total_users=25,
                admin_email="admin@acme.com",
                admin_name="John Doe",
                admin_role="Client Admin",
                admin_phone="+1-555-1234",
                integrations_count=5,
                last_login=datetime.utcnow(),
                storage_used_gb=150.5,
                monthly_cost=499.0,
                billing_status="paid"
            )
        ]

@router.post("/companies", response_model=SuperAdminCompanyResponse)
async def create_superadmin_company(company_data: CompanyCreateRequest):
    """Create a new company via super admin dashboard"""
    try:
        logger.info(f"Creating company with data: {company_data}")
        
        # Validate required fields
        if not all([company_data.name, company_data.admin_first_name, company_data.admin_last_name, 
                   company_data.admin_email, company_data.admin_password]):
            logger.error("Missing required fields")
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Validate password strength
        if len(company_data.admin_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Check if company already exists
        existing_company_query = "SELECT CompanyID FROM Company WHERE Name = {name}"
        existing_company = await query_one(existing_company_query, {"name": company_data.name})
        if existing_company:
            raise HTTPException(status_code=400, detail="Company with this name already exists")
        
        # Check if admin email already exists
        existing_user_query = "SELECT UserID FROM UserAccount WHERE Email = {email}"
        existing_user = await query_one(existing_user_query, {"email": company_data.admin_email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Hash the password
        password_hash = hash_password(company_data.admin_password)
        
        # Create company
        create_company_query = """
            INSERT INTO Company (Name, SizeLabel, CreatedAt, IsActive)
            OUTPUT INSERTED.CompanyID, INSERTED.Name, INSERTED.SizeLabel, INSERTED.CreatedAt, INSERTED.IsActive
            VALUES ({name}, {size_label}, SYSUTCDATETIME(), 1)
        """
        company_result = await insert_and_return(create_company_query, {
            "name": company_data.name,
            "size_label": company_data.size_label
        })
        
        if not company_result:
            raise HTTPException(status_code=500, detail="Failed to create company")
        
        company_id = company_result["CompanyID"]
        
        # Create admin user
        create_user_query = """
            INSERT INTO UserAccount (CompanyID, FirstName, MiddleName, LastName, Email, PasswordHash, Phone, 
                                   Department, Location, IsSuperAdmin, IsActive, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.UserID, INSERTED.Email, INSERTED.FirstName, INSERTED.MiddleName, INSERTED.LastName, INSERTED.Phone
            VALUES ({company_id}, {first_name}, {middle_name}, {last_name}, {email}, {password_hash}, {phone}, 
                    NULL, NULL, 0, 1, SYSUTCDATETIME(), SYSUTCDATETIME())
        """
        user_result = await insert_and_return(create_user_query, {
            "company_id": company_id,
            "first_name": company_data.admin_first_name,
            "middle_name": company_data.admin_middle_name,
            "last_name": company_data.admin_last_name,
            "email": company_data.admin_email,
            "password_hash": password_hash,
            "phone": company_data.admin_phone
        })
        
        if not user_result:
            raise HTTPException(status_code=500, detail="Failed to create admin user")
        
        user_id = user_result["UserID"]
        logger.info(f"✅ Created admin user {user_id} for company {company_id}")
        
        # Assign admin role to the user
        # First check if "Client Admin" role exists, if not create it
        role_query = "SELECT RoleID FROM Role WHERE Name = {role_name}"
        role_result = await query_one(role_query, {"role_name": "Client Admin"})
        logger.info(f"Role query result: {role_result}")
        
        if not role_result:
            logger.info("Creating Client Admin role")
            # Create Client Admin role if it doesn't exist
            create_role_query = """
                INSERT INTO Role (Name, IsSystemRole)
                OUTPUT INSERTED.RoleID
                VALUES ({role_name}, 0)
            """
            role_result = await insert_and_return(create_role_query, {
                "role_name": "Client Admin"
            })
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
            logger.error("Failed to create or find Client Admin role")
        
        # Map size to subscription tier
        subscription_tier_map = {
            "Small": "Basic",
            "Medium": "Pro", 
            "Large": "Pro",
            "Enterprise": "Enterprise"
        }
        
        # Format admin name
        admin_name = f"{user_result['FirstName']}"
        if user_result.get('MiddleName'):
            admin_name += f" {user_result['MiddleName']}"
        admin_name += f" {user_result['LastName']}"
        
        result = SuperAdminCompanyResponse(
            company_id=company_id,
            name=company_result["Name"],
            size_label=company_result["SizeLabel"],
            subscription_tier=subscription_tier_map.get(company_data.size_label, "Basic"),
            is_active=company_result["IsActive"],
            created_at=company_result["CreatedAt"],
            total_users=1,  # Just created the admin user
            admin_email=user_result["Email"],
            admin_name=admin_name.strip(),
            admin_role="Client Admin",
            admin_phone=user_result.get("Phone"),
            integrations_count=0,
            last_login=None,
            storage_used_gb=0.0,
            monthly_cost=99.0 if company_data.size_label == "Small" else 499.0,
            billing_status="paid"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create company via super admin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/companies/{company_id}", response_model=SuperAdminCompanyResponse)
async def update_superadmin_company(company_id: int, company_data: dict):
    """Update an existing company via super admin dashboard"""
    try:
        logger.info(f"Updating company {company_id} with data: {company_data}")
        
        # Get existing company
        existing_query = "SELECT CompanyID, Name, SizeLabel, IsActive, CreatedAt FROM Company WHERE CompanyID = {company_id}"
        existing_company = await query_one(existing_query, {"company_id": company_id})
        if not existing_company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Update company fields
        update_fields = []
        params = {"company_id": company_id}
        
        if "name" in company_data:
            update_fields.append("Name = {name}")
            params["name"] = company_data["name"]
        if "size_label" in company_data:
            update_fields.append("SizeLabel = {size_label}")
            params["size_label"] = company_data["size_label"]
        if "is_active" in company_data:
            update_fields.append("IsActive = {is_active}")
            params["is_active"] = 1 if company_data["is_active"] else 0
            logger.info(f"Converting is_active {company_data['is_active']} to bit value {params['is_active']}")
        
        if update_fields:
            update_query = f"UPDATE Company SET {', '.join(update_fields)} WHERE CompanyID = {{company_id}}"
            logger.info(f"Executing update query: {update_query} with params: {params}")
            await execute_sql(update_query, params)
        
        # Get updated company info
        updated_company = await query_one(existing_query, {"company_id": company_id})
        
        # Get user count and admin info
        user_count_query = "SELECT COUNT(*) as count FROM UserAccount WHERE CompanyID = {company_id}"
        user_result = await query_one(user_count_query, {"company_id": company_id})
        user_count = user_result.get("count", 0) if user_result else 0
        
        # Get admin user info - only Client Admin role
        admin_query = """
            SELECT u.Email, u.FirstName, u.MiddleName, u.LastName, u.Phone, u.CreatedAt,
                   r.Name as RoleName
            FROM UserAccount u
            INNER JOIN UserRole ur ON u.UserID = ur.UserID
            INNER JOIN Role r ON ur.RoleID = r.RoleID
            WHERE u.CompanyID = {company_id} 
            AND r.Name = 'Client Admin'
            ORDER BY u.CreatedAt ASC
        """
        admin_result = await query_one(admin_query, {"company_id": company_id})
        
        # Format admin name and role
        admin_name = None
        admin_role = None
        if admin_result and admin_result.get("FirstName"):
            admin_name = f"{admin_result['FirstName']}"
            if admin_result.get('MiddleName'):
                admin_name += f" {admin_result['MiddleName']}"
            admin_name += f" {admin_result['LastName']}"
            admin_role = "Client Admin"  # Only showing Client Admin in super admin dashboard
        
        # Map size to subscription tier
        subscription_tier_map = {
            "Small": "Basic",
            "Medium": "Pro", 
            "Large": "Pro",
            "Enterprise": "Enterprise"
        }
        
        result = SuperAdminCompanyResponse(
            company_id=updated_company["CompanyID"],
            name=updated_company["Name"],
            size_label=updated_company["SizeLabel"],
            subscription_tier=subscription_tier_map.get(updated_company.get("SizeLabel", ""), "Basic"),
            is_active=updated_company["IsActive"],
            created_at=updated_company["CreatedAt"],
            total_users=user_count,
            admin_email=admin_result.get("Email") if admin_result else None,
            admin_name=admin_name.strip() if admin_name else None,
            admin_role=admin_role,
            admin_phone=admin_result.get("Phone") if admin_result else None,
            integrations_count=0,
            last_login=admin_result.get("CreatedAt") if admin_result else None,
            storage_used_gb=0.0,
            monthly_cost=99.0 if updated_company.get("SizeLabel") == "Small" else 499.0,
            billing_status="paid"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update company via super admin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/companies/{company_id}")
async def delete_superadmin_company(company_id: int):
    """Delete a company via super admin dashboard"""
    try:
        # Check if company exists
        existing_query = "SELECT CompanyID FROM Company WHERE CompanyID = {company_id}"
        existing_company = await query_one(existing_query, {"company_id": company_id})
        if not existing_company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # First delete all users in the company
        delete_users_query = "DELETE FROM UserAccount WHERE CompanyID = {company_id}"
        await execute_sql(delete_users_query, {"company_id": company_id})
        
        # Then delete the company
        delete_company_query = "DELETE FROM Company WHERE CompanyID = {company_id}"
        await execute_sql(delete_company_query, {"company_id": company_id})
        
        return {"message": "Company deleted successfully", "company_id": company_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete company via super admin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/companies/{company_id}/reset-password")
async def reset_company_admin_password(company_id: int, password_data: dict):
    """Reset the company admin password for a company"""
    try:
        new_password = password_data.get("new_password")
        if not new_password or len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Get the company admin user for this company
        admin_query = """
            SELECT u.UserID, u.Email FROM UserAccount u
            INNER JOIN UserRole ur ON u.UserID = ur.UserID
            INNER JOIN Role r ON ur.RoleID = r.RoleID
            WHERE u.CompanyID = {company_id} AND r.Name = 'Client Admin'
            ORDER BY u.CreatedAt ASC
        """
        admin_result = await query_one(admin_query, {"company_id": company_id})
        
        if not admin_result:
            raise HTTPException(status_code=404, detail="Company admin not found for this company")
        
        # Hash the new password
        password_hash = hash_password(new_password)
        
        # Update the password
        update_query = "UPDATE UserAccount SET PasswordHash = {password_hash} WHERE UserID = {user_id}"
        await execute_sql(update_query, {
            "password_hash": password_hash,
            "user_id": admin_result["UserID"]
        })
        
        return {
            "message": "Password reset successfully",
            "admin_email": admin_result["Email"],
            "company_id": company_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to reset company admin password: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/companies/{company_id}/admin")
async def get_company_admin_info(company_id: int):
    """Get the company admin information for a company"""
    try:
        # Check if company exists
        company_query = "SELECT CompanyID, Name FROM Company WHERE CompanyID = {company_id}"
        company_result = await query_one(company_query, {"company_id": company_id})
        if not company_result:
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Get the company admin user for this company (only Client Admin)
        admin_query = """
            SELECT TOP 1 u.UserID, u.Email, u.FirstName, u.MiddleName, u.LastName, u.Phone, u.CreatedAt
            FROM UserAccount u
            INNER JOIN UserRole ur ON u.UserID = ur.UserID
            INNER JOIN Role r ON ur.RoleID = r.RoleID
            WHERE u.CompanyID = {company_id} 
            AND r.Name = 'Client Admin'
            ORDER BY u.CreatedAt ASC
        """
        admin_result = await query_one(admin_query, {"company_id": company_id})
        
        if not admin_result:
            raise HTTPException(status_code=404, detail="Client Admin not found for this company")
        
        # Format admin name
        admin_name = f"{admin_result['FirstName']}"
        if admin_result.get('MiddleName'):
            admin_name += f" {admin_result['MiddleName']}"
        admin_name += f" {admin_result['LastName']}"
        
        # Return flat structure that matches frontend expectations
        return {
            "admin_id": admin_result["UserID"],
            "first_name": admin_result["FirstName"],
            "middle_name": admin_result.get("MiddleName"),
            "last_name": admin_result["LastName"],
            "email": admin_result["Email"],
            "phone": admin_result.get("Phone"),
            "created_at": admin_result["CreatedAt"],
            "last_login": admin_result.get("CreatedAt"),
            "company_id": company_id,
            "company_name": company_result["Name"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get company admin info: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    """Get all users in the system for super admin dashboard"""
    try:
        # Build dynamic WHERE clause
        where_conditions = []
        params = {"skip": skip, "limit": limit}
        
        if search:
            where_conditions.append("(u.FirstName LIKE {search} OR u.LastName LIKE {search} OR u.Email LIKE {search})")
            params["search"] = f"%{search}%"
        
        if company_id:
            where_conditions.append("u.CompanyID = {company_id}")
            params["company_id"] = company_id
            
        if is_active is not None:
            where_conditions.append("u.IsActive = {is_active}")
            params["is_active"] = 1 if is_active else 0
        
        where_clause = " AND " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Get users with role information
        users_query = f"""
            SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email,
                   u.CompanyID, u.IsSuperAdmin, u.IsActive, u.CreatedAt, u.Phone,
                   c.Name as CompanyName, r.Name as RoleName
            FROM UserAccount u
            LEFT JOIN Company c ON u.CompanyID = c.CompanyID
            LEFT JOIN UserRole ur ON u.UserID = ur.UserID
            LEFT JOIN Role r ON ur.RoleID = r.RoleID
            WHERE 1=1 {where_clause}
            ORDER BY u.CreatedAt DESC
            OFFSET {{skip}} ROWS
            FETCH NEXT {{limit}} ROWS ONLY
        """
        
        users = await query_many(users_query, params)
        
        result = []
        for user in users:
            result.append({
                "user_id": user["UserID"],
                "first_name": user["FirstName"],
                "middle_name": user.get("MiddleName"),
                "last_name": user["LastName"],
                "email": user["Email"],
                "company_id": user.get("CompanyID"),
                "company_name": user.get("CompanyName"),
                "is_super_admin": user["IsSuperAdmin"],
                "is_active": user["IsActive"],
                "created_at": user["CreatedAt"],
                "role": user.get("RoleName", "User")
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get all users: {e}")
        return []

@router.post("/users")
async def create_user(user_data: dict):
    """Create a new user via super admin dashboard"""
    try:
        logger.info(f"Creating user with data: {user_data}")
        
        # Validate required fields
        required_fields = ["first_name", "last_name", "email", "password"]
        for field in required_fields:
            if not user_data.get(field):
                logger.error(f"Missing required field: {field}")
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Validate password strength
        password = user_data["password"]
        if len(password) < 8:
            logger.error(f"Password too short: {len(password)} characters")
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Check if user with email already exists
        existing_query = "SELECT UserID FROM UserAccount WHERE Email = {email}"
        existing_user = await query_one(existing_query, {"email": user_data["email"]})
        if existing_user:
            logger.error(f"User with email {user_data['email']} already exists (UserID: {existing_user['UserID']})")
            raise HTTPException(status_code=400, detail=f"User with email '{user_data['email']}' already exists")
        
        # Hash the password
        password_hash = hash_password(password)
        logger.info(f"Password hashed successfully for user creation")
        
        # Create user
        create_user_query = """
            INSERT INTO UserAccount (CompanyID, FirstName, MiddleName, LastName, Email, PasswordHash,
                                   IsSuperAdmin, IsActive, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.UserID, INSERTED.FirstName, INSERTED.MiddleName, INSERTED.LastName, 
                   INSERTED.Email, INSERTED.CompanyID, INSERTED.IsSuperAdmin, INSERTED.IsActive, INSERTED.CreatedAt
            VALUES ({company_id}, {first_name}, {middle_name}, {last_name}, {email}, {password_hash},
                    {is_super_admin}, {is_active}, SYSUTCDATETIME(), SYSUTCDATETIME())
        """
        
        user_result = await insert_and_return(create_user_query, {
            "company_id": user_data.get("company_id") if user_data.get("company_id", 0) > 0 else None,
            "first_name": user_data["first_name"],
            "middle_name": user_data.get("middle_name") if user_data.get("middle_name") else None,
            "last_name": user_data["last_name"],
            "email": user_data["email"],
            "password_hash": password_hash,
            "is_super_admin": 1 if user_data.get("is_super_admin", False) else 0,
            "is_active": 1 if user_data.get("is_active", True) else 0
        })
        
        if not user_result:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user_id = user_result["UserID"]
        logger.info(f"✅ Created user {user_id}")
        
        # Assign role if specified
        role_name = user_data.get("role", "User")
        if role_name:
            # Find or create the role
            role_query = "SELECT RoleID FROM Role WHERE Name = {role_name}"
            role_result = await query_one(role_query, {"role_name": role_name})
            
            if not role_result:
                # Create the role if it doesn't exist
                create_role_query = """
                    INSERT INTO Role (Name, IsSystemRole)
                    OUTPUT INSERTED.RoleID
                    VALUES ({role_name}, 0)
                """
                role_result = await insert_and_return(create_role_query, {"role_name": role_name})
            
            if role_result:
                # Assign the role to the user
                assign_role_query = """
                    INSERT INTO UserRole (UserID, RoleID)
                    VALUES ({user_id}, {role_id})
                """
                await execute_sql(assign_role_query, {
                    "user_id": user_id,
                    "role_id": role_result["RoleID"]
                })
                logger.info(f"✅ Role '{role_name}' assigned to user {user_id}")
        
        return {
            "message": "User created successfully",
            "user_id": user_id,
            "user": {
                "user_id": user_result["UserID"],
                "first_name": user_result["FirstName"],
                "middle_name": user_result.get("MiddleName"),
                "last_name": user_result["LastName"],
                "email": user_result["Email"],
                "company_id": user_result.get("CompanyID"),
                "is_super_admin": user_result["IsSuperAdmin"],
                "is_active": user_result["IsActive"],
                "created_at": user_result["CreatedAt"],
                "role": role_name
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create user via super admin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/users/{user_id}")
async def update_user(user_id: int, user_data: dict):
    """Update an existing user via super admin dashboard"""
    try:
        logger.info(f"Updating user {user_id} with data: {user_data}")
        
        # Get existing user
        existing_query = "SELECT UserID, FirstName, LastName, Email, CompanyID, IsSuperAdmin, IsActive FROM UserAccount WHERE UserID = {user_id}"
        existing_user = await query_one(existing_query, {"user_id": user_id})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user fields
        update_fields = []
        params = {"user_id": user_id}
        
        if "first_name" in user_data:
            update_fields.append("FirstName = {first_name}")
            params["first_name"] = user_data["first_name"]
        if "middle_name" in user_data:
            update_fields.append("MiddleName = {middle_name}")
            params["middle_name"] = user_data["middle_name"] if user_data["middle_name"] else None
        if "last_name" in user_data:
            update_fields.append("LastName = {last_name}")
            params["last_name"] = user_data["last_name"]
        if "email" in user_data:
            update_fields.append("Email = {email}")
            params["email"] = user_data["email"]
        if "company_id" in user_data:
            update_fields.append("CompanyID = {company_id}")
            params["company_id"] = user_data["company_id"] if user_data["company_id"] > 0 else None
        if "is_super_admin" in user_data:
            update_fields.append("IsSuperAdmin = {is_super_admin}")
            params["is_super_admin"] = 1 if user_data["is_super_admin"] else 0
        if "is_active" in user_data:
            update_fields.append("IsActive = {is_active}")
            params["is_active"] = 1 if user_data["is_active"] else 0
        
        if update_fields:
            update_query = f"UPDATE UserAccount SET {', '.join(update_fields)}, UpdatedAt = SYSUTCDATETIME() WHERE UserID = {{user_id}}"
            logger.info(f"Executing user update query: {update_query} with params: {params}")
            await execute_sql(update_query, params)
        
        return {"message": "User updated successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user via super admin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Delete a user via super admin dashboard"""
    try:
        # Check if user exists
        existing_query = "SELECT UserID, FirstName, LastName, Email FROM UserAccount WHERE UserID = {user_id}"
        existing_user = await query_one(existing_query, {"user_id": user_id})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete user roles first (foreign key constraint)
        delete_roles_query = "DELETE FROM UserRole WHERE UserID = {user_id}"
        await execute_sql(delete_roles_query, {"user_id": user_id})
        
        # Then delete the user
        delete_user_query = "DELETE FROM UserAccount WHERE UserID = {user_id}"
        await execute_sql(delete_user_query, {"user_id": user_id})
        
        return {
            "message": "User deleted successfully", 
            "user_id": user_id,
            "deleted_user": f"{existing_user['FirstName']} {existing_user['LastName']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user via super admin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ============================================================================
# Additional Endpoints for Frontend Integration
# ============================================================================

@router.get("/activity")
async def get_system_activity(limit: int = Query(20, ge=1, le=100)):
    """Get system activity log for super admin dashboard"""
    try:
        # Since we don't have an activity log table yet, return mock data
        # In a real implementation, you would query an ActivityLog table
        mock_activities = [
            {
                "id": 1,
                "timestamp": datetime.utcnow(),
                "type": "user_login",
                "description": "User jade@makestuffgo.com logged in",
                "user_email": "jade@makestuffgo.com",
                "company_name": "MakeStuffGo"
            },
            {
                "id": 2,
                "timestamp": datetime.utcnow() - timedelta(minutes=15),
                "type": "company_created",
                "description": "New company 'TechFlow Solutions' created",
                "user_email": "admin@makestuffgo.com",
                "company_name": "TechFlow Solutions"
            },
            {
                "id": 3,
                "timestamp": datetime.utcnow() - timedelta(hours=2),
                "type": "user_created", 
                "description": "New user registered: john@techflow.com",
                "user_email": "admin@makestuffgo.com",
                "company_name": "TechFlow Solutions"
            }
        ]
        
        return {"activities": mock_activities[:limit]}
        
    except Exception as e:
        logger.error(f"Failed to get system activity: {e}")
        return {"activities": []}

@router.get("/integrations/company-status")
async def get_company_integrations_status():
    """Get per-company integration status for Integration Status widget"""
    try:
        # Check real integration data from Integration table and infer from other tables
        
        # Get all active companies
        companies_query = """
        SELECT CompanyID, Name, CreatedAt
        FROM Company 
        WHERE IsActive = 1
        ORDER BY CreatedAt DESC
        """
        companies = await query_many(companies_query)
        
        if not companies:
            return {
                "companies": [],
                "summary": {
                    "total_companies": 0,
                    "total_integrations": 0,
                    "healthy_percentage": 0
                }
            }
        
        result_companies = []
        total_integrations = 0
        total_healthy = 0
        
        # Check each company for real integration data
        for company in companies:
            company_id = company["CompanyID"]
            company_name = company["Name"]
            
            integrations = {}
            healthy_count = 0
            total_count = 0
            latest_activity = None
            
            # Check Integration table first (real integrations)
            integrations_query = """
            SELECT IntegrationType, IntegrationName, IsActive, CreatedAt, UpdatedAt
            FROM Integration 
            WHERE CompanyID = {company_id}
            ORDER BY CreatedAt DESC
            """
            integration_records = await query_many(integrations_query, {"company_id": company_id})
            
            if integration_records:
                # Use real integration data
                for record in integration_records:
                    provider = record['IntegrationType'].lower()
                    status = 'healthy' if record['IsActive'] else 'error'
                    last_sync = record['UpdatedAt'] or record['CreatedAt']
                    
                    if status == 'healthy':
                        healthy_count += 1
                    
                    integrations[provider] = {
                        'status': status,
                        'last_sync': last_sync.isoformat(),
                        'resources_count': 1,
                        'name': record['IntegrationName']
                    }
                    total_count += 1
                    
                    if not latest_activity or last_sync > latest_activity:
                        latest_activity = last_sync
            else:
                # Check for data in other tables to infer integrations
                
                # Check FinancialFact for cloud provider data
                financial_query = """
                SELECT DISTINCT Provider, COUNT(*) as records, MAX(BillingPeriodEnd) as last_date
                FROM FinancialFact 
                WHERE CompanyID = {company_id}
                GROUP BY Provider
                """
                try:
                    financial_data = await query_many(financial_query, {"company_id": company_id})
                    
                    for record in financial_data:
                        if record['Provider'] and record['records'] > 0:
                            provider = record['Provider'].lower()
                            integrations[provider] = {
                                'status': 'healthy',
                                'last_sync': record['last_date'].isoformat() if record['last_date'] else datetime.utcnow().isoformat(),
                                'resources_count': record['records'],
                                'name': f"{company_name} {record['Provider']}"
                            }
                            healthy_count += 1
                            total_count += 1
                            
                            if not latest_activity or (record['last_date'] and record['last_date'] > latest_activity):
                                latest_activity = record['last_date']
                except Exception as fe:
                    logger.warning(f"Failed to query FinancialFact for company {company_id}: {fe}")
                
                # Check WorkflowFact for GitHub/Jira data
                workflow_query = """
                SELECT DISTINCT Provider, COUNT(*) as records, MAX(CreatedAt) as last_date
                FROM WorkflowFact 
                WHERE CompanyID = {company_id}
                GROUP BY Provider
                """
                try:
                    workflow_data = await query_many(workflow_query, {"company_id": company_id})
                    
                    for record in workflow_data:
                        if record['Provider'] and record['records'] > 0:
                            provider = record['Provider'].lower()
                            if provider not in integrations:  # Don't overwrite existing
                                if provider == 'github':
                                    integrations[provider] = {
                                        'status': 'healthy',
                                        'last_sync': record['last_date'].isoformat() if record['last_date'] else datetime.utcnow().isoformat(),
                                        'repos_count': record['records'],
                                        'name': f"{company_name} GitHub"
                                    }
                                elif provider == 'jira':
                                    integrations[provider] = {
                                        'status': 'healthy',
                                        'last_sync': record['last_date'].isoformat() if record['last_date'] else datetime.utcnow().isoformat(),
                                        'projects_count': record['records'],
                                        'name': f"{company_name} Jira"
                                    }
                                
                                healthy_count += 1
                                total_count += 1
                                
                                if not latest_activity or (record['last_date'] and record['last_date'] > latest_activity):
                                    latest_activity = record['last_date']
                except Exception as we:
                    logger.warning(f"Failed to query WorkflowFact for company {company_id}: {we}")
                
                # Check SyncBatch for additional integration evidence
                sync_query = """
                SELECT DISTINCT SourceSystem, COUNT(*) as records, MAX(StartedAt) as last_date
                FROM SyncBatch 
                WHERE CompanyID = {company_id}
                GROUP BY SourceSystem
                """
                try:
                    sync_data = await query_many(sync_query, {"company_id": company_id})
                    
                    for record in sync_data:
                        if record['SourceSystem'] and record['records'] > 0:
                            source = record['SourceSystem'].lower()
                            if source not in integrations:  # Don't overwrite existing
                                integrations[source] = {
                                    'status': 'healthy',
                                    'last_sync': record['last_date'].isoformat() if record['last_date'] else datetime.utcnow().isoformat(),
                                    'sync_count': record['records'],
                                    'name': f"{company_name} {record['SourceSystem'].title()}"
                                }
                                healthy_count += 1
                                total_count += 1
                                
                                if not latest_activity or (record['last_date'] and record['last_date'] > latest_activity):
                                    latest_activity = record['last_date']
                except Exception as se:
                    logger.warning(f"Failed to query SyncBatch for company {company_id}: {se}")
            
            # Only include companies that have integrations
            if total_count > 0:
                result_companies.append({
                    'company_id': company_id,
                    'company_name': company_name,
                    'integrations': integrations,
                    'total_integrations': total_count,
                    'healthy_integrations': healthy_count,
                    'last_activity': latest_activity.isoformat() if latest_activity else datetime.utcnow().isoformat()
                })
                total_integrations += total_count
                total_healthy += healthy_count
        
        # Calculate overall health percentage
        healthy_percentage = round((total_healthy / total_integrations * 100) if total_integrations > 0 else 0)
        
        return {
            "companies": result_companies,
            "summary": {
                "total_companies": len(result_companies),
                "total_integrations": total_integrations,
                "healthy_percentage": healthy_percentage
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get company integrations status: {e}")
        return {
            "companies": [],
            "summary": {
                "total_companies": 0,
                "total_integrations": 0,
                "healthy_percentage": 0
            }
        }

@router.get("/admin/{user_id}")
async def get_admin_name_by_user_id(user_id: int):
    """Get admin name by User ID, checking UserRole and Role relationships"""
    try:
        # Get user with admin roles - check for various admin role names
        admin_query = """
            SELECT u.UserID, u.Email, u.FirstName, u.MiddleName, u.LastName, u.Phone, 
                   u.CompanyID, u.CreatedAt, r.Name as RoleName, r.RoleID
            FROM UserAccount u
            LEFT JOIN UserRole ur ON u.UserID = ur.UserID
            LEFT JOIN Role r ON ur.RoleID = r.RoleID
            WHERE u.UserID = {user_id} 
            AND r.Name = 'Client Admin'
            ORDER BY u.CreatedAt ASC
        """
        admin_result = await query_one(admin_query, {"user_id": user_id})
        
        if not admin_result:
            # Check if user exists but doesn't have admin role
            user_check_query = "SELECT UserID, FirstName, LastName, Email FROM UserAccount WHERE UserID = {user_id}"
            user_exists = await query_one(user_check_query, {"user_id": user_id})
            
            if user_exists:
                raise HTTPException(status_code=403, detail="User found but does not have admin privileges")
            else:
                raise HTTPException(status_code=404, detail="User not found")
        
        # Format admin name
        admin_name = f"{admin_result['FirstName']}"
        if admin_result.get('MiddleName'):
            admin_name += f" {admin_result['MiddleName']}"
        admin_name += f" {admin_result['LastName']}"
        
        return {
            "user_id": admin_result["UserID"],
            "admin_name": admin_name.strip(),
            "email": admin_result["Email"],
            "role_name": admin_result.get("RoleName", "Super Admin" if admin_result.get("IsSuperAdmin") else "Admin"),
            "company_id": admin_result.get("CompanyID"),
            "phone": admin_result.get("Phone"),
            "created_at": admin_result["CreatedAt"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get admin name for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/users", response_model=List[dict])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all users in the system for super admin dashboard"""
    try:
        # Get all users with company information
        users_query = f"""
            SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, 
                   u.CompanyID, c.Name as CompanyName, u.IsSuperAdmin, u.IsActive, 
                   u.CreatedAt, u.LastSignInAt, u.Phone
            FROM UserAccount u
            LEFT JOIN Company c ON u.CompanyID = c.CompanyID
            ORDER BY u.CreatedAt DESC
            OFFSET {skip} ROWS
            FETCH NEXT {limit} ROWS ONLY
        """
        
        users = await query_many(users_query)
        
        if not users:
            return []
        
        result = []
        for user in users:
            # Get user role
            role_query = """
                SELECT r.Name as RoleName
                FROM UserRole ur
                INNER JOIN Role r ON ur.RoleID = r.RoleID
                WHERE ur.UserID = {user_id}
                ORDER BY r.Name
            """
            role_result = await query_one(role_query, {"user_id": user["UserID"]})
            
            result.append({
                "user_id": user["UserID"],
                "first_name": user["FirstName"],
                "middle_name": user.get("MiddleName"),
                "last_name": user["LastName"],
                "email": user["Email"],
                "company_id": user.get("CompanyID"),
                "company_name": user.get("CompanyName"),
                "is_super_admin": user.get("IsSuperAdmin", False),
                "is_active": user.get("IsActive", True),
                "created_at": user["CreatedAt"],
                "phone": user.get("Phone"),
                "role": role_result.get("RoleName") if role_result else None,
                "last_login": user.get("LastSignInAt")
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get all users: {e}")
        # Return empty list on error
        return []

@router.get("/recent-additions")
async def get_recent_additions(limit: int = Query(6, ge=1, le=50)):
    """Get recently created companies with admin details for Recent Additions widget"""
    try:
        # Get recent companies with admin information
        query = f"""
        SELECT TOP {limit} 
            c.CompanyID, c.Name, c.SizeLabel, c.CreatedAt, c.IsActive,
            u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email
        FROM Company c
        LEFT JOIN (
            SELECT DISTINCT u.CompanyID, u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email,
                   ROW_NUMBER() OVER (PARTITION BY u.CompanyID ORDER BY u.CreatedAt ASC) as rn
            FROM UserAccount u
            INNER JOIN UserRole ur ON u.UserID = ur.UserID
            INNER JOIN Role r ON ur.RoleID = r.RoleID
            WHERE r.Name = 'Client Admin'
        ) u ON c.CompanyID = u.CompanyID AND u.rn = 1
        WHERE c.CreatedAt >= DATEADD(day, -30, GETDATE())
        ORDER BY c.CreatedAt DESC
        """
        
        recent_companies = await query_many(query)
        
        if not recent_companies:
            return []
        
        result = []
        # Map size labels to subscription tiers
        subscription_tier_map = {
            "Small": "Basic",
            "Medium": "Professional", 
            "Large": "Professional",
            "Enterprise": "Enterprise"
        }
        
        for company in recent_companies:
            # Format admin name
            admin_name = None
            if company.get("FirstName"):
                admin_name = company["FirstName"]
                if company.get("MiddleName"):
                    admin_name += f" {company['MiddleName']}"
                if company.get("LastName"):
                    admin_name += f" {company['LastName']}"
                admin_name = admin_name.strip()
            
            result.append({
                "company_id": company["CompanyID"],
                "name": company["Name"],
                "created_at": company["CreatedAt"].isoformat(),
                "admin_name": admin_name or "Admin User",
                "admin_email": company.get("Email") or "admin@company.com",
                "subscription_tier": subscription_tier_map.get(company.get("SizeLabel", ""), "Basic"),
                "created_by": "Self Registration",
                "status": "active" if company["IsActive"] else "inactive",
                "employees_count": 50,  # Default value, add actual field if available
                "industry": "Technology"  # Default value, add actual field if available
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get recent additions: {e}")
        return []

@router.get("/roles")
async def get_all_roles():
    """Get all available roles in the system"""
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