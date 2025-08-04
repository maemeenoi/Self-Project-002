variable "name" {
  description = "Name of the private DNS zone"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "virtual_network_id" {
  description = "ID of the virtual network to link to"
  type        = string
  default     = null
}

variable "registration_enabled" {
  description = "Enable auto registration in the DNS zone"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to assign to the private DNS zone"
  type        = map(string)
  default     = {}
}

variable "private_dns_zone_link_name" {
  description = "Name of the virtual network link (must match imported name)"
  type        = string
}
