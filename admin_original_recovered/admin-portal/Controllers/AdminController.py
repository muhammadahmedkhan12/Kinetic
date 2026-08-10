from project.Services.TrainerService import TrainerService
from project.Services.PaymentService import PaymentService
from project.Services.AttendanceService import AttendanceService
from project.Repository.UserRepo import UserRepo
from project.Models.Trainer import Trainer
from project.Models.User import User

class AdminController:
    def __init__(self, admin_user=None):
        self.__admin_user = admin_user
        self.__trainerService = TrainerService()
        self.__paymentService = PaymentService()
        self.__attendanceService = AttendanceService()
        self.__userRepo = UserRepo()

    def registerTrainer(self, name, email, password, age, number, gender, specialization, experience_years):
        # 1. Save as User with role 'trainer'
        trainer_user = User(
            name=name,
            email=email,
            password=password,
            age=age,
            number=number,
            gender=gender,
            role="trainer"
        )
        self.__userRepo.save(trainer_user)
        
        # 2. Add to Trainer profile table
        trainer = Trainer(
            name=name,
            specialization=specialization,
            experience_years=experience_years
        )
        return self.__trainerService.addTrainer(trainer)

    def viewAllMembers(self):
        all_users = self.__userRepo.findAll()
        return [u for u in all_users if u.getRole() == "member"]

    def viewAllTrainers(self):
        return self.__trainerService.getAllTrainers()

    def viewAllPayments(self):
        return self.__paymentService.getAllPayments()

    def viewAllAttendance(self):
        return self.__attendanceService.getAllAttendance()
