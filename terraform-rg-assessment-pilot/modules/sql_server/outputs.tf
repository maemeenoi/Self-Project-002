output "id" {
  description = "ID of the SQL Server"
  value       = azurerm_mssql_server.this.id
}

output "name" {
  description = "Name of the SQL Server"
  value       = azurerm_mssql_server.this.name
}

output "fully_qualified_domain_name" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.this.fully_qualified_domain_name
}

output "administrator_login" {
  description = "Administrator login of the SQL Server"
  value       = azurerm_mssql_server.this.administrator_login
}

output "version" {
  description = "Version of the SQL Server"
  value       = azurerm_mssql_server.this.version
}
