resource "azurerm_cognitive_account" "this" {
  name                = "${var.prefix}-openai"
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "OpenAI"
  sku_name            = "S0"

  tags = var.tags
}

resource "azurerm_cognitive_deployment" "this" {
  name                 = var.deployment_name
  cognitive_account_id = azurerm_cognitive_account.this.id
  model {
    format  = "OpenAI"
    name    = var.model_name    # e.g., "gpt-4"
    version = var.model_version # e.g., "1106-preview"
  }

  scale {
    type = "Standard"
  }
}
