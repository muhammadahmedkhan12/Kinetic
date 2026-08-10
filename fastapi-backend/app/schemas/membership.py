from pydantic import BaseModel
from typing import Optional

class MembershipReadSchema(BaseModel):
    id: int
    user_id: int
    plan_id: Optional[int] = None
    membership_type: str
    start_date: str
    end_date: str
    status: str

    class Config:
        from_attributes = True

class SubscribeRequestSchema(BaseModel):
    plan_id: int
    payment_method: str = "bank_transfer"  # bank_transfer, card, cash

class AdminAssignMembershipSchema(BaseModel):
    user_id: int
    plan_id: int
