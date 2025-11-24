#!/usr/bin/env python3
"""
Initialize Integration table in the database
Run this script to add the Integration table to existing database
"""

import sys
import os
import logging
from datetime import datetime

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'lib'))

from db import DatabaseManager

logger = logging.getLogger(__name__)

def create_integration_table():
    """Create the Integration table"""
    
    db = DatabaseManager()
    
    # Check if table already exists
    check_query = """
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'Integration'
    """
    
    result = db.execute_query(check_query)
    if result and result[0]['count'] > 0:
        logger.info("✅ Integration table already exists")
        return True
    
    # Create the Integration table
    create_table_sql = """
        CREATE TABLE Integration (
            IntegrationID    INT IDENTITY(1,1) PRIMARY KEY,
            CompanyID        INT NOT NULL,
            IntegrationType  NVARCHAR(50) NOT NULL,    -- 'aws', 'azure', 'github', 'jira'
            IntegrationName  NVARCHAR(200) NOT NULL,   -- friendly name like "AWS Production" or "Main GitHub"
            ConfigJson       NVARCHAR(MAX) NULL,       -- non-secret config: {"region":"us-east-1","repo":"owner/repo","projects":"PROJ1,PROJ2"}
            SecretsJson      NVARCHAR(MAX) NULL,       -- encrypted secrets: {"AWS_ACCESS_KEY_ID":"enc_val","AWS_SECRET_ACCESS_KEY":"enc_val"}
            CreatedBy        INT NULL,                 -- which admin created this
            IsActive         BIT NOT NULL DEFAULT 1,
            CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
            UpdatedAt        DATETIME2 NULL,
            FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
            FOREIGN KEY (CreatedBy) REFERENCES UserAccount(UserID)
        );
    """
    
    try:
        db.execute_query(create_table_sql)
        logger.info("✅ Integration table created successfully")
        
        # Create index
        index_sql = """
            CREATE INDEX IX_Integration_ByCompany ON Integration(CompanyID, IntegrationType, IsActive);
        """
        db.execute_query(index_sql)
        logger.info("✅ Integration table index created successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to create Integration table: {e}")
        return False


def test_integration_table():
    """Test that the Integration table works correctly"""
    
    db = DatabaseManager()
    
    try:
        # Test insert
        test_insert = """
            INSERT INTO Integration (CompanyID, IntegrationType, IntegrationName, ConfigJson, CreatedAt)
            OUTPUT INSERTED.IntegrationID
            VALUES (1, 'github', 'Test GitHub Integration', '{"owner": "test", "repo": "test-repo"}', SYSUTCDATETIME())
        """
        
        result = db.execute_query(test_insert)
        if not result:
            logger.error("❌ Failed to insert test record")
            return False
            
        integration_id = result[0]['IntegrationID']
        logger.info(f"✅ Test integration created with ID: {integration_id}")
        
        # Test select
        test_select = """
            SELECT IntegrationID, CompanyID, IntegrationType, IntegrationName, ConfigJson, IsActive
            FROM Integration
            WHERE IntegrationID = ?
        """
        
        result = db.execute_query(test_select, (integration_id,))
        if not result:
            logger.error("❌ Failed to select test record")
            return False
            
        integration = result[0]
        logger.info(f"✅ Test integration retrieved: {integration['IntegrationName']}")
        
        # Test update
        test_update = """
            UPDATE Integration 
            SET IntegrationName = 'Updated Test Integration', UpdatedAt = SYSUTCDATETIME()
            WHERE IntegrationID = ?
        """
        
        db.execute_query(test_update, (integration_id,))
        logger.info("✅ Test integration updated successfully")
        
        # Test soft delete
        test_delete = """
            UPDATE Integration 
            SET IsActive = 0, UpdatedAt = SYSUTCDATETIME()
            WHERE IntegrationID = ?
        """
        
        db.execute_query(test_delete, (integration_id,))
        logger.info("✅ Test integration soft deleted successfully")
        
        # Clean up - hard delete test record
        cleanup = "DELETE FROM Integration WHERE IntegrationID = ?"
        db.execute_query(cleanup, (integration_id,))
        logger.info("✅ Test integration cleaned up")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Integration table test failed: {e}")
        return False


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("🚀 Starting Integration table initialization...")
    
    # Create table
    if create_integration_table():
        logger.info("✅ Integration table creation completed")
        
        # Run tests
        if test_integration_table():
            logger.info("✅ Integration table tests passed")
            logger.info("🎉 Integration table initialization completed successfully!")
        else:
            logger.error("❌ Integration table tests failed")
            sys.exit(1)
    else:
        logger.error("❌ Failed to create Integration table")
        sys.exit(1)