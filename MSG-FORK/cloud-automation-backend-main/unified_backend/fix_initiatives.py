#!/usr/bin/env python3
"""
Quick fix to update existing Initiative records with proper provider names and British spelling
"""
import sys
import os
import asyncio

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.db import execute_sql

async def fix_initiatives():
    """Update existing initiatives to use uppercase provider names and British spelling"""
    
    try:
        # Update azure to AZURE and optimization to optimisation
        await execute_sql("""
            UPDATE Initiative 
            SET Name = 'AZURE Cost Optimisation Initiative',
                Description = 'Optimise and modernise AZURE infrastructure to reduce costs and improve performance'
            WHERE CompanyID = 11 AND Name LIKE '%azure%Cost%Optimization%'
        """, {})
        
        # Update aws to AWS and optimization to optimisation  
        await execute_sql("""
            UPDATE Initiative 
            SET Name = 'AWS Cost Optimisation Initiative',
                Description = 'Optimise and modernise AWS infrastructure to reduce costs and improve performance'
            WHERE CompanyID = 11 AND Name LIKE '%aws%Cost%Optimization%'
        """, {})
        
        print("✅ Updated initiatives with proper provider names and British spelling")
        
    except Exception as e:
        print(f"❌ Error updating initiatives: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(fix_initiatives())