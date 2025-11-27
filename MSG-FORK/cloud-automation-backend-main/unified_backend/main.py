"""
Unified Cloud Automation Backend - Working Version

This is the main FastAPI application that combines functionality from:
- focus_converter: Cloud cost data analysis and FOCUS format conversion
- work_processor: Jira/GitHub workflow data processing

This version focuses on getting the server running successfully first.
"""

import sys
import os
import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, config('LOG_LEVEL', default='INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Unified Cloud Automation Backend",
    description="""
    Unified backend combining cloud cost analysis and workflow processing:
    
    **Focus Converter Features:**
    - Multi-cloud cost data analysis (AWS, Azure, GCP, OCI)
    - FOCUS format conversion and validation
    - Financial fact data storage and querying
    
    **Workflow Processor Features:**
    - Jira issue tracking and metrics
    - GitHub repository analysis
    - Workflow fact data storage and analysis
    
    **Shared Features:**
    - Multi-tenant company isolation
    - Azure Blob Storage integration
    - Azure SQL Database with comprehensive models
    - Authentication and authorization
    - Real-time monitoring and health checks
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config('CORS_ORIGINS', default='["*"]', cast=lambda x: eval(x) if x.startswith('[') else [x]),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Import auth utilities
from utils.auth import get_current_company

# Basic health endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Unified Cloud Automation Backend",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "message": "Unified backend is operational",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health/detailed")
async def detailed_health():
    """Detailed health check"""
    try:
        # Test basic functionality
        health_data = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "components": {
                "api": {"status": "healthy", "message": "API is responsive"},
                "environment": {
                    "status": "healthy",
                    "python_version": sys.version,
                    "environment_variables": len([k for k in os.environ.keys() if not k.startswith('_')])
                }
            }
        }
        
        # Try to import and test database
        try:
            from lib.db import health_check as db_health_check
            db_health = await db_health_check()
            health_data["components"]["database"] = db_health
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")
            health_data["components"]["database"] = {
                "status": "degraded",
                "error": str(e)
            }
            
        # Try to test Azure storage
        try:
            from services.cloud.azure_storage import UnifiedAzureBlobStorage
            storage = UnifiedAzureBlobStorage()
            storage_health = await storage.health_check()
            health_data["components"]["azure_storage"] = storage_health
        except Exception as e:
            logger.warning(f"Azure storage health check failed: {e}")
            health_data["components"]["azure_storage"] = {
                "status": "degraded", 
                "error": str(e)
            }
            
        return health_data
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Load routers during app initialization (not startup event)
def load_routers():
    """Load all routers during app initialization"""
    logger.info("🚀 Loading routers for Unified Cloud Automation Backend...")
    
    # Try to load routers
    try:
        from routers import focus_converter
        app.include_router(focus_converter.router)
        logger.info("✅ Focus converter router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load focus converter router: {e}")
        
    try:
        from routers import workflow_processor
        app.include_router(workflow_processor.router)
        logger.info("✅ Workflow processor router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load workflow processor router: {e}")
        
    try:
        from routers import admin
        app.include_router(admin.router)
        logger.info("✅ Admin router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load admin router: {e}")
        
    try:
        from routers import auth
        app.include_router(auth.router)
        logger.info("✅ Auth router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load auth router: {e}")
        
    try:
        from routers import superadmin
        app.include_router(superadmin.router)
        logger.info("✅ Superadmin router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load superadmin router: {e}")
        
    try:
        from routers import general_admin
        app.include_router(general_admin.router)
        logger.info("✅ General admin router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load general admin router: {e}")
        
    try:
        from routers import engineer
        app.include_router(engineer.router)
        logger.info("✅ Engineer router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load engineer router: {e}")
    
    try:
        from routers import widgets
        app.include_router(widgets.router)
        logger.info("✅ Widgets router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load widgets router: {e}")
    
    try:
        from routers import integrations
        app.include_router(integrations.router)
        logger.info("✅ Integrations router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load integrations router: {e}")
    
    try:
        from routers import cloud_cost
        app.include_router(cloud_cost.router)
        logger.info("✅ Cloud cost router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load cloud cost router: {e}")
    
    try:
        from routers import drs_widgets
        app.include_router(drs_widgets.router)
        logger.info("✅ DRS widgets router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load DRS widgets router: {e}")
    
    try:
        from routers import baseline_generator
        app.include_router(baseline_generator.router)
        logger.info("✅ Baseline generator router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load baseline generator router: {e}")
    
    try:
        from routers import auto_baseline_api
        app.include_router(auto_baseline_api.router)
        logger.info("✅ Auto baseline API router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load auto baseline API router: {e}")
    
    try:
        from routers import cto
        app.include_router(cto.router)
        logger.info("✅ CTO router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load CTO router: {e}")
    
    try:
        from routers import tech_executive
        app.include_router(tech_executive.router)
        logger.info("✅ Technology Executive router loaded")
    except Exception as e:
        logger.warning(f"⚠️ Could not load Technology Executive router: {e}")

# Load routers immediately
load_routers()

# Custom OpenAPI schema generation to ensure all routes are included
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.on_event("startup")
async def startup_event():
    """Startup event for final initialization"""
    logger.info("=" * 80)
    logger.info("🚀 UNIFIED CLOUD AUTOMATION BACKEND STARTED")
    logger.info("=" * 80)
    logger.info(f"🌐 API Documentation: http://localhost:{config('FASTAPI_PORT', default=8000)}/docs")
    logger.info(f"🔍 Health Check: http://localhost:{config('FASTAPI_PORT', default=8000)}/health")
    logger.info(f"📊 Detailed Health: http://localhost:{config('FASTAPI_PORT', default=8000)}/health/detailed")
    logger.info("=" * 80)

if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=config('FASTAPI_HOST', default='0.0.0.0'),
        port=config('FASTAPI_PORT', default=8000, cast=int),
        reload=config('FASTAPI_RELOAD', default=True, cast=bool) and config('DEBUG', default=False, cast=bool),
        log_level=config('LOG_LEVEL', default='info').lower(),
        access_log=True
    )