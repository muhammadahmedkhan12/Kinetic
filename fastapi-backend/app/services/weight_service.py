from datetime import date
from sqlalchemy.orm import Session
from app.models.weight_log import WeightLog

def upsert_weight_log(db: Session, user_id: int, weight_kg: float) -> WeightLog:
    today_str = date.today().isoformat()
    existing = db.query(WeightLog).filter(WeightLog.user_id == user_id, WeightLog.date == today_str).first()
    if existing:
        existing.weight_kg = weight_kg
        db.commit()
        db.refresh(existing)
        return existing
    
    log = WeightLog(
        user_id=user_id,
        date=today_str,
        weight_kg=weight_kg
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
