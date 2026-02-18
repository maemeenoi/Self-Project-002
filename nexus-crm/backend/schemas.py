from datetime import datetime
from typing import Literal
from pydantic import BaseModel

LeadStatus = Literal["new", "contacted", "qualified", "proposal", "closed-won", "closed-lost"]
LeadSource = Literal["website", "referral", "cold-outreach", "social", "event", "other"]


class LeadCreate(BaseModel):
    company_name: str
    status: LeadStatus = "new"
    source: LeadSource = "other"


class LeadUpdate(BaseModel):
    company_name: str | None = None
    status: LeadStatus | None = None
    source: LeadSource | None = None


class LeadRead(BaseModel):
    id: int
    company_name: str
    status: str
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_leads: int
    new_this_week: int
    active_deals: int
    win_rate: float
