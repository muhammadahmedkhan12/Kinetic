import sqlite3
import os

db_path = "fastapi-backend/gym_fallback.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT user_id, name, email, password, role FROM Users WHERE role='admin'")
    rows = cur.fetchall()
    print("ADMIN USERS IN FALLBACK DB:")
    for r in rows:
        print(r)
    conn.close()
