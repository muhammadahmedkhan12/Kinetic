from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import UserSignupSchema, TokenResponseSchema

def authenticate_user(db: Session, identifier: str, password: str) -> User:
    identifier = identifier.strip()
    # Search by email or phone
    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.phone == identifier)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )
    
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )
    
    # Block pending accounts
    if user.is_approved == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access pending. Your account is awaiting approval by gym management."
        )
        
    return user

def register_user(db: Session, signup_data: UserSignupSchema) -> User:
    existing = db.query(User).filter(
        (User.email.ilike(signup_data.email)) |
        ((User.phone == signup_data.phone) if signup_data.phone else False)
    ).first()
    
    if existing:
        if existing.email.lower() == signup_data.email.lower():
            raise HTTPException(status_code=400, detail=f"Email '{signup_data.email}' is already registered.")
        if signup_data.phone and existing.phone == signup_data.phone:
            raise HTTPException(status_code=400, detail=f"Phone number '{signup_data.phone}' is already registered.")

    hashed_pw = get_password_hash(signup_data.password)
    new_user = User(
        name=signup_data.name.strip(),
        email=signup_data.email.strip().lower(),
        password=hashed_pw,
        phone=signup_data.phone.strip() if signup_data.phone else None,
        age=signup_data.age or 0,
        gender=signup_data.gender or "Male",
        role="member",
        is_approved=0,  # Public self-signup pending approval
        must_change_password=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
