output "id" {
  description = "ID of the private DNS zone"
  value       = azurerm_private_dns_zone.this.id
}

output "name" {
  description = "Name of the private DNS zone"
  value       = azurerm_private_dns_zone.this.name
}

output "number_of_record_sets" {
  description = "Number of record sets in the DNS zone"
  value       = azurerm_private_dns_zone.this.number_of_record_sets
}

output "max_number_of_record_sets" {
  description = "Maximum number of record sets"
  value       = azurerm_private_dns_zone.this.max_number_of_record_sets
}
