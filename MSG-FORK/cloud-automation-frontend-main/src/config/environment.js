/**
 * Environment Configuration
 *
 * Centralized configuration for different environments.
 * BACKEND INTEGRATION: Update API URLs when backend is deployed
 */

const config = {
  // API Configuration - Always use real backend
  API_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",

  // Authentication
  JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET || "dev-secret-key",

  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
  ENABLE_NOTIFICATIONS:
    process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false",
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",

  // Cache Configuration
  CACHE_DURATION: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION) || 900000, // 15 minutes
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000, // 30 seconds

  // Environment Detection
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
}

const API_URL = "http://localhost:8000"

// Environment-specific overrides
if (config.isDevelopment) {
  config.USE_MOCK_DATA = false // Use real backend even in development
  config.DEBUG_MODE = true
}

if (config.isProduction) {
  config.USE_MOCK_DATA = false
  config.DEBUG_MODE = false
}

// Log configuration in development
if (config.isDevelopment || config.DEBUG_MODE) {
  console.log("Environment configuration:", {
    API_URL: config.API_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  })
}

// export default config;
export default { API_URL }