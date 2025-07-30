resource "azurerm_search_service" "this" {
  name                = "${var.prefix}-search"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "basic"
  partition_count     = 1
  replica_count       = 1

  tags = var.tags
}
