-- =========================================
-- Enhanced Mock Data for FinOps Database
-- Generated on: 2025-10-16
-- Realistic data for comprehensive testing
-- =========================================

-- =========
-- Company Data (Diverse NZ/Global Companies)
-- =========
SET IDENTITY_INSERT Company ON;
INSERT INTO Company (CompanyID, Name, SizeLabel, CreatedAt, IsActive) VALUES
(1, 'TechFlow Solutions Ltd', '51-200', '2024-01-15T09:30:00.000', 1),
(2, 'CloudFirst Innovations', '11-50', '2024-02-20T14:15:00.000', 1),
(3, 'Digital Transformation Corp', '201-500', '2024-03-10T11:45:00.000', 1),
(4, 'StartupVenture Inc', '1-10', '2024-04-05T16:20:00.000', 1),
(5, 'Enterprise Solutions Group', '501-1000', '2024-05-12T08:10:00.000', 1),
(6, 'AgriTech Innovations NZ', '51-200', '2024-06-18T10:45:00.000', 1),
(7, 'FinanceForward Limited', '11-50', '2024-07-22T13:20:00.000', 1),
(8, 'HealthTech Solutions', '201-500', '2024-08-05T16:15:00.000', 1),
(9, 'EduPlatform Global', '51-200', '2024-09-10T11:30:00.000', 1),
(10, 'GreenEnergy Systems', '1001+', '2024-10-01T09:00:00.000', 1);
SET IDENTITY_INSERT Company OFF;

-- =========
-- Enhanced Role Data
-- =========
SET IDENTITY_INSERT Role ON;
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
(11, 'Client Admin', 0),
(12, 'Data Analyst', 0),
(13, 'Security Specialist', 0),
(14, 'QA Engineer', 0),
(15, 'Business Analyst', 0);
SET IDENTITY_INSERT Role OFF;

-- =========
-- Comprehensive Permission Data
-- =========
SET IDENTITY_INSERT Permission ON;
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
(11, 'admin_system', 'Full system administration access'),
(12, 'export_data', 'Export data to external formats'),
(13, 'manage_billing', 'Manage billing and invoicing'),
(14, 'view_analytics', 'View advanced analytics and insights'),
(15, 'manage_security', 'Manage security settings and policies'),
(16, 'audit_access', 'Access audit logs and compliance reports'),
(17, 'manage_projects', 'Manage project settings and configurations'),
(18, 'view_team_metrics', 'View team performance metrics');
SET IDENTITY_INSERT Permission OFF;

-- =========
-- Enhanced Role-Permission Mapping
-- =========
INSERT INTO RolePermission (RoleID, PermissionID) VALUES
-- SuperAdmin - all permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18),
-- CEO - strategic and oversight permissions
(2, 1), (2, 3), (2, 5), (2, 7), (2, 9), (2, 14), (2, 16), (2, 17), (2, 18),
-- CFO - financial and reporting focus
(3, 1), (3, 2), (3, 7), (3, 8), (3, 9), (3, 12), (3, 13), (3, 14), (3, 16),
-- CTO - technical and system oversight
(4, 1), (4, 3), (4, 4), (4, 7), (4, 9), (4, 10), (4, 14), (4, 15), (4, 17), (4, 18),
-- Product Manager - product and project focus
(5, 1), (5, 3), (5, 7), (5, 9), (5, 14), (5, 17), (5, 18),
-- Engineering Manager - team and technical management
(6, 1), (6, 3), (6, 4), (6, 7), (6, 9), (6, 17), (6, 18),
-- DevOps Engineer - infrastructure and integrations
(7, 1), (7, 3), (7, 7), (7, 10), (7, 15),
-- Finance Analyst - financial analysis and reporting
(8, 1), (8, 2), (8, 7), (8, 8), (8, 12), (8, 13), (8, 14),
-- Project Manager - project and workflow management
(9, 1), (9, 3), (9, 7), (9, 9), (9, 17), (9, 18),
-- Developer - basic access and workflow
(10, 3), (10, 7), (10, 9),
-- Client Admin - company management
(11, 5), (11, 6), (11, 7), (11, 9), (11, 16), (11, 17),
-- Data Analyst - analytics and reporting
(12, 1), (12, 3), (12, 7), (12, 8), (12, 12), (12, 14),
-- Security Specialist - security and audit
(13, 7), (13, 9), (13, 15), (13, 16),
-- QA Engineer - quality and testing focus
(14, 3), (14, 7), (14, 9), (14, 18),
-- Business Analyst - analysis and reporting
(15, 1), (15, 3), (15, 7), (15, 8), (15, 9), (15, 14), (15, 17), (15, 18);

