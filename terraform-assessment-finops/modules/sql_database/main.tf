resource "azurerm_mssql_server" "this" {
  name                         = "${var.prefix}-sqlserver"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.admin_username
  administrator_login_password = var.admin_password

  tags = var.tags
}

resource "azurerm_mssql_database" "this" {
  name                        = "sqldb-assessment"
  server_id                   = azurerm_mssql_server.this.id
  sku_name                    = "Basic"
  collation                   = "SQL_Latin1_General_CP1_CI_AS"
  max_size_gb                 = 2
  auto_pause_delay_in_minutes = 60

  tags = var.tags
}

resource "azurerm_mssql_firewall_rule" "allow_all_azure" {
  name             = "AllowAllAzure"
  server_id        = azurerm_mssql_server.this.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

