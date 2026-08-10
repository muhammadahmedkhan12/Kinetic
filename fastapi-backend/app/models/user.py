from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, CheckConstraint, Index
from app.core.database import Base

class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    plain_password = Column(String(50), nullable=True)  # Numeric PIN for admin display
    age = Column(Integer, nullable=False, default=0)
    phone = Column(String(20), index=True, nullable=True)
    gender = Column(String(10), nullable=False, default="Male")
    role = Column(String(20), nullable=False, default="member")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_approved = Column(Integer, nullable=False, default=0)
    must_change_password = Column(Integer, nullable=False, default=0)
    is_onboarded = Column(Integer, nullable=False, default=0)
    
    # Fitness & Body Profile Attributes
    height = Column(Float, nullable=True)
    goals_json = Column(String, nullable=True)  # JSON string array
    activity_level = Column(String(50), nullable=True)
    injuries = Column(String(255), nullable=True)
    experience_level = Column(String(50), nullable=True)
    preferred_days_json = Column(String, nullable=True)  # JSON string array

    __table_args__ = (
        CheckConstraint("role IN ('member', 'admin')", name="check_user_role"),
        Index("idx_user_email_phone", "email", "phone"),
    )
