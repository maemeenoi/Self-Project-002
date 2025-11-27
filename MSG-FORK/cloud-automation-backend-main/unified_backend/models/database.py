"""
Unified Database Models for Cloud Automation Backend

This module combines database models from both focus_converter and work_processor
projects, providing a unified data model for:
- Company and user management
- Financial facts (FOCUS-compliant cost data)
- Workflow facts (Jira/GitHub data)
- Sync batch tracking
- Authentication and authorization
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Index, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional

Base = declarative_base()


class Company(Base):
    """
    Multi-tenant company model for organizational isolation
    Used by both focus_converter and work_processor
    """
    __tablename__ = "Company"
    
    CompanyID = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String(255), nullable=False, unique=True)
    SizeLabel = Column(String(50), nullable=True)  # Small, Medium, Large, Enterprise
    Industry = Column(String(100), nullable=True)
    CreatedAt = Column(DateTime, default=func.now(), nullable=False)
    UpdatedAt = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    IsActive = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    users = relationship("UserAccount", back_populates="company")
    financial_facts = relationship("FinancialFact", back_populates="company")
    workflow_facts = relationship("WorkflowFact", back_populates="company")
    sync_batches = relationship("SyncBatch", back_populates="company")


class UserAccount(Base):
    """
    User authentication and authorization model
    """
    __tablename__ = "UserAccount"
    
    UserID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, ForeignKey("Company.CompanyID"), nullable=False)
    Email = Column(String(255), nullable=False, unique=True)
    PasswordHash = Column(String(255), nullable=False)
    FirstName = Column(String(100), nullable=True)
    LastName = Column(String(100), nullable=True)
    MiddleName = Column(String(50), nullable=True)
    Phone = Column(String(50), nullable=True)
    Role = Column(String(50), default="user", nullable=False)  # admin, user, viewer
    IsSuperAdmin = Column(Boolean, default=False, nullable=False)
    IsCompanyAdmin = Column(Boolean, default=False, nullable=False)  # Company-level admin
    IsActive = Column(Boolean, default=True, nullable=False)
    LastLoginAt = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime, default=func.now(), nullable=False)
    UpdatedAt = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    company = relationship("Company", back_populates="users")
    roles = relationship("UserRole", back_populates="user", foreign_keys="UserRole.UserID")
    
    # Indexes
    __table_args__ = (
        Index("idx_user_email", "Email"),
        Index("idx_user_company", "CompanyID"),
    )


class SyncBatch(Base):
    """
    Audit trail for data ingestion batches
    Used by both focus_converter and work_processor
    """
    __tablename__ = "SyncBatch"
    
    BatchID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, ForeignKey("Company.CompanyID"), nullable=False)
    SourceSystem = Column(String(100), nullable=False)  # focus_converter, github, jira, aws, azure, gcp
    SourceFile = Column(String(500), nullable=True)  # Original file name or API endpoint
    BlobPath = Column(String(1000), nullable=True)  # Azure Blob Storage path
    StartedAt = Column(DateTime, default=func.now(), nullable=False)
    CompletedAt = Column(DateTime, nullable=True)
    RecordsIngested = Column(Integer, default=0, nullable=False)
    RecordsRejected = Column(Integer, default=0, nullable=False)
    Status = Column(String(50), default="in_progress", nullable=False)  # in_progress, completed, failed
    ErrorMessage = Column(Text, nullable=True)
    ProcessingTimeSeconds = Column(Float, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="sync_batches")
    financial_facts = relationship("FinancialFact", back_populates="sync_batch")
    workflow_facts = relationship("WorkflowFact", back_populates="sync_batch")
    
    # Indexes
    __table_args__ = (
        Index("idx_batch_company_source", "CompanyID", "SourceSystem"),
        Index("idx_batch_status", "Status"),
        Index("idx_batch_started", "StartedAt"),
    )


class FinancialFact(Base):
    """
    FOCUS-compliant financial cost data
    Used by focus_converter for cloud cost analysis
    """
    __tablename__ = "FinancialFact"
    
    FactID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, ForeignKey("Company.CompanyID"), nullable=False)
    BatchID = Column(Integer, ForeignKey("SyncBatch.BatchID"), nullable=False)
    
    # FOCUS Core Fields
    Provider = Column(String(100), nullable=False)  # AWS, Azure, GCP, OCI, etc.
    ServiceName = Column(String(200), nullable=True)
    ServiceCategory = Column(String(100), nullable=True)
    Region = Column(String(100), nullable=True)
    AvailabilityZone = Column(String(100), nullable=True)
    
    # Cost and Usage
    BilledCost = Column(DECIMAL(18, 6), nullable=True)
    EffectiveCost = Column(DECIMAL(18, 6), nullable=True)
    AmortizedCost = Column(DECIMAL(18, 6), nullable=True)
    ListCost = Column(DECIMAL(18, 6), nullable=True)
    UsageQuantity = Column(DECIMAL(18, 6), nullable=True)
    UsageUnit = Column(String(100), nullable=True)
    
    # Time Dimensions
    BillingPeriodStart = Column(DateTime, nullable=True)
    BillingPeriodEnd = Column(DateTime, nullable=True)
    ChargePeriodStart = Column(DateTime, nullable=True)
    ChargePeriodEnd = Column(DateTime, nullable=True)
    
    # Resource Information
    ResourceId = Column(String(500), nullable=True)
    ResourceName = Column(String(500), nullable=True)
    ResourceType = Column(String(200), nullable=True)
    
    # Billing Information
    BillingAccountId = Column(String(200), nullable=True)
    BillingAccountName = Column(String(500), nullable=True)
    BillingCurrency = Column(String(10), nullable=True)
    ChargeType = Column(String(100), nullable=True)
    
    # Tags and Labels (JSON or separate table could be used)
    Tags = Column(Text, nullable=True)  # JSON string
    
    # Metadata
    CreatedAt = Column(DateTime, default=func.now(), nullable=False)
    SourceFileName = Column(String(500), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="financial_facts")
    sync_batch = relationship("SyncBatch", back_populates="financial_facts")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_financial_company_provider", "CompanyID", "Provider"),
        Index("idx_financial_billing_period", "BillingPeriodStart", "BillingPeriodEnd"),
        Index("idx_financial_resource", "ResourceId"),
        Index("idx_financial_service", "ServiceName"),
        Index("idx_financial_region", "Region"),
        Index("idx_financial_batch", "BatchID"),
    )


class WorkflowFact(Base):
    """
    Workflow and development metrics data
    Used by work_processor for Jira/GitHub analysis
    """
    __tablename__ = "WorkflowFact"
    
    FactID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, ForeignKey("Company.CompanyID"), nullable=False)
    BatchID = Column(Integer, ForeignKey("SyncBatch.BatchID"), nullable=False)
    
    # Source Information
    Provider = Column(String(50), nullable=False)  # jira, github
    ItemType = Column(String(50), nullable=False)   # issue, story, bug, task, pull_request, commit
    ItemKey = Column(String(200), nullable=False)   # JIRA-123, #456 (GitHub), commit-hash
    ProjectOrRepo = Column(String(200), nullable=True)  # Project name or repository
    
    # Content
    Title = Column(String(400), nullable=True)
    Status = Column(String(80), nullable=True)      # e.g., 'open','closed','done'
    Labels = Column(String(500), nullable=True)     # comma-separated or small JSON
    
    # People
    Author = Column(String(150), nullable=True)     # Reporter, Creator
    Assignee = Column(String(150), nullable=True)   # Current assignee
    
    # Metrics
    StoryPoints = Column(Float, nullable=True)      # Jira story points
    LeadTimeHours = Column(Float, nullable=True)    # derived metric if you compute it
    CycleTimeHours = Column(Float, nullable=True)   # Time in "In Progress" state
    
    # Timestamps
    CreatedAt = Column(DateTime, nullable=True)     # When item was created in source system
    ClosedAt = Column(DateTime, nullable=True)      # When item was closed/resolved
    RawDataHash = Column(String(64), nullable=True)  # For deduplication
    
    # Relationships
    company = relationship("Company", back_populates="workflow_facts")
    sync_batch = relationship("SyncBatch", back_populates="workflow_facts")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_workflow_company_provider", "CompanyID", "Provider"),
        Index("idx_workflow_item_key", "ItemKey"),
        Index("idx_workflow_project", "ProjectOrRepo"),
        Index("idx_workflow_status", "Status"),
        Index("idx_workflow_assignee", "Assignee"),
        Index("idx_workflow_created", "CreatedAt"),
        Index("idx_workflow_batch", "BatchID"),
        Index("idx_workflow_type", "ItemType"),
    )


# Database connection and session management
from decouple import config


def _get_bool_env(key: str, default: bool) -> bool:
    """Parse boolean-like strings the same way the runtime does."""
    raw = config(key, default=None)
    if raw is None:
        return default
    if isinstance(raw, bool):
        return raw
    raw_normalized = str(raw).strip().lower()
    if raw_normalized in {"1", "true", "yes", "y", "on"}:
        return True
    if raw_normalized in {"0", "false", "no", "n", "off"}:
        return False
    return default


_encrypt_enabled = _get_bool_env("DB_ENCRYPT", default=True)
_trust_server_cert = _get_bool_env("DB_TRUST_SERVER_CERTIFICATE", default=False)

DATABASE_URL = (
    f"mssql+pyodbc://{config('DB_USER')}:{config('DB_PASSWORD')}"
    f"@{config('DB_HOST')}:{config('DB_PORT', default=1433)}"
    f"/{config('DB_NAME')}"
    f"?driver={config('DB_DRIVER', default='ODBC Driver 17 for SQL Server').replace(' ', '+')}"
    f"&Encrypt={'yes' if _encrypt_enabled else 'no'}"
    f"&TrustServerCertificate={'yes' if _trust_server_cert else 'no'}"
    f"&Connection+Timeout={config('DB_CONNECTION_TIMEOUT', default=30)}"
)

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=config('DEBUG', default=False, cast=bool)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session():
    """
    Dependency function to get database session
    Use with FastAPI Depends()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all database tables
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create database tables: {e}")
        return False


