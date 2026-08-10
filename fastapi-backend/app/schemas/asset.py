from pydantic import BaseModel
from typing import Optional

class AssetReadSchema(BaseModel):
    id: int
    name: str
    category: str
    quantity: int
    location: str
    status: str
    last_serviced: str
    next_service: str

    class Config:
        from_attributes = True

class AssetCreateSchema(BaseModel):
    name: str
    category: str = "Strength"
    quantity: int = 1
    location: str = "Main Floor"
    status: str = "Operational"
    last_serviced: Optional[str] = None
