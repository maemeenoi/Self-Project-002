#!/usr/bin/env python3
"""
Script to check what users exist in the database
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from lib.db import query_many

async def check_users():
    """Check what users exist in the database"""
    try:
        print("🔍 Checking users in database...")
        
        # Query all users
        query = """
        SELECT 
            u.UserID,
            u.FirstName,
            u.LastName,
            u.Email,
            u.CompanyID,
            u.IsSuperAdmin,
            u.CreatedAt,
            c.Name as CompanyName
        FROM UserAccount u
        LEFT JOIN Company c ON u.CompanyID = c.CompanyID
        ORDER BY u.UserID
        """
        
        users = await query_many(query)
        
        if users:
            print(f"\n📋 Found {len(users)} users:")
            print("-" * 80)
            for user in users:
                print(f"ID: {user['UserID']}")
                print(f"Name: {user['FirstName']} {user['LastName']}")
                print(f"Email: {user['Email']}")
                print(f"SuperAdmin: {user['IsSuperAdmin']}")
                print(f"Company: {user['CompanyName'] or 'None'}")
                print(f"Created: {user['CreatedAt']}")
                print("-" * 80)
        else:
            print("❌ No users found in database!")
            
        # Also check companies
        company_query = "SELECT CompanyID, Name, CreatedAt FROM Company ORDER BY CompanyID"
        companies = await query_many(company_query)
        
        if companies:
            print(f"\n🏢 Found {len(companies)} companies:")
            print("-" * 40)
            for company in companies:
                print(f"ID: {company['CompanyID']}")
                print(f"Name: {company['Name']}")
                print(f"Created: {company['CreatedAt']}")
                print("-" * 40)
        else:
            print("\n❌ No companies found in database!")
            
    except Exception as e:
        print(f"❌ Error checking users: {e}")

if __name__ == "__main__":
    asyncio.run(check_users())