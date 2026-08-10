class User:
    def __init__(self, name, email, password, age, number, gender, role, is_approved=0, id=None):
        self.__id = id
        self.__name = name
        self.__email = email
        self.__number = number
        self.__password = password
        self.__gender = gender
        self.__age = age
        self.__role = role
        self.__is_approved = is_approved

    def getId(self):
        return self.__id

    def setId(self, id):
        self.__id = id

    def getName(self):
        return self.__name

    def setName(self, name):
        self.__name = name

    def getEmail(self):
        return self.__email

    def setEmail(self, email):
        self.__email = email

    def getPassword(self):
        return self.__password

    def setPassword(self, password):
        self.__password = password

    def getAge(self):
        return self.__age

    def setAge(self, age):
        self.__age = age

    def getNumber(self):
        return self.__number

    def setNumber(self, number):
        self.__number = number

    def getPhone(self):
        return self.__number

    def getGender(self):
        return self.__gender

    def setGender(self, gender):
        self.__gender = gender

    def getRole(self):
        return self.__role

    def setRole(self, role):
        self.__role = role

    def getIsApproved(self):
        return self.__is_approved

    def setIsApproved(self, is_approved):
        self.__is_approved = is_approved

