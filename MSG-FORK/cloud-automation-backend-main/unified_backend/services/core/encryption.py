"""
Encryption utilities for secure storage of integration secrets.
"""
import os
import json
import base64
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import logging

# Load environment variables at module level
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)


class EncryptionService:
    """Service for encrypting and decrypting integration secrets"""
    
    def __init__(self):
        self.encryption_key = self._get_or_create_key()
        self.fernet = Fernet(self.encryption_key)
    
    def _get_or_create_key(self) -> bytes:
        """Get encryption key from environment or generate a new one"""
        key_string = os.getenv("INTEGRATION_ENCRYPTION_KEY")
        
        if key_string:
            try:
                return base64.urlsafe_b64decode(key_string.encode())
            except Exception as e:
                logger.warning(f"Invalid encryption key in environment: {e}")
        
        # Generate new key if not found
        logger.info("Generating new encryption key")
        key = Fernet.generate_key()
        key_string = base64.urlsafe_b64encode(key).decode()
        
        logger.warning(
            f"🔐 IMPORTANT: Add this encryption key to your .env file:\n"
            f"INTEGRATION_ENCRYPTION_KEY={key_string}\n"
            f"Without this key, existing encrypted secrets cannot be decrypted!"
        )
        
        return key
    
    def encrypt_secrets(self, secrets: Dict[str, Any]) -> Optional[str]:
        """Encrypt secrets dictionary to JSON string"""
        if not secrets:
            return None
        
        try:
            # Convert to JSON string
            json_string = json.dumps(secrets, separators=(',', ':'))
            
            # Encrypt
            encrypted_bytes = self.fernet.encrypt(json_string.encode('utf-8'))
            
            # Convert to base64 string for storage
            return base64.urlsafe_b64encode(encrypted_bytes).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Failed to encrypt secrets: {e}")
            raise ValueError("Failed to encrypt secrets")
    
    def decrypt_secrets(self, encrypted_secrets: str) -> Optional[Dict[str, Any]]:
        """Decrypt JSON string back to secrets dictionary"""
        if not encrypted_secrets:
            return None
        
        try:
            # Decode from base64
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_secrets.encode('utf-8'))
            
            # Decrypt
            decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
            
            # Parse JSON
            json_string = decrypted_bytes.decode('utf-8')
            return json.loads(json_string)
            
        except Exception as e:
            logger.error(f"Failed to decrypt secrets: {e}")
            return None
    
    def test_encryption(self) -> bool:
        """Test that encryption/decryption is working"""
        test_data = {"test_key": "test_value", "number": 123}
        
        try:
            encrypted = self.encrypt_secrets(test_data)
            decrypted = self.decrypt_secrets(encrypted)
            return test_data == decrypted
        except Exception as e:
            logger.error(f"Encryption test failed: {e}")
            return False


# Global encryption service instance
encryption_service = EncryptionService()


def encrypt_integration_secrets(secrets: Dict[str, Any]) -> Optional[str]:
    """Convenience function to encrypt integration secrets"""
    return encryption_service.encrypt_secrets(secrets)


def decrypt_integration_secrets(encrypted_secrets: str) -> Optional[Dict[str, Any]]:
    """Convenience function to decrypt integration secrets"""
    return encryption_service.decrypt_secrets(encrypted_secrets)