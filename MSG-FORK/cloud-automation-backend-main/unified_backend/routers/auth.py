"""
Authentication Router for Unified Backend
Handles user authentication with company-scoped access control
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import jwt
import bcrypt
import logging
import os
from dotenv import load_dotenv

# Fix the database import path
import sys
import os
from lib.db import query_one, query_many, execute_sql
from models.database import UserAccount, Company

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# JWT Configuration - Load from environment with secure fallback
JWT_SECRET = os.getenv('JWT_SECRET')
if not JWT_SECRET:
    # Generate a warning and use a temporary secret (should be replaced)
    logger.warning("⚠️  JWT_SECRET not found in environment! Using temporary secret. Please run generate_jwt_secret.py")
    JWT_SECRET = "TEMP_SECRET_PLEASE_REPLACE_IMMEDIATELY_" + os.urandom(32).hex()

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# ==========================================
# PYDANTIC MODELS
# ==========================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    roles: Dict[str, Any]
    company: Dict[str, Any]

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

# ==========================================
# UTILITY FUNCTIONS
# ==========================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    try:
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None

async def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email from database"""
    try:
        query = """
        SELECT 
            u.UserID,
            u.FirstName,
            u.LastName,
            u.Email,
            u.PasswordHash,
            u.CompanyID,
            u.IsSuperAdmin,
            u.CreatedAt,
            c.Name as CompanyName
        FROM UserAccount u
        LEFT JOIN Company c ON u.CompanyID = c.CompanyID
        WHERE u.Email = {email}
        """
        
        result = await query_one(query, {"email": email})
        if result:
            return {
                'user_id': result['UserID'],
                'first_name': result['FirstName'],
                'last_name': result['LastName'],
                'email': result['Email'],
                'password_hash': result['PasswordHash'],
                'company_id': result['CompanyID'],
                'is_super_admin': bool(result['IsSuperAdmin']) if result['IsSuperAdmin'] is not None else False,
                'is_company_admin': False,  # Add this field - determine based on role
                'created_at': result['CreatedAt'],
                'company_name': result['CompanyName'],
                'company_description': None  # Column doesn't exist in database
            }
        return None
    except Exception as e:
        logger.error(f"Error getting user by email: {e}")
        return None

async def get_user_roles(user_id: int) -> List[Dict[str, Any]]:
    """Get user roles from database"""
    try:
        query = """
        SELECT r.RoleID, r.Name
        FROM Role r
        INNER JOIN UserRole ur ON r.RoleID = ur.RoleID
        WHERE ur.UserID = {user_id}
        """
        
        results = await query_many(query, {"user_id": user_id})
        return [{'id': r['RoleID'], 'name': r['Name']} for r in results] if results else []
    except Exception as e:
        logger.error(f"Error getting user roles: {e}")
        return []

