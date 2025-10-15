-- =========================================
-- DROP ALL TABLES SCRIPT (MySQL Version)
-- Run this to completely clean the database
-- Generated on: 2025-10-16
-- =========================================

-- Disable foreign key checks to allow dropping tables with dependencies
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all views if they exist
DROP VIEW IF EXISTS v_Workflow_Summary;
DROP VIEW IF EXISTS v_Financial_Summary;
DROP VIEW IF EXISTS v_Company_SyncStatus;
DROP VIEW IF EXISTS v_WorkflowFact_Latest;
DROP VIEW IF EXISTS v_FinancialFact_Latest;

-- Drop tables (order doesn't matter with FOREIGN_KEY_CHECKS = 0)
DROP TABLE IF EXISTS WorkflowFact;
DROP TABLE IF EXISTS FinancialFact;
DROP TABLE IF EXISTS SyncBatch;
DROP TABLE IF EXISTS UserRole;
DROP TABLE IF EXISTS UserAccount;
DROP TABLE IF EXISTS RolePermission;
DROP TABLE IF EXISTS Permission;
DROP TABLE IF EXISTS Role;
DROP TABLE IF EXISTS Company;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All tables and views dropped successfully!' AS Status;
SELECT 'Tables dropped: WorkflowFact, FinancialFact, SyncBatch, UserRole, UserAccount, RolePermission, Permission, Role, Company' AS TablesDropped;
SELECT 'Views dropped: v_Workflow_Summary, v_Financial_Summary, v_Company_SyncStatus, v_WorkflowFact_Latest, v_FinancialFact_Latest' AS ViewsDropped;