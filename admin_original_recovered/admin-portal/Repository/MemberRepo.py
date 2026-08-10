from project.Database.DBConnection import DBConnection
from project.Models.User import Users
from project.Services.MembershipService import MembershipService

class MemberRepo:
    
    def __init__(self):
        self.__db  = DBConnection.get_instance()   
        self.membershipService= MembershipService()

    def save(self,member):
        
        query = """
        INSERT INTO Users
        (name, email, password,age ,phone, gender, role)
        VALUES (?,?,?,?,?,?,?)
        """

        values = (
            member.getName(),
            member.getEmail(),
            member.getPassword(),
            member.getAge(),
            member.getPhone(),
            member.getGender(),
            member.getRole()
        )
        try:
            self.__db.executeInsert(query, values)
            return True

        except Exception as e:
            print("Could not save member:", e)
            return False

        
    def findByEmail(self,email):

        query= "SELECT * FROM Users WHERE email= ?" 
        cursor= self.__db.execute(query,(email,))
    
        row = cursor.fetchone()

        if row: 
            member= Users(
                row[1],
                row[2],
                row[3],
                row[4],
                row[5],
                row[6],
                row[7]  
            )
        
            return member

        return None


 
    
