output "backend_url" {
  description = "Default hostname for the backend application"
  value       = azurerm_linux_web_app.backend.default_site_hostname
}

output "frontend_url" {
  description = "Default hostname for the frontend application"
  value       = azurerm_linux_web_app.frontend.default_site_hostname
}