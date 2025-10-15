-- =========================================
-- Mock Data for FinOps Database
-- Generated on: 2025-10-16
-- =========================================

-- Disable identity insert checks temporarily
SET IDENTITY_INSERT Company ON;
SET IDENTITY_INSERT Role ON;
SET IDENTITY_INSERT Permission ON;
SET IDENTITY_INSERT UserAccount ON;
SET IDENTITY_INSERT SyncBatch ON;

-- =========
-- Company Data
-- =========
INSERT INTO Company (CompanyID, Name, SizeLabel, CreatedAt, IsActive) VALUES
(1, 'TechFlow Solutions Ltd', '51-200', '2024-01-15T09:30:00.000', 1),
(2, 'CloudFirst Innovations', '11-50', '2024-02-20T14:15:00.000', 1),
(3, 'Digital Transformation Corp', '201-500', '2024-03-10T11:45:00.000', 1),
(4, 'StartupVenture Inc', '1-10', '2024-04-05T16:20:00.000', 1),
(5, 'Enterprise Solutions Group', '501-1000', '2024-05-12T08:10:00.000', 1);

-- =========
-- Role Data
-- =========
INSERT INTO Role (RoleID, Name, IsSystemRole) VALUES
(1, 'SuperAdmin', 1),
(2, 'CEO', 0),
(3, 'CFO', 0),
(4, 'CTO', 0),
(5, 'Product Manager', 0),
(6, 'Engineering Manager', 0),
(7, 'DevOps Engineer', 0),
(8, 'Finance Analyst', 0),
(9, 'Project Manager', 0),
(10, 'Developer', 0),
(11, 'Client Admin', 0);

-- =========
-- Permission Data
-- =========
INSERT INTO Permission (PermissionID, Code, Description) VALUES
(1, 'view_financial', 'View financial reports and cost data'),
(2, 'manage_financial', 'Manage financial data and budgets'),
(3, 'view_workflow', 'View workflow and development metrics'),
(4, 'manage_workflow', 'Manage workflow settings and configurations'),
(5, 'manage_company', 'Manage company settings and structure'),
(6, 'manage_users', 'Manage user accounts and permissions'),
(7, 'view_reports', 'View generated reports and analytics'),
(8, 'manage_reports', 'Create and manage custom reports'),
(9, 'view_dashboard', 'Access main dashboard'),
(10, 'manage_integrations', 'Manage external system integrations'),
(11, 'admin_system', 'Full system administration access');

-- =========
-- Role-Permission Mapping
-- =========
INSERT INTO RolePermission (RoleID, PermissionID) VALUES
-- SuperAdmin - all permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
-- CEO - strategic view
(2, 1), (2, 3), (2, 5), (2, 7), (2, 9),
-- CFO - financial focus
(3, 1), (3, 2), (3, 7), (3, 8), (3, 9),
-- CTO - technical and workflow
(4, 1), (4, 3), (4, 4), (4, 7), (4, 9), (4, 10),
-- Product Manager
(5, 1), (5, 3), (5, 7), (5, 9),
-- Engineering Manager
(6, 1), (6, 3), (6, 4), (6, 7), (6, 9),
-- DevOps Engineer
(7, 1), (7, 3), (7, 7), (7, 10),
-- Finance Analyst
(8, 1), (8, 2), (8, 7), (8, 8),
-- Project Manager
(9, 1), (9, 3), (9, 7), (9, 9),
-- Developer
(10, 3), (10, 7), (10, 9),
-- Client Admin
(11, 5), (11, 6), (11, 7), (11, 9);

-- =========
-- User Account Data
-- =========
INSERT INTO UserAccount (UserID, CompanyID, FullName, Email, PasswordHash, Phone, IsSuperAdmin, CreatedAt) VALUES
-- SuperAdmin
(1, NULL, 'System Administrator', 'admin@finopsplatform.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-123-4567', 1, '2024-01-01T00:00:00.000'),

