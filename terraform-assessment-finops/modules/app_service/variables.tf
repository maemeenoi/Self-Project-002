variable "prefix" {
  type        = string
  description = "Prefix for naming"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "resource_group_name" {
  type        = string
  description = "Target resource group"
}

variable "tags" {
  type    = map(string)
  default = {}
}
