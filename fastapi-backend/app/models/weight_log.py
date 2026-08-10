from sqlalchemy import Column, Integer, String, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class WeightLog(Base):
    __tablename__ = "WeightLogs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False, index=True)
    date = Column(String(50), nullable=False)
    weight_kg = Column(Float, nullable=False)

    user = relationship("User", backref="weight_logs")

    __table_args__ = (
        Index("idx_weight_user_date", "user_id", "date"),
    )
