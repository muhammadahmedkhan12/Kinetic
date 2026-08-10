from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class ClassBooking(Base):
    __tablename__ = "ClassBookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("GymClasses.id"), nullable=False, index=True)
    booked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="class_bookings")
    gym_class = relationship("GymClass", backref="bookings")

    __table_args__ = (
        Index("idx_class_booking_user_class", "user_id", "class_id", unique=True),
    )
