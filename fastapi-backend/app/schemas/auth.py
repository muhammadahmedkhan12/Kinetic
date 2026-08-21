from pydantic import BaseModel, EmailStr
from typing import Optional

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str
    is_approved: int = 1
    must_change_password: int = 0
    is_restricted: bool = False

class UserSignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    age: Optional[int] = 0
    gender: Optional[str] = "Male"

class PasswordResetRequestSchema(BaseModel):
    identifier: str  # email or phone

class PasswordResetConfirmSchema(BaseModel):
    token: str
    new_password: str
    email: Optional[str] = None

class PasswordChangeSchema(BaseModel):
    current_password: str
    new_password: str

class MessageResponse(BaseModel):
    success: bool = True
    message: str
