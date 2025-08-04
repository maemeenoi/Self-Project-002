
variable "name" {
  description = "Name of the SQL database"
  type        = string
}

variable "server_id" {
  description = "ID of the SQL server to create the database on"
  type        = string
}

variable "collation" {
  description = "Collation for the database"
  type        = string
  default     = "SQL_Latin1_General_CP1_CI_AS"
}

variable "license_type" {
  description = "License type for the database"
  type        = string
  default     = "LicenseIncluded"
}

variable "max_size_gb" {
  description = "Maximum size of the database in GB"
  type        = number
  default     = 2
}

variable "sku_name" {
  description = "SKU name for the database (S0, Basic, etc.)"
  type        = string
  default     = "S0"
}

variable "enclave_type" {
  description = "Enclave type for the database"
  type        = string
  default     = null
}

variable "storage_account_type" {
  description = "Storage account type for the database"
  type        = string
  default     = "Local"
}

variable "tags" {
  description = "Tags to assign to the database"
  type        = map(string)
  default     = {}
}
