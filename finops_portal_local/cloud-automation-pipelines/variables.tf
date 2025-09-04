variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "finops-rg"
}

variable "location" {
  description = "Azure location for resources"
  type        = string
  default     = "eastus"
}

variable "database_server" {
  description = "Hostname for Azure SQL server"
  type        = string
  default     = "finops-sql-server"
}

variable "sql_server_name" {
  description = "Name of the SQL server"
  type        = string
  default     = "finopssrv"
}

variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "finopsdb"
}

variable "database_user" {
  description = "Database administrator username"
  type        = string
  default     = "finopsadmin"
}

variable "database_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret used for signing JWTs"
  type        = string
  sensitive   = true
}

variable "storage_account_name" {
  description = "Name of the storage account for cost data"
  type        = string
  default     = "finopscostdata"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, prod)"
  type        = string
  default     = "dev"
}