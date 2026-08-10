import sys
sys.path.append("fastapi-backend")

from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
user = db.query(User).filter(User.user_id == 35).first()
if not user:
    user = db.query(User).order_by(User.user_id.desc()).first()

print("User ID:", user.user_id)
print("User Email:", user.email)
print("User Password:", user.password)
print("User Plain Password:", getattr(user, 'plain_password', 'NOT_FOUND'))
db.close()
