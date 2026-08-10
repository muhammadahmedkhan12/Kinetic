from project.Database.DBConnection import DBConnection
from project.Models.Payment import Payment

class PaymentRepo:
    def __init__(self):
        self.__db = DBConnection.get_instance()

    def save(self, payment):
        query = """
        INSERT INTO Payments (user_id, amount, date, status, method)
        VALUES (?, ?, ?, ?, ?)
        """
        values = (
            payment.getUserId(),
            payment.getAmount(),
            payment.getDate(),
            payment.getStatus(),
            payment.getMethod()
        )
        self.__db.executeInsert(query, values)

    def findByUserId(self, user_id):
        query = "SELECT * FROM Payments WHERE user_id = ?"
        cursor = self.__db.execute(query, (user_id,))
        payments = []
        for row in cursor.fetchall():
            payments.append(Payment(
                user_id=row[1],
                amount=row[2],
                date=row[3],
                status=row[4],
                method=row[5],
                id=row[0]
            ))
        return payments

    def findAll(self):
        query = "SELECT * FROM Payments"
        cursor = self.__db.execute(query)
        payments = []
        for row in cursor.fetchall():
            payments.append(Payment(
                user_id=row[1],
                amount=row[2],
                date=row[3],
                status=row[4],
                method=row[5],
                id=row[0]
            ))
        return payments

    def findById(self, payment_id):
        query = "SELECT * FROM Payments WHERE id = ?"
        cursor = self.__db.execute(query, (payment_id,))
        row = cursor.fetchone()
        if row:
            return Payment(
                user_id=row[1],
                amount=row[2],
                date=row[3],
                status=row[4],
                method=row[5],
                id=row[0]
            )
        return None

    def updateStatus(self, payment_id, status):
        query = "UPDATE Payments SET status = ? WHERE id = ?"
        self.__db.executeInsert(query, (status, payment_id))

