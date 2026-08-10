from project.Database.DBConnection import DBConnection
from project.Models.Trainer import Trainer

class TrainerRepo:
    def __init__(self):
        self.__db = DBConnection.get_instance()

    def saveTrainer(self,trainer):

        query = """ INSERT INTO Trainers 
                (name,specialization,experience_years)
                VALUES (?,?,?)
                """
        
        values= (
            trainer.getName(),
            trainer.getSpecialization(),
            trainer.getExperience()
        )

        try:
            self.__db.executeInsert(query, values)
            return True

        except Exception as e:
            print("Could not save member:", e)
            return False

    def findById(self, trainer_id):
        query = "SELECT * FROM Trainers WHERE id = ?"
        cursor = self.__db.execute(query, (trainer_id,))
        row = cursor.fetchone()
        if row:
            return Trainer(
                name=row[1],
                specialization=row[2],
                experience_years=row[3],
                id=row[0]
            )
        return None

    def findAll(self):
        query = "SELECT * FROM Trainers"
        cursor = self.__db.execute(query)
        trainers = []
        for row in cursor.fetchall():
            trainers.append(Trainer(
                name=row[1],
                specialization=row[2],
                experience_years=row[3],
                id=row[0]
            ))
        return trainers

