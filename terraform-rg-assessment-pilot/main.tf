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

# Workspaces
# dev, test, prod

# Resource Group import
module "resource_group_import" {
  source   = "./modules/resource_group"
  name     = "rg-assessment-pilot"
  location = var.location
}

# Import Virtual Network 
module "virtual_network_import" {
  source              = "./modules/virtual_network"
  name                = "vnet-makestuffgo-001"
  resource_group_name = module.resource_group_import.name
  location            = module.resource_group_import.location
  address_space       = ["10.69.69.0/24"]

  # Add subnets configuration
  subnets = {
    "sql_ai" = {
      address_prefix = "10.69.69.0/24"
    }
  }

  tags = {}
}

# Import Storage Account
module "storage_account_import" {
  source                          = "./modules/storage_account"
  name                            = "rgassessmentpilot91c5"
  resource_group_name             = module.resource_group_import.name
  location                        = module.resource_group_import.location
  account_tier                    = var.storage_account_tier
  account_replication_type        = var.storage_replication_type
  allow_nested_items_to_be_public = true
  default_to_oauth_authentication = true
  tags                            = {}
}

# Import SQL Server
module "sql_server_import" {
  source                                   = "./modules/sql_server"
  name                                     = "sql-makestuffgo-001"
  resource_group_name                      = module.resource_group_import.name
  location                                 = module.resource_group_import.location
  sql_version                              = "12.0"
  administrator_login                      = var.sql_administrator_login
  administrator_login_password             = var.sql_administrator_password
  minimum_tls_version                      = var.sql_minimum_tls_version
  public_network_access_enabled            = true
  sql_azuread_administrator_object_id      = var.sql_azuread_administrator_object_id
  sql_azuread_administrator_tenant_id      = var.sql_azuread_administrator_tenant_id
  sql_azuread_administrator_login_username = var.sql_azuread_administrator_login_username
  tags                                     = {}
}

# Import SQL Database
module "sql_database_import" {
  source               = "./modules/sql_database"
  name                 = "sqldb-assesment"
  server_id            = module.sql_server_import.id
  collation            = "SQL_Latin1_General_CP1_CI_AS"
  storage_account_type = "Local"
  max_size_gb          = 5
  sku_name             = "S0"
  tags                 = {}
}

# Import Private DNS Zone 
module "private_dns_zone_database" {
  source                     = "./modules/private_dns_zone"
  name                       = "privatelink.database.windows.net"
  private_dns_zone_link_name = var.private_dns_zone_link_name
  resource_group_name        = module.resource_group_import.name
  virtual_network_id         = module.virtual_network_import.id
  tags                       = {}
}

# Import Private Endpoint for SQL
module "private_endpoint_sql" {
  source                         = "./modules/private_endpoint"
  name                           = "pe-sql-makestuffgo-001"
  resource_group_name            = module.resource_group_import.name
  location                       = module.resource_group_import.location
  subnet_id                      = "/subscriptions/7c0e8c21-980c-4a6a-9f75-ef24d677baf8/resourceGroups/rg-assessment-pilot/providers/Microsoft.Network/virtualNetworks/vnet-makestuffgo-001/subnets/sql_ai"
  private_connection_resource_id = module.sql_server_import.id
  subresource_names              = ["sqlServer"]

  private_dns_zone_group = {
    name                 = "default"
    private_dns_zone_ids = [module.private_dns_zone_database.id]
  }
  custom_network_interface_name = "pe-sql-makestuffgo-001-nic"

  tags = {}
}
