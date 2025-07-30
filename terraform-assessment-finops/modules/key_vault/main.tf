resource "azurerm_key_vault" "this" {
  name                       = "${var.prefix}-kv"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  tenant_id                  = var.tenant_id
  sku_name                   = "standard"
  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  access_policy {
    tenant_id = var.tenant_id
    object_id = var.admin_object_id # Your user/service principal/managed identity

    secret_permissions = [
      "get", "list", "set", "delete"
    ]
  }

  tags = var.tags
}

# Optional: Store secrets
resource "azurerm_key_vault_secret" "openai_api_key" {
  name         = "OpenAI-API-Key"
  value        = var.openai_api_key
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_key_vault.this]
}

resource "azurerm_key_vault_secret" "sql_password" {
  name         = "SQL-Admin-Password"
  value        = var.sql_admin_password
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_key_vault.this]
}
