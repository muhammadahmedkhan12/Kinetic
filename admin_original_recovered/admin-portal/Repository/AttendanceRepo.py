from project.Database.DBConnection import DBConnection
from project.Models.Attendance import Attendance

class AttendanceRepo:
    def __init__(self):
        self.__db = DBConnection.get_instance()

    def save(self, attendance):
        query = """
        INSERT INTO Attendance (user_id, date, is_present)
        VALUES (?, ?, ?)
        """
        values = (
            attendance.getUserId(),
            attendance.getDate(),
            1 if attendance.getIsPresent() else 0
        )
        self.__db.executeInsert(query, values)

    def findByUserId(self, user_id):
        query = "SELECT * FROM Attendance WHERE user_id = ?"
        cursor = self.__db.execute(query, (user_id,))
        records = []
        for row in cursor.fetchall():
            records.append(Attendance(
                user_id=row[1],
                date=row[2],
                is_present=bool(row[3]),
                id=row[0]
            ))
        return records

    def findAll(self):
        query = "SELECT * FROM Attendance"
        cursor = self.__db.execute(query)
        records = []
        for row in cursor.fetchall():
            records.append(Attendance(
                user_id=row[1],
                date=row[2],
                is_present=bool(row[3]),
                id=row[0]
            ))
        return records
