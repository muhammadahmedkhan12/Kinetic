import sys
import requests

sys.path.append('d:/Python/.venv/project/fastapi-backend')
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()
admin_users = db.query(User).filter(User.role == "admin").all()

print(f"--- Admin Users Count in Azure SQL: {len(admin_users)} ---")
for u in admin_users:
    print(f"ID: {u.user_id} | Name: {u.name} | Email: '{u.email}' | Role: {u.role}")
    print(f"Testing 'adminpassword':", verify_password("adminpassword", u.password))

db.close()
