# Unified Ingestion Framework - Complete Documentation

A comprehensive, reusable Node.js ingestion framework for Next.js applications that supports multiple data sources including GitHub, Jira, and cloud billing data (FOCUS format).

## 🚀 Features

- **Multi-source ingestion**: GitHub API, Jira CSV/API, FOCUS CSV (AWS/Azure/GCP)
- **Data lake architecture**: Bronze (raw) → Silver (processed) → Gold (curated)
- **Idempotent operations**: Natural key-based upserts
- **Comprehensive logging**: Structured JSON logs with run tracking
- **Error handling**: Quarantine bad data with detailed error tracking
- **Scheduling ready**: Built for GitHub Actions, Azure Functions, or manual triggers
- **Type-safe**: Full TypeScript support with Next.js 14

## 📁 Architecture

```
src/lib/ingest/
├── base/
│   ├── BaseIngestor.js          # Reusable ingestion pipeline
│   ├── Logger.js                # Structured logging
│   ├── Repository.js            # Database interface
│   ├── providers/
│   │   ├── SqliteRepository.js  # SQLite implementation (dev)
│   │   └── MssqlRepository.js   # Azure SQL (production)
│   └── storage/
│       ├── LocalFsStorage.js    # Local filesystem (dev)
│       └── BlobStorage.js       # Azure Blob (production)
├── sources/
│   ├── GithubApiIngestor.js     # GitHub API ingestion
│   ├── JiraCsvIngestor.js       # Jira CSV ingestion
│   ├── JiraApiIngestor.js       # Jira API ingestion
│   └── FocusCsvIngestor.js      # Cloud billing CSV ingestion
├── mappers/
│   ├── github.js                # GitHub data normalization
│   ├── jira.js                  # Jira data normalization
│   └── focus.js                 # FOCUS billing data normalization
└── utils/
    ├── csv.js                   # CSV parsing utilities
    └── hashing.js               # ID generation utilities
```

## 💾 Data Lake Structure

```
.data/
├── bronze/          # Raw data exactly as received
│   ├── operational/
│   │   ├── github/YYYY-MM-DD/
│   │   └── jira/YYYY-MM-DD/
│   └── focus/
│       └── {provider}/YYYY/MM/
├── silver/          # Cleaned, schema-aligned data
│   ├── operational/
│   └── focus/
├── gold/            # Curated, aggregated outputs
└── errors/          # Quarantined bad data
    └── {source}/{runId}/
```

## 🗄️ Database Schema

### Observability Tables

- `meta_ingestion_run` - Track ingestion executions
- `meta_ingestion_error` - Error logging and quarantine

### Operational Data

- `operational_github_pull_request` - GitHub PRs
- `operational_jira_issue` - Jira issues

### Financial Data

- `focus_cost_line_item` - Normalized cloud costs

## 🛠️ Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Test the framework**

   ```bash
   node test-ingestion.js
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Test API endpoints**

   ```bash
   # Get available sources
   curl http://localhost:3000/api/ingest

   # Check ingestion status
   curl http://localhost:3000/api/ingest/status
   ```

## 📡 API Endpoints

### POST `/api/ingest`

Trigger data ingestion for a specific source.

**GitHub Pull Requests Example:**

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "github",
    "config": {
      "token": "ghp_xxxxxxxxxxxx",
      "org": "your-org",
      "repo": "your-repo",
      "dataType": "pulls"
    }
  }'
```

**Jira CSV Example:**

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "jira_csv",
    "input": {
      "filePath": "bronze/jira/export.csv"
    }
  }'
```

**Jira API Example:**

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "jira_api",
    "config": {
      "baseUrl": "https://your-domain.atlassian.net",
      "email": "your-email@company.com",
      "token": "your-api-token",
      "jql": "updated >= -30d"
    }
  }'
```

**FOCUS Billing Data Example:**

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "focus_csv",
    "input": {
      "filePath": "bronze/focus/aws/2025/01/billing.csv"
    }
  }'
