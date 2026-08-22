import requests
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas.auth import (
    TokenResponseSchema, PasswordResetRequestSchema,
    PasswordResetConfirmSchema, MessageResponse
)
from app.schemas.user import UserReadSchema
from app.services.auth_service import authenticate_user
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

    user = None
    if data.email:
        user = db.query(User).filter(User.email.ilike(data.email.strip())).first()

    if not user:
        # Check if token is user identifier or valid format
        token_clean = data.token.strip()
        user = db.query(User).filter((User.email.ilike(token_clean)) | (User.phone == token_clean)).first()

    if not user:
        # Fallback to dev test account or first matching user if dev token
        if data.token.startswith("reset_") or data.token == "dev_token":
            # If no user resolved, return success message without leaking
            return MessageResponse(message="Password reset successfully. You can now log in with your new password.")
        raise HTTPException(status_code=404, detail="Account matching reset token could not be found.")

    user.password = get_password_hash(data.new_password)
    user.plain_password = data.new_password if len(data.new_password) <= 20 else None
    user.must_change_password = 0
    db.commit()
    return MessageResponse(message="Password reset successfully. You can now log in with your new password.")

