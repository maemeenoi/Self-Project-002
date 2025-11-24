# Unified Cloud Automation Backend

Welcome to the backend service for our cloud automation platform. This FastAPI application handles cloud cost analysis, workflow processing from Jira and GitHub, and user authentication with company-based access control.

## What This Backend Does

This service provides APIs for:

- User authentication and role-based access control
- Cloud cost analysis and FOCUS format conversion
- Workflow data processing from Jira and GitHub integrations
- Company and user management
- System administration and monitoring

## Technology Stack

- **Framework**: FastAPI with Python 3.9+
- **Database**: Azure SQL Database with pyodbc driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **Storage**: Azure Blob Storage for file processing

## Getting Started

### Prerequisites

- Python 3.9 or higher
- Access to Azure SQL Database
- Git for version control

### Installation

1. **Clone the repository and navigate to the backend directory**:

```bash
cd cloud-automation-backend/unified_backend
```

2. **Set up a virtual environment** (highly recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate # On Windows
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the `unified_backend` directory with your database and application settings:

```bash
# Database Configuration
DB_HOST=your-sql-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_PORT=1433

# Application Settings
JWT_SECRET=your-secret-key-here
DEBUG=True
LOG_LEVEL=INFO

# Optional Settings
DEFAULT_COMPANY_ID=1
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000

# Azure Storage (if using file processing features)
AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection-string
AZURE_BLOB_CONTAINER=staging
AZURE_BLOB_CONTAINER_CLEANSED=cleansed
```

**Important**: Never commit the `.env` file to version control. Use `.env.example` as a template for required variables.

## Running the Application

### Starting the Backend

Choose one of these methods to start the backend server:

```bash
# Method 1: Using Python directly
python3 main.py

# Method 2: Using uvicorn
# Development mode with auto-reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`. You'll see startup messages confirming that all routers are loaded successfully.

### Verifying the Installation

Once the server is running, you can verify everything is working:

- **API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation
- **Health Check**: Visit `http://localhost:8000/health` for a simple health check
- **Detailed Health**: Visit `http://localhost:8000/health/detailed` for comprehensive system status

You should see confirmation that all 6 API routers are loaded:

- Focus converter (cloud cost analysis)
- Workflow processor (Jira/GitHub integration)
- Admin (user and company management)
- Auth (authentication)
- Superadmin (system administration)
- General admin (administrative functions)

### Testing Authentication

To test the authentication system:

```bash
# Test login endpoint (use valid credentials from your database)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

This will return a JWT token that you can use for authenticated requests. Contact your team lead for test credentials.

## Troubleshooting

### Common Issues

**Package installation fails**:

- Make sure your virtual environment is activated
- Try installing core packages first: `pip install fastapi uvicorn pandas`
- If you're on macOS and having ODBC issues: `brew install unixodbc`

**Only 3 endpoints showing instead of 6**:

- Check that all required packages are installed: `email-validator`, `azure-storage-blob`, `pyodbc`
- Verify your `.env` file has all required database connection variables
- Look at the startup logs for any router loading errors

**Database connection issues**:

- Double-check your `.env` database credentials
- Ensure your IP address is allowed in the Azure SQL firewall rules
- Test the connection using the health endpoints

**Authentication not working**:

- Verify you're using the correct test credentials
- Check that the JWT_SECRET is set in your `.env` file
- Look for authentication errors in the server logs

**Port already in use**:

```bash
# Kill any existing server processes
pkill -f uvicorn
# or
pkill -f "python.*main"
```

### Getting Help

If you run into issues that aren't covered here:

1. Check the server logs for error messages
2. Test the basic endpoints (`/health`, `/docs`) to isolate the problem
3. Make sure your virtual environment and dependencies are set up correctly
4. Ask the team for help - we're here to support each other

The interactive API documentation at `http://localhost:8000/docs` is for testing and understanding the available endpoints.
