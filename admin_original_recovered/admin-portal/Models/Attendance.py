class Attendance:
    def __init__(self, user_id, date, is_present, id=None):
        self.__id = id
        self.__user_id = user_id
        self.__date = date
        self.__is_present = is_present

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

    def getIsPresent(self):
        return self.__is_present

    def setIsPresent(self, is_present):
        self.__is_present = is_present

    def getIsPresemt(self):
        # Fix typo but keep for backwards compatibility if needed
        return self.__is_present
