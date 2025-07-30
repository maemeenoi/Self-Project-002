resource "azurerm_app_service_plan" "this" {
  name                = "${var.prefix}-appserviceplan"
  location            = var.location
  resource_group_name = var.resource_group_name

  kind     = "Linux"
  reserved = true # Required for Linux

  sku {
    tier = "Basic"
    size = "B1"
  }

  tags = var.tags
}

resource "azurerm_app_service" "this" {
  name                = "${var.prefix}-webapp"
  location            = var.location
  resource_group_name = var.resource_group_name
  app_service_plan_id = azurerm_app_service_plan.this.id

  site_config {
    linux_fx_version = "NODE|18-lts"
    always_on        = true
    ftps_state       = "Disabled"
  }

  app_settings = {
    WEBSITE_NODE_DEFAULT_VERSION = "18.17.1"
    NODE_ENV                     = "production"
    # Add more as needed (like connection strings, OpenAI keys, etc.)
  }

  tags = var.tags
}
