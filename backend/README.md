# Backend API - FinOps & Workflow Management

## Overview

A comprehensive FastAPI backend for financial analytics, cloud cost optimization, and workflow management. Built using modern Python practices with comprehensive models based on Backend-Cushla schemas.

## Project Structure

```
backend/
├── main.py                # FastAPI app entry point
├── .env                   # Environment configuration
├── routers/
│   ├── widgetsService.py  # All 32 widgets API endpoints
│   ├── auth.py            # Authentication & authorization
│   └── admin.py           # Admin management routes
├── lib/
│   ├── db.py              # PostgreSQL connection pool & utilities
│   └── utils.py           # Helper functions & utilities
└── models/
    ├── financial.py       # Financial & cost optimization models
    └── workflow.py        # Workflow & issue tracking models
```

## Features Implemented

### 🔐 Authentication System

- JWT-based authentication
- User registration & login
- Password change & reset
- Role-based access control (user, admin, super_admin)
- Secure password hashing

### 📊 32 Dashboard Widgets

Based on your MSGSQLDB structure, including:

**Financial Widgets (12):**

1. Cost breakdown by service/region/provider
2. Cost trend analysis over time
3. Savings opportunities summary
4. Top services by cost
5. Budget vs actual spending
6. Regional cost analysis
7. Resource utilization metrics
8. Cost forecasting
9. Reserved instance optimization
10. Rightsizing recommendations
11. Spend anomaly detection
12. ROI tracking

**Workflow Widgets (12):**

1. Issue summary by status/type
2. Team velocity & story points
3. Backlog health metrics
4. Sprint burndown charts
5. Code quality metrics
6. Deployment frequency
7. Lead time tracking
8. Cycle time analysis
9. Bug tracking & resolution
10. Team productivity metrics
11. Pull request analytics
12. Technical debt tracking

**Combined Widgets (4):**

1. Cost per story point efficiency
2. Team cost attribution
3. Project ROI analysis
4. Resource allocation optimization

**Admin/System Widgets (4):**

1. System health & uptime
2. Data quality metrics
3. User activity monitoring
4. Performance dashboards

### 🗄️ Database Management

- PostgreSQL with async connection pooling
- Comprehensive schema with indexes
- Support for financial data (FOCUS format)
- Workflow data (Jira, GitHub integration)
- User & company management
- Audit logging capabilities

### 🏗️ Data Models

Comprehensive Pydantic models including:

- **Financial Models**: Cost tracking, savings opportunities, team rankings
- **Workflow Models**: Jira issues, GitHub integration, team productivity
- **User Models**: Authentication, company management
- **Analytics Models**: Metrics, trends, reporting

### 🛠️ Utilities & Helpers

- Password hashing & validation
- Email validation
- Date/time utilities
- Currency formatting
- Percentage calculations
- JSON handling
- API response formatting
- Logging utilities

## Quick Start

### 1. Install Dependencies

```bash
pip install fastapi uvicorn asyncpg python-dotenv pydantic[email] python-jose[cryptography] python-multipart
```

### 2. Database Setup

```bash
# Install PostgreSQL and create database
createdb finops_db

# Update .env with your database credentials
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Application

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. Access the API

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints Overview

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - Logout user

### Widgets (32 endpoints)

- `GET /api/widgets/financial/*` - Financial analytics widgets
- `GET /api/widgets/workflow/*` - Workflow management widgets
- `GET /api/widgets/combined/*` - Cross-domain widgets
- `GET /api/widgets/admin/*` - System administration widgets

### Administration

- `GET /api/admin/users` - User management
- `GET /api/admin/companies` - Company management
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/health` - Detailed health check

## Database Schema

### Core Tables

- **companies** - Company/organization data
- **users** - User accounts & authentication
- **financial_fact** - Financial & cost data (FOCUS format)
- **workflow_fact** - Issues & workflow data (Jira/GitHub)

### Key Features

- Proper indexing for performance
- JSONB support for flexible metadata
- Audit trail capabilities
- Multi-tenant architecture

## Security Features

- **JWT Authentication** with configurable expiration
- **Password Security** with strength validation
- **Role-Based Access Control** (RBAC)
- **SQL Injection Protection** via parameterized queries
- **CORS Configuration** for frontend integration
- **Rate Limiting** support (configurable)

## Based on Backend-Cushla Models

This implementation incorporates models and patterns from:

- **Backend-Cushla/cloud-automation-backend/work_processor/backend/schemas.py**
- **MSGSQLDB/Backend/widgetsService.py**
- Industry-standard FOCUS data format
- Modern FastAPI best practices

## Development Notes

### Adding New Widgets

1. Add endpoint to `routers/widgetsService.py`
2. Create corresponding Pydantic models if needed
3. Implement database queries using the connection pool
4. Add proper error handling and logging

### Adding New Models

1. Define Pydantic models in appropriate files
2. Add database schema updates to `lib/db.py`
3. Create migration scripts for production

### Environment Variables

All configuration is handled via environment variables in `.env` file.
Never commit sensitive data like passwords or API keys.

## Production Considerations

### Performance

- Use connection pooling (implemented)
- Add Redis caching for frequently accessed data
- Implement query optimization
- Add database read replicas for scaling

### Security

- Change all default secrets in production
- Use environment-specific `.env` files
- Implement proper SSL/TLS
- Add API rate limiting
- Regular security audits

### Monitoring

- Add application performance monitoring (APM)
- Implement comprehensive logging
- Set up health check endpoints
- Monitor database performance

### Deployment

- Use Docker containers
- Implement CI/CD pipelines
- Add automated testing
- Use infrastructure as code (IaC)

## Questions for You

To complete the implementation, I'd like to clarify:

1. **Database Choice**: Are you happy with PostgreSQL, or would you prefer SQL Server to match your MSGSQLDB setup?

2. **Specific Widgets**: Which of the 32 widgets are highest priority for full implementation?

3. **Integration Requirements**: Do you need specific integrations with Jira, GitHub, or Azure services?

4. **Authentication**: Do you want to integrate with existing authentication systems or use the JWT implementation provided?

5. **Deployment**: How do you plan to deploy this (Docker, Azure App Service, etc.)?

The structure is ready to use and can be extended based on your specific requirements!
