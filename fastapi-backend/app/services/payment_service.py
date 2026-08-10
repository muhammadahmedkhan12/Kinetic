import os
import uuid
from typing import Optional
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.payment import Payment
from app.models.membership_plan import MembershipPlan
from app.models.membership import Membership
from app.services.membership_service import activate_approved_membership, subscribe_or_renew_user, check_and_expire_memberships
from app.core.config import settings

def create_payment_request(db: Session, user_id: int, plan_id: int, method: str, proof_file: Optional[str] = None) -> Payment:
    # 1. Prevent duplicate pending requests
    pending = db.query(Payment).filter(Payment.user_id == user_id, Payment.status == "pending").first()
    if pending:
        raise HTTPException(
            status_code=400,
            detail="You already have a payment request pending admin verification. Please wait for admin approval."
        )

    # 2. Validate plan and server-side price
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id, MembershipPlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found or inactive.")

    # 3. Check plan tier restrictions (same-plan and downgrade prevention)
    current_membership = db.query(Membership).filter(Membership.user_id == user_id).order_by(Membership.id.desc()).first()
    if current_membership and current_membership.status in ["active", "overdue"]:
        current_plan = db.query(MembershipPlan).filter(MembershipPlan.id == current_membership.plan_id).first() if current_membership.plan_id else None
        if current_plan:
            if current_plan.id == plan.id:
                raise HTTPException(status_code=400, detail=f"You are already subscribed to the {plan.plan_name} plan.")
            if plan.price < current_plan.price:
                raise HTTPException(status_code=400, detail="Plan downgrades are not permitted for active subscriptions.")

    # 4. Determine initial status
    initial_status = "pending" if method.lower() == "bank_transfer" else "completed"
    
    # 5. Create Payment record
    payment = Payment(
        user_id=user_id,
        plan_id=plan.id,
        amount=plan.price,
        date=date.today().isoformat(),
        status=initial_status,
        method="Bank Transfer" if method.lower() == "bank_transfer" else ("Card" if method.lower() == "card" else "Cash at Desk"),
        proof_file=proof_file
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # 6. Trigger subscription update
    subscribe_or_renew_user(db, user_id, plan.id, method.lower())
    
    if initial_status == "completed":
        activate_approved_membership(db, user_id, plan.id)

    return payment

def approve_payment_by_admin(db: Session, payment_id: int) -> Payment:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    if payment.status == "completed":
        return payment

    # Atomic DB transaction: Update Payment status AND activate membership
    payment.status = "completed"
    db.commit()
    db.refresh(payment)

    activate_approved_membership(db, payment.user_id, payment.plan_id)
    return payment

def reject_payment_by_admin(db: Session, payment_id: int) -> Payment:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    payment.status = "rejected"
    db.commit()
    db.refresh(payment)

    # Check if user has an active membership; if first-time subscriber, update status to inactive
    membership = db.query(Membership).filter(Membership.user_id == payment.user_id).order_by(Membership.id.desc()).first()
    if membership and membership.status == "pending_approval":
        membership.status = "inactive"
        db.commit()

    return payment
