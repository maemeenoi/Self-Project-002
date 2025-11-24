# 🌐 Cloud Automation Frontend

A modern, responsive Next.js dashboard for enterprise cloud automation, workflow management, and multi-tenant administration with real-time data visualization and role-based access control.

## ✨ Key Features

### 🎨 **Modern UI/UX**

- **Next.js 15** with App Router and Turbopack for lightning-fast development
- **Tailwind CSS + DaisyUI** for consistent, beautiful components
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Dark/Light Theme** support with system preference detection

### 🏢 **Enterprise Features**

- **Multi-Tenant Architecture** with company-based data isolation
- **Role-Based Access Control** (SuperAdmin → CompanyAdmin → User)
- **Real-Time Dashboard** with live data updates and interactive charts
- **Integration Management** for GitHub, Jira, and cloud providers

### 📊 **Data Visualization**

- **Interactive Charts** using Chart.js and Recharts
- **Widget System** with customizable dashboard components
- **Performance Metrics** with trend analysis and insights
- **Export Capabilities** for reports and data analysis

### ⚡ **Performance & Developer Experience**

- **TypeScript** for type safety and better development experience
- **ESLint + Prettier** for consistent code quality
- **Hot Module Replacement** with Turbopack for instant updates
- **Optimized Bundle** with Next.js automatic optimizations

## 🏗️ Project Architecture

```
📦 Frontend Application
├── 🚀 Next.js App (app/)
│   ├── 🔐 Authentication (login/, register/)
│   ├── 🏠 Dashboard (dashboard/)
│   ├── 👑 Admin Panels (superadmin/, admin/)
│   ├── 🔌 Integrations (integrations/)
│   └── ⚙️  Settings (settings/)
├── 🧩 Components (src/components/)
│   ├── 📊 Charts (charts/)
│   ├── 📈 Widgets (widgets/)
│   ├── 🎛️  Forms (forms/)
│   └── 🧱 UI Elements (ui/)
├── 🔧 Services (src/services/)
│   ├── 🌐 API Client (api.ts)
│   ├── 🔑 Auth Service (auth.ts)
│   └── 📊 Data Services (data/)
├── 🎯 Types (src/types/)
├── 🛠️  Utils (src/utils/)
└── 🎨 Styles (src/styles/)
```

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Running backend API (see backend README)

### **Installation**

```bash
# Clone and navigate to frontend
git clone <your-repo-url>
cd cloud-automation-frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration
```

### **Configuration**

Create `.env.local` with your settings:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://app-makestuffgo-test-001-backend.azurewebsites.net
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_INTEGRATIONS=true
NEXT_PUBLIC_MAX_COMPANIES=100

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### **Development**

```bash
# Start development server with Turbopack
npm run dev

# Alternative commands
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint check
npm run type-check # TypeScript check
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Hot Reload**: Enabled with Turbopack for instant updates

## 📱 Application Features

### 🔐 **Authentication System**

- **JWT-based Authentication** with secure token management
- **Role-based Routing** with automatic redirects
- **Session Management** with refresh token support
- **Multi-tenant Login** with company selection

### 🏠 **Dashboard Overview**

- **Executive Summary** with key metrics and trends
- **Real-time Widgets** showing GitHub/Jira activity
- **Performance Charts** with interactive data exploration
- **Quick Actions** for common administrative tasks

### 👑 **SuperAdmin Features**

- **System-wide Analytics** across all companies and users
- **Company Management** with creation, editing, and deletion
- **Global User Administration** with role assignments
- **System Health Monitoring** with performance metrics

### 🏢 **CompanyAdmin Features**

- **Company Dashboard** with team-specific insights
- **User Management** within company scope
- **Integration Configuration** for team tools
- **Team Analytics** and productivity reports

### 🔌 **Integration Management**

- **GitHub Integration** with repository and organization setup
- **Jira Integration** with project and workflow configuration
- **Sync Status** with real-time progress and error handling
- **Configuration Wizard** for easy setup

## 🎨 UI Components & Design

### **Component Library**

- **DaisyUI Components**: Buttons, cards, modals, forms
- **Custom Widgets**: Dashboard components with data binding
- **Chart Components**: Interactive visualizations with Chart.js
- **Form Components**: Validated forms with error handling

### **Responsive Design**

```css
/* Breakpoints */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

