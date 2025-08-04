output "id" {
  description = "ID of the SQL database"
  value       = azurerm_mssql_database.this.id
}

output "name" {
  description = "Name of the SQL database"
  value       = azurerm_mssql_database.this.name
}

output "server_id" {
  description = "ID of the SQL server"
  value       = azurerm_mssql_database.this.server_id
}

output "collation" {
  description = "Collation of the database"
  value       = azurerm_mssql_database.this.collation
}

output "max_size_gb" {
  description = "Maximum size of the database in GB"
  value       = azurerm_mssql_database.this.max_size_gb
}


