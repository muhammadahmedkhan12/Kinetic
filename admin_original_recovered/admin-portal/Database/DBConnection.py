import os
import sqlite3
import pyodbc
import sys

class DBConnection:
    __instance = None  

    def __init__(self):
        self.__is_mock = False
        try:
            print("Connecting to live Azure SQL database...")
            self.__conn = pyodbc.connect(
                "DRIVER={ODBC Driver 17 for SQL Server};"
                "SERVER=tcp:cinemadatabase.database.windows.net,1433;"
                "DATABASE=Gym;"
                "UID=cinema;"
                "PWD=movie12@;"
                "Encrypt=yes;"
                "TrustServerCertificate=no;"
                "Connection Timeout=3;"  # Short timeout for quick fallback
            )
            self.__cursor = self.__conn.cursor()
            print("Connected to Live Azure Database Successfully!")

            # Ensure is_approved column exists on Users table (Azure SQL)
            try:
                self.__cursor.execute("ALTER TABLE Users ADD is_approved INT DEFAULT 0")
                self.__conn.commit()
            except Exception:
                pass

            # Ensure default admin user is seeded on Azure SQL
            try:
                self.__cursor.execute("SELECT COUNT(*) FROM Users WHERE email = ?", ("admin@kineticgym.com",))
                if self.__cursor.fetchone()[0] == 0:
                    self.__cursor.execute("""
                    INSERT INTO Users (name, email, password, age, phone, gender, role, is_approved)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, ("Admin User", "admin@kineticgym.com", "Admin@123", 30, "+1234567890", "other", "admin", 1))
                    self.__conn.commit()
            except Exception:
                pass

            # Ensure WeightLogs table exists on Azure SQL (it may be missing)
            try:
                self.__cursor.execute("""
                IF OBJECT_ID('WeightLogs', 'U') IS NULL
                CREATE TABLE WeightLogs (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    date NVARCHAR(20) NOT NULL,
                    weight_kg FLOAT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES Users(user_id)
                )
                """)
                self.__conn.commit()
            except Exception:
                pass
            
        except Exception as e:
            print(f"Live Database Connection Failed: {e}")
            print("Falling back to local SQLite database (gym_fallback.db) for persistent simulation.")
            self.__is_mock = True
            
            # Setup path for local sqlite database in the project root folder dynamically
            current = os.path.dirname(os.path.abspath(__file__))
            while current and not os.path.exists(os.path.join(current, ".env")) and os.path.dirname(current) != current:
                current = os.path.dirname(current)
            db_path = os.path.join(current, "gym_fallback.db")
            
            self.__conn = sqlite3.connect(db_path, check_same_thread=False)
            self.__cursor = self.__conn.cursor()
            self._init_sqlite_db()

    def _init_sqlite_db(self):
        # 1. Users table
        self.__cursor.execute("""
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            age INTEGER NOT NULL,
            phone TEXT NOT NULL,
            gender TEXT NOT NULL,
            role TEXT NOT NULL,
            is_approved INTEGER DEFAULT 0
        )
        """)
        try:
            self.__cursor.execute("ALTER TABLE Users ADD COLUMN is_approved INTEGER DEFAULT 0")
            self.__conn.commit()
        except Exception:
            pass


        # 2. Trainers table
        self.__cursor.execute("""
        CREATE TABLE IF NOT EXISTS Trainers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            experience_years INTEGER NOT NULL
        )
        """)

        # 3. Memberships table
        self.__cursor.execute("""
        CREATE TABLE IF NOT EXISTS Memberships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            membership_type TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
        """)

        # 4. Payments table
        self.__cursor.execute("""
        CREATE TABLE IF NOT EXISTS Payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            method TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
        """)

        # 5. Attendance table
        self.__cursor.execute("""
        CREATE TABLE IF NOT EXISTS Attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            is_present INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
        """)

        # 6. WeightLogs table
        self.__cursor.execute("""
        CREATE TABLE IF NOT EXISTS WeightLogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            weight_kg REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
        """)
        self.__conn.commit()

        # Seed initial admin if not exists
        self.__cursor.execute("SELECT COUNT(*) FROM Users WHERE role = 'admin'")
        if self.__cursor.fetchone()[0] == 0:
            self.__cursor.execute("""
            INSERT INTO Users (name, email, password, age, phone, gender, role, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, ("Admin User", "admin@kineticgym.com", "Admin@123", 30, "+1234567890", "other", "admin", 1))
            self.__conn.commit()
            print("Pre-seeded default admin user: admin@kineticgym.com / Admin@123")
        
        # Ensure all admins are marked approved in the database
        self.__cursor.execute("UPDATE Users SET is_approved = 1 WHERE role = 'admin'")
        self.__conn.conn.commit() if hasattr(self.__cursor, 'conn') else self.__conn.commit()


        # Seed initial trainers if empty
        self.__cursor.execute("SELECT COUNT(*) FROM Trainers")
        if self.__cursor.fetchone()[0] == 0:
            trainers_data = [
                ("Alex Johnson", "Strength & Conditioning", 8),
                ("Sarah Connor", "HIIT & Fat Burn", 5),
                ("Mike Tyson", "Boxing & MMA", 12),
                ("John Smith", "Powerlifting Academy", 10)
            ]
            self.__cursor.executemany("""
            INSERT INTO Trainers (name, specialization, experience_years)
            VALUES (?, ?, ?)
            """, trainers_data)
            self.__conn.commit()
            print("Pre-seeded initial gym trainers.")

    # Singleton — only one connection created
    @staticmethod
    def get_instance():
        if DBConnection.__instance is None:        
            DBConnection.__instance = DBConnection()
        return DBConnection.__instance
    
    def is_mock(self):
        return self.__is_mock

    def execute(self, query, values=None):
        cursor = self.get_cursor()
        # SQLite needs cursor.execute with tuple for placeholders, which values is.
        if values:
            cursor.execute(query, values)
        else:
            cursor.execute(query)
        return cursor
    
    def executeInsert(self, query, values):
        cursor = self.get_cursor()
        cursor.execute(query, values)
        self.commit()

    def get_cursor(self):
        return self.__cursor

    def commit(self):
        self.__conn.commit()

    def close(self):
        self.__conn.close()

