# Generate random suffix for unique resource names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
  tags     = var.tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "plan-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku
  tags                = var.tags
}

# Storage Account for file uploads
resource "azurerm_storage_account" "main" {
  name                     = "st${var.project_name}${var.environment}${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }

  tags = var.tags
}

# Storage Container for uploads
resource "azurerm_storage_container" "uploads" {
  name                  = "uploads"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "sql-${var.project_name}-${var.environment}-${random_string.suffix.result}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_server_admin_login
  administrator_login_password = var.sql_server_admin_password

  tags = var.tags
}

# SQL Database
resource "azurerm_mssql_database" "main" {
  name           = "sqldb-${var.project_name}-${var.environment}"
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  sku_name       = var.sql_database_sku
  zone_redundant = false

  short_term_retention_policy {
    retention_days = var.sql_backup_retention_days
  }

  tags = var.tags
}

# SQL Firewall Rule - Allow Azure Services
resource "azurerm_mssql_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# SQL Firewall Rules for allowed IP addresses
resource "azurerm_mssql_firewall_rule" "allowed_ips" {
  count            = length(var.allowed_ip_addresses)
  name             = "AllowedIP${count.index + 1}"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = var.allowed_ip_addresses[count.index]
  end_ip_address   = var.allowed_ip_addresses[count.index]
}

# Application Insights (if enabled)
resource "azurerm_application_insights" "main" {
  count               = var.enable_application_insights ? 1 : 0
  name                = "appi-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "web"
  retention_in_days   = var.log_retention_days

  tags = var.tags
}

# App Service for Backend API
resource "azurerm_linux_web_app" "backend" {
  name                = "app-${var.project_name}-backend-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }

    always_on = false
  }

  app_settings = {
    "NODE_ENV"                              = var.environment
    "DB_SERVER"                             = azurerm_mssql_server.main.fully_qualified_domain_name
    "DB_DATABASE"                           = azurerm_mssql_database.main.name
    "DB_USER"                               = var.sql_server_admin_login
    "DB_PASSWORD"                           = var.sql_server_admin_password
    "DB_ENCRYPT"                            = "true"
    "UPLOAD_PATH"                           = "/tmp/uploads"
    "MAX_FILE_SIZE"                         = "10485760"
    "FRONTEND_URL"                          = "https://${azurerm_static_site.frontend.default_host_name}"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.enable_application_insights ? azurerm_application_insights.main[0].connection_string : ""
  }

  connection_string {
    name  = "DefaultConnection"
    type  = "SQLAzure"
    value = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_server_admin_login};Password=${var.sql_server_admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }

  tags = var.tags
}

# Static Web App for Frontend
resource "azurerm_static_site" "frontend" {
  name                = "stapp-${var.project_name}-frontend-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = var.tags
}

# Key Vault for secrets (optional but recommended)
resource "azurerm_key_vault" "main" {
  name                = "kv-${var.project_name}-${var.environment}-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get",
      "List",
      "Set",
      "Delete",
      "Purge",
      "Recover"
    ]
  }

  tags = var.tags
}

# Store SQL connection string in Key Vault
resource "azurerm_key_vault_secret" "sql_connection_string" {
  name         = "sql-connection-string"
  value        = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_server_admin_login};Password=${var.sql_server_admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  key_vault_id = azurerm_key_vault.main.id
}

# Data source for current client configuration
data "azurerm_client_config" "current" {}
