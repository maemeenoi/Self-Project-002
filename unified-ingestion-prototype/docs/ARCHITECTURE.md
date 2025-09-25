# 🏗️ Project Architecture - 2025 Industry Standard

## 📁 Directory Structure

```
unified-ingestion-prototype/
├── 📁 frontend/              # Next.js App Router Frontend
│   ├── app/                  # App Router pages & layouts
│   │   ├── api/              # API routes (Next.js App Router)
│   │   ├── dashboard/        # Dashboard page
│   │   ├── ingestion/        # Ingestion page
│   │   ├── test/            # Test page
│   │   └── layout.tsx       # Root layout
│   ├── components/           # Reusable UI components
│   │   ├── PrTable.tsx      # Pull request table
│   │   ├── JiraTasksTable.tsx # Jira tasks table
│   │   ├── StatusChip.tsx   # Status indicator component
│   │   └── ...              # Other UI components
│   ├── lib/                  # Frontend utilities
│   ├── hooks/                # Custom React hooks
│   ├── types/                # Frontend-specific types
│   └── styles/               # Global styles
│       └── globals.css      # Global CSS
├── 📁 backend/               # Backend services & APIs
│   ├── api/                  # API business logic (copied to frontend/app/api)
│   ├── lib/                  # Backend business logic
│   │   └── ingest/          # Ingestion framework
│   │       ├── base/        # Base classes
│   │       └── sources/     # Source-specific ingestors
│   ├── models/               # Data models & schemas
│   ├── services/             # Business services
│   └── utils/                # Backend utilities
├── 📁 shared/                # Shared utilities & types
│   ├── types/                # Shared TypeScript types
│   │   └── index.ts         # All shared type definitions
│   ├── utils/                # Common utilities
│   │   └── index.ts         # Utility functions
│   └── constants/            # Application constants
│       └── index.ts         # Constants and enums
├── 📁 data/                  # Data storage & migration
│   ├── bronze/              # Raw ingested data
│   ├── silver/              # Cleaned data
│   ├── gold/                # Processed data
│   ├── errors/              # Error logs
│   └── finops.db           # SQLite database
├── 📁 docs/                  # Documentation
│   ├── ARCHITECTURE.md     # This file
│   ├── README.md           # Project overview
│   ├── FRAMEWORK-DOCS.md   # Framework documentation
│   └── IMPLEMENTATION-COMPLETE.md # Implementation details
├── 📁 config/               # Configuration files (copied to root)
│   ├── next.config.mjs     # Next.js configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── tsconfig.json       # TypeScript configuration
├── .env                     # Environment variables
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
└── next-env.d.ts           # Next.js types
```

## 🎯 Architecture Philosophy

### 1. **Separation of Concerns**

- **Frontend**: Pure UI/UX with React Server Components
- **Backend**: Business logic, data processing, and ingestion
- **Shared**: Common utilities and type definitions

### 2. **Modern Next.js 14 App Router**

- Uses App Router instead of Pages Router
- Server Components by default
- API routes in `frontend/app/api/`
- Layouts and page organization

### 3. **Type Safety First**

- Shared TypeScript types in `shared/types/`
- Strong typing across frontend and backend
- API response standardization

### 4. **Data Flow Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│  Ingestion API  │───▶│   Database      │
│                 │    │                 │    │                 │
│ • GitHub API    │    │ • Transform     │    │ • SQLite        │
│ • Jira CSV/API  │    │ • Validate      │    │ • Tables        │
│ • FOCUS CSV     │    │ • Store         │    │ • Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │◀───│   Data APIs     │◀───│   Repository    │
│                 │    │                 │    │                 │
│ • Tables        │    │ • /api/data/*   │    │ • SqliteRepo    │
│ • Charts        │    │ • Transform     │    │ • Query Layer   │
│ • Real-time     │    │ • Format        │    │ • Transactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Development Workflow

### 1. **Frontend Development**

```bash
# Work in frontend directory
cd frontend/

# Components in frontend/components/
# Pages in frontend/app/
# Styles in frontend/styles/
```

### 2. **Backend Development**

```bash
# Business logic in backend/lib/
# API logic copied to frontend/app/api/
# Models in backend/models/
```

### 3. **Shared Development**

```bash
# Types in shared/types/
# Utils in shared/utils/
# Constants in shared/constants/
```

## 🔧 Key Features

### ✅ **Industry Standards 2025**

- **Monorepo Structure**: Clear separation but single codebase
- **TypeScript First**: Full type safety
- **Modern React**: Server Components, App Router
- **Clean Architecture**: Domain-driven design
- **API-First Design**: RESTful APIs with standardized responses

### ✅ **Scalability**

- **Modular Components**: Reusable UI components
- **Service Layer**: Business logic separation
- **Repository Pattern**: Data access abstraction
- **Configuration Management**: Environment-based config

### ✅ **Developer Experience**

- **Hot Reload**: Next.js development server
- **Type Checking**: Real-time TypeScript validation
- **Code Organization**: Logical folder structure
- **Documentation**: Comprehensive docs

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Best Practices

### **File Naming**

- Components: `PascalCase.tsx`
- API routes: `route.js` (App Router standard)
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

### **Import Conventions**

```typescript
// Shared types
import { ApiResponse, GitHubPullRequest } from "@/shared/types"

// Shared utilities
import { formatDate, truncateText } from "@/shared/utils"

// Shared constants
import { API_ENDPOINTS, STATUS_VALUES } from "@/shared/constants"
```

### **Component Structure**

```typescript
// frontend/components/ExampleComponent.tsx
import { ComponentProps } from "@/shared/types"

export default function ExampleComponent({ data }: ComponentProps) {
  return <div className="component-wrapper">{/* Component JSX */}</div>
}
```

This architecture follows 2025 industry standards with clear separation of concerns, modern React patterns, and excellent developer experience! 🎉
