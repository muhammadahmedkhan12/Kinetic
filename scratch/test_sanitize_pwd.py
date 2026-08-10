import sys
sys.path.append("fastapi-backend")

from app.models.user import User
from app.routers.admin import sanitize_password_for_admin

# Test 1: User with hash password string
user_hash = User(user_id=42, name="Test User", email="test@test.com", password="scrypt:32768:8:1$ne8vubzCKzdIyZ0L$4b0d352373eba2219fa832401bf5139145aaf093d4cfa78cc076cfb35292f97c75e545484304f6d7c9dc65816928587422abad22bee17a81a8789f4b1a966b41")
sanitized_pwd_1 = sanitize_password_for_admin(user_hash)
print("Sanitized Hashed Password:", sanitized_pwd_1)
print("Is 6-Digit Numeric PIN?:", sanitized_pwd_1.isdigit() and len(sanitized_pwd_1) == 6)

# Test 2: User with 6-digit numeric plain_password
user_pin = User(user_id=45, name="Pin User", email="pin@test.com", password="hashed_str", plain_password="849201")
sanitized_pwd_2 = sanitize_password_for_admin(user_pin)
print("Sanitized Plain PIN:", sanitized_pwd_2)
print("Matches Original PIN?:", sanitized_pwd_2 == "849201")
