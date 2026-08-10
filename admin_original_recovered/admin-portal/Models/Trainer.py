class Trainer:
    def __init__(self, name, specialization, experience_years, id=None):
        self.__id = id
        self.__name = name
        self.__specialization = specialization
        self.__experience_years = experience_years

    def getId(self):
        return self.__id

    def setId(self, id):
        self.__id = id

    def getName(self):
        return self.__name

    def setName(self, name):
        self.__name = name

    def getSpecialization(self):
        return self.__specialization

    def setSpecialization(self, specialization):
        self.__specialization = specialization

    def getExperience(self):
        return self.__experience_years

    def getExperienceYears(self):
        return self.__experience_years

    def setExperienceYears(self, experience_years):
        self.__experience_years = experience_years
