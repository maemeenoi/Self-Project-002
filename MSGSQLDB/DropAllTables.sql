-- =========================================
-- DROP ALL TABLES SCRIPT
-- Run this to completely clean the database
-- Generated on: 2025-10-16
-- =========================================

-- First, drop all views if they exist
IF OBJECT_ID('v_Workflow_Summary', 'V') IS NOT NULL
    DROP VIEW v_Workflow_Summary;

IF OBJECT_ID('v_Financial_Summary', 'V') IS NOT NULL
    DROP VIEW v_Financial_Summary;

IF OBJECT_ID('v_Company_SyncStatus', 'V') IS NOT NULL
    DROP VIEW v_Company_SyncStatus;

IF OBJECT_ID('v_WorkflowFact_Latest', 'V') IS NOT NULL
    DROP VIEW v_WorkflowFact_Latest;

IF OBJECT_ID('v_FinancialFact_Latest', 'V') IS NOT NULL
    DROP VIEW v_FinancialFact_Latest;

-- Drop tables in correct order (child tables first, then parent tables)
-- This respects foreign key dependencies

-- Drop fact tables first (they reference SyncBatch and Company)
IF OBJECT_ID('WorkflowFact', 'U') IS NOT NULL
    DROP TABLE WorkflowFact;

IF OBJECT_ID('FinancialFact', 'U') IS NOT NULL
    DROP TABLE FinancialFact;

-- Drop SyncBatch (references Company)
IF OBJECT_ID('SyncBatch', 'U') IS NOT NULL
    DROP TABLE SyncBatch;

-- Drop user-related tables (they reference Company and Role)
IF OBJECT_ID('UserRole', 'U') IS NOT NULL
    DROP TABLE UserRole;

IF OBJECT_ID('UserAccount', 'U') IS NOT NULL
    DROP TABLE UserAccount;

-- Drop role-permission junction table
IF OBJECT_ID('RolePermission', 'U') IS NOT NULL
    DROP TABLE RolePermission;

-- Drop lookup/master tables
IF OBJECT_ID('Permission', 'U') IS NOT NULL
    DROP TABLE Permission;

IF OBJECT_ID('Role', 'U') IS NOT NULL
    DROP TABLE Role;

-- Drop Company last (most referenced table)
IF OBJECT_ID('Company', 'U') IS NOT NULL
    DROP TABLE Company;

PRINT 'All tables and views dropped successfully!';
PRINT 'Tables dropped:';
PRINT '- WorkflowFact';
PRINT '- FinancialFact';
PRINT '- SyncBatch';
PRINT '- UserRole';
PRINT '- UserAccount';
PRINT '- RolePermission';
PRINT '- Permission';
PRINT '- Role';
PRINT '- Company';
PRINT 'Views dropped:';
PRINT '- v_Workflow_Summary';
PRINT '- v_Financial_Summary';
PRINT '- v_Company_SyncStatus';
PRINT '- v_WorkflowFact_Latest';
PRINT '- v_FinancialFact_Latest';