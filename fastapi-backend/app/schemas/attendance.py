from pydantic import BaseModel

class AttendanceReadSchema(BaseModel):
    id: int
    user_id: int
    date: str
    is_present: int

    class Config:
        from_attributes = True

class CheckInResponseSchema(BaseModel):
    success: bool = True
    message: str
    attendance_id: int
    date: str
