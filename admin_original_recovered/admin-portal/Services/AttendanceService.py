from project.Repository.AttendanceRepo import AttendanceRepo
from project.Models.Attendance import Attendance

class AttendanceService:
    def __init__(self):
        self.__attendanceRepo = AttendanceRepo()

    def markAttendance(self, user_id, date, is_present):
        attendance = Attendance(
            user_id=user_id,
            date=date,
            is_present=is_present
        )
        self.__attendanceRepo.save(attendance)
        status_str = "Present" if is_present else "Absent"
        print(f"Attendance marked as '{status_str}' for user ID {user_id} on {date}.")
        return attendance

    def getAttendanceHistory(self, user_id):
        return self.__attendanceRepo.findByUserId(user_id)

    def getAllAttendance(self):
        return self.__attendanceRepo.findAll()
