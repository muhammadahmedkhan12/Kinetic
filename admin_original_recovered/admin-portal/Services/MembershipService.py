import re
from project.Repository.UserRepo import UserRepo
from project.Repository.MembershipRepo import MembershipRepo
from project.Models.Membership import Membership

class MembershipService:
    def __init__(self):
        self.__userRepo = UserRepo()
        self.__membershipRepo = MembershipRepo()

    def registerMember(self, member):
        if not self.validateMember(member):
            print("Invalid data")
            return False
        self.__userRepo.save(member)
        return True
    
    def loginUser(self, email, password):
        member = self.__userRepo.findByEmail(email)
        if member is None:
            return None
        if member.getPassword() == password:
            return member
        return None

    def subscribeUser(self, user_id, membership_type, start_date, end_date, status="active"):
        # Check if user already has a membership record
        existing = self.__membershipRepo.findByUserId(user_id)
        if existing:
            # Update existing membership record in place
            existing.setMembershipType(membership_type)
            existing.setStartDate(start_date)
            existing.setEndDate(end_date)
            existing.setStatus(status)
            self.__membershipRepo.update(existing)
            print(f"Subscription of type '{membership_type}' updated successfully for user ID {user_id}.")
            return existing
        else:
            # Create a new membership for the user
            membership = Membership(
                user_id=user_id,
                membership_type=membership_type,
                start_date=start_date,
                end_date=end_date,
                status=status
            )
            self.__membershipRepo.save(membership)
            print(f"Subscription of type '{membership_type}' created successfully for user ID {user_id}.")
            return membership

    def getMembership(self, user_id):
        return self.__membershipRepo.findByUserId(user_id)

    def validateMember(self, member):
        # Check duplicate email
        if self.__userRepo.findByEmail(member.getEmail()):
            print("Email already exists")
            return False

        # Name validation
        if len(member.getName()) < 3:
            print("Name must be at least 3 characters")
            return False

        # Email format validation
        email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_pattern, member.getEmail()):
            print("Invalid email format")
            return False

        # Password validation
        password = member.getPassword()
        if len(password) < 8:
            print("Password must be at least 8 characters")
            return False

        if not re.search(r"[A-Z]", password):
            print("Password must contain an uppercase letter")
            return False

        if not re.search(r"[a-z]", password):
            print("Password must contain a lowercase letter")
            return False

        if not re.search(r"[0-9]", password):
            print("Password must contain a number")
            return False

        if not re.search(r"[!@#$%^&*]", password):
            print("Password must contain a special character")
            return False

        return True
