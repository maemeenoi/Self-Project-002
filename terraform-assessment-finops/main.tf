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

# Resource Group
module "resource_group" {
  source   = "./modules/resource_group"
  name     = "rg-terraform-001"
  location = "Australia East"
}

# Storage Accounts import
module "storage_import" {
  source              = "./modules/storage_account"
  name                = "stimportthis"
  account_tier        = "Standard"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags = {
    ProjectType = "test-terraform"
  }
}

# Deployed Storage Account
module "storage_deployed" {
  source              = "./modules/storage_account"
  name                = "stdeployed001"
  account_tier        = "Standard"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags = {
    ProjectType = "test-terraform"
  }
}

# resource "azurerm_resource_group" "this" {
#   name     = "rg-terraform-001"
#   location = "Australia East"
# }

# resource "azurerm_storage_account" "stimportthis" {
#   name                     = "stimportthis"
#   resource_group_name      = azurerm_resource_group.resource_group_import.name
#   location                 = azurerm_resource_group.resource_group_import.location
#   account_tier             = "Standard"
#   account_replication_type = "LRS"

#   allow_nested_items_to_be_public  = false
#   cross_tenant_replication_enabled = false

#   tags = {
#     ProjectType = "test-terraform"
#   }
# }

# resource "azurerm_storage_account" "stdeployed001" {
#   name                     = "stdeployed001"
#   resource_group_name      = azurerm_resource_group.this.name
#   location                 = azurerm_resource_group.this.location
#   account_tier             = "Standard"
#   account_replication_type = "LRS"

#   allow_nested_items_to_be_public  = false
#   cross_tenant_replication_enabled = false

#   tags = {
#     ProjectType = "test-terraform"
#   }

# }

# resource "azurerm_resource_group" "rg-assessment-pilot" {
#   name     = "rg-assessment-pilot"
#   location = "Australia East"
# }

# # SQL Database
# module "sql_database" {
#   source              = "./modules/sql_database"
#   prefix              = var.prefix
#   location            = var.location
#   resource_group_name = var.resource_group_name
#   admin_username      = var.sql_admin_username
#   admin_password      = var.sql_admin_password
#   tags                = var.tags
# }

# # Resource Group
# module "resource_group" {
#   source   = "./modules/resource_group"
#   name     = "rg-cloud-${var.environment}"
#   location = var.location
#   tags = {
#     environment = var.environment
#     project     = "cloud-assessment"
#   }
# }

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
