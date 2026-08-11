import sys
sys.path.append('d:/Python/.venv/project/fastapi-backend')

from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

print(f"=== Total Users in Azure SQL DB: {len(users)} ===")
for u in users:
    print(f"ID: {u.user_id:<3} | Role: {u.role:<6} | Name: {u.name:<20} | Email: {u.email:<30} | Phone: {u.phone or 'N/A'}")

db.close()
