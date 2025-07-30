# SQL Database
output "sql_server_name" {
  value       = module.sql_database.sql_server_name
  description = "Name of the Azure SQL Server"
}

output "sql_database_name" {
  value       = module.sql_database.sql_database_name
  description = "Name of the Azure SQL Database"
}

output "sql_server_fqdn" {
  value       = module.sql_database.sql_server_fqdn
  description = "Fully Qualified Domain Name of SQL Server"
}

# # App Service
# output "app_service_url" {
#   value       = module.app_service.app_service_url
#   description = "Public URL of the deployed app"
# }

# # Azure OpenAI
# output "openai_account_name" {
#   value       = module.openai.openai_account_name
#   description = "Name of the Azure OpenAI account"
# }

# output "openai_deployment_name" {
#   value       = module.openai.deployment_name
#   description = "Name of the OpenAI deployment"
# }

# # Azure AI Search
# output "search_service_name" {
#   value       = module.ai_search.search_service_name
#   description = "Name of the Azure AI Search instance"
# }

# output "search_service_endpoint" {
#   value       = module.ai_search.search_service_endpoint
#   description = "Endpoint for Azure AI Search"
#   sensitive   = true
# }

# # Azure Key Vault
# output "key_vault_uri" {
#   value       = module.key_vault.key_vault_uri
#   description = "Base URI of the Azure Key Vault"
# }

# # Optional: Useful when debugging or copying into config
# output "sql_admin_login" {
#   value       = var.sql_admin_username
#   description = "SQL Server admin login name"
#   sensitive   = true
# }

# output "openai_model_version" {
#   value       = var.openai_model_version
#   description = "OpenAI model version in use"
# }
