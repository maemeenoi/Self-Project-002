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
  subscription_id            = var.subscription_id
}

# Workspaces
# dev, test, prod

# Resource Group
module "resource_group" {
  source   = "./modules/resource_group"
  name     = var.resource_group_name
  location = var.location
}

#  Virtual Network 
module "virtual_network" {
  source              = "./modules/virtual_network"
  name                = var.virtual_network_name
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  address_space       = ["10.69.69.0/24"]

  # Add subnets configuration
  subnets = {
    "sql_ai" = {
      address_prefix = "10.69.69.0/24"
    }
  }

  tags = {}
}

# Storage Account
module "storage_account" {
  source                          = "./modules/storage_account"
  name                            = var.storage_account_name
  resource_group_name             = module.resource_group.name
  location                        = module.resource_group.location
  account_tier                    = var.storage_account_tier
  account_replication_type        = var.storage_replication_type
  allow_nested_items_to_be_public = true
  default_to_oauth_authentication = true
  tags                            = {}
}

# SQL Server
module "sql_server" {
  source                                   = "./modules/sql_server"
  name                                     = var.sql_server_name
  resource_group_name                      = module.resource_group.name
  location                                 = module.resource_group.location
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

# SQL Database
module "sql_database" {
  source               = "./modules/sql_database"
  name                 = var.sql_database_name
  server_id            = module.sql_server.id
  collation            = "SQL_Latin1_General_CP1_CI_AS"
  storage_account_type = "Local"
  max_size_gb          = 5
  sku_name             = "S0"
  tags                 = {}
}

# Private DNS Zone
module "private_dns_zone_database" {
  source                     = "./modules/private_dns_zone"
  name                       = "privatelink.database.windows.net"
  private_dns_zone_link_name = var.private_dns_zone_link_name
  resource_group_name        = module.resource_group.name
  virtual_network_id         = module.virtual_network.id
  tags                       = {}
}

# Private Endpoint for SQL
module "private_endpoint_sql" {
  source                         = "./modules/private_endpoint"
  name                           = "pe-${var.sql_server_name}"
  resource_group_name            = module.resource_group.name
  location                       = module.resource_group.location
  subnet_id                      = module.virtual_network.subnet_ids["sql_ai"]
  private_connection_resource_id = module.sql_server.id
  subresource_names              = ["sqlServer"]

  private_dns_zone_group = {
    name                 = "default"
    private_dns_zone_ids = [module.private_dns_zone_database.id]
  }
  custom_network_interface_name = "pe-${var.sql_server_name}-nic"

  tags = {}
}
