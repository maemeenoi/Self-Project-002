"""
Debug endpoint to test SQL queries directly
"""

from fastapi import APIRouter, HTTPException
from lib.db import query_all, query_one
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/debug", tags=["Debug"])

@router.get("/test-financial/{company_id}")
async def test_financial_query(company_id: int):
    """Test financial query with different parameter formats"""
    try:
        # Test different parameter binding formats
        results = {}
        
        # Test 1: Using f-string (should work)
        sql1 = f"SELECT COUNT(*) as count FROM FinancialFact WHERE CompanyID = {company_id}"
        result1 = await query_one(sql1)
        results["f_string"] = result1
        
        # Test 2: Using @param binding
        sql2 = "SELECT COUNT(*) as count FROM FinancialFact WHERE CompanyID = @CompanyID"
        result2 = await query_one(sql2, {"CompanyID": company_id})
        results["param_binding"] = result2
        
        # Test 3: Get actual records
        sql3 = f"SELECT TOP 3 FinancialID, CompanyID, ServiceName, BilledCost FROM FinancialFact WHERE CompanyID = {company_id}"
        result3 = await query_all(sql3)
        results["actual_records"] = result3
        
        return results
        
    except Exception as e:
        logger.error(f"Debug test failed: {e}")
        return {"error": str(e)}