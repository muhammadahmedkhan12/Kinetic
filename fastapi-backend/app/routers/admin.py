import json
import random
import requests
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.user import User
from app.models.payment import Payment
from app.models.trainer import Trainer
from app.models.gym_class import GymClass
from app.models.equipment_asset import EquipmentAsset
from app.models.class_booking import ClassBooking
from app.schemas.admin import (
    AdminSummaryResponseSchema, StatsSummarySchema, PendingPaymentDetailSchema,
    AdminMemberDetailResponseSchema
)
from app.schemas.user import UserReadSchema, AdminCreateMemberSchema, AdminCreatedMemberResponseSchema
from app.schemas.membership import MembershipReadSchema
from app.schemas.payment import PaymentReadSchema
from app.schemas.trainer import TrainerReadSchema
from app.schemas.gym_class import GymClassReadSchema
from app.schemas.asset import AssetReadSchema
from app.schemas.auth import MessageResponse
from app.services.membership_service import check_and_expire_memberships

router = APIRouter(prefix="/admin", tags=["Admin Portal Summary & Actions"])

@router.get("/dashboard-summary", response_model=AdminSummaryResponseSchema)
def get_admin_dashboard_summary(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    all_users = db.query(User).all()
    members = [u for u in all_users if u.role == "member"]
    pending_members = [u for u in all_users if u.role == "member" and u.is_approved == 0]
    
    payments = db.query(Payment).all()
    pending_payments_raw = [p for p in payments if p.status and str(p.status).strip().lower() == "pending"]
    
    trainers = db.query(Trainer).all()
    classes = db.query(GymClass).all()
    assets = db.query(EquipmentAsset).all()

    # Calculate monthly revenue
    monthly_revenue = sum(float(p.amount) for p in payments if p.status == "completed" and p.amount is not None)

    stats = StatsSummarySchema(
        total_members=len(members),
        total_trainers=len(trainers),
        total_payments=len(payments),
        total_assets=len(assets),
        monthly_revenue=monthly_revenue
    )

    # Serialize pending payments
    pending_payments_data = []
    for p in pending_payments_raw:
        mem = db.query(User).filter(User.user_id == p.user_id).first()
        pending_payments_data.append(PendingPaymentDetailSchema(
            id=p.id,
            user_id=p.user_id,
            member_name=mem.name if mem else "Unknown Member",
            amount=float(p.amount) if p.amount is not None else 0.0,
            date=p.date,
            method=p.method,
            proof_file=p.proof_file
        ))

    # Serialize classes with booked_count
    res_classes = []
    for c in classes:
        cnt = db.query(ClassBooking).filter(ClassBooking.class_id == c.id).count()
        t_name = c.trainer.name if c.trainer else "Staff Instructor"
        res_classes.append(GymClassReadSchema(
            id=c.id,
            trainer_id=c.trainer_id,
            name=c.name,
            day=c.day,
            time=c.time,
            capacity=c.capacity,
            trainer_name=t_name,
            booked_count=cnt
        ))

    from app.models.membership import Membership

    serialized_members = []
    for m in members:
        check_and_expire_memberships(m.user_id, db)
        membership = db.query(Membership).filter(Membership.user_id == m.user_id).order_by(Membership.id.desc()).first()
        mem_schema = MembershipReadSchema.from_orm(membership) if membership else None
        m_dict = UserReadSchema.from_orm(m).model_dump()
        m_dict['membership'] = mem_schema
        serialized_members.append(UserReadSchema(**m_dict))

    serialized_pending_members = []
    for m in pending_members:
        check_and_expire_memberships(m.user_id, db)
        membership = db.query(Membership).filter(Membership.user_id == m.user_id).order_by(Membership.id.desc()).first()
        mem_schema = MembershipReadSchema.from_orm(membership) if membership else None
        m_dict = UserReadSchema.from_orm(m).model_dump()
        m_dict['membership'] = mem_schema
        serialized_pending_members.append(UserReadSchema(**m_dict))

    return AdminSummaryResponseSchema(
        success=True,
        stats=stats,
        members=serialized_members,
        pending_payments=pending_payments_data,
        pending_members=serialized_pending_members,
        trainers=[TrainerReadSchema.from_orm(t) for t in trainers],
        classes=res_classes,
        assets=[AssetReadSchema.from_orm(a) for a in assets]
    )

@router.post("/members", response_model=AdminCreatedMemberResponseSchema)
def admin_create_member(data: AdminCreateMemberSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    email_clean = data.email.strip().lower()
    phone_clean = data.phone.strip() if (data.phone and data.phone.strip()) else None

    # Check duplicate email
    existing_email = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Member with email '{data.email}' already exists.")

    # Check duplicate phone (only if phone is provided)
    if phone_clean:
        existing_phone = db.query(User).filter(User.phone == phone_clean).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail=f"Member with phone number '{data.phone}' already exists.")

    temp_pin = "".join(random.choices("0123456789", k=6))
    new_user = User(
        name=data.name.strip(),
        email=email_clean,
        password=get_password_hash(temp_pin),
        plain_password=temp_pin,
        phone=phone_clean,
        age=data.age or 0,
        gender=data.gender or "Male",
        role="member",
        is_approved=1,
        must_change_password=1  # Gate behind must_change_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AdminCreatedMemberResponseSchema(
        success=True,
        message=f"Member '{new_user.name}' registered successfully!",
        user_id=new_user.user_id,
        name=new_user.name,
        email=new_user.email,
        temp_password=temp_pin
    )

@router.post("/members/{user_id}/approve", response_model=MessageResponse)
def approve_member_registration(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    user.is_approved = 1
    db.commit()
    return MessageResponse(message=f"Member #{user_id} registration approved!")

@router.post("/members/{user_id}/reject", response_model=MessageResponse)
def reject_member_registration(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    db.delete(user)
    db.commit()
    return MessageResponse(message=f"Member #{user_id} registration rejected and account deleted.")

@router.delete("/members/{user_id}", response_model=MessageResponse)
def delete_member_account(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    db.query(ClassBooking).filter(ClassBooking.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return MessageResponse(message=f"Member #{user_id} account deleted successfully.")

from app.schemas.admin import (
    AdminSummaryResponseSchema, StatsSummarySchema, PendingPaymentDetailSchema,
    AdminMemberDetailResponseSchema, AdminResetPasswordSchema, AdminResetPasswordResponseSchema
)

def sanitize_password_for_admin(user: User) -> str:
    plain = getattr(user, 'plain_password', None)
    if plain and isinstance(plain, str) and not plain.startswith("scrypt:") and not plain.startswith("$2") and len(plain) <= 20:
        return plain

    raw_pwd = getattr(user, 'password', None)
    if raw_pwd and isinstance(raw_pwd, str) and not raw_pwd.startswith("scrypt:") and not raw_pwd.startswith("$2") and len(raw_pwd) <= 20:
        return raw_pwd

    # If it's a secure hash, do not show a fake calculation; return placeholder
    return "••••••"

@router.post("/members/{user_id}/reset-password", response_model=AdminResetPasswordResponseSchema)
def admin_reset_member_password(
    user_id: int,
    data: AdminResetPasswordSchema = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    new_pin = (data.new_password.strip() if data and data.new_password and data.new_password.strip() else None)
    if not new_pin:
        new_pin = "".join(random.choices("0123456789", k=6))

    user.password = get_password_hash(new_pin)
    user.plain_password = new_pin
    db.commit()
    db.refresh(user)

    return AdminResetPasswordResponseSchema(
        success=True,
        message=f"Password for member '{user.name}' reset successfully.",
        user_id=user.user_id,
        temp_password=new_pin
    )

@router.get("/members/{user_id}", response_model=AdminMemberDetailResponseSchema)
def get_admin_member_details(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    status_str = check_and_expire_memberships(user_id, db)
    
    from app.models.membership import Membership
    membership = db.query(Membership).filter(Membership.user_id == user_id).order_by(Membership.id.desc()).first()
    membership_data = None
    if membership:
        membership_data = MembershipReadSchema.from_orm(membership)

    payments = db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.id.desc()).all()
    user_payments = [PaymentReadSchema.from_orm(p) for p in payments]

    pwd_display = sanitize_password_for_admin(user)

    return AdminMemberDetailResponseSchema(
        id=user.user_id,
        name=user.name,
        email=user.email,
        password=pwd_display,
        phone=user.phone,
        age=user.age,
        gender=user.gender,
        membership=membership_data,
        payments=user_payments
    )

@router.post("/members/{user_id}/send-reminder", response_model=MessageResponse)
def send_member_payment_reminder(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Member not found.")

    msg = f"Payment reminder email sent successfully to {user.name} ({user.email})!"
    if settings.N8N_EMAIL_REMINDER_WEBHOOK:
        try:
            payload = {
                "user_id": user_id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "event": "payment_reminder",
                "message": f"Hi {user.name}, this is a reminder from KINETIC Gym to select a membership plan and complete payment."
            }
            requests.post(settings.N8N_EMAIL_REMINDER_WEBHOOK, json=payload, timeout=5)
            msg += " (Triggered via n8n integration)"
        except Exception as e:
            print(f"[N8N Reminder Error] {e}")

    return MessageResponse(message=msg)

