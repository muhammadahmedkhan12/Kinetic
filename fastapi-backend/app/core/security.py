from datetime import datetime, timedelta
from typing import Optional, Any
import jwt
import bcrypt
from werkzeug.security import check_password_hash, generate_password_hash
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    
    # 1. Legacy Plaintext comparison (for dev/test or legacy PINs)
    if plain_password == hashed_password:
        return True

    # 2. Werkzeug hashes (scrypt:, pbkdf2:)
    if hashed_password.startswith("scrypt:") or hashed_password.startswith("pbkdf2:"):
        try:
            return check_password_hash(hashed_password, plain_password)
        except Exception:
            pass

    # 3. Bcrypt hashes ($2b$, $2a$, $2y$)
    if hashed_password.startswith("$2"):
        try:
            plain_bytes = plain_password[:72].encode("utf-8")
            hashed_bytes = hashed_password.encode("utf-8")
            return bcrypt.checkpw(plain_bytes, hashed_bytes)
        except Exception:
            pass

    # 4. Fallback attempt with werkzeug
    try:
        return check_password_hash(hashed_password, plain_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    # Use native bcrypt with UTF-8 truncation for 72-byte limit
    try:
        plain_bytes = password[:72].encode("utf-8")
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(plain_bytes, salt)
        return hashed.decode("utf-8")
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

