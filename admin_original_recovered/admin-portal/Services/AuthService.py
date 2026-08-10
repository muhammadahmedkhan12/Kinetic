from project.Repository.UserRepo import UserRepo
from project.Models.User import User

class AuthService:
    def __init__(self):
        self.__userRepo = UserRepo()

    def register(self, user):
        existing = self.__userRepo.findByEmail(user.getEmail())
        if existing:
            print("Registration failed: Email already exists")
            return False
        self.__userRepo.save(user)
        return True

    def login(self, email, password):
        user = self.__userRepo.findByEmail(email)
        if user is None:
            print("Login failed: User not found")
            return None
        if user.getPassword() == password:
            print(f"Login successful for {user.getName()} ({user.getRole()})")
            return user
        print("Login failed: Incorrect password")
        return None
