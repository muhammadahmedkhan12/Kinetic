from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import verify_password

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