-- TechFlow Solutions Ltd (Company 1)
(2, 1, 'Sarah Mitchell', 'sarah.mitchell@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5678', 0, '2024-01-15T10:00:00.000'),
(3, 1, 'James Thompson', 'james.thompson@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-345-6789', 0, '2024-01-15T10:30:00.000'),
(4, 1, 'Emma Rodriguez', 'emma.rodriguez@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-456-7890', 0, '2024-01-16T09:15:00.000'),
(5, 1, 'Michael Chen', 'michael.chen@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-567-8901', 0, '2024-01-18T14:20:00.000'),

-- CloudFirst Innovations (Company 2)
(6, 2, 'Lisa Anderson', 'lisa.anderson@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-678-9012', 0, '2024-02-20T15:00:00.000'),
(7, 2, 'David Kumar', 'david.kumar@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-789-0123', 0, '2024-02-21T11:30:00.000'),
(8, 2, 'Rachel Green', 'rachel.green@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-890-1234', 0, '2024-02-22T13:45:00.000'),

-- Digital Transformation Corp (Company 3)
(9, 3, 'Robert Wilson', 'robert.wilson@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-901-2345', 0, '2024-03-10T12:00:00.000'),
(10, 3, 'Jennifer Lee', 'jennifer.lee@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-012-3456', 0, '2024-03-11T10:15:00.000'),
(11, 3, 'Mark Johnson', 'mark.johnson@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-123-4567', 0, '2024-03-12T16:30:00.000'),

-- StartupVenture Inc (Company 4)
(12, 4, 'Alex Taylor', 'alex.taylor@startupventure.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5678', 0, '2024-04-05T17:00:00.000'),
(13, 4, 'Sophie Brown', 'sophie.brown@startupventure.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-345-6789', 0, '2024-04-06T09:30:00.000'),

-- Enterprise Solutions Group (Company 5)
(14, 5, 'Thomas Martinez', 'thomas.martinez@enterprise.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-456-7890', 0, '2024-05-12T08:30:00.000'),
(15, 5, 'Maria Garcia', 'maria.garcia@enterprise.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-567-8901', 0, '2024-05-13T14:45:00.000');

-- =========
-- User-Role Mapping
-- =========
INSERT INTO UserRole (UserID, RoleID) VALUES
-- SuperAdmin
(1, 1),
-- TechFlow Solutions Ltd
(2, 2), -- Sarah - CEO
(3, 3), -- James - CFO
(4, 4), -- Emma - CTO
(5, 6), -- Michael - Engineering Manager
-- CloudFirst Innovations
(6, 2), -- Lisa - CEO
(7, 5), -- David - Product Manager
(8, 8), -- Rachel - Finance Analyst
-- Digital Transformation Corp
(9, 2), -- Robert - CEO
(10, 4), -- Jennifer - CTO
(11, 7), -- Mark - DevOps Engineer
-- StartupVenture Inc
(12, 2), -- Alex - CEO (wearing multiple hats)
(13, 10), -- Sophie - Developer
-- Enterprise Solutions Group
(14, 3), -- Thomas - CFO
(15, 9); -- Maria - Project Manager

-- =========
-- Sync Batch Data
-- =========
INSERT INTO SyncBatch (BatchID, CompanyID, SourceSystem, IsFullSnapshot, StorageStagePath, StorageCleanPath, StartedAt, CompletedAt, RecordsIngested, ChecksumHint) VALUES
-- TechFlow Solutions Ltd - Financial Data
(1, 1, 'focus', 1, '/staging/techflow/focus/20250915/', '/clean/techflow/focus/20250915/', '2025-09-15T02:00:00.000', '2025-09-15T02:15:00.000', 24, 'abc123def456'),
(2, 1, 'focus', 1, '/staging/techflow/focus/20250916/', '/clean/techflow/focus/20250916/', '2025-09-16T02:00:00.000', '2025-09-16T02:12:00.000', 23, 'def456ghi789'),
(3, 1, 'focus', 1, '/staging/techflow/focus/20250917/', '/clean/techflow/focus/20250917/', '2025-09-17T02:00:00.000', '2025-09-17T02:18:00.000', 25, 'ghi789jkl012'),

