variable "prefix" {
  type        = string
  description = "Resource name prefix"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "resource_group_name" {
  type        = string
  description = "Azure Resource Group"
}

variable "deployment_name" {
  type        = string
  description = "OpenAI deployment name"
}

variable "model_name" {
  type        = string
  description = "OpenAI model name (e.g., gpt-4)"
}

variable "model_version" {
  type        = string
  description = "Model version (e.g., 1106-preview)"
}

variable "tags" {
  type    = map(string)
  default = {}
}
