# FinOps Portal - Complete Cloud Cost Management Solution

A comprehensive Financial Operations (FinOps) portal for cloud cost management and optimization, built with modern technologies and following industry best practices.

## 🏗️ Architecture Overview

This solution is distributed across four main repositories, each handling a specific concern:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Frontend (Next.js) │  │  Backend (Node.js)  │  │   AI Services       │  │  Infrastructure     │
│                     │  │                     │  │   (Future)          │  │   (Terraform)       │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ • React Dashboard   │  │ • REST API          │  │ • Cost Analytics    │  │ • Azure Resources   │
│ • Cost Visualizations│ │ • Authentication    │  │ • ML Predictions    │  │ • CI/CD Pipelines   │
│ • File Upload UI    │  │ • File Processing   │  │ • Natural Language  │  │ • Security Config   │
│ • Export Features   │  │ • Database Layer    │  │ • Recommendations   │  │ • Monitoring Setup  │
│ • Responsive Design │  │ • FOCUS Schema      │  │ • Anomaly Detection │  │ • Backup Strategy   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## 📁 Repository Structure

```
makestuffgo-project-v1/
├── cloud-automation-frontend/     # Next.js React application
├── cloud-automation-backend/      # Node.js Express API
├── cloud-automation-aiservices/   # AI/ML services (planned)
├── cloud-automation-pipelines/    # Infrastructure & CI/CD
└── project.md                     # Original project specification
```

## ✨ Features

### 🔐 Authentication & Security

- Email/password authentication with JWT
- Role-based access control (user, admin, superadmin)
- Secure password hashing with bcrypt
- Azure AD integration ready

### 📊 Dashboard & Analytics

- **Cost Summary Cards**: Total costs, growth metrics, service counts
- **Interactive Charts**: Bar charts, line graphs, category breakdowns
- **Service Analysis**: Top services by cost with percentages
- **Trend Analysis**: Monthly cost trends with growth indicators
- **Category Insights**: Cost breakdown by resource categories

### 📁 Data Management

- **File Upload**: Support for CSV, JSON, and Excel files
- **FOCUS Schema**: Automatic normalization to FinTechOps Open Cost and Usage Specification
- **Data Processing**: Asynchronous file processing with status tracking
- **Data Validation**: Input validation and error handling

### 📈 Visualization & Reporting

- **Real-time Charts**: Built with Chart.js and React
- **Export Capabilities**: PDF and CSV export functionality
- **Filtering**: Date range, service, and category filters
- **Responsive Design**: Mobile-friendly interface

### 🔄 Data Processing Pipeline

- **Multi-format Support**: CSV, JSON, Excel file parsing
- **Automatic Normalization**: Convert various cost formats to standardized schema
- **Batch Processing**: Handle large files efficiently
- **Error Recovery**: Robust error handling and retry mechanisms

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (optional)

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Azure SQL Server with mssql driver
- **Authentication**: JWT with bcryptjs
- **File Processing**: Multer, csv-parser, xlsx
- **Validation**: Joi for input validation

### Infrastructure

- **Cloud Provider**: Microsoft Azure
- **Container Orchestration**: Azure App Service
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage
- **CDN**: Azure Static Web Apps
- **Monitoring**: Application Insights
- **Security**: Azure Key Vault

### DevOps

- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Security Scanning**: Trivy
- **Cost Management**: Infracost
- **Code Quality**: ESLint, TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Azure subscription
- Terraform 1.6+
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd makestuffgo-project-v1
```

### 2. Deploy Infrastructure

```bash
cd cloud-automation-pipelines/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration
terraform init
terraform apply
```

### 3. Setup Backend

```bash
cd ../cloud-automation-backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### 4. Setup Frontend

```bash
cd ../cloud-automation-frontend
npm install
cp .env.local.example .env.local
# Configure environment variables
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📋 Environment Configuration

### Development

```bash
# Backend (.env)
NODE_ENV=development
PORT=3001
DB_SERVER=localhost
JWT_SECRET=your-secret-key

# Frontend (.env.local)
NEXTAUTH_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### Production

