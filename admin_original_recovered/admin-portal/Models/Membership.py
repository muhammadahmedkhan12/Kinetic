class Membership:
    def __init__(self, user_id, membership_type, start_date, end_date, status="pending", id=None):
        self.__id = id
        self.__user_id = user_id
        self.__membership_type = membership_type
        self.__start_date = start_date
        self.__end_date = end_date
        self.__status = status

    def getId(self):
        return self.__id

    def setId(self, id):
        self.__id = id

    def getUserId(self):
        return self.__user_id

    def setUserId(self, user_id):
        self.__user_id = user_id

    def getUser(self):
        # Backward compatibility in case user_id is referenced as user
        return self.__user_id

    def getMembershipType(self):
        return self.__membership_type

    def setMembershipType(self, membership_type):
        self.__membership_type = membership_type

    def getMembershipTyoe(self):
        # Fix typo but keep for backwards compatibility if needed
        return self.__membership_type

    def getStartDate(self):
        return self.__start_date   
    
    def setStartDate(self, start_date):
        self.__start_date = start_date

    def getEndDate(self):
        return self.__end_date

    def setEndDate(self, end_date):
        self.__end_date = end_date

    def getStatus(self):
        return self.__status        

    def setStatus(self, status):
        self.__status = status
