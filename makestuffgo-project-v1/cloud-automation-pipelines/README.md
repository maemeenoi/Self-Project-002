# FinOps Portal - Cloud Automation Pipelines

This repository contains the infrastructure as code (Terraform) and CI/CD pipelines for the FinOps Portal.

## Repository Structure

```
cloud-automation-pipelines/
├── terraform/                 # Terraform infrastructure code
├── .github/workflows/         # GitHub Actions workflows
├── scripts/                   # Deployment and utility scripts
└── docs/                     # Documentation
```

## Infrastructure Components

### Azure Resources Deployed

- **Resource Group**: Container for all resources
- **App Service Plan**: Hosting plan for web applications
- **App Service (Backend)**: Node.js API backend
- **Static Web App (Frontend)**: React frontend hosting
- **SQL Server & Database**: Azure SQL for data storage
- **Storage Account**: File uploads and static content
- **Key Vault**: Secure secrets management
- **Application Insights**: Monitoring and telemetry

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   SQL Database  │
│ (Static Web App)│────│  (App Service)  │────│  (Azure SQL)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Storage Account │
                    │ (File Uploads)  │
                    └─────────────────┘
```

## Prerequisites

### Local Development

- [Terraform](https://www.terraform.io/downloads.html) >= 1.6.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Azure subscription with appropriate permissions

### CI/CD Pipeline

- GitHub repository with Actions enabled
- Azure Service Principal for authentication
- Infracost account (optional, for cost estimation)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd cloud-automation-pipelines
```

### 2. Configure Azure Authentication

```bash
# Login to Azure
az login

# Create a service principal for Terraform
az ad sp create-for-rbac --name "finops-portal-terraform" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID

# Note the output for GitHub secrets configuration
```

### 3. Configure Terraform Backend

```bash
# Create storage account for Terraform state
cd scripts
./setup-terraform-backend.sh
```

### 4. Deploy Infrastructure

```bash
cd terraform

# Copy and customize variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply
```

## Environment Configuration

### Development Environment

```hcl
# terraform/environments/dev.tfvars
environment = "dev"
location    = "East US"
app_service_plan_sku = "B1"
sql_database_sku     = "Basic"
enable_application_insights = true
```

### Staging Environment

```hcl
# terraform/environments/staging.tfvars
environment = "staging"
location    = "East US"
app_service_plan_sku = "S1"
sql_database_sku     = "S0"
enable_application_insights = true
enable_private_endpoints = false
```

### Production Environment

```hcl
# terraform/environments/prod.tfvars
environment = "prod"
location    = "East US"
app_service_plan_sku = "P1v2"
sql_database_sku     = "S2"
enable_application_insights = true
enable_private_endpoints = true
sql_backup_retention_days = 35
```

## CI/CD Pipeline

### GitHub Actions Workflows

#### Infrastructure Deployment (`infrastructure.yml`)

- **Trigger**: Push to main, PR to main, manual dispatch
- **Jobs**:
  - Terraform plan and validation
  - Security scanning with Trivy
  - Cost estimation with Infracost
  - Infrastructure deployment (main branch only)

#### Application Deployment (`deploy-apps.yml`)

- **Trigger**: Push to main, manual dispatch
- **Jobs**:
  - Build and deploy backend API
  - Build and deploy frontend app
  - Database migrations
  - Health checks

### Required GitHub Secrets

```bash
# Azure Authentication
AZURE_CLIENT_ID          # Service Principal App ID
AZURE_CLIENT_SECRET      # Service Principal Password
AZURE_SUBSCRIPTION_ID    # Azure Subscription ID
AZURE_TENANT_ID          # Azure Tenant ID

# Terraform State Storage
TF_STATE_RESOURCE_GROUP  # Resource group for state storage
TF_STATE_STORAGE_ACCOUNT # Storage account for state
TF_STATE_CONTAINER       # Container name for state

# Application Secrets
SQL_ADMIN_PASSWORD       # SQL Server admin password
JWT_SECRET              # JWT signing secret

# Optional
INFRACOST_API_KEY       # For cost estimation
```

## Security Configuration

### Network Security

- SQL Server firewall rules
- App Service IP restrictions
- Private endpoints (production)
- Key Vault access policies

### Secrets Management

- All secrets stored in Azure Key Vault
- Service-to-service authentication via Managed Identity
- No hardcoded credentials in code

### Security Scanning

- Trivy vulnerability scanning
- Terraform security validation
- Dependency scanning

## Monitoring and Logging

### Application Insights

- Application performance monitoring
- Custom telemetry and metrics
- Availability tests
- Alert rules

### Log Analytics

- Centralized logging
- Query and analytics capabilities
- Custom dashboards

## Cost Management

### Cost Optimization

- Right-sized resource SKUs per environment
- Auto-scaling configurations
- Reserved instances for production
- Storage lifecycle policies

### Cost Monitoring

- Budget alerts
- Cost anomaly detection
- Resource tagging for cost allocation
- Infracost integration for PR cost estimates

## Backup and Disaster Recovery

### SQL Database

- Automated backups
- Point-in-time restore
- Geo-redundant backups (production)

### Application Code

- Git repository backup
- Container image backups
- Infrastructure as Code versioning

## Troubleshooting

### Common Issues

#### Terraform State Lock

```bash
# Force unlock if needed (use with caution)
terraform force-unlock LOCK_ID
```

#### SQL Connection Issues

```bash
# Check firewall rules
az sql server firewall-rule list --server YOUR_SERVER --resource-group YOUR_RG

# Add your IP if needed
az sql server firewall-rule create --server YOUR_SERVER --resource-group YOUR_RG --name "MyIP" --start-ip-address YOUR_IP --end-ip-address YOUR_IP
```

#### App Service Deployment Failures

```bash
# Check deployment logs
az webapp log tail --name YOUR_APP_NAME --resource-group YOUR_RG

# Restart app service
az webapp restart --name YOUR_APP_NAME --resource-group YOUR_RG
```

### Support and Maintenance

- **Documentation**: Keep this README and inline comments updated
- **Monitoring**: Regular review of Application Insights and alerts
- **Updates**: Monthly review of Terraform provider versions
- **Security**: Quarterly security review and penetration testing

## Contributing

1. Create feature branch from main
2. Make changes and test locally
3. Submit PR with terraform plan output
4. Review and approve changes
5. Merge to main for automatic deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.
