-- =========================================
-- DRS Phase 1: MINIMAL Database Extension
-- Add only the 3 essential tables for Business Executive Dashboard
-- These tables work with your existing FinancialFact + WorkflowFact
-- =========================================

-- Strategic Initiatives (Projects/Epics tracked across systems)
CREATE TABLE Initiative (
    InitiativeID     INT IDENTITY(1,1) PRIMARY KEY,
    CompanyID        INT NOT NULL,
    Name             NVARCHAR(200) NOT NULL,
    Description      NVARCHAR(500) NULL,
    ImpactLevel      NVARCHAR(20) NULL DEFAULT 'Medium', -- High/Medium/Low
    Owner            NVARCHAR(100) NULL,
    PlannedStartDate DATE NULL,
    PlannedEndDate   DATE NULL,
    Status           NVARCHAR(30) NULL DEFAULT 'Planning', -- Planning/InProgress/Complete
    Tags             NVARCHAR(300) NULL, -- JSON or comma-separated labels
    CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX IX_Initiative_Company ON Initiative(CompanyID);

-- Initiative Metrics (Progress, Value, ROI tracking)
CREATE TABLE InitiativeMetric (
    InitiativeMetricID INT IDENTITY(1,1) PRIMARY KEY,
    InitiativeID       INT NOT NULL,
    PeriodStart        DATE NOT NULL,
    PeriodEnd          DATE NOT NULL,
    MetricType         NVARCHAR(50) NOT NULL, -- PROGRESS_PCT, TARGET_ARR, REALISED_ARR, TARGET_SAVINGS, REALISED_SAVINGS, INVESTMENT_COST
    Value              DECIMAL(18,6) NOT NULL,
    Unit               NVARCHAR(20) NULL, -- %, NZD, USD, days, etc.
    SourceSystem       NVARCHAR(30) NULL, -- 'finance','manual','calc','jira','github'
    CreatedAt          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (InitiativeID) REFERENCES Initiative(InitiativeID)
);
CREATE INDEX IX_InitiativeMetric_Initiative ON InitiativeMetric(InitiativeID, PeriodStart);

-- Baseline Metrics (Pre-cloud/legacy baselines for comparison)
CREATE TABLE BaselineMetric (
    BaselineMetricID   INT IDENTITY(1,1) PRIMARY KEY,
    CompanyID          INT NOT NULL,
    MetricCode         NVARCHAR(50) NOT NULL, -- TTM_BASELINE, OPS_COST_BASELINE, REVENUE_BASELINE
    ScopeType          NVARCHAR(30) NOT NULL, -- 'company','product','initiative'
    ScopeKey           NVARCHAR(100) NULL,   -- free text name or code
    PeriodStart        DATE NOT NULL,
    PeriodEnd          DATE NOT NULL,
    BaselineValue      DECIMAL(18,6) NOT NULL,
    Unit               NVARCHAR(20) NULL, -- days, $, %, etc.
    CreatedAt          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (CompanyID) REFERENCES Company(CompanyID)
);
CREATE INDEX IX_BaselineMetric_Company ON BaselineMetric(CompanyID, MetricCode);

PRINT 'DRS Phase 1 Tables Created Successfully!';
PRINT 'Added: Initiative, InitiativeMetric, BaselineMetric';
PRINT 'Ready to implement Business Executive Dashboard widgets';