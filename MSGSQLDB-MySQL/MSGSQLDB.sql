-- =========================================
-- Core Database Schema (MySQL Version)
-- FinOps Platform with FOCUS Billing Standard
-- Generated on: 2025-10-16
-- =========================================
CREATE DATABASE IF NOT EXISTS MSGSQLDB_V1;
USE MSGSQLDB_V1;
-- =========
-- Core org / users
-- =========

CREATE TABLE IF NOT EXISTS Company (
    CompanyID        INT AUTO_INCREMENT PRIMARY KEY,
    Name             VARCHAR(200) NOT NULL,
    SizeLabel        VARCHAR(50)  NULL,  -- e.g., "51-200"
    CreatedAt        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsActive         BOOLEAN      NOT NULL DEFAULT TRUE
    -- (Intentionally no UNIQUE(Name) yet per your preference)
);

CREATE TABLE IF NOT EXISTS Role (
    RoleID           INT AUTO_INCREMENT PRIMARY KEY,
    Name             VARCHAR(100) NOT NULL, -- e.g., CEO, CFO, ProductManager, ClientAdmin
    IsSystemRole     BOOLEAN NOT NULL DEFAULT FALSE   -- for SuperAdmin role if you want one later
);

CREATE TABLE IF NOT EXISTS Permission (
    PermissionID     INT AUTO_INCREMENT PRIMARY KEY,
    Code             VARCHAR(100) NOT NULL UNIQUE,  -- e.g., "view_financial", "view_workflow", "manage_company", "manage_users"
    Description      VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS RolePermission (
    RoleID           INT NOT NULL,
    PermissionID     INT NOT NULL,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID),
    FOREIGN KEY (PermissionID) REFERENCES Permission(PermissionID)
);

CREATE TABLE IF NOT EXISTS UserAccount (
    UserID           INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID        INT NULL,                      -- NULL => SuperAdmin (cross-company)
    FullName         VARCHAR(150) NOT NULL,
    Email            VARCHAR(200) NOT NULL,
    PasswordHash     VARCHAR(255) NULL,           -- if using password auth later
    Phone            VARCHAR(50)  NULL,
    IsSuperAdmin     BOOLEAN NOT NULL DEFAULT FALSE,        -- quick "system" escape hatch
    CreatedAt        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX  IX_UserAccount_Email ON UserAccount(Email);

CREATE TABLE IF NOT EXISTS UserRole (
    UserID           INT NOT NULL,
    RoleID           INT NOT NULL,
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES UserAccount(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

-- =========
-- Ingestion tracking
-- =========

CREATE TABLE IF NOT EXISTS SyncBatch (
    BatchID          BIGINT AUTO_INCREMENT PRIMARY KEY,
    CompanyID        INT NOT NULL,
    SourceSystem     VARCHAR(30) NOT NULL,   -- 'github' | 'jira' | 'focus'
    IsFullSnapshot   BOOLEAN NOT NULL DEFAULT TRUE,  -- full vs incremental
    StorageStagePath VARCHAR(400) NULL,      -- optional pointer to blob "staging"
    StorageCleanPath VARCHAR(400) NULL,      -- optional pointer to blob "cleansed"
    StartedAt        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CompletedAt      DATETIME NULL,
    RecordsIngested  INT NULL,
    ChecksumHint     VARCHAR(100) NULL,      -- optional fingerprint
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX IX_SyncBatch_Company_Source ON SyncBatch(CompanyID, SourceSystem, StartedAt DESC);

-- =========
-- Financial facts (FOCUS-friendly)
-- =========

CREATE TABLE IF NOT EXISTS FinancialFact (
    FinancialID      BIGINT AUTO_INCREMENT PRIMARY KEY,
    CompanyID        INT NOT NULL,
    BatchID          BIGINT NOT NULL,
    -- FOCUS standard columns (matching your CSV file exactly)
    BilledCost       DECIMAL(18,6) NOT NULL,
    BillingAccountId VARCHAR(100) NOT NULL,
    BillingCurrency  VARCHAR(10)  NOT NULL,
    BillingPeriodEnd DATE NOT NULL,
    BillingPeriodStart DATE NOT NULL,
    ChargeCategory   VARCHAR(50)  NULL,
    ChargePeriodEnd  DATE NOT NULL,
    ChargePeriodStart DATE NOT NULL,
    EffectiveCost    DECIMAL(18,6) NULL,
    InvoiceIssuer    VARCHAR(50)  NULL,
    ListCost         DECIMAL(18,6) NULL,
    PricingCategory  VARCHAR(50)  NULL,
    Provider         VARCHAR(50)  NULL,
    Publisher        VARCHAR(50)  NULL,
    Region           VARCHAR(100) NULL,
    ResourceId       VARCHAR(300) NULL,
    ResourceLocation VARCHAR(100) NULL,
    ServiceName      VARCHAR(100) NULL,
    SubAccountId     VARCHAR(100) NULL,
    UnblendedCost    DECIMAL(18,6) NULL,
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
    FOREIGN KEY (BatchID)  REFERENCES SyncBatch(BatchID)
);
CREATE INDEX IX_FinancialFact_ByCompanyDate ON FinancialFact(CompanyID, BillingPeriodStart, BillingPeriodEnd);
CREATE INDEX IX_FinancialFact_ByCompanyBatch ON FinancialFact(CompanyID, BatchID);


-- =========
-- Workflow facts (GitHub/Jira normalized)
-- =========

CREATE TABLE IF NOT EXISTS WorkflowFact (
    WorkflowID       BIGINT AUTO_INCREMENT PRIMARY KEY,
    CompanyID        INT NOT NULL,
    BatchID          BIGINT NOT NULL,
    Provider         VARCHAR(20) NOT NULL,       -- 'github' | 'jira'
    ItemType         VARCHAR(30) NOT NULL,       -- 'issue' | 'pull_request' | 'task' | 'bug'
    ItemKey          VARCHAR(120) NULL,          -- e.g., 'PROJ-123' or 'repo#1234'
    ProjectOrRepo    VARCHAR(200) NULL,
    Title            VARCHAR(400) NULL,
    Status           VARCHAR(80)  NULL,          -- e.g., 'open','closed','done'
    CreatedAt        DATETIME     NULL,
    ClosedAt         DATETIME     NULL,
    LeadTimeHours    DECIMAL(18,3) NULL,          -- derived metric if you compute it
    CycleTimeHours   DECIMAL(18,3) NULL,
    StoryPoints      DECIMAL(9,2)  NULL,
    Author           VARCHAR(150) NULL,
    Assignee         VARCHAR(150) NULL,
    Labels           VARCHAR(500) NULL,          -- comma-separated or small JSON
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID),
    FOREIGN KEY (BatchID)  REFERENCES SyncBatch(BatchID)
);
CREATE INDEX IX_WorkflowFact_ByCompanyDates ON WorkflowFact(CompanyID, CreatedAt, ClosedAt);
CREATE INDEX IX_WorkflowFact_ByCompanyBatch ON WorkflowFact(CompanyID, BatchID);