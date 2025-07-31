output "search_service_name" {
  value = azurerm_search_service.this.name
}

output "search_service_id" {
  value = azurerm_search_service.this.id
}

output "search_service_endpoint" {
  value = azurerm_search_service.this.query_keys[0].key
}
