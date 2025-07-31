variable "prefix" {
  description = "Naming prefix for resources (e.g., makestuffgo)"
  type        = string
  default     = "makestuffgo"
}

variable "resource_group_name" {
  description = "Resource group to deploy to"
  type        = string
  default     = "rg-terraform-001"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Australia East"
}

variable "admin_username" {
  description = "SQL admin username"
  type        = string
  sensitive   = true

}

variable "admin_password" {
  description = "SQL admin password"
  type        = string
  sensitive   = true

}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
