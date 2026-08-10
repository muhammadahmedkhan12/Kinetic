import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.membership_plan import MembershipPlan
from app.models.membership import Membership
from app.schemas.membership_plan import MembershipPlanReadSchema, MembershipPlanCreateSchema, MembershipPlanUpdateSchema
from app.schemas.membership import MembershipReadSchema, SubscribeRequestSchema, AdminAssignMembershipSchema
from app.schemas.auth import MessageResponse
from app.services.membership_service import subscribe_or_renew_user, activate_approved_membership

router = APIRouter(tags=["Memberships & Plans"])

@router.get("/membership-plans", response_model=List[MembershipPlanReadSchema])
def list_membership_plans(db: Session = Depends(get_db)):
    plans = db.query(MembershipPlan).filter(MembershipPlan.is_active == True).all()
    res = []
    for p in plans:
        features = json.loads(p.features_json) if p.features_json else []
        res.append(MembershipPlanReadSchema(
            id=p.id,
            plan_name=p.plan_name,
            price=float(p.price),
            duration_days=p.duration_days,
            description=p.description,
            features=features,
            is_active=p.is_active
        ))
    return res

@router.post("/admin/membership-plans", response_model=MembershipPlanReadSchema)
def create_membership_plan(data: MembershipPlanCreateSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(MembershipPlan).filter(MembershipPlan.plan_name.ilike(data.plan_name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Plan '{data.plan_name}' already exists.")

    plan = MembershipPlan(
        plan_name=data.plan_name.strip(),
        price=data.price,
        duration_days=data.duration_days,
        description=data.description,
        features_json=json.dumps(data.features) if data.features else "[]",
        is_active=True
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return MembershipPlanReadSchema(
        id=plan.id,
        plan_name=plan.plan_name,
        price=float(plan.price),
        duration_days=plan.duration_days,
        description=plan.description,
        features=data.features or [],
        is_active=plan.is_active
    )

@router.patch("/admin/membership-plans/{plan_id}", response_model=MembershipPlanReadSchema)
def update_membership_plan(plan_id: int, data: MembershipPlanUpdateSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    if data.plan_name is not None:
        plan.plan_name = data.plan_name.strip()
    if data.price is not None:
        plan.price = data.price
    if data.duration_days is not None:
        plan.duration_days = data.duration_days
    if data.description is not None:
        plan.description = data.description
    if data.features is not None:
        plan.features_json = json.dumps(data.features)
    if data.is_active is not None:
        plan.is_active = data.is_active

    db.commit()
    db.refresh(plan)
    features = json.loads(plan.features_json) if plan.features_json else []
    return MembershipPlanReadSchema(
        id=plan.id,
        plan_name=plan.plan_name,
        price=float(plan.price),
        duration_days=plan.duration_days,
        description=plan.description,
        features=features,
        is_active=plan.is_active
    )

@router.delete("/admin/membership-plans/{plan_id}", response_model=MessageResponse)
def soft_delete_membership_plan(plan_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")
    plan.is_active = False
    db.commit()
    return MessageResponse(message=f"Membership plan '{plan.plan_name}' has been soft-deleted (retired).")

@router.post("/memberships/subscribe", response_model=MembershipReadSchema)
def subscribe_to_plan(data: SubscribeRequestSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = subscribe_or_renew_user(db, current_user.user_id, data.plan_id, data.payment_method)
    return membership

@router.post("/admin/memberships/assign", response_model=MembershipReadSchema)
def admin_assign_membership(data: AdminAssignMembershipSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    membership = activate_approved_membership(db, data.user_id, data.plan_id)
    return membership