### **Theme System**

- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for extended use
- **System Detection**: Automatic theme based on user preference
- **Custom Colors**: Brand-consistent color palette

## 📊 Widget System

### **Available Widgets**

1. **GitHub Overview** - Repository activity and metrics
2. **Jira Overview** - Work item status and progress
3. **Performance Metrics** - System and user analytics
4. **Integration Status** - Connection health and sync status
5. **Recent Activity** - Latest actions and updates

### **Widget Configuration**

```javascript
// Widget customization options
{
  refreshInterval: 30000,    // Auto-refresh every 30 seconds
  dataRange: "30d",          // Last 30 days of data
  chartType: "line",         // line, bar, pie, doughnut
  showLegend: true,          // Display chart legend
  exportEnabled: true       // Enable data export
}
```

## 🧪 Testing & Quality

### **Code Quality Tools**

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting (if Prettier is configured)
npm run format

# Build verification
npm run build
```

### **Testing Strategy**

- **Component Testing**: React component unit tests
- **Integration Testing**: API integration and user flows
- **E2E Testing**: Full application workflow testing
- **Performance Testing**: Bundle size and runtime performance

## 🚀 Deployment

### **Production Build**

```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Or export static files
npm run export  # If configured for static export
```

### **Environment Configuration**

```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXTAUTH_SECRET=production-secret-key
NODE_ENV=production
```

### **Performance Optimizations**

- **Automatic Code Splitting** with Next.js dynamic imports
- **Image Optimization** with Next.js Image component
- **Bundle Analysis** with @next/bundle-analyzer
- **Caching Strategy** for API responses and static assets

## 🔧 Development Workflow

### **Project Structure Best Practices**

- **Feature-based Organization** in `src/features/`
- **Shared Components** in `src/components/`
- **Type Definitions** in `src/types/`
- **Utility Functions** in `src/utils/`

### **State Management**

- **React Context** for global application state
- **Local State** with React hooks for component state
- **Server State** with React Query for API data caching
- **Form State** with React Hook Form for complex forms

## 📈 Performance Monitoring

### **Built-in Analytics**

- **User Interaction Tracking** with custom events
- **Performance Metrics** using Next.js built-in analytics
- **Error Boundary** for graceful error handling
- **Loading States** for better user experience

### **Monitoring Tools**

```javascript
// Performance monitoring
import { reportWebVitals } from "next/web-vitals"

export function reportWebVitals(metric) {
  // Send to analytics service
  console.log(metric)
}
```

## 🤝 Contributing

### **Development Guidelines**

- Follow React and Next.js best practices
- Use TypeScript for all new components
- Implement responsive design for all features
- Add proper error handling and loading states
- Write meaningful commit messages

### **Code Style**

- **ESLint Configuration**: Enforced code quality rules
- **TypeScript**: Strict mode enabled for type safety
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Organization**: Feature-based directory structure

## 🆘 Troubleshooting

### **Common Issues**

**Build failures with TypeScript errors**

```bash
# Check type errors
npm run type-check
# Fix types or add // @ts-ignore for temporary fixes
```

**API connection issues**

```bash
# Verify backend is running
curl https://app-makestuffgo-test-001-backend.azurewebsites.net/health
# Check NEXT_PUBLIC_API_URL in .env.local
```

**Slow development server**

```bash
# Use Turbopack for faster builds
npm run dev --turbo
# Clear Next.js cache
rm -rf .next
```

**Authentication not working**

```bash
# Verify NEXTAUTH_SECRET is set
# Check JWT token expiry
# Confirm backend auth endpoints are working
```

## 📄 Dependencies

### **Core Framework**

- **Next.js 15**: React framework with App Router
- **React 18**: UI library with concurrent features
- **TypeScript**: Static type checking

### **UI & Styling**

- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind
- **Heroicons**: Beautiful SVG icons
- **Lucide React**: Additional icon library

### **Data & Charts**

- **Chart.js**: Canvas-based charts
- **React-Chartjs-2**: React wrapper for Chart.js
- **Recharts**: React-specific charting library

### **Development Tools**

- **ESLint**: Code linting and quality
- **Turbopack**: Fast bundler for development
- **PostCSS**: CSS processing and optimization

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with** ❤️ **using Next.js, React, and modern web technologies**
