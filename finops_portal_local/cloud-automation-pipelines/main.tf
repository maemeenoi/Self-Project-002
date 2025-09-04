// Terraform configuration for the FinOps portal infrastructure

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">=3.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

// Resource group
resource "azurerm_resource_group" "finops" {
  name     = var.resource_group_name
  location = var.location
}

// App Service Plan for backend and frontend
resource "azurerm_app_service_plan" "finops" {
  name                = "finops-plan"
  location            = azurerm_resource_group.finops.location
  resource_group_name = azurerm_resource_group.finops.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Basic"
    size = "B1"
  }
}

// Backend App Service
resource "azurerm_linux_web_app" "backend" {
  name                = "finops-backend"
  location            = azurerm_resource_group.finops.location
  resource_group_name = azurerm_resource_group.finops.name
  service_plan_id     = azurerm_app_service_plan.finops.id

  site_config {
    linux_fx_version = "NODE|18-lts"
  }

  app_settings = {
    NODE_ENV   = "production"
    DB_HOST    = var.database_server
    DB_NAME    = var.database_name
    DB_USER    = var.database_user
    DB_PASS    = var.database_password
    JWT_SECRET = var.jwt_secret
  }
}

// Frontend App Service
resource "azurerm_linux_web_app" "frontend" {
  name                = "finops-frontend"
  location            = azurerm_resource_group.finops.location
  resource_group_name = azurerm_resource_group.finops.name
  service_plan_id     = azurerm_app_service_plan.finops.id

  site_config {
    linux_fx_version = "NODE|18-lts"
  }

  app_settings = {
    NODE_ENV    = "production"
    API_BASE_URL = "https://${azurerm_linux_web_app.backend.default_site_hostname}"
  }
}

// Storage account for uploaded cost files
resource "azurerm_storage_account" "costdata" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.finops.name
  location                 = azurerm_resource_group.finops.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

// Azure SQL server
resource "azurerm_mssql_server" "db" {
  name                         = var.sql_server_name
  resource_group_name          = azurerm_resource_group.finops.name
  location                     = azurerm_resource_group.finops.location
  version                      = "12.0"
  administrator_login          = var.database_user
  administrator_login_password = var.database_password

  tags = {
    environment = var.environment
  }
}

// Azure SQL database
resource "azurerm_mssql_database" "db" {
  name      = var.database_name
  server_id = azurerm_mssql_server.db.id
  sku_name  = "S0"
}
