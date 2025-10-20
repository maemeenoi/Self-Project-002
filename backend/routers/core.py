"""
Basic CRUD API endpoints for core entities
Company, UserAccount, FinancialFact, WorkflowFact
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import logging
from lib.db import query_all, query_one

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Core Entities"])

# =========================================================
# COMPANIES
# =========================================================

@router.get("/companies")
async def get_companies():
    """Get all companies"""
    try:
        sql = """
        SELECT CompanyID, Name, SizeLabel, CreatedAt, IsActive
        FROM Company
        WHERE IsActive = 1
        ORDER BY Name
        """
        companies = await query_all(sql)
        return {"companies": companies, "count": len(companies)}
    except Exception as e:
        logger.error(f"Error fetching companies: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch companies")

@router.get("/companies/{company_id}")
async def get_company(company_id: int):
    """Get company by ID"""
    try:
        sql = """
        SELECT CompanyID, Name, SizeLabel, CreatedAt, IsActive
        FROM Company
        WHERE CompanyID = @CompanyID
        """
        company = await query_one(sql, {"CompanyID": company_id})
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch company")

# =========================================================
# USERS
# =========================================================

@router.get("/users")
async def get_users(company_id: Optional[int] = None):
    """Get all users, optionally filtered by company"""
    try:
        if company_id:
            sql = """
            SELECT u.UserID, u.CompanyID, u.FirstName, u.MiddleName, u.LastName, 
                   u.Email, u.Phone, u.IsSuperAdmin, u.CreatedAt, c.Name as CompanyName
            FROM UserAccount u
            LEFT JOIN Company c ON u.CompanyID = c.CompanyID
            WHERE u.CompanyID = @CompanyID
            ORDER BY u.LastName, u.FirstName
            """
            users = await query_all(sql, {"CompanyID": company_id})
        else:
            sql = """
            SELECT u.UserID, u.CompanyID, u.FirstName, u.MiddleName, u.LastName, 
                   u.Email, u.Phone, u.IsSuperAdmin, u.CreatedAt, c.Name as CompanyName
            FROM UserAccount u
            LEFT JOIN Company c ON u.CompanyID = c.CompanyID
            ORDER BY u.LastName, u.FirstName
            """
            users = await query_all(sql)
        
        return {"users": users, "count": len(users)}
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.get("/users/{user_id}")
async def get_user(user_id: int):
    """Get user by ID"""
    try:
        sql = """
        SELECT u.UserID, u.CompanyID, u.FirstName, u.MiddleName, u.LastName, 
               u.Email, u.Phone, u.IsSuperAdmin, u.CreatedAt, c.Name as CompanyName
        FROM UserAccount u
        LEFT JOIN Company c ON u.CompanyID = c.CompanyID
        WHERE u.UserID = @UserID
        """
        user = await query_one(sql, {"UserID": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user")

# =========================================================
# FINANCIAL FACTS
# =========================================================

@router.get("/financial-facts")
async def get_financial_facts(company_id: Optional[int] = None, limit: int = 100):
    """Get financial facts, optionally filtered by company"""
    try:
        if company_id:
            sql = f"""
            SELECT TOP {limit} f.FinancialID, f.CompanyID, f.BilledCost, f.BillingCurrency,
                   f.BillingPeriodStart, f.BillingPeriodEnd, f.ServiceName, f.Provider,
                   f.Region, f.ResourceId, c.Name as CompanyName
            FROM FinancialFact f
            LEFT JOIN Company c ON f.CompanyID = c.CompanyID
            WHERE f.CompanyID = @CompanyID
            ORDER BY f.BillingPeriodStart DESC
            """
            records = await query_all(sql, {"CompanyID": company_id})
        else:
            sql = f"""
            SELECT TOP {limit} f.FinancialID, f.CompanyID, f.BilledCost, f.BillingCurrency,
                   f.BillingPeriodStart, f.BillingPeriodEnd, f.ServiceName, f.Provider,
                   f.Region, f.ResourceId, c.Name as CompanyName
            FROM FinancialFact f
            LEFT JOIN Company c ON f.CompanyID = c.CompanyID
            ORDER BY f.BillingPeriodStart DESC
            """
            records = await query_all(sql)
        
        return {"financial_facts": records, "count": len(records)}
    except Exception as e:
        logger.error(f"Error fetching financial facts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch financial facts")

# =========================================================
# WORKFLOW FACTS
# =========================================================

@router.get("/workflow-facts")
async def get_workflow_facts(company_id: Optional[int] = None, limit: int = 100):
    """Get workflow facts, optionally filtered by company"""
    try:
        if company_id:
            sql = f"""
            SELECT TOP {limit} w.WorkflowID, w.CompanyID, w.Provider, w.ItemType,
                   w.ItemKey, w.ProjectOrRepo, w.Title, w.Status, w.CreatedAt,
                   w.ClosedAt, w.Author, w.Assignee, c.Name as CompanyName
            FROM WorkflowFact w
            LEFT JOIN Company c ON w.CompanyID = c.CompanyID
            WHERE w.CompanyID = @CompanyID
            ORDER BY w.CreatedAt DESC
            """
            records = await query_all(sql, {"CompanyID": company_id})
        else:
            sql = f"""
            SELECT TOP {limit} w.WorkflowID, w.CompanyID, w.Provider, w.ItemType,
                   w.ItemKey, w.ProjectOrRepo, w.Title, w.Status, w.CreatedAt,
                   w.ClosedAt, w.Author, w.Assignee, c.Name as CompanyName
            FROM WorkflowFact w
            LEFT JOIN Company c ON w.CompanyID = c.CompanyID
            ORDER BY w.CreatedAt DESC
            """
            records = await query_all(sql)
        
        return {"workflow_facts": records, "count": len(records)}
    except Exception as e:
        logger.error(f"Error fetching workflow facts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch workflow facts")

# =========================================================
# SUMMARY STATS
# =========================================================

@router.get("/stats")
async def get_summary_stats():
    """Get overall system statistics"""
    try:
        # Get counts for all major entities
        stats = {}
        
        # Companies
        company_sql = "SELECT COUNT(*) as count FROM Company WHERE IsActive = 1"
        company_result = await query_one(company_sql)
        stats["companies"] = company_result["count"] if company_result else 0
        
        # Users
        user_sql = "SELECT COUNT(*) as count FROM UserAccount"
        user_result = await query_one(user_sql)
        stats["users"] = user_result["count"] if user_result else 0
        
        # Financial records
        financial_sql = "SELECT COUNT(*) as count FROM FinancialFact"
        financial_result = await query_one(financial_sql)
        stats["financial_records"] = financial_result["count"] if financial_result else 0
        
        # Workflow records
        workflow_sql = "SELECT COUNT(*) as count FROM WorkflowFact"
        workflow_result = await query_one(workflow_sql)
        stats["workflow_records"] = workflow_result["count"] if workflow_result else 0
        
        return stats
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")