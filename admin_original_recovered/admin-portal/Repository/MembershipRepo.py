from project.Database.DBConnection import DBConnection
from project.Models.Membership import Membership

class MembershipRepo:
    def __init__(self):
        self.__db = DBConnection.get_instance()

    def save(self, membership):
        query = """
        INSERT INTO Memberships (user_id, membership_type, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?)
        """
        values = (
            membership.getUserId(),
            membership.getMembershipType(),
            membership.getStartDate(),
            membership.getEndDate(),
            membership.getStatus()
        )
        self.__db.executeInsert(query, values)

    def findByUserId(self, user_id):
        query = "SELECT * FROM Memberships WHERE user_id = ?"
        cursor = self.__db.execute(query, (user_id,))
        row = cursor.fetchone()

        if row:
            return Membership(
                user_id=row[1],
                membership_type=row[2],
                start_date=row[3],
                end_date=row[4],
                status=row[5],
                id=row[0]
            )
        return None

    def findById(self, membership_id):
        query = "SELECT * FROM Memberships WHERE id = ?"
        cursor = self.__db.execute(query, (membership_id,))
        row = cursor.fetchone()

        if row:
            return Membership(
                user_id=row[1],
                membership_type=row[2],
                start_date=row[3],
                end_date=row[4],
                status=row[5],
                id=row[0]
            )
        return None

    def updateStatus(self, membership_id, status):
        query = "UPDATE Memberships SET status = ? WHERE id = ?"
        self.__db.executeInsert(query, (status, membership_id))

    def update(self, membership):
        query = """
        UPDATE Memberships
        SET membership_type = ?, start_date = ?, end_date = ?, status = ?
        WHERE id = ?
        """
        values = (
            membership.getMembershipType(),
            membership.getStartDate(),
            membership.getEndDate(),
            membership.getStatus(),
            membership.getId()
        )
        self.__db.executeInsert(query, values)


    def findAll(self):
        query = "SELECT * FROM Memberships"
        cursor = self.__db.execute(query)
        memberships = []
        for row in cursor.fetchall():
            memberships.append(Membership(
                user_id=row[1],
                membership_type=row[2],
                start_date=row[3],
                end_date=row[4],
                status=row[5],
                id=row[0]
            ))
        return memberships
