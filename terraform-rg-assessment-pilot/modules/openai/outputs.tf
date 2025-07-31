output "openai_account_name" {
  value = azurerm_cognitive_account.this.name
}

output "openai_account_id" {
  value = azurerm_cognitive_account.this.id
}

output "deployment_name" {
  value = azurerm_cognitive_deployment.this.name
}
