from sqlalchemy import Column, Integer, String, Numeric, Boolean
from app.core.database import Base

class MembershipPlan(Base):
    __tablename__ = "MembershipPlans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plan_name = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    duration_days = Column(Integer, nullable=False, default=30)
    description = Column(String(255), nullable=True)
    features_json = Column(String, nullable=True)  # JSON string array
    is_active = Column(Boolean, nullable=False, default=True)
