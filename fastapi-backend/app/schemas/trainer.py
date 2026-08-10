from pydantic import BaseModel
from typing import Optional

class TrainerReadSchema(BaseModel):
    id: int
    name: str
    specialization: str
    experience_years: int

    class Config:
        from_attributes = True

class TrainerCreateSchema(BaseModel):
    name: str
    specialization: str
    experience_years: int

class TrainerUpdateSchema(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
