class WeightLog:
    def __init__(self, user_id, date, weight_kg, id=None):
        self.__id = id
        self.__user_id = user_id
        self.__date = date
        self.__weight_kg = weight_kg

    def getId(self):
        return self.__id

    def setId(self, id):
        self.__id = id

    def getUserId(self):
        return self.__user_id

    def setUserId(self, user_id):
        self.__user_id = user_id

    def getDate(self):
        return self.__date

    def setDate(self, date):
        self.__date = date

    def getWeightKg(self):
        return self.__weight_kg

    def setWeightKg(self, weight_kg):
        self.__weight_kg = weight_kg
