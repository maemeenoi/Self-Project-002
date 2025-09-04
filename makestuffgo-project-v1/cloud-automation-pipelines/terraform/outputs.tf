# Resource Group
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# SQL Server and Database
output "sql_server_name" {
  description = "Name of the SQL Server"
  value       = azurerm_mssql_server.main.name
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Name of the SQL Database"
  value       = azurerm_mssql_database.main.name
}

# Storage Account
output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "storage_account_primary_endpoint" {
  description = "Primary endpoint of the storage account"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

# App Services
output "backend_app_service_name" {
  description = "Name of the backend App Service"
  value       = azurerm_linux_web_app.backend.name
}

output "backend_app_service_url" {
  description = "URL of the backend App Service"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_static_app_name" {
  description = "Name of the frontend Static Web App"
  value       = azurerm_static_site.frontend.name
}

output "frontend_static_app_url" {
  description = "URL of the frontend Static Web App"
  value       = "https://${azurerm_static_site.frontend.default_host_name}"
}

# Key Vault
output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

# Application Insights
output "application_insights_name" {
  description = "Name of Application Insights"
  value       = var.enable_application_insights ? azurerm_application_insights.main[0].name : ""
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = var.enable_application_insights ? azurerm_application_insights.main[0].instrumentation_key : ""
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = var.enable_application_insights ? azurerm_application_insights.main[0].connection_string : ""
  sensitive   = true
}

# Deployment Information
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    resource_group       = azurerm_resource_group.main.name
    backend_url          = "https://${azurerm_linux_web_app.backend.default_hostname}"
    frontend_url         = "https://${azurerm_static_site.frontend.default_host_name}"
    sql_server           = azurerm_mssql_server.main.fully_qualified_domain_name
    sql_database         = azurerm_mssql_database.main.name
    storage_account      = azurerm_storage_account.main.name
    key_vault            = azurerm_key_vault.main.name
    application_insights = var.enable_application_insights ? azurerm_application_insights.main[0].name : "disabled"
  }
}
