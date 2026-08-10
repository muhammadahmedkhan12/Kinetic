import urllib.parse
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

Base = declarative_base()

def get_engine():
    # Attempt Azure SQL Connection first
    try:
        quoted_conn_str = urllib.parse.quote_plus(settings.AZURE_SQL_CONN_STR)
        db_url = f"mssql+pyodbc:///?odbc_connect={quoted_conn_str}"
        engine = create_engine(db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
        # Test connection
        with engine.connect() as conn:
            pass
        print("Connected to Azure SQL Database successfully.")
        return engine
    except Exception as e:
        print(f"Azure SQL connection unavailable ({e}). Falling back to local SQLite database...")
        db_url = f"sqlite:///{settings.SQLITE_DB_PATH}"
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        return engine

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
