-- =========================================
-- Database Views for FinOps Database (MySQL Version)
-- Run this AFTER creating tables (MSGSQLDB.sql)
-- Generated on: 2025-10-16
-- =========================================

-- =========
-- Financial Data Views
-- =========

-- Latest financial snapshot view (per company)
CREATE VIEW v_FinancialFact_Latest AS
SELECT f.*
FROM FinancialFact f
JOIN (
    SELECT CompanyID, MAX(BatchID) AS LatestBatchID
    FROM SyncBatch
    WHERE SourceSystem = 'focus'
    GROUP BY CompanyID
) b ON f.CompanyID = b.CompanyID AND f.BatchID = b.LatestBatchID;

-- =========
-- Workflow Data Views
-- =========

-- Latest workflow snapshot view (per company, regardless of provider)
CREATE VIEW v_WorkflowFact_Latest AS
SELECT w.*
FROM WorkflowFact w
JOIN (
    SELECT CompanyID, MAX(BatchID) AS LatestBatchID
    FROM SyncBatch
    WHERE SourceSystem IN ('github','jira')
    GROUP BY CompanyID
) b ON w.CompanyID = b.CompanyID AND w.BatchID = b.LatestBatchID;

-- =========
-- Additional Convenience Views
-- =========

-- Active companies with latest sync status
CREATE VIEW v_Company_SyncStatus AS
SELECT 
    c.CompanyID,
    c.Name AS CompanyName,
    c.SizeLabel,
    c.IsActive,
    f_sync.LastFinancialSync,
    f_sync.FinancialRecords,
    w_sync.LastWorkflowSync,
    w_sync.WorkflowRecords
FROM Company c
LEFT JOIN (
    SELECT 
        CompanyID,
        MAX(CompletedAt) AS LastFinancialSync,
        SUM(RecordsIngested) AS FinancialRecords
    FROM SyncBatch 
    WHERE SourceSystem = 'focus' AND CompletedAt IS NOT NULL
    GROUP BY CompanyID
) f_sync ON c.CompanyID = f_sync.CompanyID
LEFT JOIN (
    SELECT 
        CompanyID,
        MAX(CompletedAt) AS LastWorkflowSync,
        SUM(RecordsIngested) AS WorkflowRecords
    FROM SyncBatch 
    WHERE SourceSystem IN ('github','jira') AND CompletedAt IS NOT NULL
    GROUP BY CompanyID
) w_sync ON c.CompanyID = w_sync.CompanyID
WHERE c.IsActive = TRUE;

-- Financial summary by company (for quick dashboard overview)
CREATE VIEW v_Financial_Summary AS
SELECT 
    f.CompanyID,
    c.Name AS CompanyName,
    f.BillingCurrency,
    COUNT(*) AS TotalRecords,
    SUM(f.BilledCost) AS TotalBilledCost,
    SUM(f.EffectiveCost) AS TotalEffectiveCost,
    SUM(f.ListCost) AS TotalListCost,
    SUM(f.ListCost - f.EffectiveCost) AS TotalSavings,
    MIN(f.BillingPeriodStart) AS EarliestPeriod,
    MAX(f.BillingPeriodEnd) AS LatestPeriod
FROM v_FinancialFact_Latest f
JOIN Company c ON f.CompanyID = c.CompanyID
GROUP BY f.CompanyID, c.Name, f.BillingCurrency;

-- Workflow summary by company (for quick dashboard overview)
CREATE VIEW v_Workflow_Summary AS
SELECT 
    w.CompanyID,
    c.Name AS CompanyName,
    w.Provider,
    COUNT(*) AS TotalItems,
    COUNT(CASE WHEN w.Status IN ('open','in_progress') THEN 1 END) AS ActiveItems,
    COUNT(CASE WHEN w.Status IN ('closed','done') THEN 1 END) AS CompletedItems,
    AVG(w.LeadTimeHours) AS AvgLeadTimeHours,
    AVG(w.CycleTimeHours) AS AvgCycleTimeHours,
    SUM(w.StoryPoints) AS TotalStoryPoints
FROM v_WorkflowFact_Latest w
JOIN Company c ON w.CompanyID = c.CompanyID
GROUP BY w.CompanyID, c.Name, w.Provider;

SELECT 'Database views created successfully!' AS Status;
SELECT 'Views created: v_FinancialFact_Latest, v_WorkflowFact_Latest, v_Company_SyncStatus, v_Financial_Summary, v_Workflow_Summary' AS ViewsCreated;