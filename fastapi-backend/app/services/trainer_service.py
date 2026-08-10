from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.trainer import Trainer
from app.schemas.trainer import TrainerCreateSchema, TrainerUpdateSchema

def create_trainer(db: Session, data: TrainerCreateSchema) -> Trainer:
    if len(data.name.strip()) < 3 or len(data.specialization.strip()) < 3:
        raise HTTPException(status_code=400, detail="Name and specialization must be at least 3 characters long.")
    
    trainer = Trainer(
        name=data.name.strip(),
        specialization=data.specialization.strip(),
        experience_years=data.experience_years
    )
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer

def update_trainer(db: Session, trainer_id: int, data: TrainerUpdateSchema) -> Trainer:
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found.")

    if data.name is not None:
        trainer.name = data.name.strip()
    if data.specialization is not None:
        trainer.specialization = data.specialization.strip()
    if data.experience_years is not None:
        trainer.experience_years = data.experience_years

    db.commit()
    db.refresh(trainer)
    return trainer

def delete_trainer(db: Session, trainer_id: int) -> bool:
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found.")
    db.delete(trainer)
    db.commit()
    return True
