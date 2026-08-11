import sys
sys.path.append('d:/Python/.venv/project/fastapi-backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

member1 = db.query(User).filter(User.email == "ahmed1248khan@gmail.com").first()
if member1:
    member1.password = get_password_hash("Password123!")
    print("Set ahmed1248khan@gmail.com password to 'Password123!'")

member2 = db.query(User).filter(User.email == "24ahmedkhan24@gmail.com").first()
if member2:
    member2.password = get_password_hash("Password123!")
    print("Set 24ahmedkhan24@gmail.com password to 'Password123!'")

db.commit()
print("Member passwords updated successfully!")
db.close()