```bash
# Set via Azure App Service configuration
NODE_ENV=production
DB_SERVER=your-azure-sql-server.database.windows.net
DB_ENCRYPT=true
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Users table
Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) DEFAULT 'user',
  created_at DATETIME2 DEFAULT GETDATE()
)

-- Cost uploads tracking
CostUploads (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT FOREIGN KEY REFERENCES Users(id),
  filename NVARCHAR(255) NOT NULL,
  status NVARCHAR(50) DEFAULT 'processing',
  records_processed INT DEFAULT 0,
  upload_date DATETIME2 DEFAULT GETDATE()
)

-- Normalized cost data (FOCUS compliant)
NormalizedCost (
  id INT IDENTITY(1,1) PRIMARY KEY,
  upload_id INT FOREIGN KEY REFERENCES CostUploads(id),
  service_name NVARCHAR(255) NOT NULL,
  cost_amount DECIMAL(18,4) NOT NULL,
  currency NVARCHAR(10) DEFAULT 'USD',
  time_period DATE NOT NULL,
  category NVARCHAR(100),
  region NVARCHAR(100),
  resource_id NVARCHAR(255),
  tags NVARCHAR(MAX)
)
```

## 🔒 Security Features

### Authentication & Authorization

- JWT-based stateless authentication
- Role-based access control
- Secure password storage with bcrypt
- Session management

### Data Security

- SQL injection prevention with parameterized queries
- Input validation and sanitization
- File upload restrictions and validation
- HTTPS/TLS encryption in transit

### Infrastructure Security

- Azure Key Vault for secrets management
- Network security groups and firewall rules
- Private endpoints for database access
- Regular security scanning with Trivy

## 📊 Monitoring & Observability

### Application Monitoring

- Application Insights integration
- Custom telemetry and metrics
- Performance monitoring
- Error tracking and alerting

### Infrastructure Monitoring

- Azure Monitor integration
- Resource health monitoring
- Cost and billing alerts
- Availability monitoring

## 🎯 Future Enhancements (AI Services)

### Phase 1: Smart Analytics

- [ ] Automated anomaly detection in cost data
- [ ] Predictive cost forecasting using ML models
- [ ] Intelligent resource optimization recommendations
- [ ] Automated budget variance analysis

### Phase 2: Natural Language Interface

- [ ] ChatGPT-style query interface for cost data
- [ ] Natural language to SQL conversion
- [ ] Automated report generation from text prompts
- [ ] Voice-activated cost queries

### Phase 3: Advanced AI Features

- [ ] Computer vision for cloud architecture analysis
- [ ] Automated FinOps policy recommendations
- [ ] Multi-cloud cost optimization
- [ ] Intelligent resource lifecycle management

## 🧪 Testing Strategy

### Unit Tests

```bash
# Backend tests
cd cloud-automation-backend
npm test

# Frontend tests
cd cloud-automation-frontend
npm test
```

### Integration Tests

- API endpoint testing
- Database integration tests
- File upload/processing tests
- Authentication flow tests

### End-to-End Tests

- Complete user workflows
- Cross-browser compatibility
- Performance testing
- Security testing

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
```

### Upload Endpoints

```
POST /api/upload/cost-data    # Upload cost data file
GET  /api/upload/status/:id   # Check upload status
GET  /api/upload/uploads      # List user uploads
```

### Dashboard Endpoints

```
GET  /api/dashboard/summary       # Cost summary
GET  /api/dashboard/top-services  # Top services by cost
GET  /api/dashboard/trends        # Monthly trends
GET  /api/dashboard/categories    # Category breakdown
GET  /api/dashboard/costs         # Filtered cost data
GET  /api/dashboard/export/csv    # Export as CSV
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch from main
2. Implement changes with tests
3. Submit pull request
4. Code review and approval
5. Automated deployment to staging
6. Manual promotion to production

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Test coverage requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [Frontend README](cloud-automation-frontend/README.md)
- [Backend README](cloud-automation-backend/README.md)
- [Infrastructure README](cloud-automation-pipelines/README.md)

### Getting Help

- Create an issue for bugs or feature requests
- Check existing documentation and FAQs
- Review troubleshooting guides

---

**Built with ❤️ for the FinOps community**
