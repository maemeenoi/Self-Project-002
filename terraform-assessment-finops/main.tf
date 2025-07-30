terraform {
  required_version = ">= 1.4.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80.0"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

# SQL Database
module "sql_database" {
  source              = "./modules/sql_database"
  prefix              = var.prefix
  location            = var.location
  resource_group_name = var.resource_group_name
  admin_username      = var.sql_admin_username
  admin_password      = var.sql_admin_password
  tags                = var.tags
}


# # App Service
# module "app_service" {
#   source              = "./modules/app_service"
#   prefix              = var.prefix
#   location            = var.location
#   resource_group_name = var.resource_group_name
#   tags                = var.tags
# }

# # Azure OpenAI
# module "openai" {
#   source              = "./modules/openai"
#   prefix              = var.prefix
#   location            = var.location
#   resource_group_name = var.resource_group_name
#   deployment_name     = var.openai_deployment_name
#   model_name          = var.openai_model_name
#   model_version       = var.openai_model_version
#   tags                = var.tags
# }

# # Azure AI Search
# module "ai_search" {
#   source              = "./modules/ai_search"
#   prefix              = var.prefix
#   location            = var.location
#   resource_group_name = var.resource_group_name
#   tags                = var.tags
# }

# # Key Vault
# module "key_vault" {
#   source              = "./modules/key_vault"
#   prefix              = var.prefix
#   location            = var.location
#   resource_group_name = var.resource_group_name
#   tenant_id           = var.tenant_id
#   admin_object_id     = var.admin_object_id
#   openai_api_key      = var.openai_api_key
#   sql_admin_password  = var.sql_admin_password
#   tags                = var.tags
# }
