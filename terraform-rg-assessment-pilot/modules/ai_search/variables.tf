variable "prefix" {
  type        = string
  description = "Naming prefix"
  default     = "makestuffgo"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "Australia East"
}

variable "resource_group_name" {
  type        = string
  description = "Azure Resource Group"
  default     = "rg-terraform-001"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}

}
