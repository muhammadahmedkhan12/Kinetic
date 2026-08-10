from project.Repository.PaymentRepo import PaymentRepo
from project.Models.Payment import Payment

class PaymentService:
    def __init__(self):
        self.__paymentRepo = PaymentRepo()

    def processPayment(self, user_id, amount, date, method, status=None):
        if amount <= 0:
            print("Payment amount must be greater than zero")
            return None
        
        # Bank transfer defaults to pending (needs admin approval)
        if status is None:
            status = "pending" if method == "bank_transfer" else "completed"
        
        payment = Payment(
            user_id=user_id,
            amount=amount,
            date=date,
            status=status,
            method=method
        )
        self.__paymentRepo.save(payment)
        print(f"Payment of {amount} via {method} [{status}] for user ID {user_id}.")
        return payment

    def getPaymentById(self, payment_id):
        return self.__paymentRepo.findById(payment_id)

    def approvePayment(self, payment_id):
        self.__paymentRepo.updateStatus(payment_id, "completed")
        print(f"Payment #{payment_id} approved.")

    def rejectPayment(self, payment_id):
        self.__paymentRepo.updateStatus(payment_id, "rejected")
        print(f"Payment #{payment_id} rejected.")

    def getPaymentHistory(self, user_id):
        return self.__paymentRepo.findByUserId(user_id)

    def getAllPayments(self):
        return self.__paymentRepo.findAll()

