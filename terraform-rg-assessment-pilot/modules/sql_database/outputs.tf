output "sql_server_name" {
  description = "Name of the Azure SQL Server"
  value       = azurerm_mssql_server.this.name
}

output "sql_database_name" {
  description = "Name of the Azure SQL Database"
  value       = azurerm_mssql_database.this.name
}

output "sql_server_fqdn" {
  description = "Fully Qualified Domain Name of the Azure SQL Server"
  value       = azurerm_mssql_server.this.fully_qualified_domain_name
}



