import sys
sys.path.append("fastapi-backend")

from app.core.database import SessionLocal, engine
from app.models.user import User
from sqlalchemy import text

db = SessionLocal()
try:
    # Execute migration helper
    from app.core.init_db import migrate_missing_columns
    migrate_missing_columns()

    # Check table structure
    result = db.execute(text("SELECT user_id, email, password, plain_password FROM Users LIMIT 5")).fetchall()
    print("Sample Users:")
    for r in result:
        print(r)
except Exception as e:
    print("Error querying plain_password:", e)
finally:
    db.close()
