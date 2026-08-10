from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_full_access
from app.models.user import User
from app.schemas.ai_coach import AIChatRequestSchema, AIChatResponseSchema
from app.services.ai_service import generate_ai_coach_response

router = APIRouter(prefix="/ai-coach", tags=["PULSE AI Assistant"])

@router.post("/chat", response_model=AIChatResponseSchema)
def ai_coach_chat(data: AIChatRequestSchema, current_user: User = Depends(require_full_access), db: Session = Depends(get_db)):
    reply = generate_ai_coach_response(db, current_user, data.message)
    return AIChatResponseSchema(reply=reply)
