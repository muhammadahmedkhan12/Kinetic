from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_full_access
from app.models.user import User
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceReadSchema, CheckInResponseSchema
from app.services.attendance_service import record_check_in

router = APIRouter(prefix="/attendance", tags=["Daily Attendance Check-In"])

@router.post("/check-in", response_model=CheckInResponseSchema)
def check_in(current_user: User = Depends(require_full_access), db: Session = Depends(get_db)):
    attendance = record_check_in(db, current_user.user_id)
    return CheckInResponseSchema(
        success=True,
        message="Gate check-in recorded successfully! Welcome to KINETIC Gym.",
        attendance_id=attendance.id,
        date=attendance.date
    )

@router.get("/history", response_model=List[AttendanceReadSchema])
def get_attendance_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(Attendance).filter(Attendance.user_id == current_user.user_id).order_by(Attendance.id.desc()).all()
    return logs
