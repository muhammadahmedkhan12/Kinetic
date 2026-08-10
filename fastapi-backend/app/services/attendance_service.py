from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.attendance import Attendance

def record_check_in(db: Session, user_id: int) -> Attendance:
    today_str = date.today().isoformat()
    existing = db.query(Attendance).filter(Attendance.user_id == user_id, Attendance.date == today_str).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already checked in today!")

    new_att = Attendance(
        user_id=user_id,
        date=today_str,
        is_present=1
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)
    return new_att