```

### GET `/api/ingest`

Get available sources and their configuration requirements.

### GET `/api/ingest/status`

View recent ingestion runs and their status.

**Query parameters:**

- `limit` - Number of runs to return (default: 10)
- `runId` - Get details for specific run

## ⚙️ Configuration

### Environment Variables

- `DATA_ROOT` - Root directory for data lake (default: `.data`)
- `SQLITE_DB_PATH` - SQLite database file path (default: `.data/finops.db`)

### Secrets Management

For production, store sensitive tokens in:

- Environment variables
- Azure Key Vault
- Encrypted database fields

## 📊 Supported Data Sources

### GitHub API

- **Data types**: Pull requests, issues, commits
- **Required config**: `token`, `org`, `repo`
- **Optional config**: `dataType`, `sinceIso`

### Jira CSV

- **Input**: CSV file path
- **Supports**: Standard Jira export formats
- **Auto-detects**: Common column variations

### Jira API

- **Required config**: `baseUrl`, `token`, `email`
- **Optional config**: `jql`, `maxResults`
- **Features**: Pagination, custom JQL queries

### FOCUS CSV (Cloud Billing)

- **Supports**: AWS CUR, Azure Cost Management, GCP Billing
- **Auto-detects**: Provider from column structure
- **Handles**: Large files with batch processing

## ⏰ Scheduling

### GitHub Actions (Phase 1)

```yaml
# .github/workflows/nightly-ingest.yml
name: Nightly Ingest
on:
  schedule: [{ cron: "0 13 * * *" }]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger GitHub ingestion
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/ingest" \
            -H "Authorization: Bearer ${{ secrets.CRON_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"source":"github","config":{"token":"${{ secrets.GITHUB_TOKEN }}","org":"your-org","repo":"your-repo"}}'
```

### Azure Functions (Phase 2)

Timer trigger functions calling the ingestion endpoints or running ingestors directly.

## 🚨 Error Handling

- **Validation errors**: Logged with context and sample data
- **Transformation errors**: Quarantined with row details
- **API errors**: Retry logic with exponential backoff
- **Database errors**: Transaction rollback and error logging

## 📈 Monitoring

- **Structured logging**: JSON format with run correlation
- **Metrics tracking**: Rows processed, duration, error rates
- **Status dashboard**: Recent runs, error summary, statistics

## 🔧 Extending the Framework

### Adding a New Source

1. **Create ingestor class**

   ```javascript
   // src/lib/ingest/sources/MySourceIngestor.js
   import { BaseIngestor } from "../base/BaseIngestor.js"

   export class MySourceIngestor extends BaseIngestor {
     async load(input) {
       /* fetch data */
     }
     async validate(data) {
       /* validate structure */
     }
     async transform(data) {
       /* normalize schema */
     }
     async upsert(rows) {
       /* save to database */
     }
   }
   ```

2. **Add mapper**

   ```javascript
   // src/lib/ingest/mappers/mysource.js
   export function mapMySourceData(item) {
     return {
       /* normalized fields */
     }
   }
   ```

3. **Register in API**

   ```javascript
   // src/app/api/ingest/route.js
   import { MySourceIngestor } from "@/lib/ingest/sources/MySourceIngestor"

   const INGESTOR_MAP = {
     // ... existing
     my_source: MySourceIngestor,
   }
   ```

## 🧪 Testing

Run the test script to validate your setup:

```bash
node test-ingestion.js
```

This will test:

- Component initialization
- Database schema creation
- Sample data insertion
- API readiness

## 🔒 Security

- **Input validation**: Sanitize all user inputs
- **Token security**: Never log sensitive tokens
- **Access control**: Secure API endpoints
- **Data isolation**: Tenant-specific data separation

## ⚡ Performance

- **Batch processing**: Handle large datasets efficiently
- **Memory management**: Stream large files
- **Connection pooling**: Optimize database connections
- **Caching**: Cache frequently accessed data

## 🚀 Migration to Production

1. **Replace SQLite with Azure SQL**
2. **Replace LocalFsStorage with BlobStorage**
3. **Add Azure Key Vault for secrets**
4. **Set up Application Insights for monitoring**
5. **Deploy as Azure Functions or Container Apps**

## 📝 Example Workflows

### Daily GitHub PR Sync

```javascript
const result = await fetch("/api/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source: "github",
    config: {
      token: process.env.GITHUB_TOKEN,
      org: "myorg",
      repo: "myrepo",
      dataType: "pulls",
    },
  }),
})
```

### Weekly Cloud Cost Analysis

```javascript
const result = await fetch("/api/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source: "focus_csv",
    input: {
      filePath: "bronze/focus/aws/2025/01/weekly-bill.csv",
    },
  }),
})
```

### Project Health Monitoring

```javascript
// Combine GitHub and Jira data
await Promise.all([
  fetch("/api/ingest", {
    method: "POST",
    body: JSON.stringify({ source: "github", config: githubConfig }),
  }),
  fetch("/api/ingest", {
    method: "POST",
    body: JSON.stringify({ source: "jira_api", config: jiraConfig }),
  }),
])
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
