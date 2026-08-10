from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.equipment_asset import EquipmentAsset
from app.schemas.asset import AssetCreateSchema

def create_asset(db: Session, data: AssetCreateSchema) -> EquipmentAsset:
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Asset name is required.")

    last_serviced = data.last_serviced or date.today().isoformat()
    try:
        dt = datetime.strptime(last_serviced, "%Y-%m-%d")
        next_service = (dt + timedelta(days=90)).strftime("%Y-%m-%d")
    except Exception:
        next_service = (date.today() + timedelta(days=90)).isoformat()

    asset = EquipmentAsset(
        name=data.name.strip(),
        category=data.category.strip(),
        quantity=data.quantity,
        location=data.location.strip(),
        status=data.status.strip(),
        last_serviced=last_serviced,
        next_service=next_service
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

def mark_asset_serviced(db: Session, asset_id: int) -> EquipmentAsset:
    asset = db.query(EquipmentAsset).filter(EquipmentAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    today_str = date.today().isoformat()
    next_str = (date.today() + timedelta(days=90)).isoformat()
    asset.last_serviced = today_str
    asset.next_service = next_str
    asset.status = "Operational"
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset_id: int) -> bool:
    asset = db.query(EquipmentAsset).filter(EquipmentAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    db.delete(asset)
    db.commit()
    return True
