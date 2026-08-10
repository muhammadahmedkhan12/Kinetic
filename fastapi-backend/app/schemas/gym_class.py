from pydantic import BaseModel
from typing import Optional, List

class GymClassReadSchema(BaseModel):
    id: int
    trainer_id: Optional[int] = None
    name: str
    day: str
    time: str
    capacity: int
    trainer_name: Optional[str] = "Staff Instructor"
    booked_count: int = 0

    class Config:
        from_attributes = True

class ClassCreateSchema(BaseModel):
    name: str
    day: str
    time: str
    capacity: int = 20
    trainer_id: Optional[int] = None

class BookingRequestSchema(BaseModel):
    class_id: int

class BookingResponseSchema(BaseModel):
    success: bool = True
    booked: bool
    message: str
    class_id: int

class ClassesListResponseSchema(BaseModel):
    classes: List[GymClassReadSchema]
    booked_class_ids: List[int]
