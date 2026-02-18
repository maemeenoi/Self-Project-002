from datetime import datetime, date
from sqlalchemy import Integer, String, Float, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="new")
    source: Mapped[str] = mapped_column(String(50), default="other")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="lead", cascade="all, delete-orphan")
    deals: Mapped[list["Deal"]] = relationship("Deal", back_populates="lead", cascade="all, delete-orphan")
    interactions: Mapped[list["Interaction"]] = relationship("Interaction", back_populates="lead", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="contacts")


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    stage: Mapped[str] = mapped_column(String(50), default="prospecting")
    expected_close_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="deals")


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    lead: Mapped["Lead"] = relationship("Lead", back_populates="interactions")
