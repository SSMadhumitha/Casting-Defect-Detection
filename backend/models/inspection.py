from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename      = Column(String, nullable=False)
    has_defects   = Column(Boolean, default=False)
    defect_count  = Column(Integer, default=0)
    max_confidence= Column(Float, default=0.0)
    detections    = Column(JSON, default=list)   # raw list of {class_id, class_name, confidence}
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
