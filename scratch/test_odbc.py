import urllib.parse
from sqlalchemy import create_engine, text

conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=cinemadatabase.database.windows.net;DATABASE=Gym;UID=cinema;PWD=movie12@"
print("Testing clean conn_str:", conn_str)

quoted = urllib.parse.quote_plus(conn_str)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={quoted}")

try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT COUNT(*) FROM Users")).scalar()
        print("SUCCESS! Users count in Azure SQL:", res)
except Exception as e:
    print("FAILED:", type(e), e)
