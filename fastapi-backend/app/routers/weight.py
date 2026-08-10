from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.weight_log import WeightLog
from app.schemas.weight_log import WeightLogCreateSchema, WeightLogReadSchema
from app.services.weight_service import upsert_weight_log

router = APIRouter(prefix="/weight-logs", tags=["Body Metrics Weight Logs"])

@router.post("", response_model=WeightLogReadSchema)
def log_weight(data: WeightLogCreateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = upsert_weight_log(db, current_user.user_id, data.weight_kg)
    return log

@router.get("/history", response_model=List[WeightLogReadSchema])
def get_weight_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(WeightLog).filter(WeightLog.user_id == current_user.user_id).order_by(WeightLog.id.desc()).all()
    return logs
