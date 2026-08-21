from pydantic import BaseModel
from typing import List, Optional
from app.schemas.user import UserReadSchema
from app.schemas.membership import MembershipReadSchema
from app.schemas.payment import PaymentReadSchema
from app.schemas.trainer import TrainerReadSchema
from app.schemas.gym_class import GymClassReadSchema
from app.schemas.asset import AssetReadSchema

class StatsSummarySchema(BaseModel):
    total_members: int
    total_trainers: int
    total_payments: int
    total_assets: int
    monthly_revenue: float

class PendingPaymentDetailSchema(BaseModel):
    id: int
    user_id: int
    member_name: str
    amount: float
    date: str
    method: str
    proof_file: Optional[str] = None

class AdminSummaryResponseSchema(BaseModel):
    success: bool = True
    stats: StatsSummarySchema
    members: List[UserReadSchema]
    pending_payments: List[PendingPaymentDetailSchema]
    pending_members: List[UserReadSchema]
    trainers: List[TrainerReadSchema]
    classes: List[GymClassReadSchema]
    assets: List[AssetReadSchema]

class AdminMemberDetailResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    age: int
    gender: str
    membership: Optional[MembershipReadSchema] = None
    payments: List[PaymentReadSchema] = []

class AdminResetPasswordSchema(BaseModel):
    new_password: Optional[str] = None

class AdminResetPasswordResponseSchema(BaseModel):
    success: bool = True
    message: str
    user_id: int
    temp_password: str

