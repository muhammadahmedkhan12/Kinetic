from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Trainer(Base):
    __tablename__ = "Trainers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    specialization = Column(String(255), nullable=False)
    experience_years = Column(Integer, nullable=False, default=1)
