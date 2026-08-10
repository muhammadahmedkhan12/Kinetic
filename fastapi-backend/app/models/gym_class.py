from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class GymClass(Base):
    __tablename__ = "GymClasses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trainer_id = Column(Integer, ForeignKey("Trainers.id"), nullable=True)
    name = Column(String(100), nullable=False)
    day = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    capacity = Column(Integer, nullable=False, default=20)

    trainer = relationship("Trainer", backref="classes")
