from project.Database.DBConnection import DBConnection
from project.Models.WeightLog import WeightLog


class WeightLogRepo:
    def __init__(self):
        self.__db = DBConnection.get_instance()

    def save(self, weight_log):
        query = """
        INSERT INTO WeightLogs (user_id, date, weight_kg)
        VALUES (?, ?, ?)
        """
        values = (
            weight_log.getUserId(),
            weight_log.getDate(),
            weight_log.getWeightKg()
        )
        self.__db.executeInsert(query, values)

    def findByUserId(self, user_id):
        query = "SELECT * FROM WeightLogs WHERE user_id = ? ORDER BY date DESC"
        cursor = self.__db.execute(query, (user_id,))
        logs = []
        for row in cursor.fetchall():
            logs.append(WeightLog(
                user_id=row[1],
                date=row[2],
                weight_kg=row[3],
                id=row[0]
            ))
        return logs

    def findByUserIdAndDate(self, user_id, date):
        query = "SELECT * FROM WeightLogs WHERE user_id = ? AND date = ?"
        cursor = self.__db.execute(query, (user_id, date))
        row = cursor.fetchone()
        if row:
            return WeightLog(
                user_id=row[1],
                date=row[2],
                weight_kg=row[3],
                id=row[0]
            )
        return None

    def update(self, weight_log_id, weight_kg):
        query = "UPDATE WeightLogs SET weight_kg = ? WHERE id = ?"
        self.__db.executeInsert(query, (weight_kg, weight_log_id))
