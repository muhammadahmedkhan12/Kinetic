from datetime import date, datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.membership import Membership
from app.models.membership_plan import MembershipPlan
from app.models.payment import Payment
from app.core.config import settings

def check_and_expire_memberships(user_id: int, db: Session) -> str:
    membership = db.query(Membership).filter(Membership.user_id == user_id).order_by(Membership.id.desc()).first()
    if not membership:
        return "inactive"
    
    if membership.status == "pending_approval":
        return "pending_approval"
    
    try:
        end_dt = datetime.strptime(membership.end_date, "%Y-%m-%d").date()
    except Exception:
        return "inactive"

    today = date.today()
    days_overdue = (today - end_dt).days

    if days_overdue <= 0:
        new_status = "active"
    elif 1 <= days_overdue <= settings.GRACE_PERIOD_DAYS:
        new_status = "overdue"
    else:
        new_status = "inactive"

    if membership.status != new_status and membership.status != "pending_approval":
        membership.status = new_status
        db.commit()
        db.refresh(membership)
        
    return membership.status

def subscribe_or_renew_user(db: Session, user_id: int, plan_id: int, payment_method: str) -> Membership:
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id, MembershipPlan.is_active == True).first()
    if not plan:
        raise ValueError("Selected membership plan is invalid or inactive.")

    existing_membership = db.query(Membership).filter(Membership.user_id == user_id).order_by(Membership.id.desc()).first()
    
    today_str = date.today().isoformat()
    
    # Check if user already has an active or overdue subscription
    current_status = check_and_expire_memberships(user_id, db)
    
    if current_status in ["active", "overdue"]:
        # Renewal Flow: Keep existing membership active during review!
        # Do not alter current_membership status; record pending payment only.
        return existing_membership
    else:
        # First-time or Reactivation Subscription: Create pending_approval membership
        if existing_membership:
            existing_membership.plan_id = plan.id
            existing_membership.membership_type = plan.plan_name
            existing_membership.status = "pending_approval" if payment_method == "bank_transfer" else "active"
            db.commit()
            db.refresh(existing_membership)
            return existing_membership
        else:
            new_membership = Membership(
                user_id=user_id,
                plan_id=plan.id,
                membership_type=plan.plan_name,
                start_date=today_str,
                end_date=today_str,
                status="pending_approval" if payment_method == "bank_transfer" else "active"
            )
            db.add(new_membership)
            db.commit()
            db.refresh(new_membership)
            return new_membership

def activate_approved_membership(db: Session, user_id: int, plan_id: int) -> Membership:
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    plan_name = plan.plan_name if plan else "Pro"
    duration_days = plan.duration_days if plan else 30

    membership = db.query(Membership).filter(Membership.user_id == user_id).order_by(Membership.id.desc()).first()

    today_dt = date.today()
    current_end_dt: Optional[date] = None
    if membership and membership.end_date:
        try:
            current_end_dt = datetime.strptime(membership.end_date, "%Y-%m-%d").date()
        except Exception:
            current_end_dt = None

    # Handle null current_end_date gracefully using max(today, current_end_date or today)
    base_date = max(today_dt, current_end_dt) if current_end_dt else today_dt
    new_end_date_str = (base_date + timedelta(days=duration_days)).isoformat()
    today_str = today_dt.isoformat()

    if membership:
        membership.plan_id = plan_id
        membership.membership_type = plan_name
        membership.start_date = today_str if (not current_end_dt or current_end_dt < today_dt) else membership.start_date
        membership.end_date = new_end_date_str
        membership.status = "active"
    else:
        membership = Membership(
            user_id=user_id,
            plan_id=plan_id,
            membership_type=plan_name,
            start_date=today_str,
            end_date=new_end_date_str,
            status="active"
        )
        db.add(membership)

    db.commit()
    db.refresh(membership)
    return membership
