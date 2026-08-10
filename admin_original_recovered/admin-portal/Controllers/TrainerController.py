from project.Services.TrainerService import TrainerService
from project.Services.AttendanceService import AttendanceService
from project.Models.Trainer import Trainer

class TrainerController:
    def __init__(self, trainer_user=None):
        self.__trainer_user = trainer_user  # User object with role 'trainer'
        self.__trainerService = TrainerService()
        self.__attendanceService = AttendanceService()

    def updateProfile(self, specialization, experience_years):
        if self.__trainer_user:
            trainer = Trainer(
                name=self.__trainer_user.getName(),
                specialization=specialization,
                experience_years=experience_years
            )
            return self.__trainerService.addTrainer(trainer)
        print("Error: No trainer profile context found")
        return False

    def markMemberAttendance(self, member_id, date, is_present):
        # Trainers mark attendance for members
        return self.__attendanceService.markAttendance(member_id, date, is_present)

    def getMemberAttendanceHistory(self, member_id):
        return self.__attendanceService.getAttendanceHistory(member_id)
