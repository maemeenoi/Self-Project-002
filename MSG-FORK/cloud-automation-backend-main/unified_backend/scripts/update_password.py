#!/usr/bin/env python3
"""
Script to update password for a specific user
"""
import asyncio
import sys
import os
import bcrypt
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from lib.db import execute_sql, query_one

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

async def update_user_password(email: str, new_password: str):
    """Update user password in database"""
    try:
        print(f"🔍 Looking for user: {email}")
        
        # First check if user exists
        user_query = "SELECT UserID, FirstName, LastName FROM UserAccount WHERE Email = {email}"
        user = await query_one(user_query, {"email": email})
        
        if not user:
            print(f"❌ User {email} not found!")
            return
            
        print(f"✅ Found user: {user['FirstName']} {user['LastName']} (ID: {user['UserID']})")
        
        # Hash the new password
        print("🔐 Hashing new password...")
        hashed_password = hash_password(new_password)
        
        # Update the password
        update_query = """
        UPDATE UserAccount 
        SET PasswordHash = {password_hash}
        WHERE UserID = {user_id}
        """
        
        await execute_sql(update_query, {
            "password_hash": hashed_password,
            "user_id": user['UserID']
        })
        
        print(f"✅ Password updated successfully for {email}")
        print(f"🔑 You can now login with: {email} / {new_password}")
        
    except Exception as e:
        print(f"❌ Error updating password: {e}")

if __name__ == "__main__":
    email = "cushla@makestuffgo.com"
    password = "cushla2025"
    
    print(f"🚀 Updating password for {email}...")
    asyncio.run(update_user_password(email, password))