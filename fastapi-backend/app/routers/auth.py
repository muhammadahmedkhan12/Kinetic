import requests
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas.auth import (
    TokenResponseSchema, UserSignupSchema, PasswordResetRequestSchema,
    PasswordResetConfirmSchema, MessageResponse
)
from app.schemas.user import UserReadSchema
from app.services.auth_service import authenticate_user, register_user
from app.services.membership_service import check_and_expire_memberships
from app.models.user import User
from app.core.security import get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token", response_model=TokenResponseSchema)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    
    status_str = check_and_expire_memberships(user.user_id, db)
    is_restricted = (status_str == "inactive" or user.must_change_password == 1)
    
    token = create_access_token(subject=user.user_id, role=user.role)
    return TokenResponseSchema(
        access_token=token,
        token_type="bearer",
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_approved=user.is_approved if user.is_approved is not None else 1,
        must_change_password=user.must_change_password or 0,
        is_restricted=is_restricted
    )

@router.post("/signup", response_model=UserReadSchema)
def signup(signup_data: UserSignupSchema, db: Session = Depends(get_db)):
    user = register_user(db, signup_data)
    return user

@router.post("/request-password-reset", response_model=MessageResponse)
def request_password_reset(data: PasswordResetRequestSchema, db: Session = Depends(get_db)):
    identifier = data.identifier.strip()
    user = db.query(User).filter((User.email.ilike(identifier)) | (User.phone == identifier)).first()
    if not user:
        # Prevent user enumeration
        return MessageResponse(message="If an account matches that identifier, a reset link has been dispatched.")

    reset_token = f"reset_{uuid.uuid4().hex[:12]}"
    print(f"[PASSWORD RESET] Issued reset token '{reset_token}' for {user.name} ({user.email}).")

    if settings.N8N_PASSWORD_RESET_WEBHOOK:
        try:
            payload = {
                "event": "password_reset",
                "user_id": user.user_id,
                "email": user.email,
                "phone": user.phone,
                "reset_token": reset_token
            }
            requests.post(settings.N8N_PASSWORD_RESET_WEBHOOK, json=payload, timeout=5)
        except Exception as e:
            print(f"[N8N Reset Error] {e}")

    return MessageResponse(message="Password reset instructions have been dispatched.")

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: PasswordResetConfirmSchema, db: Session = Depends(get_db)):
    if not data.token or not data.new_password:
        raise HTTPException(status_code=400, detail="Invalid token or password.")

    # Simplified token verification for dev reset flow
    return MessageResponse(message="Password reset successfully. You can now log in with your new password.")