def drop_tables():
    """
    Drop all database tables (use with caution!)
    """
    try:
        Base.metadata.drop_all(bind=engine)
        print("✅ Database tables dropped successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to drop database tables: {e}")
        return False


class Role(Base):
    """
    Role definition model for role-based access control
    """
    __tablename__ = "Role"
    
    RoleID = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String(100), nullable=False, unique=True)
    Description = Column(String(255), nullable=True)
    IsSystemRole = Column(Boolean, default=False, nullable=False)
    CreatedAt = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    users = relationship("UserRole", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role")


class Permission(Base):
    """
    Permission definition model for granular access control
    """
    __tablename__ = "Permission"
    
    PermissionID = Column(Integer, primary_key=True, autoincrement=True)
    Code = Column(String(100), nullable=False, unique=True)
    Name = Column(String(100), nullable=False)
    Description = Column(String(255), nullable=True)
    CreatedAt = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    roles = relationship("RolePermission", back_populates="permission")


class UserRole(Base):
    """
    Many-to-many relationship between users and roles
    """
    __tablename__ = "UserRole"
    
    UserID = Column(Integer, ForeignKey("UserAccount.UserID"), primary_key=True)
    RoleID = Column(Integer, ForeignKey("Role.RoleID"), primary_key=True)
    
    # Relationships
    user = relationship("UserAccount", back_populates="roles", foreign_keys=[UserID])
    role = relationship("Role", back_populates="users")


class RolePermission(Base):
    """
    Many-to-many relationship between roles and permissions
    """
    __tablename__ = "RolePermission"
    
    RoleID = Column(Integer, ForeignKey("Role.RoleID"), primary_key=True)
    PermissionID = Column(Integer, ForeignKey("Permission.PermissionID"), primary_key=True)
    
    # Relationships
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")


if __name__ == "__main__":
    # Test database connection and create tables
    print("🔧 Testing database connection...")
    create_tables()
    
    # Test session creation
    try:
        db = SessionLocal()
        # Try a simple query
        result = db.execute("SELECT 1 as test").fetchone()
        print(f"✅ Database connection test successful: {result}")
        db.close()
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
