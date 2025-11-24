#!/usr/bin/env python3
"""
JWT Secret Generator
Generates secure JWT secrets for authentication
"""

import secrets
import base64
import os
from pathlib import Path

def generate_secure_jwt_secret(length: int = 64) -> str:
    """Generate a cryptographically secure JWT secret"""
    # Generate random bytes
    secret_bytes = secrets.token_bytes(length)
    # Encode as base64 for safe storage
    secret_b64 = base64.b64encode(secret_bytes).decode('utf-8')
    return secret_b64

def update_env_file(env_file_path: str, jwt_secret: str) -> bool:
    """Update .env file with new JWT secret"""
    try:
        env_path = Path(env_file_path)
        
        if not env_path.exists():
            print(f"Creating new .env file: {env_file_path}")
            env_path.touch()
        
        # Read existing content
        lines = []
        jwt_found = False
        
        if env_path.stat().st_size > 0:
            with open(env_path, 'r') as f:
                lines = f.readlines()
        
        # Update or add JWT_SECRET
        updated_lines = []
        for line in lines:
            if line.startswith('JWT_SECRET='):
                updated_lines.append(f'JWT_SECRET={jwt_secret}\n')
                jwt_found = True
                print(f"✅ Updated existing JWT_SECRET in {env_file_path}")
            else:
                updated_lines.append(line)
        
        # Add JWT_SECRET if not found
        if not jwt_found:
            updated_lines.append(f'\n# JWT Configuration\nJWT_SECRET={jwt_secret}\n')
            print(f"✅ Added new JWT_SECRET to {env_file_path}")
        
        # Write back to file
        with open(env_path, 'w') as f:
            f.writelines(updated_lines)
            
        return True
        
    except Exception as e:
        print(f"❌ Error updating {env_file_path}: {e}")
        return False

def main():
    """Generate and update JWT secrets for all backend services"""
    print("🔐 Generating secure JWT secrets...")
    
    # Generate a new secure secret
    new_jwt_secret = generate_secure_jwt_secret()
    print(f"Generated secret length: {len(new_jwt_secret)} characters")
    
    # Define paths to update
    backend_paths = [
        "unified_backend/.env",
        "work_processor/backend/.env",
        "focus_converter/webapp/.env"
    ]
    
    base_dir = Path(__file__).parent
    success_count = 0
    
    for backend_path in backend_paths:
        full_path = base_dir / backend_path
        print(f"\n🔄 Processing: {backend_path}")
        
        if update_env_file(str(full_path), new_jwt_secret):
            success_count += 1
        else:
            print(f"⚠️  Failed to update: {backend_path}")
    
    print(f"\n🎉 Successfully updated {success_count}/{len(backend_paths)} .env files")
    
    if success_count > 0:
        print("\n⚠️  IMPORTANT SECURITY NOTES:")
        print("1. Restart all backend services to apply the new JWT secret")
        print("2. All existing JWT tokens will be invalidated")
        print("3. Users will need to log in again")
        print("4. Keep your .env files secure and never commit them to git")
        print("5. Consider using different secrets for different environments")
        
        print(f"\n🔑 Your new JWT secret: {new_jwt_secret}")
        print("💾 This has been saved to your .env files")

if __name__ == "__main__":
    main()