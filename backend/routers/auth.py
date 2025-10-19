"""
Authentication Router
Handles user authentication, registration, and authorization
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
import jwt
import logging

from lib.db import query_one, execute_sql
from lib.utils import (
    hash_password, verify_password, validate_email, 
    validate_password_strength, generate_secure_token,
    success_response, error_response
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = "your-secret-key-change-in-production"  # Should be from environment
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# ==========================================
# PYDANTIC MODELS
# ==========================================

class UserRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

class AuthResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = JWT_EXPIRATION_HOURS * 3600
    user: Optional[UserProfile] = None

# ==========================================
# JWT UTILITIES
# ==========================================

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(token_payload: dict = Depends(verify_token)) -> UserProfile:
    """Get current user from token"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    sql = """
        SELECT u.id, u.email, u.full_name, u.company_id, u.role, u.is_active, u.created_at,
               c.name as company_name
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.id = $1 AND u.is_active = true;
    """
    
    user = await query_one(sql, {"user_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return UserProfile(**user)

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/register", response_model=AuthResponse)
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        # Validate email format
        if not validate_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        password_validation = validate_password_strength(user_data.password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password too weak: {', '.join(password_validation['issues'])}"
            )
        
        # Check if email already exists
        existing_user = await query_one(
            "SELECT id FROM users WHERE email = $1",
            {"email": user_data.email.lower()}
        )
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Create company if provided
        company_id = None
        if user_data.company_name:
            company_sql = """
                INSERT INTO companies (name, created_at)
                VALUES ($1, $2)
                RETURNING id;
            """
            company_result = await query_one(company_sql, {
                "name": user_data.company_name.strip(),
                "created_at": datetime.utcnow()
            })
            company_id = company_result["id"]
        
        # Create user
        user_sql = """
            INSERT INTO users (email, password_hash, full_name, company_id, created_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        """
        
        user_result = await query_one(user_sql, {
            "email": user_data.email.lower(),
            "password_hash": password_hash,
            "full_name": user_data.full_name.strip(),
            "company_id": company_id,
            "created_at": datetime.utcnow()
        })
        
        user_id = user_result["id"]
        
        # Create access token
        token_data = {"user_id": user_id, "email": user_data.email.lower()}
        access_token = create_access_token(token_data)
        
        # Get user profile
        user_profile = UserProfile(
            id=user_id,
            email=user_data.email.lower(),
            full_name=user_data.full_name,
            company_id=company_id,
            company_name=user_data.company_name,
            role="user",
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        logger.info(f"User registered successfully: {user_data.email}")
        
        return AuthResponse(
            success=True,
            message="User registered successfully",
            access_token=access_token,
            user=user_profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=AuthResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user and return access token"""
    try:
        # Get user by email
        sql = """
            SELECT u.id, u.email, u.password_hash, u.full_name, u.company_id, 
                   u.role, u.is_active, u.created_at, c.name as company_name
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE u.email = $1;
        """
        
        user = await query_one(sql, {"email": login_data.email.lower()})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        token_data = {"user_id": user["id"], "email": user["email"]}
        access_token = create_access_token(token_data)
        
        # Create user profile
        user_profile = UserProfile(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            company_id=user["company_id"],
            company_name=user["company_name"],
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"]
        )
        
        logger.info(f"User logged in successfully: {login_data.email}")
        
        return AuthResponse(
            success=True,
            message="Login successful",
            access_token=access_token,
            user=user_profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: UserProfile = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: UserProfile = Depends(get_current_user)
):
    """Change user password"""
    try:
        # Get current password hash
        user = await query_one(
            "SELECT password_hash FROM users WHERE id = $1",
            {"user_id": current_user.id}
        )
        
        # Verify current password
        if not verify_password(password_data.current_password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password
        password_validation = validate_password_strength(password_data.new_password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"New password too weak: {', '.join(password_validation['issues'])}"
            )
        
        # Hash new password
        new_password_hash = hash_password(password_data.new_password)
        
        # Update password
        await execute_sql(
            "UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3",
            {
                "password_hash": new_password_hash,
                "updated_at": datetime.utcnow(),
                "user_id": current_user.id
            }
        )
        
        logger.info(f"Password changed for user: {current_user.email}")
        
        return success_response(message="Password changed successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.post("/logout")
async def logout_user(current_user: UserProfile = Depends(get_current_user)):
    """Logout user (client should discard token)"""
    logger.info(f"User logged out: {current_user.email}")
    return success_response(message="Logged out successfully")

@router.post("/refresh")
async def refresh_token(current_user: UserProfile = Depends(get_current_user)):
    """Refresh access token"""
    try:
        # Create new access token
        token_data = {"user_id": current_user.id, "email": current_user.email}
        access_token = create_access_token(token_data)
        
        return AuthResponse(
            success=True,
            message="Token refreshed successfully",
            access_token=access_token,
            user=current_user
        )
        
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

# Password reset endpoints (simplified implementation)
@router.post("/password-reset")
async def request_password_reset(reset_data: PasswordReset):
    """Request password reset (sends email in production)"""
    try:
        # Check if user exists
        user = await query_one(
            "SELECT id FROM users WHERE email = $1 AND is_active = true",
            {"email": reset_data.email.lower()}
        )
        
        if user:
            # In production, generate token and send email
            reset_token = generate_secure_token()
            # Store reset token with expiration in database
            logger.info(f"Password reset requested for: {reset_data.email}")
            
        # Always return success to prevent email enumeration
        return success_response(message="If the email exists, a reset link has been sent")
        
    except Exception as e:
        logger.error(f"Password reset request failed: {e}")
        return success_response(message="If the email exists, a reset link has been sent")

# Export commonly used dependencies
__all__ = [
    "router", 
    "get_current_user", 
    "verify_token", 
    "UserProfile"
]