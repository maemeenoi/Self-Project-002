-- =========================================
-- DROP AND RECREATE SCRIPT
-- Completely refreshes all tables and data
-- =========================================

PRINT 'Starting complete database refresh...';

-- Drop all tables in dependency order (child tables first)
PRINT 'Dropping existing tables...';

-- Drop fact tables first
IF OBJECT_ID('dbo.WorkflowFact', 'U') IS NOT NULL 
    DROP TABLE dbo.WorkflowFact;
PRINT 'Dropped WorkflowFact';

IF OBJECT_ID('dbo.FinancialFact', 'U') IS NOT NULL 
    DROP TABLE dbo.FinancialFact;
PRINT 'Dropped FinancialFact';

-- Drop sync batch table
IF OBJECT_ID('dbo.SyncBatch', 'U') IS NOT NULL 
    DROP TABLE dbo.SyncBatch;
PRINT 'Dropped SyncBatch';

-- Drop user-role mapping
IF OBJECT_ID('dbo.UserRole', 'U') IS NOT NULL 
    DROP TABLE dbo.UserRole;
PRINT 'Dropped UserRole';

-- Drop role-permission mapping
IF OBJECT_ID('dbo.RolePermission', 'U') IS NOT NULL 
    DROP TABLE dbo.RolePermission;
PRINT 'Dropped RolePermission';

-- Drop users
IF OBJECT_ID('dbo.UserAccount', 'U') IS NOT NULL 
    DROP TABLE dbo.UserAccount;
PRINT 'Dropped UserAccount';

-- Drop permissions
IF OBJECT_ID('dbo.Permission', 'U') IS NOT NULL 
    DROP TABLE dbo.Permission;
PRINT 'Dropped Permission';

-- Drop roles
IF OBJECT_ID('dbo.Role', 'U') IS NOT NULL 
    DROP TABLE dbo.Role;
PRINT 'Dropped Role';

-- Drop companies last
IF OBJECT_ID('dbo.Company', 'U') IS NOT NULL 
    DROP TABLE dbo.Company;
PRINT 'Dropped Company';

PRINT 'All tables dropped successfully. Creating fresh schema...';
PRINT '';

-- =========================================
-- RECREATE TABLES FROM SCHEMA
-- =========================================

-- =========
-- Core org / users
-- =========

CREATE TABLE Company (
    CompanyID        INT IDENTITY(1,1) PRIMARY KEY,
    Name             NVARCHAR(200) NOT NULL,
    SizeLabel        NVARCHAR(50)  NULL,  -- e.g., "51-200"
    CreatedAt        DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    IsActive         BIT            NOT NULL DEFAULT 1
    -- (Intentionally no UNIQUE(Name) yet per your preference)
);
PRINT 'Created Company table';

CREATE TABLE Role (
    RoleID           INT IDENTITY(1,1) PRIMARY KEY,
    Name             NVARCHAR(100) NOT NULL, -- e.g., CEO, CFO, ProductManager, ClientAdmin
    IsSystemRole     BIT NOT NULL DEFAULT 0   -- for SuperAdmin role if you want one later
);
PRINT 'Created Role table';

CREATE TABLE Permission (
    PermissionID     INT IDENTITY(1,1) PRIMARY KEY,
    Code             NVARCHAR(100) NOT NULL UNIQUE,  -- e.g., "view_financial", "view_workflow", "manage_company", "manage_users"
    Description      NVARCHAR(255) NULL
);
PRINT 'Created Permission table';

CREATE TABLE RolePermission (
    RoleID           INT NOT NULL,
    PermissionID     INT NOT NULL,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID),
    FOREIGN KEY (PermissionID) REFERENCES Permission(PermissionID)
);
PRINT 'Created RolePermission table';

