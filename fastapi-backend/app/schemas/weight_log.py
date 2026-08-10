from pydantic import BaseModel

class WeightLogCreateSchema(BaseModel):
    weight_kg: float

class WeightLogReadSchema(BaseModel):
    id: int
    user_id: int
    date: str
    weight_kg: float

    class Config:
        from_attributes = True
