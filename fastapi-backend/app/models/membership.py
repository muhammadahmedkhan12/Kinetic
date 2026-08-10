from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Membership(Base):
    __tablename__ = "Memberships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("MembershipPlans.id"), nullable=True)
    membership_type = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)

    user = relationship("User", backref="memberships")
    plan = relationship("MembershipPlan")

    __table_args__ = (
        CheckConstraint("status IN ('active', 'overdue', 'inactive', 'pending_approval')", name="check_membership_status"),
        Index("idx_membership_user_status", "user_id", "status"),
    )
