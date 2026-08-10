from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_full_access
from app.models.user import User
from app.models.gym_class import GymClass
from app.models.class_booking import ClassBooking
from app.schemas.gym_class import (
    GymClassReadSchema, ClassCreateSchema, BookingRequestSchema,
    BookingResponseSchema, ClassesListResponseSchema
)
from app.schemas.auth import MessageResponse
from app.services.class_service import book_gym_class, cancel_gym_class_booking

router = APIRouter(prefix="/classes", tags=["Workout Classes Schedule"])

@router.get("", response_model=ClassesListResponseSchema)
def list_classes(date: Optional[str] = None, db: Session = Depends(get_db)):
    classes = db.query(GymClass).all()
    res_classes = []
    
    for c in classes:
        booked_count = db.query(ClassBooking).filter(ClassBooking.class_id == c.id).count()
        t_name = c.trainer.name if c.trainer else "Staff Instructor"
        res_classes.append(GymClassReadSchema(
            id=c.id,
            trainer_id=c.trainer_id,
            name=c.name,
            day=c.day,
            time=c.time,
            capacity=c.capacity,
            trainer_name=t_name,
            booked_count=booked_count
        ))

    booked_class_ids = []
    return ClassesListResponseSchema(classes=res_classes, booked_class_ids=booked_class_ids)

@router.post("", response_model=GymClassReadSchema)
def create_class(data: ClassCreateSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if not data.name.strip() or not data.day.strip() or not data.time.strip():
        raise HTTPException(status_code=400, detail="Name, Days, and Time are required.")

    new_class = GymClass(
        name=data.name.strip(),
        day=data.day.strip(),
        time=data.time.strip(),
        capacity=data.capacity,
        trainer_id=data.trainer_id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    t_name = new_class.trainer.name if new_class.trainer else "Staff Instructor"
    return GymClassReadSchema(
        id=new_class.id,
        trainer_id=new_class.trainer_id,
        name=new_class.name,
        day=new_class.day,
        time=new_class.time,
        capacity=new_class.capacity,
        trainer_name=t_name,
        booked_count=0
    )

@router.delete("/{class_id}", response_model=MessageResponse)
def delete_class(class_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    target = db.query(GymClass).filter(GymClass.id == class_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Class not found.")

    # Purge bookings
    db.query(ClassBooking).filter(ClassBooking.class_id == class_id).delete()
    db.delete(target)
    db.commit()
    return MessageResponse(message=f"Class '{target.name}' removed from schedule.")

@router.post("/book", response_model=BookingResponseSchema)
def book_class(data: BookingRequestSchema, current_user: User = Depends(require_full_access), db: Session = Depends(get_db)):
    booking = book_gym_class(db, current_user.user_id, data.class_id)
    return BookingResponseSchema(
        success=True,
        booked=True,
        message="Class booked successfully!",
        class_id=data.class_id
    )

@router.post("/cancel-booking", response_model=BookingResponseSchema)
def cancel_booking(data: BookingRequestSchema, current_user: User = Depends(require_full_access), db: Session = Depends(get_db)):
    cancel_gym_class_booking(db, current_user.user_id, data.class_id)
    return BookingResponseSchema(
        success=True,
        booked=False,
        message="Class booking cancelled.",
        class_id=data.class_id
    )
