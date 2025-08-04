variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "Australia East"
}

variable "subscription_id" {
  description = "The Azure subscription ID where resources will be created"
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
  default     = "rg-assessment-pilot"
}

variable "virtual_network_name" {
  description = "The name of the virtual network"
  type        = string
  default     = "vnet-makestuffgo-002"
}

variable "storage_account_name" {
  description = "The name of the storage account"
  type        = string
  default     = "rg-assessment-pilot-002"
}

variable "sql_server_name" {
  description = "The name of the SQL server"
  type        = string
  default     = "sql-makestuffgo-002"
}

variable "sql_database_name" {
  description = "The name of the SQL database"
  type        = string
  default     = "sqldb-assesment"
}

variable "sql_administrator_login" {
  description = "SQL Server administrator login username"
  type        = string
  default     = "sqladmin"
}

variable "sql_administrator_password" {
  description = "SQL Server administrator password"
  type        = string
  sensitive   = true
}

variable "sql_minimum_tls_version" {
  description = "Minimum TLS version for SQL Server"
  type        = string
  default     = "1.2"
}

variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "pilot"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "assessment-pilot"
}

variable "storage_account_tier" {
  description = "Storage account tier"
  type        = string
  default     = "Standard"
}

variable "storage_replication_type" {
  description = "Storage account replication type"
  type        = string
  default     = "LRS"
}

variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.69.69.0/24"]
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "pilot"
    Project     = "assessment-pilot"
    CreatedBy   = "Terraform"
  }
}

variable "sql_azuread_administrator_object_id" {
  description = "The Azure AD administrator object ID for SQL Server"
  type        = string
}

variable "sql_azuread_administrator_tenant_id" {
  description = "The Azure AD administrator tenant ID for SQL Server"
  type        = string
}

variable "sql_azuread_administrator_login_username" {
  description = "The Azure AD administrator login username for SQL Server"
  type        = string
}

variable "private_dns_zone_link_name" {
  description = "Existing name of the VNet link for the imported DNS zone"
  type        = string
}
