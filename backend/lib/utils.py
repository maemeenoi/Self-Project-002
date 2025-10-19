"""
Utility Functions and Helpers
Common utilities used across the application
"""

import hashlib
import secrets
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
import json
import logging
from decimal import Decimal, ROUND_HALF_UP

logger = logging.getLogger(__name__)

# Password utilities
def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt"""
    salt = secrets.token_hex(32)
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt, pwd_hash = stored_hash.split('$')
        return hashlib.sha256((password + salt).encode()).hexdigest() == pwd_hash
    except ValueError:
        return False

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

# Validation utilities
def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> Dict[str, Any]:
    """
    Validate password strength
    Returns dict with validation results and suggestions
    """
    result = {
        "valid": True,
        "score": 0,
        "issues": [],
        "suggestions": []
    }
    
    if len(password) < 8:
        result["valid"] = False
        result["issues"].append("Password too short")
        result["suggestions"].append("Use at least 8 characters")
    else:
        result["score"] += 1
    
    if not re.search(r'[A-Z]', password):
        result["issues"].append("No uppercase letters")
        result["suggestions"].append("Add uppercase letters")
    else:
        result["score"] += 1
    
    if not re.search(r'[a-z]', password):
        result["issues"].append("No lowercase letters")
        result["suggestions"].append("Add lowercase letters")
    else:
        result["score"] += 1
    
    if not re.search(r'\d', password):
        result["issues"].append("No numbers")
        result["suggestions"].append("Add numbers")
    else:
        result["score"] += 1
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        result["suggestions"].append("Consider adding special characters")
    else:
        result["score"] += 1
    
    if result["score"] < 3:
        result["valid"] = False
    
    return result

# Data formatting utilities
def format_currency(amount: Union[float, Decimal, int], currency: str = "USD") -> str:
    """Format amount as currency"""
    if isinstance(amount, (int, float)):
        amount = Decimal(str(amount))
    
    # Round to 2 decimal places
    amount = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    if currency == "USD":
        return f"${amount:,.2f}"
    elif currency == "EUR":
        return f"€{amount:,.2f}"
    elif currency == "GBP":
        return f"£{amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"

def format_percentage(value: Union[float, int], decimals: int = 1) -> str:
    """Format value as percentage"""
    return f"{value:.{decimals}f}%"

def format_number_compact(num: Union[float, int]) -> str:
    """Format large numbers in compact form (1K, 1M, etc.)"""
    if abs(num) >= 1_000_000_000:
        return f"{num / 1_000_000_000:.1f}B"
    elif abs(num) >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    elif abs(num) >= 1_000:
        return f"{num / 1_000:.1f}K"
    else:
        return str(num)

# Date utilities
def get_date_range_months(months_back: int = 12) -> tuple[datetime, datetime]:
    """Get date range for the last N months"""
    end_date = datetime.now().replace(day=1)  # First day of current month
    start_date = end_date - timedelta(days=months_back * 30)  # Approximate
    start_date = start_date.replace(day=1)  # Ensure start of month
    
    return start_date, end_date

def format_date_for_db(date_obj: datetime) -> str:
    """Format datetime for database storage"""
    return date_obj.strftime('%Y-%m-%d %H:%M:%S')

def parse_date_string(date_str: str) -> Optional[datetime]:
    """Parse date string in various formats"""
    formats = [
        '%Y-%m-%d',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%dT%H:%M:%SZ',
        '%Y-%m-%dT%H:%M:%S.%fZ'
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    logger.warning(f"Could not parse date string: {date_str}")
    return None

# JSON utilities
def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Safely load JSON string, return default on error"""
    try:
        return json.loads(json_str) if json_str else default
    except (json.JSONDecodeError, TypeError):
        return default

def safe_json_dumps(obj: Any, default: str = "{}") -> str:
    """Safely dump object to JSON string"""
    try:
        return json.dumps(obj, default=str, ensure_ascii=False)
    except (TypeError, ValueError):
        return default

# List and dict utilities
def safe_get(dictionary: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get value from dictionary"""
    return dictionary.get(key, default) if dictionary else default

def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
    """Flatten nested dictionary"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split list into chunks of specified size"""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

# Calculation utilities
def calculate_percentage_change(old_value: Union[float, int], new_value: Union[float, int]) -> float:
    """Calculate percentage change between two values"""
    if old_value == 0:
        return 100.0 if new_value > 0 else 0.0
    
    return ((new_value - old_value) / old_value) * 100

def calculate_savings_percentage(original: Union[float, int], current: Union[float, int]) -> float:
    """Calculate savings percentage"""
    if original == 0:
        return 0.0
    
    savings = original - current
    return (savings / original) * 100

def calculate_trend_direction(values: List[Union[float, int]]) -> str:
    """Determine trend direction from list of values"""
    if len(values) < 2:
        return "stable"
    
    recent_avg = sum(values[-3:]) / len(values[-3:])
    older_avg = sum(values[:-3]) / len(values[:-3]) if len(values) > 3 else values[0]
    
    if recent_avg > older_avg * 1.05:  # 5% threshold
        return "up"
    elif recent_avg < older_avg * 0.95:
        return "down"
    else:
        return "stable"

# API response utilities
def success_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Standard success response format"""
    response = {
        "success": True,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    
    return response

def error_response(message: str, error_code: str = "GENERAL_ERROR", details: Any = None) -> Dict[str, Any]:
    """Standard error response format"""
    response = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    
    if details:
        response["error"]["details"] = details
    
    return response

def paginate_response(data: List[Any], page: int, per_page: int, total: int) -> Dict[str, Any]:
    """Add pagination metadata to response"""
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "data": data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

# Logging utilities
def log_api_call(endpoint: str, method: str, user_id: Optional[int] = None, company_id: Optional[int] = None):
    """Log API call for monitoring"""
    logger.info(f"API Call - {method} {endpoint} - User: {user_id}, Company: {company_id}")

def log_database_operation(operation: str, table: str, affected_rows: int = 0):
    """Log database operation"""
    logger.info(f"DB Operation - {operation} on {table} - Rows affected: {affected_rows}")

# Constants for common use
VALID_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]
VALID_REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1"]
VALID_PROVIDERS = ["AWS", "Azure", "GCP", "Other"]

# Export all utilities
__all__ = [
    # Password utilities
    'hash_password', 'verify_password', 'generate_secure_token',
    # Validation utilities  
    'validate_email', 'validate_password_strength',
    # Formatting utilities
    'format_currency', 'format_percentage', 'format_number_compact',
    # Date utilities
    'get_date_range_months', 'format_date_for_db', 'parse_date_string',
    # JSON utilities
    'safe_json_loads', 'safe_json_dumps',
    # Dict/List utilities
    'safe_get', 'flatten_dict', 'chunk_list',
    # Calculation utilities
    'calculate_percentage_change', 'calculate_savings_percentage', 'calculate_trend_direction',
    # API utilities
    'success_response', 'error_response', 'paginate_response',
    # Logging utilities
    'log_api_call', 'log_database_operation',
    # Constants
    'VALID_CURRENCIES', 'VALID_REGIONS', 'VALID_PROVIDERS'
]