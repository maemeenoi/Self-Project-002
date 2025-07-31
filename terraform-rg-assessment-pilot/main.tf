terraform {
  required_version = "var.required_version"
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
  name     = "rg-assessment-pilot"
  location = "Australia East"
}
