#!/usr/bin/env python3
"""
Create Super Admin User for Unified Backend
Usage: python create_super_admin.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import hashlib
import secrets
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from models.database import Base, UserAccount, Company
from lib.db import get_engine
import bcrypt


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()  # automatically handles random salt
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # store as string

def get_database_session():
    """Get a database session using the unified backend engine"""
    try:
        engine = get_engine()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return SessionLocal()
    except Exception as e:
        print(f"❌ Could not connect to database: {e}")
        return None

def create_super_admin():
    """Create the Super Admin user"""
    
    email = "jade@makestuffgo.com"
    password = "123password"
    
    # Get database session
    db = get_database_session()
    if db is None:
        print("❌ Could not connect to database")
        return False
    
    try:
        # Check if user already exists
        existing_user = db.query(UserAccount).filter(UserAccount.Email == email).first()
        if existing_user:
            print(f"✅ Super Admin user {email} already exists")
            db.close()
            return True
        
        # Hash the password
        hashed_password = hash_password(password)
        
        # Create new super admin user
        new_user = UserAccount(
            CompanyID=None,  # Super admin doesn't belong to a specific company
            FirstName="Jade",
            MiddleName=None,
            LastName="Admin",
            Email=email,
            PasswordHash=hashed_password,
            Phone=None,
            Role="admin",
            IsSuperAdmin=True,
            IsCompanyAdmin=False,
            IsActive=True,
            CreatedAt=datetime.utcnow(),
            UpdatedAt=None,
            LastLoginAt=None
        )
        
        # Add to database
        db.add(new_user)
        db.commit()
        
        print(f"✅ Super Admin user created successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   User ID: {new_user.UserID}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating super admin user: {e}")
        db.rollback()
        db.close()
        return False

if __name__ == "__main__":
    print("🔧 Creating Super Admin User...")
    success = create_super_admin()
    if success:
        print("🎉 Super Admin user setup complete!")
    else:
        print("💥 Failed to create Super Admin user")
        sys.exit(1)