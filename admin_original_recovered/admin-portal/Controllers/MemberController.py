from project.Services.MembershipService import MembershipService
from project.Services.PaymentService import PaymentService
from project.Services.AttendanceService import AttendanceService

class MemberController:
    def __init__(self, user):
        self.__user = user  # User object
        self.__membershipService = MembershipService()
        self.__paymentService = PaymentService()
        self.__attendanceService = AttendanceService()

    def subscribe(self, membership_type, start_date, end_date):
        # We save user's ID directly in the database as per instruction
        user_id = self.__user.getId()
        return self.__membershipService.subscribeUser(user_id, membership_type, start_date, end_date)

    def pay(self, amount, date, method):
        user_id = self.__user.getId()
        return self.__paymentService.processPayment(user_id, amount, date, method)

    def viewMembership(self):
        user_id = self.__user.getId()
        return self.__membershipService.getMembership(user_id)

    def viewPaymentHistory(self):
        user_id = self.__user.getId()
        return self.__paymentService.getPaymentHistory(user_id)

    def viewAttendance(self):
        user_id = self.__user.getId()
        return self.__attendanceService.getAttendanceHistory(user_id)
