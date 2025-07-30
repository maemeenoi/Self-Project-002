# ☁️ Terraform Azure Infrastructure – Cloud Assessment Platform

## 📖 Overview

This Terraform configuration deploys the full infrastructure for the **Cloud Maturity Assessment Platform**, including:

- Azure App Service (Next.js frontend)
- Azure SQL Database (client + assessment data)
- Azure OpenAI (GPT-4o model)
- Azure AI Search (RAG index)
- Azure Key Vault (secure secret storage)
- Optional: Admin-authenticated secrets access

## 📋 Prerequisites

- Azure CLI authenticated (`az login`)
- Terraform ≥ 1.4.0
- `terraform.tfvars` or secrets set via environment

## 🚀 Usage

```bash
# Set environment variables
source set-env-vars.sh

# Initialize project
terraform init

# Review plan
terraform plan -out=tfplan

# Deploy infrastructure
terraform apply tfplan
```

## 🔐 Secrets Management

Use .tfvars, TF*VAR* environment variables, or CI/CD secrets injection.

Do not commit terraform.tfvars.

## Project Structure

```bash
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.example
├── modules/
│   ├── sql_database/
│   ├── app_service/
│   ├── openai/
│   ├── ai_search/
│   ├── key_vault/
```

## 👩‍💻 Contributors

- Hamish (Morph iT Ltd)
- Jade Sainui

---
