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

CREATE TABLE Role (
    RoleID           INT IDENTITY(1,1) PRIMARY KEY,
    Name             NVARCHAR(100) NOT NULL, -- e.g., CEO, CFO, ProductManager, ClientAdmin
    IsSystemRole     BIT NOT NULL DEFAULT 0   -- for SuperAdmin role if you want one later
);

CREATE TABLE Permission (
    PermissionID     INT IDENTITY(1,1) PRIMARY KEY,
    Code             NVARCHAR(100) NOT NULL UNIQUE,  -- e.g., "view_financial", "view_workflow", "manage_company", "manage_users"
    Description      NVARCHAR(255) NULL
);

CREATE TABLE RolePermission (
    RoleID           INT NOT NULL,
    PermissionID     INT NOT NULL,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID),
    FOREIGN KEY (PermissionID) REFERENCES Permission(PermissionID)
);

CREATE TABLE UserAccount (
    UserID           INT IDENTITY(1,1) PRIMARY KEY,
    CompanyID        INT NULL,                      -- NULL => SuperAdmin (cross-company)
    FirstName         NVARCHAR(50) NOT NULL,
    MiddleName         NVARCHAR(50) NULL,
    LastName         NVARCHAR(50) NOT NULL,
    Email            NVARCHAR(200) NOT NULL,
    PasswordHash     NVARCHAR(255) NULL,           -- if using password auth later
    Phone            NVARCHAR(50)  NULL,
    IsSuperAdmin     BIT NOT NULL DEFAULT 0,        -- quick “system” escape hatch
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX IX_UserAccount_Email ON UserAccount(Email);

CREATE TABLE UserRole (
    UserID           INT NOT NULL,
    RoleID           INT NOT NULL,
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES UserAccount(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

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