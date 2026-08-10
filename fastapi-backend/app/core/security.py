from datetime import datetime, timedelta
from typing import Optional, Any
import jwt
from passlib.context import CryptContext
from werkzeug.security import check_password_hash, generate_password_hash
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    # Truncate plain_password if needed for bcrypt length limit
    plain = plain_password[:72]
    
    # Legacy Werkzeug PBKDF2 check
    if hashed_password.startswith("pbkdf2:"):
        try:
            return check_password_hash(hashed_password, plain_password)
        except Exception:
            return False
    # Legacy Plaintext fallback
    if len(hashed_password) < 60 and not hashed_password.startswith("$"):
        return plain_password == hashed_password
    # Standard Bcrypt verify
    try:
        return pwd_context.verify(plain, hashed_password)
    except Exception:
        try:
            return check_password_hash(hashed_password, plain_password)
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    # Truncate string to 72 bytes maximum for bcrypt compatibility
    safe_pw = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    try:
        return pwd_context.hash(safe_pw)
    except Exception:
        return generate_password_hash(password)

def create_access_token(subject: Any, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
