from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Payment(Base):
    __tablename__ = "Payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("MembershipPlans.id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    method = Column(String(50), nullable=False)
    proof_file = Column(String(255), nullable=True)

    user = relationship("User", backref="payments")
    plan = relationship("MembershipPlan")

    __table_args__ = (
        CheckConstraint("status IN ('completed', 'pending', 'rejected')", name="check_payment_status"),
        Index("idx_payment_user_status", "user_id", "status"),
    )
