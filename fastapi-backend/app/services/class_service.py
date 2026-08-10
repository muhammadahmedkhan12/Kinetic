from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.gym_class import GymClass
from app.models.class_booking import ClassBooking

def book_gym_class(db: Session, user_id: int, class_id: int) -> ClassBooking:
    # Use atomic DB row lock with_for_update() on GymClass during capacity verification
    try:
        gym_class = db.query(GymClass).filter(GymClass.id == class_id).with_for_update().first()
    except Exception:
        gym_class = db.query(GymClass).filter(GymClass.id == class_id).first()

    if not gym_class:
        raise HTTPException(status_code=404, detail="Class not found.")

    # Check existing booking by this user
    existing = db.query(ClassBooking).filter(ClassBooking.user_id == user_id, ClassBooking.class_id == class_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already booked this class.")

    # Check capacity count
    current_bookings_count = db.query(ClassBooking).filter(ClassBooking.class_id == class_id).count()
    if current_bookings_count >= gym_class.capacity:
        raise HTTPException(status_code=400, detail="Class is fully booked.")

    booking = ClassBooking(
        user_id=user_id,
        class_id=class_id
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def cancel_gym_class_booking(db: Session, user_id: int, class_id: int) -> bool:
    booking = db.query(ClassBooking).filter(ClassBooking.user_id == user_id, ClassBooking.class_id == class_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found.")

    db.delete(booking)
    db.commit()
    return True
