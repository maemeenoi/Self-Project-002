variable "prefix" {
  type        = string
  description = "Resource prefix"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "tenant_id" {
  type        = string
  description = "Azure tenant ID"
}

variable "admin_object_id" {
  type        = string
  description = "Azure user or identity object ID for access policy"
}

variable "openai_api_key" {
  type        = string
  sensitive   = true
  description = "Secret: OpenAI API Key"
}

variable "sql_admin_password" {
  type        = string
  sensitive   = true
  description = "Secret: SQL Admin Password"
}

variable "tags" {
  type    = map(string)
  default = {}
}
