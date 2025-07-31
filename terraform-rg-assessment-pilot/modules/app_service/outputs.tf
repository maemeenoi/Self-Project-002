output "app_service_name" {
  value = azurerm_app_service.this.name
}

output "app_service_url" {
  value = azurerm_app_service.this.default_site_hostname
}
