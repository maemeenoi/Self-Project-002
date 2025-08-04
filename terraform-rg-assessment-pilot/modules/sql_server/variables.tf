variable "name" {
  description = "Name of the SQL Server"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for the SQL Server"
  type        = string
}

variable "sql_version" {
  description = "Version of the SQL Server"
  type        = string
  default     = "12.0"
}

variable "administrator_login" {
  description = "Administrator login for the SQL Server"
  type        = string
}

variable "administrator_login_password" {
  description = "Administrator password for the SQL Server"
  type        = string
  default     = null
}

variable "minimum_tls_version" {
  description = "Minimum TLS version for the SQL Server"
  type        = string
  default     = "1.2"
}

variable "public_network_access_enabled" {
  description = "Enable public network access"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to assign to the SQL Server"
  type        = map(string)
  default     = {}
}

variable "sql_azuread_administrator_object_id" {
  description = "Object ID of the Azure AD administrator for the SQL Server"
  type        = string
}

variable "sql_azuread_administrator_tenant_id" {
  description = "Tenant ID of the Azure AD administrator for the SQL Server"
  type        = string
}

variable "sql_azuread_administrator_login_username" {
  description = "Login username for the Azure AD administrator"
  type        = string
  sensitive   = true
}
