import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.core.config import settings
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import PaymentReadSchema, CashPaymentSchema
from app.schemas.auth import MessageResponse
from app.services.payment_service import create_payment_request, approve_payment_by_admin, reject_payment_by_admin, activate_approved_membership

router = APIRouter(prefix="/payments", tags=["Payments Ledger"])

@router.post("", response_model=PaymentReadSchema)
async def submit_payment(
    plan_id: int = Form(...),
    method: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proof_filename = None
    if file:
        ext = os.path.splitext(file.filename)[1].lower() or ".png"
        if ext not in [".png", ".jpg", ".jpeg", ".webp", ".pdf"]:
            ext = ".png"
        proof_filename = f"proof_{current_user.user_id}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(settings.UPLOADS_DIR, proof_filename)
        
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

    payment = create_payment_request(
        db=db,
        user_id=current_user.user_id,
        plan_id=plan_id,
        method=method,
        proof_file=proof_filename
    )
    return payment

@router.post("/cash", response_model=PaymentReadSchema)
def record_cash_payment(data: CashPaymentSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    payment = create_payment_request(
        db=db,
        user_id=data.user_id,
        plan_id=data.plan_id,
        method="Cash at Desk",
        proof_file=None
    )
    return payment

@router.post("/{payment_id}/approve", response_model=MessageResponse)
def approve_payment(payment_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    payment = approve_payment_by_admin(db, payment_id)
    return MessageResponse(message=f"Payment #{payment.id} approved successfully.")

@router.post("/{payment_id}/reject", response_model=MessageResponse)
def reject_payment(payment_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    payment = reject_payment_by_admin(db, payment_id)
    return MessageResponse(message=f"Payment #{payment.id} has been rejected.")

@router.get("/{payment_id}/proof")
def view_payment_proof(payment_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or not payment.proof_file:
        raise HTTPException(status_code=404, detail="No proof file found for this payment.")

    filepath = os.path.join(settings.UPLOADS_DIR, payment.proof_file)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Proof file does not exist on server disk.")

    return FileResponse(filepath)
