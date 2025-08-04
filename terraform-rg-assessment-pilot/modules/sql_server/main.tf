resource "azurerm_mssql_server" "this" {
  name                          = var.name
  resource_group_name           = var.resource_group_name
  location                      = var.location
  version                       = var.sql_version
  administrator_login           = var.administrator_login
  administrator_login_password  = var.administrator_login_password
  minimum_tls_version           = var.minimum_tls_version
  public_network_access_enabled = var.public_network_access_enabled
  azuread_administrator {
    azuread_authentication_only = false
    object_id                   = var.sql_azuread_administrator_object_id
    tenant_id                   = var.sql_azuread_administrator_tenant_id
    login_username              = var.sql_azuread_administrator_login_username
  }
  tags = var.tags
}
