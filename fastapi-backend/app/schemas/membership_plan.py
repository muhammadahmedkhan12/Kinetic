from pydantic import BaseModel
from typing import Optional, List

class MembershipPlanReadSchema(BaseModel):
    id: int
    plan_name: str
    price: float
    duration_days: int
    description: Optional[str] = None
    features: Optional[List[str]] = []
    is_active: bool

    class Config:
        from_attributes = True

class MembershipPlanCreateSchema(BaseModel):
    plan_name: str
    price: float
    duration_days: int = 30
    description: Optional[str] = None
    features: Optional[List[str]] = []

class MembershipPlanUpdateSchema(BaseModel):
    plan_name: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