-- =========
-- Enhanced User Account Data (Matching Schema: FirstName, MiddleName, LastName)
-- =========
SET IDENTITY_INSERT UserAccount ON;
INSERT INTO UserAccount (UserID, CompanyID, FirstName, MiddleName, LastName, Email, PasswordHash, Phone, IsSuperAdmin, CreatedAt) VALUES
-- SuperAdmin accounts
(1, NULL, 'System', NULL, 'Administrator', 'admin@finopsplatform.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-123-4567', 1, '2024-01-01T00:00:00.000'),
(2, NULL, 'Jade', NULL, 'Sainui', 'jade@makestuffgo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '02041286964', 1, '2024-01-01T01:00:00.000'),

-- TechFlow Solutions Ltd (Company 1) - Software Development
(3, 1, 'Sarah', 'Jane', 'Mitchell', 'sarah.mitchell@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5678', 0, '2024-01-15T10:00:00.000'),
(4, 1, 'James', 'Robert', 'Thompson', 'james.thompson@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-345-6789', 0, '2024-01-15T10:30:00.000'),
(5, 1, 'Emma', 'Marie', 'Rodriguez', 'emma.rodriguez@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-456-7890', 0, '2024-01-16T09:15:00.000'),
(6, 1, 'Michael', 'David', 'Chen', 'michael.chen@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-567-8901', 0, '2024-01-18T14:20:00.000'),
(7, 1, 'Priya', NULL, 'Patel', 'priya.patel@techflow.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-678-9123', 0, '2024-01-20T11:45:00.000'),

-- CloudFirst Innovations (Company 2) - Cloud Services
(8, 2, 'Lisa', 'Margaret', 'Anderson', 'lisa.anderson@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-678-9012', 0, '2024-02-20T15:00:00.000'),
(9, 2, 'David', 'Kumar', 'Singh', 'david.kumar@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-789-0123', 0, '2024-02-21T11:30:00.000'),
(10, 2, 'Rachel', 'Elizabeth', 'Green', 'rachel.green@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-890-1234', 0, '2024-02-22T13:45:00.000'),
(11, 2, 'Aaron', 'James', 'Kim', 'aaron.kim@cloudfirst.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-901-2456', 0, '2024-02-25T09:20:00.000'),

-- Digital Transformation Corp (Company 3) - Enterprise Solutions
(12, 3, 'Robert', 'John', 'Wilson', 'robert.wilson@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-901-2345', 0, '2024-03-10T12:00:00.000'),
(13, 3, 'Jennifer', 'Susan', 'Lee', 'jennifer.lee@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-012-3456', 0, '2024-03-11T10:15:00.000'),
(14, 3, 'Mark', 'Anthony', 'Johnson', 'mark.johnson@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-123-4567', 0, '2024-03-12T16:30:00.000'),
(15, 3, 'Nina', 'Grace', 'Taylor', 'nina.taylor@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5789', 0, '2024-03-15T08:45:00.000'),
(16, 3, 'Carlos', 'Miguel', 'Santos', 'carlos.santos@digitaltrans.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-345-6890', 0, '2024-03-18T14:10:00.000'),

-- StartupVenture Inc (Company 4) - Startup
(17, 4, 'Alex', 'Cameron', 'Taylor', 'alex.taylor@startupventure.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5678', 0, '2024-04-05T17:00:00.000'),
(18, 4, 'Sophie', 'Rose', 'Brown', 'sophie.brown@startupventure.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-345-6789', 0, '2024-04-06T09:30:00.000'),
(19, 4, 'Ryan', 'Patrick', 'O''Connor', 'ryan.oconnor@startupventure.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-456-7901', 0, '2024-04-10T11:15:00.000'),

-- Enterprise Solutions Group (Company 5) - Large Enterprise
(20, 5, 'Thomas', 'Carlos', 'Martinez', 'thomas.martinez@enterprise.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-456-7890', 0, '2024-05-12T08:30:00.000'),
(21, 5, 'Maria', 'Isabella', 'Garcia', 'maria.garcia@enterprise.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-567-8901', 0, '2024-05-13T14:45:00.000'),
(22, 5, 'Kevin', 'William', 'Zhang', 'kevin.zhang@enterprise.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-678-9012', 0, '2024-05-15T10:20:00.000'),
(23, 5, 'Amanda', 'Nicole', 'Foster', 'amanda.foster@enterprise.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-789-0123', 0, '2024-05-18T13:35:00.000'),

-- AgriTech Innovations NZ (Company 6) - Agriculture Technology
(24, 6, 'John', 'Michael', 'Harrison', 'john.harrison@agritech.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-890-1234', 0, '2024-06-18T11:00:00.000'),
(25, 6, 'Rebecca', 'Anne', 'Clark', 'rebecca.clark@agritech.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-901-2345', 0, '2024-06-20T09:15:00.000'),
(26, 6, 'Samuel', 'James', 'Wright', 'samuel.wright@agritech.co.nz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-012-3456', 0, '2024-06-22T14:30:00.000'),

-- FinanceForward Limited (Company 7) - Fintech
(27, 7, 'Victoria', 'Grace', 'Thompson', 'victoria.thompson@financeforward.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-123-4567', 0, '2024-07-22T13:45:00.000'),
(28, 7, 'Benjamin', 'Luke', 'Davis', 'benjamin.davis@financeforward.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5678', 0, '2024-07-24T10:20:00.000'),
(29, 7, 'Olivia', 'Mae', 'Wilson', 'olivia.wilson@financeforward.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-345-6789', 0, '2024-07-26T15:10:00.000'),

-- HealthTech Solutions (Company 8) - Healthcare Technology
(30, 8, 'Dr. Daniel', 'Richard', 'Anderson', 'daniel.anderson@healthtech.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-456-7890', 0, '2024-08-05T16:30:00.000'),
(31, 8, 'Laura', 'Christine', 'Martinez', 'laura.martinez@healthtech.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-567-8901', 0, '2024-08-07T11:45:00.000'),
(32, 8, 'Mohammad', 'Ali', 'Khan', 'mohammad.khan@healthtech.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-678-9012', 0, '2024-08-10T09:20:00.000'),

-- EduPlatform Global (Company 9) - Education Technology
(33, 9, 'Catherine', 'Marie', 'Roberts', 'catherine.roberts@eduplatform.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-789-0123', 0, '2024-09-10T12:00:00.000'),
(34, 9, 'Andrew', 'Scott', 'Miller', 'andrew.miller@eduplatform.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-890-1234', 0, '2024-09-12T10:15:00.000'),
(35, 9, 'Jessica', 'Lynn', 'Cooper', 'jessica.cooper@eduplatform.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-901-2345', 0, '2024-09-15T14:45:00.000'),

-- GreenEnergy Systems (Company 10) - Clean Energy
(36, 10, 'Marcus', 'Alexander', 'Green', 'marcus.green@greenenergy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-012-3456', 0, '2024-10-01T09:30:00.000'),
(37, 10, 'Elena', 'Sofia', 'Rodriguez', 'elena.rodriguez@greenenergy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-123-4567', 0, '2024-10-03T11:20:00.000'),
(38, 10, 'Peter', 'James', 'Wang', 'peter.wang@greenenergy.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/', '+64-21-234-5678', 0, '2024-10-05T15:10:00.000');
SET IDENTITY_INSERT UserAccount OFF;

-- =========
-- Enhanced User-Role Mapping (More Diverse Role Assignments)
-- =========
INSERT INTO UserRole (UserID, RoleID) VALUES
-- SuperAdmin accounts
(1, 1), -- System Administrator
(2, 1), -- Jade Sainui - MakeStuffGo SuperAdmin

-- TechFlow Solutions Ltd (Company 1) - Software Development Team
(3, 2), (3, 11), -- Sarah - CEO + Client Admin
(4, 3), -- James - CFO  
(5, 4), -- Emma - CTO
(6, 6), -- Michael - Engineering Manager
(7, 12), -- Priya - Data Analyst

-- CloudFirst Innovations (Company 2) - Cloud Services Team
(8, 2), (8, 11), -- Lisa - CEO + Client Admin
(9, 5), -- David - Product Manager
(10, 8), -- Rachel - Finance Analyst
(11, 13), -- Aaron - Security Specialist

-- Digital Transformation Corp (Company 3) - Enterprise Team
(12, 2), (12, 11), -- Robert - CEO + Client Admin
(13, 4), -- Jennifer - CTO
(14, 7), -- Mark - DevOps Engineer
(15, 9), -- Nina - Project Manager
(16, 15), -- Carlos - Business Analyst

-- StartupVenture Inc (Company 4) - Agile Startup Team
(17, 2), (17, 4), (17, 11), -- Alex - CEO + CTO + Client Admin (wearing multiple hats)
(18, 10), -- Sophie - Developer
(19, 14), -- Ryan - QA Engineer

-- Enterprise Solutions Group (Company 5) - Large Enterprise Team
(20, 3), (20, 11), -- Thomas - CFO + Client Admin
(21, 9), -- Maria - Project Manager
(22, 6), -- Kevin - Engineering Manager
(23, 15), -- Amanda - Business Analyst

-- AgriTech Innovations NZ (Company 6) - Agriculture Technology Team
(24, 2), (24, 11), -- John - CEO + Client Admin
(25, 5), -- Rebecca - Product Manager
(26, 10), -- Samuel - Developer

-- FinanceForward Limited (Company 7) - Fintech Team
(27, 2), (27, 11), -- Victoria - CEO + Client Admin
(28, 3), -- Benjamin - CFO
(29, 8), -- Olivia - Finance Analyst

-- HealthTech Solutions (Company 8) - Healthcare Technology Team
(30, 2), (30, 4), (30, 11), -- Dr. Daniel - CEO + CTO + Client Admin
(31, 9), -- Laura - Project Manager
(32, 13), -- Mohammad - Security Specialist

-- EduPlatform Global (Company 9) - Education Technology Team
(33, 2), (33, 11), -- Catherine - CEO + Client Admin
(34, 5), -- Andrew - Product Manager
(35, 12), -- Jessica - Data Analyst

-- GreenEnergy Systems (Company 10) - Clean Energy Team
(36, 2), (36, 11), -- Marcus - CEO + Client Admin
(37, 4), -- Elena - CTO
(38, 7); -- Peter - DevOps Engineer

-- =========
-- Enhanced Sync Batch Data (More Comprehensive Data Sources)
-- =========
SET IDENTITY_INSERT SyncBatch ON;
INSERT INTO SyncBatch (BatchID, CompanyID, SourceSystem, IsFullSnapshot, StorageStagePath, StorageCleanPath, StartedAt, CompletedAt, RecordsIngested, ChecksumHint) VALUES
-- TechFlow Solutions Ltd - Multiple data sources over time
(1, 1, 'focus', 1, '/staging/techflow/focus/20250915/', '/clean/techflow/focus/20250915/', '2025-09-15T02:00:00.000', '2025-09-15T02:15:00.000', 247, 'tf15abc123def456'),
(2, 1, 'focus', 1, '/staging/techflow/focus/20250916/', '/clean/techflow/focus/20250916/', '2025-09-16T02:00:00.000', '2025-09-16T02:12:00.000', 239, 'tf16def456ghi789'),
(3, 1, 'focus', 0, '/staging/techflow/focus/20250917/', '/clean/techflow/focus/20250917/', '2025-09-17T02:00:00.000', '2025-09-17T02:18:00.000', 45, 'tf17ghi789jkl012'),
(4, 1, 'github', 1, '/staging/techflow/github/20250920/', '/clean/techflow/github/20250920/', '2025-09-20T01:00:00.000', '2025-09-20T01:45:00.000', 1567, 'tf20github123abc'),
(5, 1, 'github', 0, '/staging/techflow/github/20250921/', '/clean/techflow/github/20250921/', '2025-09-21T01:00:00.000', '2025-09-21T01:15:00.000', 234, 'tf21github456def'),
(6, 1, 'jira', 1, '/staging/techflow/jira/20250920/', '/clean/techflow/jira/20250920/', '2025-09-20T03:00:00.000', '2025-09-20T03:30:00.000', 892, 'tf20jira789ghi'),

-- CloudFirst Innovations - Growing cloud company
(7, 2, 'focus', 1, '/staging/cloudfirst/focus/20250920/', '/clean/cloudfirst/focus/20250920/', '2025-09-20T02:30:00.000', '2025-09-20T02:45:00.000', 189, 'cf20123abc456'),
(8, 2, 'github', 1, '/staging/cloudfirst/github/20250920/', '/clean/cloudfirst/github/20250920/', '2025-09-20T01:30:00.000', '2025-09-20T02:00:00.000', 678, 'cf20git789def'),
(9, 2, 'jira', 1, '/staging/cloudfirst/jira/20250919/', '/clean/cloudfirst/jira/20250919/', '2025-09-19T03:15:00.000', '2025-09-19T03:45:00.000', 456, 'cf19jira012jkl'),

-- Digital Transformation Corp - Large enterprise loads
(10, 3, 'focus', 1, '/staging/digital/focus/20250918/', '/clean/digital/focus/20250918/', '2025-09-18T02:00:00.000', '2025-09-18T02:35:00.000', 1247, 'dt18456ghi789'),
(11, 3, 'jira', 1, '/staging/digital/jira/20250919/', '/clean/digital/jira/20250919/', '2025-09-19T03:00:00.000', '2025-09-19T04:15:00.000', 1842, 'dt19jira012jkl'),
(12, 3, 'github', 1, '/staging/digital/github/20250918/', '/clean/digital/github/20250918/', '2025-09-18T01:30:00.000', '2025-09-18T02:45:00.000', 2134, 'dt18github567'),

-- StartupVenture Inc - Small but active
(13, 4, 'focus', 1, '/staging/startup/focus/20250922/', '/clean/startup/focus/20250922/', '2025-09-22T02:15:00.000', '2025-09-22T02:25:00.000', 67, 'sv22123def789'),
(14, 4, 'github', 1, '/staging/startup/github/20250922/', '/clean/startup/github/20250922/', '2025-09-22T01:15:00.000', '2025-09-22T01:35:00.000', 234, 'sv22git456abc'),

-- Enterprise Solutions Group - Massive enterprise
(15, 5, 'focus', 1, '/staging/enterprise/focus/20250921/', '/clean/enterprise/focus/20250921/', '2025-09-21T02:00:00.000', '2025-09-21T03:45:00.000', 3456, 'es21789ghi012'),
(16, 5, 'jira', 1, '/staging/enterprise/jira/20250921/', '/clean/enterprise/jira/20250921/', '2025-09-21T03:00:00.000', '2025-09-21T05:30:00.000', 4567, 'es21jira234def'),
(17, 5, 'github', 1, '/staging/enterprise/github/20250921/', '/clean/enterprise/github/20250921/', '2025-09-21T01:00:00.000', '2025-09-21T03:15:00.000', 5678, 'es21git567ghi'),

-- AgriTech Innovations NZ - Agriculture focus
(18, 6, 'focus', 1, '/staging/agritech/focus/20250923/', '/clean/agritech/focus/20250923/', '2025-09-23T02:30:00.000', '2025-09-23T02:50:00.000', 156, 'at23456def123'),
(19, 6, 'github', 1, '/staging/agritech/github/20250923/', '/clean/agritech/github/20250923/', '2025-09-23T01:45:00.000', '2025-09-23T02:15:00.000', 287, 'at23git789abc'),

-- FinanceForward Limited - Fintech compliance heavy
(20, 7, 'focus', 1, '/staging/fintech/focus/20250924/', '/clean/fintech/focus/20250924/', '2025-09-24T02:00:00.000', '2025-09-24T02:30:00.000', 234, 'ff24234ghi456'),
(21, 7, 'jira', 1, '/staging/fintech/jira/20250924/', '/clean/fintech/jira/20250924/', '2025-09-24T03:15:00.000', '2025-09-24T04:00:00.000', 567, 'ff24jira567def'),

-- HealthTech Solutions - Healthcare compliance
(22, 8, 'focus', 1, '/staging/healthtech/focus/20250925/', '/clean/healthtech/focus/20250925/', '2025-09-25T02:15:00.000', '2025-09-25T02:45:00.000', 345, 'ht25345abc789'),
(23, 8, 'github', 1, '/staging/healthtech/github/20250925/', '/clean/healthtech/github/20250925/', '2025-09-25T01:30:00.000', '2025-09-25T02:10:00.000', 456, 'ht25git678def'),
(24, 8, 'jira', 1, '/staging/healthtech/jira/20250925/', '/clean/healthtech/jira/20250925/', '2025-09-25T03:00:00.000', '2025-09-25T03:45:00.000', 678, 'ht25jira901ghi'),

-- EduPlatform Global - Education technology
(25, 9, 'focus', 1, '/staging/eduplatform/focus/20250926/', '/clean/eduplatform/focus/20250926/', '2025-09-26T02:00:00.000', '2025-09-26T02:25:00.000', 278, 'ep26278def456'),
(26, 9, 'github', 1, '/staging/eduplatform/github/20250926/', '/clean/eduplatform/github/20250926/', '2025-09-26T01:15:00.000', '2025-09-26T01:50:00.000', 389, 'ep26git456abc'),

-- GreenEnergy Systems - Clean energy infrastructure
(27, 10, 'focus', 1, '/staging/greenenergy/focus/20250927/', '/clean/greenenergy/focus/20250927/', '2025-09-27T02:30:00.000', '2025-09-27T03:15:00.000', 567, 'ge27567ghi123'),
(28, 10, 'github', 1, '/staging/greenenergy/github/20250927/', '/clean/greenenergy/github/20250927/', '2025-09-27T01:45:00.000', '2025-09-27T02:30:00.000', 678, 'ge27git789def'),
(29, 10, 'jira', 1, '/staging/greenenergy/jira/20250927/', '/clean/greenenergy/jira/20250927/', '2025-09-27T03:30:00.000', '2025-09-27T04:15:00.000', 789, 'ge27jira012abc');
SET IDENTITY_INSERT SyncBatch OFF;

-- =========
-- Enhanced Financial Facts Data (Comprehensive Multi-Company FOCUS Data)
-- =========

-- TechFlow Solutions Ltd - Software Development Company (Batches 1-3)
INSERT INTO FinancialFact (CompanyID, BatchID, BilledCost, BillingAccountId, BillingCurrency, BillingPeriodEnd, BillingPeriodStart, ChargeCategory, ChargePeriodEnd, ChargePeriodStart, EffectiveCost, InvoiceIssuer, ListCost, PricingCategory, Provider, Publisher, Region, ResourceId, ResourceLocation, ServiceName, SubAccountId, UnblendedCost) VALUES
-- September 15, 2025 - TechFlow (Based on real Azure data)
(1, 1, 0.47868542360208, 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.47868542360208, 'AZURE', 0.47868542360208, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'techflow-webapp-prod', 'US West 2', 'Azure App Service', 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.47868542360208),
(1, 1, 0.861145068891601, 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.861145068891601, 'AZURE', 0.861145068891601, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'techflow-db-prod', 'AU East', 'SQL Database', 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.861145068891601),
(1, 1, 1.784152501432, 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 1.784152501432, 'AZURE', 1.784152501432, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'techflow-storage-prod', 'AU East', 'Storage', 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 1.784152501432),
(1, 1, 1.16469600000029, 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 1.16469600000029, 'AZURE', 1.16469600000029, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'techflow-vnet-prod', 'AU East', 'Virtual Network', 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 1.16469600000029),
(1, 1, 0.32940751235328, 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 'NZD', '2025-09-15', '2025-09-15', 'Usage', '2025-09-15', '2025-09-15', 0.32940751235328, 'AZURE', 0.32940751235328, 'On-Demand', 'AZURE', 'AZURE', 'AP Southeast', 'techflow-backup-ap', 'AP Southeast', 'Backup', 'tf-a5ba8310-2d1d-4886-b463-d3bdabda547f', 0.32940751235328),

-- CloudFirst Innovations - Cloud Services Company (Batch 7)
(2, 7, 245.67, 'cf-billing-account-2024', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 245.67, 'AZURE', 275.89, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-webapp-prod', 'AU East', 'Azure App Service', 'cf-billing-account-2024', 245.67),
(2, 7, 89.34, 'cf-billing-account-2024', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 89.34, 'AZURE', 95.50, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-sqldb-prod', 'AU East', 'SQL Database', 'cf-billing-account-2024', 89.34),
(2, 7, 156.78, 'cf-billing-account-2024', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 156.78, 'AZURE', 167.45, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-aks-cluster', 'AU East', 'Azure Kubernetes Service', 'cf-billing-account-2024', 156.78),
(2, 7, 34.12, 'cf-billing-account-2024', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 34.12, 'AZURE', 38.90, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-storage-prod', 'AU East', 'Storage', 'cf-billing-account-2024', 34.12),
(2, 7, 67.89, 'cf-billing-account-2024', 'NZD', '2025-09-20', '2025-09-20', 'Usage', '2025-09-20', '2025-09-20', 67.89, 'AZURE', 72.34, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'cloudfirst-redis-cache', 'AU East', 'Azure Cache for Redis', 'cf-billing-account-2024', 67.89),

-- Digital Transformation Corp - Enterprise Company (Batch 10)
(3, 10, 567.89, 'dt-enterprise-billing-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 567.89, 'AZURE', 620.50, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-vm-cluster-prod', 'US West 2', 'Virtual Machines', 'dt-enterprise-billing-001', 567.89),
(3, 10, 123.45, 'dt-enterprise-billing-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 123.45, 'AZURE', 135.80, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-containers-prod', 'US West 2', 'Container Instances', 'dt-enterprise-billing-001', 123.45),
(3, 10, 234.56, 'dt-enterprise-billing-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 234.56, 'AZURE', 256.78, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-sql-server-enterprise', 'US West 2', 'SQL Database', 'dt-enterprise-billing-001', 234.56),
(3, 10, 78.90, 'dt-enterprise-billing-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 78.90, 'AZURE', 87.45, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-app-gateway-prod', 'US West 2', 'Application Gateway', 'dt-enterprise-billing-001', 78.90),
(3, 10, 345.67, 'dt-enterprise-billing-001', 'NZD', '2025-09-18', '2025-09-18', 'Usage', '2025-09-18', '2025-09-18', 345.67, 'AZURE', 378.90, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'dt-cosmos-db-prod', 'US West 2', 'Azure Cosmos DB', 'dt-enterprise-billing-001', 345.67),

-- StartupVenture Inc - Small Startup (Batch 13)
(4, 13, 45.23, 'sv-startup-billing-2024', 'NZD', '2025-09-22', '2025-09-22', 'Usage', '2025-09-22', '2025-09-22', 45.23, 'AZURE', 50.34, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'startup-webapp-mvp', 'AU East', 'Azure App Service', 'sv-startup-billing-2024', 45.23),
(4, 13, 23.45, 'sv-startup-billing-2024', 'NZD', '2025-09-22', '2025-09-22', 'Usage', '2025-09-22', '2025-09-22', 23.45, 'AZURE', 26.78, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'startup-db-basic', 'AU East', 'SQL Database', 'sv-startup-billing-2024', 23.45),
(4, 13, 12.34, 'sv-startup-billing-2024', 'NZD', '2025-09-22', '2025-09-22', 'Usage', '2025-09-22', '2025-09-22', 12.34, 'AZURE', 14.56, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'startup-storage-basic', 'AU East', 'Storage', 'sv-startup-billing-2024', 12.34),

-- Enterprise Solutions Group - Large Enterprise (Batch 15)
(5, 15, 1234.56, 'es-enterprise-main-billing', 'NZD', '2025-09-21', '2025-09-21', 'Usage', '2025-09-21', '2025-09-21', 1234.56, 'AZURE', 1356.78, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'es-webapp-cluster-prod', 'US East 2', 'Azure App Service', 'es-enterprise-main-billing', 1234.56),
(5, 15, 2345.67, 'es-enterprise-main-billing', 'NZD', '2025-09-21', '2025-09-21', 'Usage', '2025-09-21', '2025-09-21', 2345.67, 'AZURE', 2567.89, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'es-sql-cluster-prod', 'US East 2', 'SQL Database', 'es-enterprise-main-billing', 2345.67),
(5, 15, 876.54, 'es-enterprise-main-billing', 'NZD', '2025-09-21', '2025-09-21', 'Usage', '2025-09-21', '2025-09-21', 876.54, 'AZURE', 956.78, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'es-vm-farm-prod', 'US East 2', 'Virtual Machines', 'es-enterprise-main-billing', 876.54),
(5, 15, 456.78, 'es-enterprise-main-billing', 'NZD', '2025-09-21', '2025-09-21', 'Usage', '2025-09-21', '2025-09-21', 456.78, 'AZURE', 498.90, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'es-storage-premium', 'US East 2', 'Storage', 'es-enterprise-main-billing', 456.78),
(5, 15, 678.90, 'es-enterprise-main-billing', 'NZD', '2025-09-21', '2025-09-21', 'Usage', '2025-09-21', '2025-09-21', 678.90, 'AZURE', 734.56, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'es-aks-enterprise', 'US East 2', 'Azure Kubernetes Service', 'es-enterprise-main-billing', 678.90),

-- AgriTech Innovations NZ - Agriculture Technology (Batch 18)
(6, 18, 123.45, 'agri-nz-billing-2024', 'NZD', '2025-09-23', '2025-09-23', 'Usage', '2025-09-23', '2025-09-23', 123.45, 'AZURE', 134.56, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'agritech-farm-management', 'AU East', 'Azure App Service', 'agri-nz-billing-2024', 123.45),
(6, 18, 67.89, 'agri-nz-billing-2024', 'NZD', '2025-09-23', '2025-09-23', 'Usage', '2025-09-23', '2025-09-23', 67.89, 'AZURE', 74.56, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'agritech-iot-hub', 'AU East', 'IoT Hub', 'agri-nz-billing-2024', 67.89),
(6, 18, 89.12, 'agri-nz-billing-2024', 'NZD', '2025-09-23', '2025-09-23', 'Usage', '2025-09-23', '2025-09-23', 89.12, 'AZURE', 97.34, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'agritech-analytics-db', 'AU East', 'SQL Database', 'agri-nz-billing-2024', 89.12),
(6, 18, 34.56, 'agri-nz-billing-2024', 'NZD', '2025-09-23', '2025-09-23', 'Usage', '2025-09-23', '2025-09-23', 34.56, 'AZURE', 38.90, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'agritech-blob-storage', 'AU East', 'Storage', 'agri-nz-billing-2024', 34.56),

-- FinanceForward Limited - Fintech (Batch 20)
(7, 20, 345.67, 'fintech-secure-billing', 'NZD', '2025-09-24', '2025-09-24', 'Usage', '2025-09-24', '2025-09-24', 345.67, 'AZURE', 378.90, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'fintech-trading-platform', 'AU East', 'Azure App Service', 'fintech-secure-billing', 345.67),
(7, 20, 234.56, 'fintech-secure-billing', 'NZD', '2025-09-24', '2025-09-24', 'Usage', '2025-09-24', '2025-09-24', 234.56, 'AZURE', 256.78, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'fintech-secure-db', 'AU East', 'SQL Database', 'fintech-secure-billing', 234.56),
(7, 20, 123.45, 'fintech-secure-billing', 'NZD', '2025-09-24', '2025-09-24', 'Usage', '2025-09-24', '2025-09-24', 123.45, 'AZURE', 134.56, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'fintech-keyvault-premium', 'AU East', 'Key Vault', 'fintech-secure-billing', 123.45),
(7, 20, 89.12, 'fintech-secure-billing', 'NZD', '2025-09-24', '2025-09-24', 'Usage', '2025-09-24', '2025-09-24', 89.12, 'AZURE', 97.34, 'On-Demand', 'AZURE', 'AZURE', 'AU East', 'fintech-fraud-detection', 'AU East', 'Azure Machine Learning', 'fintech-secure-billing', 89.12),

-- HealthTech Solutions - Healthcare Technology (Batch 22)
(8, 22, 456.78, 'healthtech-hipaa-billing', 'NZD', '2025-09-25', '2025-09-25', 'Usage', '2025-09-25', '2025-09-25', 456.78, 'AZURE', 498.90, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'healthtech-patient-portal', 'US East 2', 'Azure App Service', 'healthtech-hipaa-billing', 456.78),
(8, 22, 345.67, 'healthtech-hipaa-billing', 'NZD', '2025-09-25', '2025-09-25', 'Usage', '2025-09-25', '2025-09-25', 345.67, 'AZURE', 378.90, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'healthtech-encrypted-db', 'US East 2', 'SQL Database', 'healthtech-hipaa-billing', 345.67),
(8, 22, 234.56, 'healthtech-hipaa-billing', 'NZD', '2025-09-25', '2025-09-25', 'Usage', '2025-09-25', '2025-09-25', 234.56, 'AZURE', 256.78, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'healthtech-dicom-storage', 'US East 2', 'Storage', 'healthtech-hipaa-billing', 234.56),
(8, 22, 123.45, 'healthtech-hipaa-billing', 'NZD', '2025-09-25', '2025-09-25', 'Usage', '2025-09-25', '2025-09-25', 123.45, 'AZURE', 134.56, 'On-Demand', 'AZURE', 'AZURE', 'US East 2', 'healthtech-ai-diagnostics', 'US East 2', 'Cognitive Services', 'healthtech-hipaa-billing', 123.45),

-- EduPlatform Global - Education Technology (Batch 25)
(9, 25, 234.56, 'eduplatform-global-billing', 'NZD', '2025-09-26', '2025-09-26', 'Usage', '2025-09-26', '2025-09-26', 234.56, 'AZURE', 256.78, 'On-Demand', 'AZURE', 'AZURE', 'EU West', 'eduplatform-lms-webapp', 'EU West', 'Azure App Service', 'eduplatform-global-billing', 234.56),
(9, 25, 156.78, 'eduplatform-global-billing', 'NZD', '2025-09-26', '2025-09-26', 'Usage', '2025-09-26', '2025-09-26', 156.78, 'AZURE', 167.45, 'On-Demand', 'AZURE', 'AZURE', 'EU West', 'eduplatform-student-db', 'EU West', 'SQL Database', 'eduplatform-global-billing', 156.78),
(9, 25, 89.12, 'eduplatform-global-billing', 'NZD', '2025-09-26', '2025-09-26', 'Usage', '2025-09-26', '2025-09-26', 89.12, 'AZURE', 97.34, 'On-Demand', 'AZURE', 'AZURE', 'EU West', 'eduplatform-video-storage', 'EU West', 'Storage', 'eduplatform-global-billing', 89.12),
(9, 25, 67.89, 'eduplatform-global-billing', 'NZD', '2025-09-26', '2025-09-26', 'Usage', '2025-09-26', '2025-09-26', 67.89, 'AZURE', 74.56, 'On-Demand', 'AZURE', 'AZURE', 'EU West', 'eduplatform-cdn-global', 'EU West', 'Content Delivery Network', 'eduplatform-global-billing', 67.89),

-- GreenEnergy Systems - Clean Energy (Batch 27)
(10, 27, 567.89, 'greenenergy-sustainability', 'NZD', '2025-09-27', '2025-09-27', 'Usage', '2025-09-27', '2025-09-27', 567.89, 'AZURE', 620.50, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'greenenergy-monitoring-app', 'US West 2', 'Azure App Service', 'greenenergy-sustainability', 567.89),
(10, 27, 456.78, 'greenenergy-sustainability', 'NZD', '2025-09-27', '2025-09-27', 'Usage', '2025-09-27', '2025-09-27', 456.78, 'AZURE', 498.90, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'greenenergy-timeseries-db', 'US West 2', 'Azure Data Explorer', 'greenenergy-sustainability', 456.78),
(10, 27, 345.67, 'greenenergy-sustainability', 'NZD', '2025-09-27', '2025-09-27', 'Usage', '2025-09-27', '2025-09-27', 345.67, 'AZURE', 378.90, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'greenenergy-iot-hub', 'US West 2', 'IoT Hub', 'greenenergy-sustainability', 345.67),
(10, 27, 234.56, 'greenenergy-sustainability', 'NZD', '2025-09-27', '2025-09-27', 'Usage', '2025-09-27', '2025-09-27', 234.56, 'AZURE', 256.78, 'On-Demand', 'AZURE', 'AZURE', 'US West 2', 'greenenergy-analytics-ml', 'US West 2', 'Azure Machine Learning', 'greenenergy-sustainability', 234.56);

-- =========
-- Enhanced Workflow Facts Data (Comprehensive Multi-Company GitHub/Jira Data)
-- =========

-- TechFlow Solutions Ltd - Software Development Workflow
INSERT INTO WorkflowFact (CompanyID, BatchID, Provider, ItemType, ItemKey, ProjectOrRepo, Title, Status, CreatedAt, ClosedAt, LeadTimeHours, CycleTimeHours, StoryPoints, Author, Assignee, Labels) VALUES
-- GitHub Issues and PRs for TechFlow
(1, 4, 'github', 'issue', 'techflow/webapp#123', 'techflow/webapp', 'Fix authentication bug in login flow', 'closed', '2025-09-18T09:30:00.000', '2025-09-18T16:45:00.000', 7.25, 4.5, NULL, 'emma.rodriguez', 'michael.chen', 'bug,security,high-priority'),
(1, 4, 'github', 'pull_request', 'techflow/webapp#124', 'techflow/webapp', 'Add user profile management features', 'closed', '2025-09-17T14:20:00.000', '2025-09-19T11:30:00.000', 45.17, 12.75, NULL, 'michael.chen', 'emma.rodriguez', 'feature,frontend'),
(1, 4, 'github', 'issue', 'techflow/api#89', 'techflow/api', 'Optimize database queries for better performance', 'open', '2025-09-19T08:15:00.000', NULL, NULL, NULL, NULL, 'sarah.mitchell', 'james.thompson', 'performance,backend'),
(1, 4, 'github', 'pull_request', 'techflow/api#90', 'techflow/api', 'Implement rate limiting middleware', 'closed', '2025-09-16T13:45:00.000', '2025-09-17T10:20:00.000', 20.58, 8.25, NULL, 'michael.chen', 'emma.rodriguez', 'security,middleware'),
(1, 4, 'github', 'issue', 'techflow/infrastructure#45', 'techflow/infrastructure', 'Set up monitoring dashboard', 'closed', '2025-09-15T11:00:00.000', '2025-09-16T15:30:00.000', 28.5, 18.25, NULL, 'emma.rodriguez', 'michael.chen', 'infrastructure,monitoring'),
(1, 4, 'github', 'pull_request', 'techflow/mobile-app#67', 'techflow/mobile-app', 'Implement push notifications', 'closed', '2025-09-18T10:15:00.000', '2025-09-20T14:30:00.000', 52.25, 28.75, NULL, 'priya.patel', 'michael.chen', 'feature,mobile,notifications'),

-- TechFlow Jira Data
(1, 6, 'jira', 'epic', 'TF-450', 'TechFlow Platform', 'Q4 Mobile App Enhancement', 'in progress', '2025-09-01T08:00:00.000', NULL, NULL, NULL, 89, 'sarah.mitchell', 'emma.rodriguez', 'epic,mobile,q4'),
(1, 6, 'jira', 'story', 'TF-456', 'TechFlow Platform', 'Design new user onboarding flow', 'done', '2025-09-10T09:00:00.000', '2025-09-15T17:00:00.000', 128, 32, 8, 'sarah.mitchell', 'emma.rodriguez', 'design,ux,onboarding'),
(1, 6, 'jira', 'bug', 'TF-457', 'TechFlow Platform', 'Payment gateway integration failing', 'done', '2025-09-12T11:30:00.000', '2025-09-14T16:45:00.000', 77.25, 25.5, 5, 'james.thompson', 'michael.chen', 'bug,payment,critical'),
(1, 6, 'jira', 'story', 'TF-458', 'TechFlow Platform', 'Implement dashboard analytics', 'in progress', '2025-09-16T08:00:00.000', NULL, NULL, NULL, 13, 'emma.rodriguez', 'priya.patel', 'analytics,dashboard,reporting'),
(1, 6, 'jira', 'task', 'TF-459', 'TechFlow Platform', 'Set up automated testing pipeline', 'done', '2025-09-08T10:15:00.000', '2025-09-12T14:30:00.000', 100.25, 45.75, 8, 'michael.chen', 'emma.rodriguez', 'testing,automation,ci-cd'),
(1, 6, 'jira', 'story', 'TF-460', 'TechFlow Platform', 'Multi-factor authentication implementation', 'done', '2025-09-05T09:30:00.000', '2025-09-18T16:00:00.000', 318.5, 89.25, 21, 'emma.rodriguez', 'michael.chen', 'security,auth,mfa'),

-- CloudFirst Innovations - Cloud Services Workflow
(2, 8, 'github', 'issue', 'cloudfirst/platform#67', 'cloudfirst/platform', 'Improve mobile responsiveness', 'closed', '2025-09-18T12:00:00.000', '2025-09-19T09:30:00.000', 21.5, 12.25, NULL, 'david.kumar', 'rachel.green', 'frontend,mobile,ui'),
(2, 8, 'github', 'pull_request', 'cloudfirst/platform#68', 'cloudfirst/platform', 'Add dark mode support', 'open', '2025-09-19T15:45:00.000', NULL, NULL, NULL, NULL, 'rachel.green', 'david.kumar', 'feature,ui,theme'),
(2, 8, 'github', 'issue', 'cloudfirst/api#34', 'cloudfirst/api', 'Implement OAuth 2.0 authentication', 'open', '2025-09-17T09:20:00.000', NULL, NULL, NULL, NULL, 'lisa.anderson', 'aaron.kim', 'security,auth,oauth'),
(2, 8, 'github', 'pull_request', 'cloudfirst/kubernetes#12', 'cloudfirst/kubernetes', 'Scale auto-scaling configuration', 'closed', '2025-09-16T14:30:00.000', '2025-09-18T10:15:00.000', 43.75, 18.5, NULL, 'aaron.kim', 'david.kumar', 'infrastructure,kubernetes,scaling'),
(2, 8, 'github', 'issue', 'cloudfirst/monitoring#89', 'cloudfirst/monitoring', 'Add Prometheus metrics collection', 'closed', '2025-09-15T11:45:00.000', '2025-09-17T16:30:00.000', 52.75, 28.25, NULL, 'david.kumar', 'aaron.kim', 'monitoring,prometheus,metrics'),

-- CloudFirst Jira Data
(2, 9, 'jira', 'epic', 'CF-200', 'CloudFirst Services', 'Q4 Infrastructure Modernization', 'in progress', '2025-09-01T09:00:00.000', NULL, NULL, NULL, 144, 'lisa.anderson', 'david.kumar', 'epic,infrastructure,modernization'),
(2, 9, 'jira', 'story', 'CF-201', 'CloudFirst Services', 'Migrate to microservices architecture', 'in progress', '2025-09-10T10:30:00.000', NULL, NULL, NULL, 34, 'david.kumar', 'aaron.kim', 'architecture,microservices,migration'),
(2, 9, 'jira', 'task', 'CF-202', 'CloudFirst Services', 'Implement service mesh with Istio', 'done', '2025-09-12T14:15:00.000', '2025-09-19T11:45:00.000', 165.5, 89.75, 13, 'aaron.kim', 'david.kumar', 'service-mesh,istio,networking'),
(2, 9, 'jira', 'bug', 'CF-203', 'CloudFirst Services', 'Container registry authentication issues', 'done', '2025-09-18T08:30:00.000', '2025-09-19T15:15:00.000', 30.75, 12.5, 5, 'rachel.green', 'aaron.kim', 'bug,container,registry,auth'),

-- Digital Transformation Corp - Enterprise Workflow
(3, 11, 'jira', 'epic', 'DT-100', 'Digital Platform', 'Customer Self-Service Portal', 'in progress', '2025-09-01T08:00:00.000', NULL, NULL, NULL, 233, 'robert.wilson', 'jennifer.lee', 'epic,customer,portal,digital-transformation'),
(3, 11, 'jira', 'story', 'DT-101', 'Digital Platform', 'User registration and profile management', 'done', '2025-09-02T09:30:00.000', '2025-09-08T16:00:00.000', 150.5, 89.25, 21, 'jennifer.lee', 'mark.johnson', 'user-management,registration,profile'),
(3, 11, 'jira', 'story', 'DT-102', 'Digital Platform', 'Document upload and management system', 'in progress', '2025-09-05T11:15:00.000', NULL, NULL, NULL, 34, 'mark.johnson', 'nina.taylor', 'documents,upload,management'),
(3, 11, 'jira', 'bug', 'DT-103', 'Digital Platform', 'File upload size limit not enforced', 'open', '2025-09-18T14:30:00.000', NULL, NULL, NULL, 3, 'nina.taylor', 'mark.johnson', 'bug,file-upload,validation,security'),
(3, 11, 'jira', 'task', 'DT-104', 'Digital Platform', 'Performance testing for high load', 'done', '2025-09-10T10:00:00.000', '2025-09-16T17:30:00.000', 151.5, 72.75, 13, 'carlos.santos', 'mark.johnson', 'performance,testing,load,scalability'),
(3, 11, 'jira', 'story', 'DT-105', 'Digital Platform', 'Integration with legacy ERP system', 'in progress', '2025-09-12T13:45:00.000', NULL, NULL, NULL, 55, 'robert.wilson', 'carlos.santos', 'integration,erp,legacy,api'),

-- Digital Transformation GitHub Data
(3, 12, 'github', 'pull_request', 'digitaltrans/portal#234', 'digitaltrans/portal', 'Add enterprise SSO integration', 'closed', '2025-09-14T09:15:00.000', '2025-09-18T14:30:00.000', 101.25, 48.75, NULL, 'jennifer.lee', 'carlos.santos', 'sso,enterprise,security'),
(3, 12, 'github', 'issue', 'digitaltrans/api#145', 'digitaltrans/api', 'Optimize batch processing performance', 'open', '2025-09-17T11:30:00.000', NULL, NULL, NULL, NULL, 'mark.johnson', 'nina.taylor', 'performance,batch-processing,optimization'),
(3, 12, 'github', 'pull_request', 'digitaltrans/infrastructure#78', 'digitaltrans/infrastructure', 'Implement blue-green deployment', 'closed', '2025-09-15T08:45:00.000', '2025-09-19T16:20:00.000', 103.58, 52.25, NULL, 'carlos.santos', 'mark.johnson', 'deployment,blue-green,infrastructure'),

-- StartupVenture Inc - Agile Startup Workflow
(4, 14, 'github', 'issue', 'startup/mvp#23', 'startup/mvp', 'Build minimum viable product dashboard', 'closed', '2025-09-20T09:00:00.000', '2025-09-22T17:30:00.000', 56.5, 32.25, NULL, 'alex.taylor', 'sophie.brown', 'mvp,dashboard,startup'),
(4, 14, 'github', 'pull_request', 'startup/api#34', 'startup/api', 'Add basic user authentication', 'closed', '2025-09-19T14:15:00.000', '2025-09-21T10:45:00.000', 44.5, 18.75, NULL, 'sophie.brown', 'ryan.oconnor', 'auth,basic,api'),
(4, 14, 'github', 'issue', 'startup/mobile#12', 'startup/mobile', 'Create prototype mobile app', 'open', '2025-09-21T11:30:00.000', NULL, NULL, NULL, NULL, 'ryan.oconnor', 'sophie.brown', 'mobile,prototype,ios,android'),
(4, 14, 'github', 'pull_request', 'startup/landing#5', 'startup/landing', 'Design landing page for beta users', 'closed', '2025-09-18T16:00:00.000', '2025-09-20T12:15:00.000', 44.25, 22.5, NULL, 'alex.taylor', 'sophie.brown', 'landing-page,beta,marketing'),

-- Enterprise Solutions Group - Large Enterprise Workflow
(5, 16, 'jira', 'epic', 'ES-300', 'Enterprise Platform', 'Enterprise-wide Digital Transformation', 'in progress', '2025-08-15T08:00:00.000', NULL, NULL, NULL, 377, 'thomas.martinez', 'kevin.zhang', 'epic,enterprise,digital-transformation'),
(5, 16, 'jira', 'story', 'ES-301', 'Enterprise Platform', 'Legacy system integration framework', 'in progress', '2025-09-01T09:30:00.000', NULL, NULL, NULL, 89, 'kevin.zhang', 'amanda.foster', 'legacy,integration,framework'),
(5, 16, 'jira', 'story', 'ES-302', 'Enterprise Platform', 'Enterprise data warehouse modernization', 'done', '2025-08-20T10:15:00.000', '2025-09-15T16:45:00.000', 620.5, 298.75, 144, 'amanda.foster', 'maria.garcia', 'data-warehouse,modernization,analytics'),
(5, 16, 'jira', 'task', 'ES-303', 'Enterprise Platform', 'Compliance and security audit preparation', 'done', '2025-09-10T11:00:00.000', '2025-09-18T14:30:00.000', 195.5, 89.25, 21, 'thomas.martinez', 'amanda.foster', 'compliance,security,audit'),
(5, 16, 'jira', 'bug', 'ES-304', 'Enterprise Platform', 'Performance degradation in reporting module', 'done', '2025-09-19T09:15:00.000', '2025-09-21T13:45:00.000', 52.5, 28.75, 8, 'maria.garcia', 'kevin.zhang', 'bug,performance,reporting,critical'),

-- Enterprise GitHub Data
(5, 17, 'github', 'pull_request', 'enterprise/platform#456', 'enterprise/platform', 'Implement enterprise-grade logging', 'closed', '2025-09-16T10:30:00.000', '2025-09-20T15:15:00.000', 100.75, 48.25, NULL, 'kevin.zhang', 'amanda.foster', 'logging,enterprise,monitoring'),
(5, 17, 'github', 'issue', 'enterprise/security#89', 'enterprise/security', 'Implement zero-trust security model', 'open', '2025-09-18T14:45:00.000', NULL, NULL, NULL, NULL, 'amanda.foster', 'thomas.martinez', 'security,zero-trust,enterprise'),
(5, 17, 'github', 'pull_request', 'enterprise/analytics#123', 'enterprise/analytics', 'Add real-time analytics dashboard', 'closed', '2025-09-15T09:00:00.000', '2025-09-19T16:30:00.000', 103.5, 52.75, NULL, 'maria.garcia', 'kevin.zhang', 'analytics,real-time,dashboard'),

-- AgriTech Innovations NZ - Agriculture Technology Workflow
(6, 19, 'github', 'issue', 'agritech/farm-management#34', 'agritech/farm-management', 'IoT sensor data integration', 'closed', '2025-09-20T08:30:00.000', '2025-09-23T14:15:00.000', 77.75, 42.25, NULL, 'john.harrison', 'rebecca.clark', 'iot,sensors,data-integration'),
(6, 19, 'github', 'pull_request', 'agritech/weather-api#12', 'agritech/weather-api', 'Add weather prediction algorithms', 'closed', '2025-09-21T11:45:00.000', '2025-09-23T09:30:00.000', 45.75, 28.5, NULL, 'rebecca.clark', 'samuel.wright', 'weather,algorithms,prediction'),
(6, 19, 'github', 'issue', 'agritech/mobile-app#23', 'agritech/mobile-app', 'Farmer mobile dashboard improvements', 'open', '2025-09-22T13:20:00.000', NULL, NULL, NULL, NULL, 'samuel.wright', 'john.harrison', 'mobile,dashboard,farmers,ui'),

-- FinanceForward Limited - Fintech Workflow
(7, 21, 'jira', 'story', 'FF-401', 'FinanceForward Platform', 'Real-time fraud detection system', 'in progress', '2025-09-20T09:15:00.000', NULL, NULL, NULL, 55, 'victoria.thompson', 'benjamin.davis', 'fraud-detection,real-time,security'),
(7, 21, 'jira', 'task', 'FF-402', 'FinanceForward Platform', 'PCI DSS compliance implementation', 'done', '2025-09-18T10:30:00.000', '2025-09-24T16:45:00.000', 150.25, 89.75, 34, 'benjamin.davis', 'olivia.wilson', 'compliance,pci-dss,security'),
(7, 21, 'jira', 'bug', 'FF-403', 'FinanceForward Platform', 'Transaction processing latency issues', 'done', '2025-09-22T14:20:00.000', '2025-09-24T11:15:00.000', 44.92, 18.5, 8, 'olivia.wilson', 'benjamin.davis', 'bug,performance,transactions,latency'),
(7, 21, 'jira', 'story', 'FF-404', 'FinanceForward Platform', 'Multi-currency trading support', 'in progress', '2025-09-19T08:45:00.000', NULL, NULL, NULL, 89, 'benjamin.davis', 'victoria.thompson', 'trading,multi-currency,international'),

-- HealthTech Solutions - Healthcare Technology Workflow
(8, 24, 'jira', 'epic', 'HT-500', 'HealthTech Platform', 'HIPAA Compliant Patient Management System', 'in progress', '2025-09-01T08:00:00.000', NULL, NULL, NULL, 233, 'daniel.anderson', 'laura.martinez', 'epic,hipaa,patient-management,healthcare'),
(8, 24, 'jira', 'story', 'HT-501', 'HealthTech Platform', 'Secure patient data encryption', 'done', '2025-09-15T09:30:00.000', '2025-09-22T14:45:00.000', 173.25, 98.5, 55, 'mohammad.khan', 'laura.martinez', 'encryption,patient-data,security,hipaa'),
(8, 24, 'jira', 'task', 'HT-502', 'HealthTech Platform', 'Medical imaging viewer integration', 'in progress', '2025-09-20T11:15:00.000', NULL, NULL, NULL, 34, 'laura.martinez', 'daniel.anderson', 'medical-imaging,viewer,integration,dicom'),
(8, 24, 'jira', 'bug', 'HT-503', 'HealthTech Platform', 'Appointment scheduling conflicts', 'done', '2025-09-23T10:45:00.000', '2025-09-25T15:30:00.000', 52.75, 24.25, 13, 'daniel.anderson', 'mohammad.khan', 'bug,scheduling,appointments,calendar'),

-- HealthTech GitHub Data
(8, 23, 'github', 'pull_request', 'healthtech/portal#67', 'healthtech/portal', 'Add telemedicine video calls', 'closed', '2025-09-22T13:20:00.000', '2025-09-25T10:15:00.000', 68.92, 38.75, NULL, 'laura.martinez', 'mohammad.khan', 'telemedicine,video-calls,webrtc'),
(8, 23, 'github', 'issue', 'healthtech/api#89', 'healthtech/api', 'FHIR standard compliance implementation', 'open', '2025-09-24T09:30:00.000', NULL, NULL, NULL, NULL, 'mohammad.khan', 'daniel.anderson', 'fhir,compliance,standards,interoperability'),
(8, 23, 'github', 'pull_request', 'healthtech/mobile#34', 'healthtech/mobile', 'Patient mobile app health tracking', 'closed', '2025-09-21T14:45:00.000', '2025-09-24T11:30:00.000', 68.75, 32.5, NULL, 'daniel.anderson', 'laura.martinez', 'mobile,health-tracking,patients,wearables'),

-- EduPlatform Global - Education Technology Workflow
(9, 26, 'github', 'issue', 'eduplatform/lms#145', 'eduplatform/lms', 'Virtual classroom video integration', 'closed', '2025-09-23T10:15:00.000', '2025-09-26T16:30:00.000', 78.25, 42.5, NULL, 'catherine.roberts', 'andrew.miller', 'virtual-classroom,video,integration,education'),
(9, 26, 'github', 'pull_request', 'eduplatform/analytics#67', 'eduplatform/analytics', 'Student performance analytics dashboard', 'closed', '2025-09-24T11:30:00.000', '2025-09-26T14:15:00.000', 50.75, 28.25, NULL, 'jessica.cooper', 'andrew.miller', 'analytics,student-performance,dashboard,education'),
(9, 26, 'github', 'issue', 'eduplatform/mobile#23', 'eduplatform/mobile', 'Offline content download for students', 'open', '2025-09-25T13:45:00.000', NULL, NULL, NULL, NULL, 'andrew.miller', 'jessica.cooper', 'mobile,offline,content,download,students'),

-- GreenEnergy Systems - Clean Energy Workflow
(10, 28, 'github', 'pull_request', 'greenenergy/monitoring#123', 'greenenergy/monitoring', 'Solar panel efficiency monitoring', 'closed', '2025-09-25T09:00:00.000', '2025-09-27T15:45:00.000', 54.75, 32.25, NULL, 'marcus.green', 'elena.rodriguez', 'solar-panels,efficiency,monitoring,renewable'),
(10, 28, 'github', 'issue', 'greenenergy/iot#89', 'greenenergy/iot', 'Wind turbine IoT sensor integration', 'open', '2025-09-26T11:30:00.000', NULL, NULL, NULL, NULL, 'elena.rodriguez', 'peter.wang', 'wind-turbines,iot,sensors,integration'),
(10, 28, 'github', 'pull_request', 'greenenergy/analytics#45', 'greenenergy/analytics', 'Energy consumption prediction models', 'closed', '2025-09-24T14:20:00.000', '2025-09-27T10:15:00.000', 67.92, 38.5, NULL, 'peter.wang', 'marcus.green', 'analytics,prediction,energy-consumption,machine-learning'),

-- GreenEnergy Jira Data
(10, 29, 'jira', 'epic', 'GE-600', 'GreenEnergy Platform', 'Smart Grid Integration Initiative', 'in progress', '2025-09-01T08:00:00.000', NULL, NULL, NULL, 377, 'marcus.green', 'elena.rodriguez', 'epic,smart-grid,integration,renewable-energy'),
(10, 29, 'jira', 'story', 'GE-601', 'GreenEnergy Platform', 'Real-time energy distribution optimization', 'in progress', '2025-09-20T10:30:00.000', NULL, NULL, NULL, 89, 'elena.rodriguez', 'peter.wang', 'optimization,energy-distribution,real-time,smart-grid'),
(10, 29, 'jira', 'task', 'GE-602', 'GreenEnergy Platform', 'Carbon footprint calculation engine', 'done', '2025-09-18T09:15:00.000', '2025-09-25T16:30:00.000', 175.25, 98.75, 55, 'peter.wang', 'elena.rodriguez', 'carbon-footprint,calculation,sustainability,reporting'),
(10, 29, 'jira', 'story', 'GE-603', 'GreenEnergy Platform', 'Renewable energy forecasting system', 'in progress', '2025-09-22T11:45:00.000', NULL, NULL, NULL, 144, 'marcus.green', 'peter.wang', 'forecasting,renewable-energy,weather,machine-learning');

-- =========
-- Summary Information
-- =========
PRINT 'Enhanced mock data insertion completed successfully!';
PRINT 'Summary:';
PRINT '- 10 Companies created (diverse industry sectors)';
PRINT '- 15 Roles defined with comprehensive permissions';
PRINT '- 38 User accounts across all companies with realistic names';
PRINT '- 29 Sync batches covering multiple data sources and timeframes';
PRINT '- Comprehensive financial facts using FOCUS standard columns';
PRINT '- Industry-specific Azure resource usage patterns';
PRINT '- Extensive workflow data from GitHub and Jira across all companies';
PRINT '- Realistic development workflows with proper metrics and timelines';
PRINT '- Multi-provider cloud usage scenarios';
PRINT '- Enhanced role assignments including Client Admin for each company';
PRINT '';
PRINT 'Industry Coverage:';
PRINT '- Software Development (TechFlow Solutions)';
PRINT '- Cloud Services (CloudFirst Innovations)';
PRINT '- Enterprise Solutions (Digital Transformation Corp)';
PRINT '- Startup Technology (StartupVenture Inc)';
PRINT '- Large Enterprise (Enterprise Solutions Group)';
PRINT '- Agriculture Technology (AgriTech Innovations NZ)';
PRINT '- Financial Technology (FinanceForward Limited)';
PRINT '- Healthcare Technology (HealthTech Solutions)';
PRINT '- Education Technology (EduPlatform Global)';
PRINT '- Clean Energy (GreenEnergy Systems)';
PRINT '';
PRINT 'Data Quality Features:';
PRINT '- Realistic cost patterns by company size and industry';
PRINT '- Proper FOCUS billing standard compliance';
PRINT '- Authentic development workflow metrics';
PRINT '- Industry-specific compliance requirements';
PRINT '- Geographic distribution of Azure resources';
PRINT '- Comprehensive role-based access control scenarios';