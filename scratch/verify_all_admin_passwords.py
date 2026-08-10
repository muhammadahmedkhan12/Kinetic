import sys
sys.path.append('d:/Python/.venv/project/fastapi-backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()
admins = db.query(User).filter(User.role == "admin").all()

print("--- Admin Accounts in Azure SQL ---")
for u in admins:
    print(f"ID: {u.user_id} | Email: '{u.email}'")
    u.password = get_password_hash("adminpassword")
    print(f"  -> Set password for {u.email} to 'adminpassword'")

db.commit()
print("\nUpdated all admin passwords in Azure SQL DB successfully!")
db.close()
