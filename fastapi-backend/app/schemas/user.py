from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from app.schemas.membership import MembershipReadSchema

class UserReadSchema(BaseModel):
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    age: Optional[int] = 0
    gender: Optional[str] = "Male"
    role: str
    is_approved: Optional[int] = 1
    must_change_password: Optional[int] = 0
    is_onboarded: Optional[int] = 0
    height: Optional[float] = None
    goals_json: Optional[str] = None
    activity_level: Optional[str] = None
    injuries: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_days_json: Optional[str] = None
    membership: Optional[MembershipReadSchema] = None

    @field_validator("is_approved", mode="before")
    def default_is_approved(cls, v):
        return 1 if v is None else v

    @field_validator("must_change_password", mode="before")
    def default_must_change_password(cls, v):
        return 0 if v is None else v

    @field_validator("age", mode="before")
    def default_age(cls, v):
        return 0 if v is None else v

    class Config:
        from_attributes = True

class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    goals: Optional[List[str]] = None

class OnboardingProfileSchema(BaseModel):
    height: float
    starting_weight: Optional[float] = None
    activity_level: Optional[str] = None
    injuries: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_days: Optional[List[str]] = None
    goals: Optional[List[str]] = None

class AdminCreateMemberSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    age: Optional[int] = 0
    gender: Optional[str] = "Male"

class AdminCreatedMemberResponseSchema(BaseModel):
    success: bool = True
    message: str
    user_id: int
    name: str
    email: str
    temp_password: str
