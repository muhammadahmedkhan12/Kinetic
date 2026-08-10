import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Try loading .env from candidate paths
possible_env_paths = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), ".env"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
    os.path.join(os.getcwd(), ".env"),
]
for env_path in possible_env_paths:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=True)
        break

class Settings(BaseSettings):
    PROJECT_NAME: str = "KINETIC Gym Management System API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT Tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "kinetic_prestige_gym_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Configurable Business Rules
    GRACE_PERIOD_DAYS: int = 3
    RATE_LIMIT_PER_MINUTE: str = "10/minute"
    
    # Storage Directories
    UPLOADS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "payment_proofs")
    
    # Database Settings
    SQLITE_DB_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "gym_fallback.db")
    AZURE_SQL_CONN_STR: str = os.getenv(
        "AZURE_SQL_CONN_STR",
        "DRIVER={ODBC Driver 17 for SQL Server};SERVER=cinemadatabase.database.windows.net;DATABASE=Gym;UID=cinema;PWD=movie12@;Connect Timeout=60;"
    )
    
    # CORS Policy (Restricted Frontend Domains)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Integrations
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    N8N_PASSWORD_RESET_WEBHOOK: str = os.getenv("N8N_PASSWORD_RESET_WEBHOOK", "")
    N8N_EMAIL_REMINDER_WEBHOOK: str = os.getenv("N8N_EMAIL_REMINDER_WEBHOOK", "")

settings = Settings()
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
