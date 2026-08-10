from project.Models.Membership import Membership
from project.Services.MembershipService import Memebershipservice

class MemberController:
    def __init__(self,user):
        self.__user=user

    def subsctibe(self,membership_type,start_date,end_date,status="pending"):
        
        self.Membership= Membership(self.__user,membership_type,start_date,end_date,status="pending")

