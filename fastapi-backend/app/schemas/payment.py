from pydantic import BaseModel
from typing import Optional

class PaymentReadSchema(BaseModel):
    id: int
    user_id: int
    plan_id: Optional[int] = None
    amount: float
    date: str
    status: str
    method: str
    proof_file: Optional[str] = None

    class Config:
        from_attributes = True

class CashPaymentSchema(BaseModel):
    user_id: int
    plan_id: int
