from project.Database.DBConnection import DBConnection
from project.Models.User import User

class UserRepo:
    def __init__(self):
        self.__db = DBConnection.get_instance()

    def save(self, user):
        query = """
        INSERT INTO Users (name, email, password, age, phone, gender, role, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        values = (
            user.getName(),
            user.getEmail(),
            user.getPassword(),
            user.getAge(),
            user.getNumber(),
            user.getGender(),
            user.getRole(),
            1 if user.getIsApproved() else 0
        )
        self.__db.executeInsert(query, values)

    def findByEmail(self, email):
        query = "SELECT * FROM Users WHERE email = ?"
        cursor = self.__db.execute(query, (email,))
        row = cursor.fetchone()

        if row:
            return User(
                name=row[1],
                email=row[2],
                password=row[3],
                age=row[4],
                number=row[5],
                gender=row[6],
                role=row[7],
                is_approved=row[8] if len(row) > 8 else 0,
                id=row[0]
            )
        return None

    def findById(self, user_id):
        query = "SELECT * FROM Users WHERE user_id = ?"
        cursor = self.__db.execute(query, (user_id,))
        row = cursor.fetchone()

        if row:
            return User(
                name=row[1],
                email=row[2],
                password=row[3],
                age=row[4],
                number=row[5],
                gender=row[6],
                role=row[7],
                is_approved=row[8] if len(row) > 8 else 0,
                id=row[0]
            )
        return None

    def findAll(self):
        query = "SELECT * FROM Users"
        cursor = self.__db.execute(query)
        users = []
        for row in cursor.fetchall():
            users.append(User(
                name=row[1],
                email=row[2],
                password=row[3],
                age=row[4],
                number=row[5],
                gender=row[6],
                role=row[7],
                is_approved=row[8] if len(row) > 8 else 0,
                id=row[0]
            ))
        return users

    def updateApprovalStatus(self, user_id, is_approved):
        query = "UPDATE Users SET is_approved = ? WHERE user_id = ?"
        self.__db.executeInsert(query, (1 if is_approved else 0, user_id))

    def update(self, user):
        query = """
        UPDATE Users
        SET name = ?, age = ?, phone = ?, gender = ?
        WHERE user_id = ?
        """
        values = (
            user.getName(),
            user.getAge(),
            user.getNumber(),
            user.getGender(),
            user.getId()
        )
        self.__db.executeInsert(query, values)

    def deleteById(self, user_id):
        query = "DELETE FROM Users WHERE user_id = ?"
        self.__db.executeInsert(query, (user_id,))


