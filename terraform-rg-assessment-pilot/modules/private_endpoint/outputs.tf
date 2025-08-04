output "id" {
  description = "ID of the private endpoint"
  value       = azurerm_private_endpoint.this.id
}

output "name" {
  description = "Name of the private endpoint"
  value       = azurerm_private_endpoint.this.name
}

output "private_service_connection" {
  description = "Private service connection details"
  value       = azurerm_private_endpoint.this.private_service_connection
}

output "network_interface" {
  description = "Network interface details"
  value       = azurerm_private_endpoint.this.network_interface
}

output "custom_dns_configs" {
  description = "Custom DNS configurations"
  value       = azurerm_private_endpoint.this.custom_dns_configs
}
