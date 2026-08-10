from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.equipment_asset import EquipmentAsset
from app.schemas.asset import AssetReadSchema, AssetCreateSchema
from app.schemas.auth import MessageResponse
from app.services.asset_service import create_asset, mark_asset_serviced, delete_asset

router = APIRouter(prefix="/assets", tags=["Equipment Assets Registry"])

@router.get("", response_model=List[AssetReadSchema])
def list_assets(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(EquipmentAsset).all()

@router.post("", response_model=AssetReadSchema)
def add_asset(data: AssetCreateSchema, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return create_asset(db, data)

@router.delete("/{asset_id}", response_model=MessageResponse)
def remove_asset(asset_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    delete_asset(db, asset_id)
    return MessageResponse(message="Asset removed from equipment registry.")

@router.post("/{asset_id}/service", response_model=AssetReadSchema)
def service_asset(asset_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return mark_asset_serviced(db, asset_id)
