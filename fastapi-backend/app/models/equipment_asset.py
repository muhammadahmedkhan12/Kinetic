from sqlalchemy import Column, Integer, String
from app.core.database import Base

class EquipmentAsset(Base):
    __tablename__ = "EquipmentAssets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, default="Strength")
    quantity = Column(Integer, nullable=False, default=1)
    location = Column(String(100), nullable=False, default="Main Floor")
    status = Column(String(50), nullable=False, default="Operational")
    last_serviced = Column(String(50), nullable=False)
    next_service = Column(String(50), nullable=False)
