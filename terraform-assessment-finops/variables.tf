
variable "prefix" {
  description = "Prefix for naming Azure resources"
  type        = string
  default     = "makestuffgo"
}

variable "location" {
  description = "Azure region to deploy to"
  type        = string
  default     = "Australia East"
}

variable "environment" {
  description = "Environment for resource naming (e.g., dev, prod)"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the existing resource group"
  type        = string
  default     = "rg-terrform-001"
}

variable "sql_admin_username" {
  description = "SQL Server admin login"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "SQL Server admin password"
  type        = string
  sensitive   = true
}

variable "openai_deployment_name" {
  description = "Deployment name for Azure OpenAI (e.g. gpt4-deploy-001)"
  type        = string
}

variable "openai_model_name" {
  description = "OpenAI model name (e.g. gpt-4)"
  type        = string
}

variable "openai_model_version" {
  description = "OpenAI model version (e.g. 1106-preview)"
  type        = string
}

variable "openai_api_key" {
  description = "Your OpenAI API key"
  type        = string
  sensitive   = true
}

variable "tenant_id" {
  description = "Azure tenant ID (for Key Vault access policy)"
  type        = string
}

variable "admin_object_id" {
  description = "Object ID of the admin user or service principal for Key Vault access"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    project = "cloud-assessment"
    owner   = "jade"
    env     = "dev"
  }
}
