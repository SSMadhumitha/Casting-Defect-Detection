from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class DailySignoff(Base):
    __tablename__ = "daily_signoffs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True, nullable=False) # Format: YYYY-MM-DD
    signed_by_name = Column(String, nullable=False)
    signed_by_email = Column(String, nullable=False)
    signed_by_role = Column(String, nullable=False)
    remarks = Column(String, nullable=True)
    signed_at = Column(DateTime(timezone=True), server_default=func.now())
