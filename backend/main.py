"""
FastAPI Backend Application
Main entry point for the FinOps & Workflow Management API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from dotenv import load_dotenv

# Import routers
from routers.core import router as core_router
from routers.widgetsService import router as widgets_router
from routers.auth import router as auth_router
from routers.admin import router as admin_router

# Import database initialization
from lib.db import init_database

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FinOps & Workflow Management API",
    description="Comprehensive API for financial analytics, cloud cost optimization, and workflow management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://your-frontend-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and perform startup tasks"""
    try:
        await init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

# Include routers
app.include_router(core_router)         # Core CRUD endpoints (/companies, /users, etc.)
app.include_router(widgets_router)      # Comprehensive widgets (/widgets/*)
app.include_router(auth_router)
app.include_router(admin_router)

# Debug router (temporary)
from routers.debug import router as debug_router
app.include_router(debug_router)

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "FinOps & Workflow Management API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Add database connectivity check here if needed
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "database": "connected",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )