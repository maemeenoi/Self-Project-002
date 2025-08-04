variable "name" {
  description = "Name of the private endpoint"
  type        = string
}

variable "location" {
  description = "Azure region for the private endpoint"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet where private endpoint will be created"
  type        = string
}

variable "private_connection_resource_id" {
  description = "Resource ID of the service to connect to"
  type        = string
}

variable "is_manual_connection" {
  description = "Does the private endpoint require manual approval"
  type        = bool
  default     = false
}

variable "subresource_names" {
  description = "List of subresource names for the private endpoint"
  type        = list(string)
}

variable "private_dns_zone_group" {
  description = "Private DNS zone group configuration"
  type = object({
    name                 = string
    private_dns_zone_ids = list(string)
  })
  default = null
}

variable "tags" {
  description = "Tags to assign to the private endpoint"
  type        = map(string)
  default     = {}
}

variable "custom_network_interface_name" {
  description = "Custom name for the network interface of the private endpoint"
  type        = string
  default     = null

}



