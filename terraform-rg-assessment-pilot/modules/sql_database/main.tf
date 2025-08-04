resource "azurerm_mssql_database" "this" {
  name                 = var.name
  server_id            = var.server_id
  collation            = var.collation
  max_size_gb          = var.max_size_gb
  sku_name             = var.sku_name
  storage_account_type = var.storage_account_type

  tags = var.tags

  # Prevent accidental data loss
  lifecycle {
    prevent_destroy = true
  }
}

