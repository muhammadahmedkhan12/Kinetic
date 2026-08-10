from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.trainer import Trainer
from app.schemas.trainer import TrainerReadSchema, TrainerCreateSchema, TrainerUpdateSchema
from app.schemas.auth import MessageResponse
from app.services.trainer_service import create_trainer, update_trainer, delete_trainer

router = APIRouter(prefix="/trainers", tags=["Gym Trainers Directory"])

@router.get("", response_model=List[TrainerReadSchema])
def list_trainers(db: Session = Depends(get_db)):
    return db.query(Trainer).all()

@router.post("/admin/trainers", response_model=TrainerReadSchema)
def add_trainer(data: TrainerCreateSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return create_trainer(db, data)

@router.put("/admin/trainers/{trainer_id}", response_model=TrainerReadSchema)
def edit_trainer(trainer_id: int, data: TrainerUpdateSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return update_trainer(db, trainer_id, data)

@router.delete("/admin/trainers/{trainer_id}", response_model=MessageResponse)
def remove_trainer(trainer_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    delete_trainer(db, trainer_id)
    return MessageResponse(message="Trainer removed successfully.")