def get_user_permissions(user_data: Dict) -> Dict[str, Any]:
    """Get user roles and permissions"""
    roles = []
    permissions = []
    
    # Determine roles based on flags
    if user_data.get('is_super_admin'):
        roles.append({
            'id': 'role-superadmin',
            'name': 'superadmin',
            'displayName': 'Super Admin'
        })
        permissions.append({'resource': '*', 'actions': ['*']})
    
    if user_data.get('is_company_admin'):
        roles.append({
            'id': 'role-company-admin',
            'name': 'company-admin',
            'displayName': 'Company Admin'
        })
        # Company admin permissions - scoped to their company
        permissions.extend([
            {'resource': 'company-users', 'actions': ['read', 'create', 'update', 'delete']},
            {'resource': 'company-dashboard', 'actions': ['read']},
            {'resource': 'company-reports', 'actions': ['read', 'create']},
            {'resource': 'company-settings', 'actions': ['read', 'update']}
        ])
    
    # If no admin roles, default to regular user
    if not roles:
        roles.append({
            'id': 'role-user',
            'name': 'user',
            'displayName': 'User'
        })
        permissions.extend([
            {'resource': 'dashboard', 'actions': ['read']},
            {'resource': 'profile', 'actions': ['read', 'update']}
        ])
    
    return {
        'roles': roles,
        'permissions': permissions
    }

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/login", response_model=LoginResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user and return JWT token with company-scoped access
    """
    try:
        # Get user from database
        user_data = await get_user_by_email(credentials.email)
        if not user_data:
            logger.warning(f"Login attempt with non-existent email: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user_data['password_hash']):
            logger.warning(f"Invalid password attempt for user: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get user roles from database
        user_roles = await get_user_roles(user_data['user_id'])
        
        # Get user permissions based on roles and flags
        permissions_data = get_user_permissions(user_data)
        
        # Combine database roles with flag-based roles for JWT token
        all_roles = [role['name'] for role in user_roles]
        # Add flag-based roles to JWT token
        for role in permissions_data['roles']:
            if role['name'] not in all_roles:
                all_roles.append(role['name'])
        
        # Create JWT token payload
        token_payload = {
            "sub": str(user_data['user_id']),
            "email": user_data['email'],
            "company_id": user_data['company_id'],
            "is_super_admin": user_data['is_super_admin'],
            "roles": all_roles,
            "iat": datetime.utcnow()
        }
        
        # Generate access token
        access_token = create_access_token(token_payload)
        
        # Prepare user response (excluding sensitive data)
        user_response = {
            "id": str(user_data['user_id']),
            "email": user_data['email'],
            "username": user_data['email'],  # Using email as username
            "firstName": user_data['first_name'],
            "lastName": user_data['last_name'],
            "organizationId": str(user_data['company_id']) if user_data['company_id'] else None,
            "roleIds": [role['id'] for role in user_roles],
            "isSuperAdmin": user_data['is_super_admin'],
            "companyId": user_data['company_id']
        }
        
        # Prepare company response
        company_response = {
            "id": str(user_data['company_id']) if user_data['company_id'] else None,
            "name": user_data['company_name'],
            "description": None  # This field was removed from the query
        }
        
        logger.info(f"Successful login for user: {credentials.email} (Company: {user_data['company_name']})")
        
        return LoginResponse(
            access_token=access_token,
            user=user_response,
            roles=permissions_data,
            company=company_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service temporarily unavailable"
        )

@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user information from JWT token
    """
    try:
        # Extract token
        token = credentials.credentials
        payload = verify_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get fresh user data from database
        user_data = await get_user_by_email(payload['email'])
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Get current permissions
        permissions_data = get_user_permissions(user_data)
        
        return {
            "user": {
                "id": str(user_data['user_id']),
                "email": user_data['email'],
                "firstName": user_data['first_name'],
                "lastName": user_data['last_name'],
                "companyId": user_data['company_id'],
                "companyName": user_data['company_name'],
                "isSuperAdmin": user_data['is_super_admin'],
                "isCompanyAdmin": user_data['is_company_admin']
            },
            "roles": permissions_data,
            "company": {
                "id": user_data['company_id'],
                "name": user_data['company_name'],
                "description": user_data['company_description']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve user information"
        )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Change user password
    """
    try:
        # Verify current token
        token = credentials.credentials
        payload = verify_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user data
        user_data = await get_user_by_email(payload['email'])
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Verify current password
        if not verify_password(password_data.current_password, user_data['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_password_hash = hash_password(password_data.new_password)
        
        # Update password in database
        update_query = """
        UPDATE UserAccount 
        SET PasswordHash = ?, UpdatedAt = GETUTCDATE()
        WHERE UserID = ?
        """
        
        await execute_sql(update_query, [new_password_hash, user_data['user_id']])
        
        logger.info(f"Password changed for user: {payload['email']}")
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to change password"
        )

@router.post("/logout")
async def logout():
    """
    Logout endpoint (for consistency, JWT tokens are stateless)
    """
    return {"message": "Logged out successfully"}

# ==========================================
# DEPENDENCY FOR PROTECTED ROUTES
# ==========================================

async def get_current_user_dependency(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Dependency to get current authenticated user
    Use this in protected routes that need user context
    """
    try:
        token = credentials.credentials
        payload = verify_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user data
        user_data = await get_user_by_email(payload['email'])
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User dependency error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_company_scoped_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Dependency to get current user with company scope validation
    Use this in routes that need to enforce company-based data isolation
    """
    user_data = await get_current_user_dependency(credentials)
    
    if not user_data.get('company_id'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a company"
        )
    
    return user_data

async def require_company_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Dependency to require company admin or super admin privileges
    """
    user_data = await get_current_user_dependency(credentials)
    
    if not (user_data.get('is_super_admin') or user_data.get('is_company_admin')):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company admin privileges required"
        )
    
    return user_data

async def require_super_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Dependency to require super admin privileges
    """
    user_data = await get_current_user_dependency(credentials)
    
    if not user_data.get('is_super_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    
    return user_data