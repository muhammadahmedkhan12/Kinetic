from project.Repository.TrainerRepo import TrainerRepo
class TrainerService:
    
    def __init__(self):
        self.trainer= TrainerRepo()


    def addTrainer(self,trainer):
        self.trainer.saveTrainer(trainer)

    def getAllTrainers(self):
        return self.trainer.findAll()



