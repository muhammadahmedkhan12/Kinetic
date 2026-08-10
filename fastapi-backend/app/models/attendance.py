from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attendance(Base):
    __tablename__ = "Attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False, index=True)
    date = Column(String(50), nullable=False)
    is_present = Column(Integer, nullable=False, default=1)

    user = relationship("User", backref="attendances")

    __table_args__ = (
        Index("idx_attendance_user_date", "user_id", "date"),
    )
