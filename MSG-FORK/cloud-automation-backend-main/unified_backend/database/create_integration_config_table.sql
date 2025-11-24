-- Create IntegrationConfig table for storing integration credentials and settings
CREATE TABLE IntegrationConfig (
    id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    credentials_encrypted NVARCHAR(MAX) NOT NULL,
    enabled BIT NOT NULL DEFAULT 1,
    last_sync_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by INT NOT NULL,
    updated_at DATETIME2 NULL,
    updated_by INT NULL,
    
    -- Ensure one config per company per integration type
    CONSTRAINT UK_IntegrationConfig_Company_Type UNIQUE (company_id, integration_type)
);

-- Create indexes for better performance
CREATE INDEX IX_IntegrationConfig_Company ON IntegrationConfig (company_id);
CREATE INDEX IX_IntegrationConfig_Type ON IntegrationConfig (integration_type);
CREATE INDEX IX_IntegrationConfig_LastSync ON IntegrationConfig (last_sync_at);

