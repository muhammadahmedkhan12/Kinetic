from pydantic import BaseModel
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