-- TechFlow Solutions Ltd - GitHub Data
(4, 1, 'github', 1, '/staging/techflow/github/20250920/', '/clean/techflow/github/20250920/', '2025-09-20T01:00:00.000', '2025-09-20T01:45:00.000', 156, 'github123abc'),
(5, 1, 'github', 0, '/staging/techflow/github/20250921/', '/clean/techflow/github/20250921/', '2025-09-21T01:00:00.000', '2025-09-21T01:15:00.000', 23, 'github456def'),

-- TechFlow Solutions Ltd - Jira Data
(6, 1, 'jira', 1, '/staging/techflow/jira/20250920/', '/clean/techflow/jira/20250920/', '2025-09-20T03:00:00.000', '2025-09-20T03:30:00.000', 89, 'jira789ghi'),

-- CloudFirst Innovations
(7, 2, 'focus', 1, '/staging/cloudfirst/focus/20250920/', '/clean/cloudfirst/focus/20250920/', '2025-09-20T02:30:00.000', '2025-09-20T02:45:00.000', 18, 'cf123abc456'),
(8, 2, 'github', 1, '/staging/cloudfirst/github/20250920/', '/clean/cloudfirst/github/20250920/', '2025-09-20T01:30:00.000', '2025-09-20T02:00:00.000', 67, 'cfgit789def'),

-- Digital Transformation Corp
(9, 3, 'focus', 1, '/staging/digital/focus/20250918/', '/clean/digital/focus/20250918/', '2025-09-18T02:00:00.000', '2025-09-18T02:20:00.000', 31, 'dt456ghi789'),
(10, 3, 'jira', 1, '/staging/digital/jira/20250919/', '/clean/digital/jira/20250919/', '2025-09-19T03:00:00.000', '2025-09-19T03:45:00.000', 142, 'dtjira012jkl');

SET IDENTITY_INSERT SyncBatch OFF;
SET IDENTITY_INSERT UserAccount OFF;
SET IDENTITY_INSERT Permission OFF;
SET IDENTITY_INSERT Role OFF;
SET IDENTITY_INSERT Company OFF;

-- =========
-- Financial Facts Data (Based on your actual Azure CSV data with FOCUS columns)
-- =========

-- TechFlow Solutions Ltd - Financial Data from CSV (Sep 15-23, 2025)
INSERT INTO FinancialFact (CompanyID, BatchID, BilledCost, BillingAccountId, BillingCurrency, BillingPeriodEnd, BillingPeriodStart, ChargeCategory, ChargePeriodEnd, ChargePeriodStart, EffectiveCost, InvoiceIssuer, ListCost, PricingCategory, Provider, Publisher, Region, ResourceId, ResourceLocation, ServiceName, SubAccountId, UnblendedCost) VALUES

-- September 15, 2025 data (matching your actual CSV data)
(1, 1, 0.000004206, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.000004206, 'AZURE', 0.000004206, 'On-Demand', 'AZURE', 'AZURE', 'EU West', 'Azure App Service-EU West', 'EU West', 'Azure App Service', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.000004206),
(1, 1, 0.000023, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.000023, 'AZURE', 0.000023, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'Azure App Service-US East 2', 'US East 2', 'Azure App Service', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.000023),
(1, 1, 0.47868542360208, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.47868542360208, 'AZURE', 0.47868542360208, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'Azure App Service-US West 2', 'US West 2', 'Azure App Service', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.47868542360208),
(1, 1, 0.02609333530056, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.02609333530056, 'AZURE', 0.02609333530056, 'On-Demand', 'AZURE', 'AZURE', 'Unknown', 'Azure DNS-Unknown', 'Unknown', 'Azure DNS', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.02609333530056),
(1, 1, 0.32940751235328, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.32940751235328, 'AZURE', 0.32940751235328, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'Backup-AP Southeast', 'AP Southeast', 'Backup', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.32940751235328),
(1, 1, 0.64985999851755, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.64985999851755, 'AZURE', 0.64985999851755, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'Backup-AU East', 'AU East', 'Backup', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.64985999851755),
(1, 1, 0.744809665227302, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.744809665227302, 'AZURE', 0.744809665227302, 'On-Demand', 'AZURE', 'AZURE', 'US West', 'Backup-US West', 'US West', 'Backup', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.744809665227302),
(1, 1, 0.861145068891601, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.861145068891601, 'AZURE', 0.861145068891601, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'SQL Database-AU East', 'AU East', 'SQL Database', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.861145068891601),
(1, 1, 0.61092719772, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.61092719772, 'AZURE', 0.61092719772, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'Storage-AP Southeast', 'AP Southeast', 'Storage', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.61092719772),
(1, 1, 1.784152501432, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 1.784152501432, 'AZURE', 1.784152501432, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'Storage-AU East', 'AU East', 'Storage', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 1.784152501432),
(1, 1, 0.017794361088, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.017794361088, 'AZURE', 0.017794361088, 'On-Demand', 'AZURE', 'AZURE', 'AU Southeast', 'Storage-AU Southeast', 'AU Southeast', 'Storage', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.017794361088),
(1, 1, 0.139776, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.139776, 'AZURE', 0.139776, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'Virtual Network-AP Southeast', 'AP Southeast', 'Virtual Network', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.139776),
(1, 1, 1.16469600000029, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 1.16469600000029, 'AZURE', 1.16469600000029, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'Virtual Network-AU East', 'AU East', 'Virtual Network', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 1.16469600000029),

