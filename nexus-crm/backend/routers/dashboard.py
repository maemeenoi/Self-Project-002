from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Lead, Deal
from schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_leads = (await db.execute(select(func.count()).select_from(Lead))).scalar_one()

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    new_this_week = (
        await db.execute(select(func.count()).select_from(Lead).where(Lead.created_at >= week_ago))
    ).scalar_one()

    active_stages = ["prospecting", "qualified", "proposal", "negotiation"]
    active_deals = (
        await db.execute(
            select(func.count()).select_from(Deal).where(Deal.stage.in_(active_stages))
        )
    ).scalar_one()

    total_closed = (
        await db.execute(
            select(func.count()).select_from(Lead).where(
                Lead.status.in_(["closed-won", "closed-lost"])
            )
        )
    ).scalar_one()
    closed_won = (
        await db.execute(
            select(func.count()).select_from(Lead).where(Lead.status == "closed-won")
        )
    ).scalar_one()
    win_rate = (closed_won / total_closed * 100) if total_closed > 0 else 0.0

    return DashboardStats(
        total_leads=total_leads,
        new_this_week=new_this_week,
        active_deals=active_deals,
        win_rate=round(win_rate, 1),
    )
