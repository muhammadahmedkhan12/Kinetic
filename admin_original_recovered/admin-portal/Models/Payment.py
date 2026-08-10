class Payment:
    def __init__(self, user_id, amount, date, status, method, id=None):
        self.__id = id
        self.__user_id = user_id
        self.__amount = amount
        self.__date = date
        self.__status = status
        self.__method = method

    def getId(self):
        return self.__id

    def setId(self, id):
        self.__id = id

    def getUserId(self):
        return self.__user_id

    def setUserId(self, user_id):
        self.__user_id = user_id

    def getAmount(self):
        return self.__amount

    def setAmount(self, amount):
        self.__amount = amount

    def getDate(self):
        return self.__date

    def setDate(self, date):
        self.__date = date

    def getStatus(self):
        return self.__status

    def setStatus(self, status):
        self.__status = status

    def getMethod(self):
        return self.__method

    def setMethod(self, method):
        self.__method = method
