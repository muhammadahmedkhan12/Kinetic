import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.models.membership import Membership
from app.models.payment import Payment
from app.models.class_booking import ClassBooking
from app.schemas.user import UserUpdateSchema, OnboardingProfileSchema
from app.schemas.auth import PasswordChangeSchema, MessageResponse
from app.services.membership_service import check_and_expire_memberships
from app.services.weight_service import upsert_weight_log

router = APIRouter(prefix="/members", tags=["Members Profile"])

@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership_status = check_and_expire_memberships(current_user.user_id, db)
    
    membership = db.query(Membership).filter(Membership.user_id == current_user.user_id).order_by(Membership.id.desc()).first()
    membership_data = None
    if membership:
        membership_data = {
            "id": membership.id,
            "type": membership.membership_type,
            "start_date": membership.start_date,
            "end_date": membership.end_date,
            "status": membership.status
        }
        
    payments = db.query(Payment).filter(Payment.user_id == current_user.user_id).order_by(Payment.id.desc()).all()
    user_payments = [{
        "id": p.id,
        "amount": float(p.amount) if p.amount is not None else 0.0,
        "date": p.date,
        "method": p.method,
        "status": p.status,
        "proof_file": p.proof_file
    } for p in payments]

    bookings = db.query(ClassBooking).filter(ClassBooking.user_id == current_user.user_id).all()
    booked_class_ids = [b.class_id for b in bookings]

    goals_list = []
    if current_user.goals_json:
        try:
            goals_list = json.loads(current_user.goals_json)
        except Exception:
            goals_list = [current_user.goals_json]

    return {
        "id": current_user.user_id,
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "age": current_user.age or 0,
        "gender": current_user.gender or "Male",
        "role": current_user.role,
        "is_approved": current_user.is_approved if current_user.is_approved is not None else 1,
        "must_change_password": current_user.must_change_password or 0,
        "is_onboarded": getattr(current_user, 'is_onboarded', 0) or 0,
        "height": current_user.height,
        "goals": goals_list,
        "activity_level": current_user.activity_level,
        "injuries": current_user.injuries,
        "experience_level": current_user.experience_level,
        "preferred_days": json.loads(current_user.preferred_days_json) if current_user.preferred_days_json else [],
        "membership": membership_data,
        "payments": user_payments,
        "bookings": booked_class_ids
    }

@router.patch("/me")
def update_my_profile(data: UserUpdateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    if data.age is not None:
        current_user.age = data.age
    if data.gender is not None:
        current_user.gender = data.gender.strip()
    if data.height is not None:
        current_user.height = data.height
    if data.goals is not None:
        current_user.goals_json = json.dumps(data.goals)

    db.commit()
    db.refresh(current_user)
    return get_my_profile(current_user=current_user, db=db)

@router.post("/me/onboarding")
def complete_onboarding(data: OnboardingProfileSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_onboarded = 1
    current_user.height = data.height
    if data.activity_level:
        current_user.activity_level = data.activity_level
    if data.injuries:
        current_user.injuries = data.injuries
    if data.experience_level:
        current_user.experience_level = data.experience_level
    if data.preferred_days:
        current_user.preferred_days_json = json.dumps(data.preferred_days)
    if data.goals:
        current_user.goals_json = json.dumps(data.goals)

    if data.starting_weight and data.starting_weight > 0:
        upsert_weight_log(db, current_user.user_id, data.starting_weight)

    db.commit()
    db.refresh(current_user)
    return get_my_profile(current_user=current_user, db=db)

@router.post("/me/change-password", response_model=MessageResponse)
def change_password(data: PasswordChangeSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    current_user.password = get_password_hash(data.new_password)
    current_user.must_change_password = 0
    db.commit()
    return MessageResponse(message="Password updated successfully.")
