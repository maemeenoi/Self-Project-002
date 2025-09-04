terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  # Backend configuration for remote state
  backend "azurerm" {
    # These values should be set via backend config file or environment variables
    # resource_group_name  = "rg-finops-terraform-state"
    # storage_account_name = "stfinopsterraformstate"
    # container_name       = "terraform-state"
    # key                  = "finops-portal.tfstate"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }

  }
}