-- September 16, 2025 data
(1, 2, 0.00000032356, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.00000032356, 'AZURE', 0.00000032356, 'On-Demand', 'AZURE', 'AZURE', 'EU West', 'Azure App Service-EU West', 'EU West', 'Azure App Service', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.00000032356),
(1, 2, 0.47868542360208, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.47868542360208, 'AZURE', 0.47868542360208, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'Azure App Service-US West 2', 'US West 2', 'Azure App Service', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.47868542360208),
(1, 2, 0.02609333530056, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.02609333530056, 'AZURE', 0.02609333530056, 'On-Demand', 'AZURE', 'AZURE', 'Unknown', 'Azure DNS-Unknown', 'Unknown', 'Azure DNS', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.02609333530056),
(1, 2, 0.32940751235328, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.32940751235328, 'AZURE', 0.32940751235328, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'Backup-AP Southeast', 'AP Southeast', 'Backup', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.32940751235328),
(1, 2, 0.64985999851755, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.64985999851755, 'AZURE', 0.64985999851755, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'Backup-AU East', 'AU East', 'Backup', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.64985999851755),
(1, 2, 0.744809665227302, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.744809665227302, 'AZURE', 0.744809665227302, 'On-Demand', 'AZURE', 'AZURE', 'US West', 'Backup-US West', 'US West', 'Backup', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.744809665227302),
(1, 2, 0.861145068891601, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.861145068891601, 'AZURE', 0.861145068891601, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'SQL Database-AU East', 'AU East', 'SQL Database', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.861145068891601),
(1, 2, 0.61092719772, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.61092719772, 'AZURE', 0.61092719772, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'Storage-AP Southeast', 'AP Southeast', 'Storage', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.61092719772),
(1, 2, 1.784151433696, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 1.784151433696, 'AZURE', 1.784151433696, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'Storage-AU East', 'AU East', 'Storage', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 1.784151433696),
(1, 2, 0.017794361088, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.017794361088, 'AZURE', 0.017794361088, 'On-Demand', 'AZURE', 'AZURE', 'AU Southeast', 'Storage-AU Southeast', 'AU Southeast', 'Storage', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.017794361088),
(1, 2, 0.139776, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 0.139776, 'AZURE', 0.139776, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'Virtual Network-AP Southeast', 'AP Southeast', 'Virtual Network', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.139776),
(1, 2, 1.16469600000029, 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-16', '2025-09-16', 'Usage', '2025-09-16', '2025-09-16', 1.16469600000029, 'AZURE', 1.16469600000029, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'Virtual Network-AU East', 'AU East', 'Virtual Network', 'a5ba8310-2d1d-4886-b463-d3bdabda547f', 1.16469600000029);

-- Additional Financial Data for other companies (sample with FOCUS schema)
INSERT INTO FinancialFact (CompanyID, BatchID, BilledCost, BillingAccountId, BillingCurrency, BillingPeriodEnd, BillingPeriodStart, ChargeCategory, ChargePeriodEnd, ChargePeriodStart, EffectiveCost, InvoiceIssuer, ListCost, PricingCategory, Provider, Publisher, Region, ResourceId, ResourceLocation, ServiceName, SubAccountId, UnblendedCost) VALUES
-- CloudFirst Innovations
(2, 7, 245.67, 'cf-account-001', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 245.67, 'AZURE', 275.89, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-web-app', 'AU East', 'Azure App Service', 'cf-account-001', 245.67),
(2, 7, 89.34, 'cf-account-001', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 89.34, 'AZURE', 95.50, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-db', 'AU East', 'SQL Database', 'cf-account-001', 89.34),
(2, 7, 34.12, 'cf-account-001', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 34.12, 'AZURE', 38.90, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-storage', 'AU East', 'Storage', 'cf-account-001', 34.12),

-- Digital Transformation Corp
(3, 9, 567.89, 'dt-account-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 567.89, 'AZURE', 620.50, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-vm-cluster', 'US West 2', 'Virtual Machines', 'dt-account-001', 567.89),
(3, 9, 123.45, 'dt-account-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 123.45, 'AZURE', 135.80, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-containers', 'US West 2', 'Container Instances', 'dt-account-001', 123.45),
(3, 9, 78.90, 'dt-account-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 78.90, 'AZURE', 87.45, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-app-gateway', 'US West 2', 'Application Gateway', 'dt-account-001', 78.90);

-- =========
-- Workflow Facts Data (GitHub and Jira)
-- =========

-- TechFlow Solutions Ltd - GitHub Data
INSERT INTO WorkflowFact (CompanyID, BatchID, Provider, ItemType, ItemKey, ProjectOrRepo, Title, Status, CreatedAt, ClosedAt, LeadTimeHours, CycleTimeHours, StoryPoints, Author, Assignee, Labels) VALUES
-- GitHub Issues and PRs
(1, 4, 'github', 'issue', 'techflow/webapp#123', 'techflow/webapp', 'Fix authentication bug in login flow', 'closed', '2025-09-18T09:30:00.000', '2025-09-18T16:45:00.000', 7.25, 4.5, NULL, 'emma.rodriguez', 'michael.chen', 'bug,security,high-priority'),
(1, 4, 'github', 'pull_request', 'techflow/webapp#124', 'techflow/webapp', 'Add user profile management features', 'closed', '2025-09-17T14:20:00.000', '2025-09-19T11:30:00.000', 45.17, 12.75, NULL, 'michael.chen', 'emma.rodriguez', 'feature,frontend'),
(1, 4, 'github', 'issue', 'techflow/api#89', 'techflow/api', 'Optimize database queries for better performance', 'open', '2025-09-19T08:15:00.000', NULL, NULL, NULL, NULL, 'sarah.mitchell', 'james.thompson', 'performance,backend'),
(1, 4, 'github', 'pull_request', 'techflow/api#90', 'techflow/api', 'Implement rate limiting middleware', 'closed', '2025-09-16T13:45:00.000', '2025-09-17T10:20:00.000', 20.58, 8.25, NULL, 'michael.chen', 'emma.rodriguez', 'security,middleware'),
(1, 4, 'github', 'issue', 'techflow/infrastructure#45', 'techflow/infrastructure', 'Set up monitoring dashboard', 'closed', '2025-09-15T11:00:00.000', '2025-09-16T15:30:00.000', 28.5, 18.25, NULL, 'emma.rodriguez', 'michael.chen', 'infrastructure,monitoring'),

-- More GitHub data for incremental sync
(1, 5, 'github', 'issue', 'techflow/webapp#125', 'techflow/webapp', 'Update dependencies to latest versions', 'open', '2025-09-20T10:15:00.000', NULL, NULL, NULL, NULL, 'michael.chen', 'emma.rodriguez', 'maintenance,dependencies'),
(1, 5, 'github', 'pull_request', 'techflow/api#91', 'techflow/api', 'Add API versioning support', 'open', '2025-09-20T14:30:00.000', NULL, NULL, NULL, NULL, 'emma.rodriguez', 'james.thompson', 'api,versioning'),

-- TechFlow Solutions Ltd - Jira Data
(1, 6, 'jira', 'task', 'TF-456', 'TechFlow Project', 'Design new user onboarding flow', 'done', '2025-09-10T09:00:00.000', '2025-09-15T17:00:00.000', 128, 32, 8, 'sarah.mitchell', 'emma.rodriguez', 'design,ux'),
(1, 6, 'jira', 'bug', 'TF-457', 'TechFlow Project', 'Payment gateway integration failing', 'done', '2025-09-12T11:30:00.000', '2025-09-14T16:45:00.000', 77.25, 25.5, 5, 'james.thompson', 'michael.chen', 'bug,payment,critical'),
(1, 6, 'jira', 'story', 'TF-458', 'TechFlow Project', 'Implement dashboard analytics', 'in progress', '2025-09-16T08:00:00.000', NULL, NULL, NULL, 13, 'emma.rodriguez', 'michael.chen', 'analytics,dashboard'),
(1, 6, 'jira', 'task', 'TF-459', 'TechFlow Project', 'Set up automated testing pipeline', 'done', '2025-09-08T10:15:00.000', '2025-09-12T14:30:00.000', 100.25, 45.75, 8, 'michael.chen', 'emma.rodriguez', 'testing,automation'),

-- CloudFirst Innovations - GitHub Data
(2, 8, 'github', 'issue', 'cloudfirst/platform#67', 'cloudfirst/platform', 'Improve mobile responsiveness', 'closed', '2025-09-18T12:00:00.000', '2025-09-19T09:30:00.000', 21.5, 12.25, NULL, 'david.kumar', 'rachel.green', 'frontend,mobile,ui'),
(2, 8, 'github', 'pull_request', 'cloudfirst/platform#68', 'cloudfirst/platform', 'Add dark mode support', 'open', '2025-09-19T15:45:00.000', NULL, NULL, NULL, NULL, 'rachel.green', 'david.kumar', 'feature,ui,theme'),
(2, 8, 'github', 'issue', 'cloudfirst/api#34', 'cloudfirst/api', 'Implement OAuth 2.0 authentication', 'open', '2025-09-17T09:20:00.000', NULL, NULL, NULL, NULL, 'lisa.anderson', 'david.kumar', 'security,auth,oauth'),

-- Digital Transformation Corp - Jira Data
(3, 10, 'jira', 'epic', 'DT-100', 'Digital Platform', 'Customer Self-Service Portal', 'in progress', '2025-09-01T08:00:00.000', NULL, NULL, NULL, 55, 'robert.wilson', 'jennifer.lee', 'epic,customer,portal'),
(3, 10, 'jira', 'story', 'DT-101', 'Digital Platform', 'User registration and profile management', 'done', '2025-09-02T09:30:00.000', '2025-09-08T16:00:00.000', 150.5, 89.25, 13, 'jennifer.lee', 'mark.johnson', 'user-management,registration'),
(3, 10, 'jira', 'story', 'DT-102', 'Digital Platform', 'Document upload and management system', 'in progress', '2025-09-05T11:15:00.000', NULL, NULL, NULL, 21, 'mark.johnson', 'jennifer.lee', 'documents,upload'),
(3, 10, 'jira', 'bug', 'DT-103', 'Digital Platform', 'File upload size limit not enforced', 'open', '2025-09-18T14:30:00.000', NULL, NULL, NULL, 3, 'jennifer.lee', 'mark.johnson', 'bug,file-upload,validation'),
(3, 10, 'jira', 'task', 'DT-104', 'Digital Platform', 'Performance testing for high load', 'done', '2025-09-10T10:00:00.000', '2025-09-16T17:30:00.000', 151.5, 72.75, 8, 'mark.johnson', 'robert.wilson', 'performance,testing,load');

PRINT 'Mock data insertion completed successfully!';
PRINT 'Summary:';
PRINT '- 5 Companies created';
PRINT '- 11 Roles defined with comprehensive permissions';
PRINT '- 15 User accounts across all companies';
PRINT '- 10 Sync batches for different data sources';
PRINT '- Financial facts using FOCUS standard columns';
PRINT '- Based on actual Azure billing data from CSV file';
PRINT '- Realistic workflow data from GitHub and Jira';