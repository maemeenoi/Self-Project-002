# Terraform Azure Infrastructure Deployment

This project deploys Azure infrastructure across multiple environments (dev, test, prod) and subscriptions.

## Prerequisites

1. **Azure CLI installed and authenticated**

   ```bash
   az login
   ```

2. **Terraform installed** (>= 1.4.0)

3. **Appropriate Azure permissions** for the target subscriptions

## Project Structure

- `main.tf` - Main Terraform configuration
- `variables.tf` - Variable definitions
- `outputs.tf` - Output values
- `*.tfvars` - Environment-specific variable files
- `modules/` - Reusable Terraform modules
- `deploy.sh` - Deployment automation script

## Setup Steps

### 1. Update Variable Files

Edit the environment-specific `.tfvars` files with your actual values:

- `dev.tfvars` - Development environment
- `test.tfvars` - Test environment
- `prod.tfvars` - Production environment

**Important**: Update these values in each `.tfvars` file:

- `subscription_id` - Your target Azure subscription ID
- `sql_azuread_administrator_object_id` - Your Azure AD object ID
- `sql_azuread_administrator_tenant_id` - Your Azure AD tenant ID
- `sql_azuread_administrator_login_username` - Your Azure AD username
- `sql_administrator_password` - Set via environment variable (see below)

### 2. Set Sensitive Variables

Set the SQL administrator password as an environment variable:

```bash
export TF_VAR_sql_administrator_password="YourSecurePassword123!"
```

### 3. Deploy to Different Environments

#### Using the deployment script (Recommended):

```bash
# Plan deployment to dev environment
./deploy.sh dev plan

# Apply to dev environment
./deploy.sh dev apply

# Plan deployment to test environment
./deploy.sh test plan

# Apply to test environment
./deploy.sh test apply

# Plan deployment to prod environment
./deploy.sh prod plan

# Apply to prod environment
./deploy.sh prod apply
```

#### Manual deployment:

```bash
# Select workspace
terraform workspace select dev  # or test, prod

# Initialize
terraform init

# Plan
terraform plan -var-file="dev.tfvars"

# Apply
terraform apply -var-file="dev.tfvars"
```

## Environment Differences

| Environment | Resource Group     | Storage Replication |
| ----------- | ------------------ | ------------------- |
| Dev         | rg-assessment-dev  | LRS                 |
| Test        | rg-assessment-test | LRS                 |
| Prod        | rg-assessment-prod | GRS                 |

## Workspaces

This project uses Terraform workspaces to manage multiple environments:

- `dev` - Development environment
- `test` - Test environment
- `prod` - Production environment

## Clean Up

To destroy resources:

```bash
# Destroy dev environment
./deploy.sh dev destroy

# Destroy test environment
./deploy.sh test destroy

# Destroy prod environment (be careful!)
./deploy.sh prod destroy
```

## Troubleshooting

1. **Authentication Issues**: Ensure you're logged into the correct Azure subscription

   ```bash
   az account show
   az account set --subscription "your-subscription-id"
   ```

2. **Permission Issues**: Ensure your account has Contributor access to the target subscription

3. **Resource Naming Conflicts**: Storage account names must be globally unique. Update the names in your `.tfvars` files if needed.

## Security Considerations

- SQL administrator password is passed via environment variable
- All resources use Azure AD authentication where possible
- Private endpoints are configured for secure database access
- Network access is restricted through virtual networks

## Next Steps

After deployment, you can:

1. Connect to your SQL databases through the private endpoints
2. Configure additional security policies
3. Set up monitoring and alerting
4. Implement backup strategies
