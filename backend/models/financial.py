"""
Financial Models and Schemas
Pydantic models for financial data, cost optimization, and cloud metrics
Based on Backend-Cushla schemas and FOCUS data format
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum

# ==========================================
# ENUMS FOR CONSISTENT VALUES
# ==========================================

class ImpactLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"

class EffortLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class OpportunityStatus(str, Enum):
    IDENTIFIED = "identified"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TrendDirection(str, Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class Period(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class StatusColor(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"

class IncidentSeverity(str, Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"

class IncidentStatus(str, Enum):
    RESOLVED = "resolved"
    IN_PROGRESS = "in_progress"
    INVESTIGATING = "investigating"

class SLAStatus(str, Enum):
    MEETING_SLA = "meeting_sla"
    BELOW_SLA = "below_sla"
    ABOVE_SLA = "above_sla"

# ==========================================
# CORE FINANCIAL MODELS
# ==========================================

class FinancialRecord(BaseModel):
    """Individual financial record (FOCUS format compatible)"""
    company_id: int
    billing_period_start: datetime
    billing_period_end: datetime
    service_name: str
    service_category: Optional[str] = None
    service_provider: str = Field(..., description="Cloud provider (AWS, Azure, GCP)")
    region: Optional[str] = None
    availability_zone: Optional[str] = None
    billed_cost: Decimal = Field(..., ge=0)
    usage_quantity: Optional[Decimal] = None
    usage_unit: Optional[str] = None
    currency: str = Field(default="USD", pattern="^[A-Z]{3}$")
    resource_id: Optional[str] = None
    resource_name: Optional[str] = None
    account_id: Optional[str] = None
    tags: Optional[Dict[str, Any]] = {}

    @validator('billed_cost')
    def validate_cost(cls, v):
        return round(v, 2)

class MetricValue(BaseModel):
    """Single metric with value, target, and change tracking"""
    value: float
    target: Optional[float] = None
    change_percent: Optional[float] = None
    period: Optional[str] = None
    status: str
    unit: Optional[str] = None

    class Config:
        json_encoders = {
            float: lambda v: round(v, 2)
        }

class MetricsSummary(BaseModel):
    """High-level metrics summary for dashboard"""
    customer_savings: MetricValue
    total_cloud_cost: MetricValue
    optimization_success_rate: MetricValue
    deployment_frequency: MetricValue
    last_updated: datetime

# ==========================================
# SAVINGS AND OPTIMIZATION MODELS
# ==========================================

class SavingsOpportunity(BaseModel):
    """Individual cost savings opportunity"""
    id: str
    type: str = Field(..., description="Type of optimization (rightsizing, reserved instances, etc.)")
    description: str
    monthly_savings: int = Field(..., ge=0)
    annual_savings: int = Field(..., ge=0)
    impact: ImpactLevel
    effort: EffortLevel
    status: OpportunityStatus
    estimated_hours: int = Field(..., ge=0)
    service_affected: Optional[str] = None
    region: Optional[str] = None
    confidence_level: Optional[float] = Field(None, ge=0, le=100)

    @validator('annual_savings')
    def validate_annual_savings(cls, v, values):
        monthly = values.get('monthly_savings', 0)
        if monthly > 0 and v != monthly * 12:
            return monthly * 12
        return v

class SavingsOpportunities(BaseModel):
    """Collection of savings opportunities with summary"""
    total_potential: int = Field(..., ge=0)
    completed_this_month: int = Field(..., ge=0)
    opportunities: List[SavingsOpportunity] = []
    
    @property
    def total_monthly_potential(self) -> int:
        return sum(opp.monthly_savings for opp in self.opportunities if opp.status != OpportunityStatus.COMPLETED)

# ==========================================
# TEAM AND RANKING MODELS
# ==========================================

class TeamRanking(BaseModel):
    """Team ranking for gamification"""
    rank: int = Field(..., ge=1)
    team_id: str
    team_name: str
    monthly_savings: int = Field(..., ge=0)
    percentage_of_total: float = Field(..., ge=0, le=100)
    trend: TrendDirection
    trend_change: int
    is_current_user: bool = False
    member_count: Optional[int] = None

class TeamRankings(BaseModel):
    """Team rankings with company-wide statistics"""
    company_wide_savings: int = Field(..., ge=0)
    period: Period
    rankings: List[TeamRanking] = []
    total_teams: int = Field(..., ge=0)
    last_updated: datetime

# ==========================================
# COST BREAKDOWN MODELS
# ==========================================

class ServiceCost(BaseModel):
    """Cost breakdown by service"""
    service: str
    service_id: str
    amount: int = Field(..., ge=0)
    percentage: int = Field(..., ge=0, le=100)
    change_from_last_month: float
    currency: str = "USD"

class CostBreakdown(BaseModel):
    """Detailed cost breakdown"""
    total: int = Field(..., ge=0)
    period: str
    currency: str = "USD"
    by_service: List[ServiceCost] = []
    by_region: Optional[List[Dict[str, Any]]] = []
    by_provider: Optional[List[Dict[str, Any]]] = []
    last_updated: datetime

# ==========================================
# INCIDENT AND HEALTH MODELS
# ==========================================

class Incident(BaseModel):
    """System incident tracking"""
    severity: IncidentSeverity
    title: str
    status: IncidentStatus
    started_at: datetime
    resolved_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    affected_services: Optional[List[str]] = []
    description: Optional[str] = None

    @validator('duration_minutes')
    def calculate_duration(cls, v, values):
        if values.get('resolved_at') and values.get('started_at'):
            delta = values['resolved_at'] - values['started_at']
            return int(delta.total_seconds() / 60)
        return v

class IncidentSummary(BaseModel):
    """Summary of incidents by severity"""
    critical: int = 0
    major: int = 0
    minor: int = 0
    total: int = 0

    @validator('total', always=True)
    def calculate_total(cls, v, values):
        return values.get('critical', 0) + values.get('major', 0) + values.get('minor', 0)

class SystemStatus(BaseModel):
    """Current system operational status"""
    all_operational: bool
    degraded_services: List[str] = []
    maintenance_mode: bool = False

class MTTR(BaseModel):
    """Mean Time To Recovery metrics"""
    value: float = Field(..., ge=0)
    unit: str = "hours"
    target: int = Field(..., ge=0)
    status: SLAStatus

class ProductionHealth(BaseModel):
    """Overall production system health"""
    uptime_percentage: float = Field(..., ge=0, le=100)
    status: str
    status_color: StatusColor
    system_status: SystemStatus
    incidents_this_week: IncidentSummary
    incidents: List[Incident] = []
    mttr: MTTR
    last_updated: datetime

# ==========================================
# TREND AND PROGRESS MODELS
# ==========================================

class MonthlyData(BaseModel):
    """Monthly data point for trends"""
    month: str
    year: int
    amount: int
    date: str
    
    @validator('year')
    def validate_year(cls, v):
        current_year = datetime.now().year
        if v < 2020 or v > current_year + 1:
            raise ValueError(f"Year must be between 2020 and {current_year + 1}")
        return v

class CostTrend(BaseModel):
    """Cost trend analysis"""
    period: str
    change_percent: float
    average_monthly_cost: int = Field(..., ge=0)
    currency: str = "USD"
    monthly_data: List[MonthlyData] = []
    last_updated: datetime

class TrendData(BaseModel):
    """Generic trend data point"""
    month: str
    year: int
    value: int
    date: str

class OptimizationProgress(BaseModel):
    """Optimization progress tracking"""
    current_percentage: int = Field(..., ge=0, le=100)
    target_percentage: int = Field(..., ge=0, le=100)
    status: str
    status_color: StatusColor
    next_milestone: int = Field(..., ge=0, le=100)
    percentage_to_milestone: int = Field(..., ge=0, le=100)
    issues_resolved: int = Field(..., ge=0)
    issues_remaining: int = Field(..., ge=0)
    team_rank: int = Field(..., ge=1)
    team_rank_total: int = Field(..., ge=1)
    trend: List[TrendData] = []
    last_updated: datetime

# ==========================================
# REQUEST/RESPONSE MODELS
# ==========================================

class CostAnalysisRequest(BaseModel):
    """Request model for cost analysis"""
    company_id: int
    start_date: datetime
    end_date: datetime
    group_by: Optional[str] = Field(None, pattern="^(service|region|provider)$")
    filters: Optional[Dict[str, Any]] = {}

class SavingsReportRequest(BaseModel):
    """Request model for savings report"""
    company_id: int
    period: Period
    include_opportunities: bool = True
    include_completed: bool = True

class DashboardResponse(BaseModel):
    """Standard dashboard response"""
    success: bool = True
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cache_duration: Optional[int] = None  # seconds

# ==========================================
# BULK OPERATIONS
# ==========================================

class BulkFinancialUpload(BaseModel):
    """Bulk upload of financial records"""
    company_id: int
    records: List[FinancialRecord]
    source: str = "manual"
    
    @validator('records')
    def validate_records_limit(cls, v):
        if len(v) > 10000:
            raise ValueError("Cannot upload more than 10,000 records at once")
        return v

class BulkUploadResponse(BaseModel):
    """Response for bulk upload operations"""
    success: bool
    processed: int
    failed: int
    errors: List[str] = []
    message: str
    upload_id: Optional[str] = None

# Export all models
__all__ = [
    # Enums
    'ImpactLevel', 'EffortLevel', 'OpportunityStatus', 'TrendDirection', 
    'Period', 'StatusColor', 'IncidentSeverity', 'IncidentStatus', 'SLAStatus',
    
    # Core models
    'FinancialRecord', 'MetricValue', 'MetricsSummary',
    
    # Savings models
    'SavingsOpportunity', 'SavingsOpportunities',
    
    # Team models
    'TeamRanking', 'TeamRankings',
    
    # Cost models
    'ServiceCost', 'CostBreakdown',
    
    # Health models
    'Incident', 'IncidentSummary', 'SystemStatus', 'MTTR', 'ProductionHealth',
    
    # Trend models
    'MonthlyData', 'CostTrend', 'TrendData', 'OptimizationProgress',
    
    # Request/Response models
    'CostAnalysisRequest', 'SavingsReportRequest', 'DashboardResponse',
    
    # Bulk operations
    'BulkFinancialUpload', 'BulkUploadResponse'
]