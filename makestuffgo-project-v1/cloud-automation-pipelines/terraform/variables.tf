# Environment Configuration
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "finops-portal"
}

# Resource Configuration
variable "app_service_plan_sku" {
  description = "SKU for the App Service Plan"
  type        = string
  default     = "B1"
}

variable "sql_server_admin_login" {
  description = "Admin login for SQL Server"
  type        = string
  default     = "finopsadmin"
}

variable "sql_server_admin_password" {
  description = "Admin password for SQL Server"
  type        = string
  sensitive   = true
}

variable "sql_database_sku" {
  description = "SKU for SQL Database"
  type        = string
  default     = "Basic"
}

# Network Configuration
variable "allowed_ip_addresses" {
  description = "List of IP addresses allowed to access SQL Server"
  type        = list(string)
  default     = []
}

# Application Configuration
variable "frontend_custom_domain" {
  description = "Custom domain for frontend (optional)"
  type        = string
  default     = ""
}

variable "backend_custom_domain" {
  description = "Custom domain for backend API (optional)"
  type        = string
  default     = ""
}

# Monitoring and Logging
variable "enable_application_insights" {
  description = "Enable Application Insights for monitoring"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Log retention period in days"
  type        = number
  default     = 30
}

# Security Configuration
variable "enable_private_endpoints" {
  description = "Enable private endpoints for enhanced security"
  type        = bool
  default     = false
}

# Backup Configuration
variable "sql_backup_retention_days" {
  description = "SQL Database backup retention in days"
  type        = number
  default     = 7
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "FinOps Portal"
    Environment = "dev"
    Owner       = "Platform Team"
    CostCenter  = "IT"
  }
}