CREATE TABLE UserAccount (
    UserID           INT IDENTITY(1,1) PRIMARY KEY,
    CompanyID        INT NULL,                      -- NULL => SuperAdmin (cross-company)
    FirstName         NVARCHAR(50) NOT NULL,
    MiddleName         NVARCHAR(50) NULL,
    LastName         NVARCHAR(50) NOT NULL,
    Email            NVARCHAR(200) NOT NULL,
    PasswordHash     NVARCHAR(255) NULL,           -- if using password auth later
    Phone            NVARCHAR(50)  NULL,
    Department       NVARCHAR(100) NULL,           -- User's department
    Location         NVARCHAR(200) NULL,           -- User's location
    IsSuperAdmin     BIT NOT NULL DEFAULT 0,        -- quick "system" escape hatch
    IsActive         BIT NOT NULL DEFAULT 1,        -- User active status
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt        DATETIME2 NULL DEFAULT SYSUTCDATETIME(),  -- Audit tracking
    LastSignInAt     DATETIME2 NULL,               -- Last sign in tracking
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX IX_UserAccount_Email ON UserAccount(Email);
PRINT 'Created UserAccount table with indexes';

CREATE TABLE UserRole (
    UserID           INT NOT NULL,
    RoleID           INT NOT NULL,
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES UserAccount(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);
PRINT 'Created UserRole table';

-- =========
-- Ingestion tracking
-- =========

CREATE TABLE SyncBatch (
    BatchID          BIGINT IDENTITY(1,1) PRIMARY KEY,
    CompanyID        INT NOT NULL,
    SourceSystem     NVARCHAR(30) NOT NULL,   -- 'github' | 'jira' | 'focus'
    IsFullSnapshot   BIT NOT NULL DEFAULT 1,  -- full vs incremental
    StorageStagePath NVARCHAR(400) NULL,      -- optional pointer to blob "staging"
    StorageCleanPath NVARCHAR(400) NULL,      -- optional pointer to blob "cleansed"
    StartedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CompletedAt      DATETIME2 NULL,
    RecordsIngested  INT NULL,
    ChecksumHint     NVARCHAR(100) NULL,      -- optional fingerprint
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX IX_SyncBatch_Company_Source ON SyncBatch(CompanyID, SourceSystem, StartedAt DESC);
PRINT 'Created SyncBatch table with indexes';

-- =========
-- Financial facts (FOCUS-friendly)
-- =========

CREATE TABLE FinancialFact (
    FinancialID      BIGINT IDENTITY(1,1) PRIMARY KEY,
    CompanyID        INT NOT NULL,
    BatchID          BIGINT NOT NULL,
    -- FOCUS standard columns (matching your CSV file exactly)
    BilledCost       DECIMAL(18,6) NOT NULL,
    BillingAccountId NVARCHAR(100) NOT NULL,
    BillingCurrency  NVARCHAR(10)  NOT NULL,
    BillingPeriodEnd DATE NOT NULL,
    BillingPeriodStart DATE NOT NULL,
    ChargeCategory   NVARCHAR(50)  NULL,
    ChargePeriodEnd  DATE NOT NULL,
    ChargePeriodStart DATE NOT NULL,
    EffectiveCost    DECIMAL(18,6) NULL,
    InvoiceIssuer    NVARCHAR(50)  NULL,
    ListCost         DECIMAL(18,6) NULL,
    PricingCategory  NVARCHAR(50)  NULL,
    Provider         NVARCHAR(50)  NULL,
    Publisher        NVARCHAR(50)  NULL,
    Region           NVARCHAR(100) NULL,
    ResourceId       NVARCHAR(300) NULL,
    ResourceLocation NVARCHAR(100) NULL,
    ServiceName      NVARCHAR(100) NULL,
    SubAccountId     NVARCHAR(100) NULL,
    UnblendedCost    DECIMAL(18,6) NULL,
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
    FOREIGN KEY (BatchID)  REFERENCES SyncBatch(BatchID)
);
CREATE INDEX IX_FinancialFact_ByCompanyDate ON FinancialFact(CompanyID, BillingPeriodStart, BillingPeriodEnd);
CREATE INDEX IX_FinancialFact_ByCompanyBatch ON FinancialFact(CompanyID, BatchID);
PRINT 'Created FinancialFact table with indexes';

-- =========
-- Workflow facts (GitHub/Jira normalized)
-- =========

CREATE TABLE WorkflowFact (
    WorkflowID       BIGINT IDENTITY(1,1) PRIMARY KEY,
    CompanyID        INT NOT NULL,
    BatchID          BIGINT NOT NULL,
    Provider         NVARCHAR(20) NOT NULL,       -- 'github' | 'jira'
    ItemType         NVARCHAR(30) NOT NULL,       -- 'issue' | 'pull_request' | 'task' | 'bug'
    ItemKey          NVARCHAR(120) NULL,          -- e.g., 'PROJ-123' or 'repo#1234'
    ProjectOrRepo    NVARCHAR(200) NULL,
    Title            NVARCHAR(400) NULL,
    Status           NVARCHAR(80)  NULL,          -- e.g., 'open','closed','done'
    CreatedAt        DATETIME2     NULL,
    ClosedAt         DATETIME2     NULL,
    LeadTimeHours    DECIMAL(18,3) NULL,          -- derived metric if you compute it
    CycleTimeHours   DECIMAL(18,3) NULL,
    StoryPoints      DECIMAL(9,2)  NULL,
    Author           NVARCHAR(150) NULL,
    Assignee         NVARCHAR(150) NULL,
    Labels           NVARCHAR(500) NULL,          -- comma-separated or small JSON
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
    FOREIGN KEY (BatchID)  REFERENCES SyncBatch(BatchID)
);
CREATE INDEX IX_WorkflowFact_ByCompanyDates ON WorkflowFact(CompanyID, CreatedAt, ClosedAt);
CREATE INDEX IX_WorkflowFact_ByCompanyBatch ON WorkflowFact(CompanyID, BatchID);
PRINT 'Created WorkflowFact table with indexes';

PRINT '';
PRINT 'Schema recreation completed successfully!';
PRINT 'Ready to insert fresh data...';
PRINT '';