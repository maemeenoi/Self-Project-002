"""
Authentication utilities for the unified backend
Separated from main.py to avoid circular imports
"""

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from decouple import config
from typing import Optional
import logging
import jwt

logger = logging.getLogger(__name__)

# Security
security = HTTPBearer(auto_error=False)

async def get_current_company(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> int:
    """
    Get current company ID from JWT token
    """
    if not credentials:
        logger.warning("🔒 No authentication credentials provided")
        raise HTTPException(
            status_code=401,
            detail="Authentication credentials required"
        )
    
    try:
        # JWT Configuration (should match auth router)
        JWT_SECRET = config('JWT_SECRET')
        JWT_ALGORITHM = "HS256"
        
        # Decode JWT token
        payload = jwt.decode(
            credentials.credentials, 
            JWT_SECRET, 
            algorithms=[JWT_ALGORITHM]
        )
        
        # Extract company_id from token payload
        company_id = payload.get('company_id')
        
        if not company_id:
            logger.error("🔒 No company_id found in JWT token payload")
            raise HTTPException(
                status_code=401,
                detail="Invalid token: missing company information"
            )
        
        logger.info(f"🏢 get_current_company() returning: {company_id} (from JWT token)")
        return int(company_id)
        
    except jwt.ExpiredSignatureError:
        logger.error("🔒 JWT token has expired")
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.PyJWTError as e:
        logger.error(f"🔒 JWT token validation failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid token format"
        )
    except Exception as e:
        logger.error(f"🔒 Authentication error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Authentication service error"
        )