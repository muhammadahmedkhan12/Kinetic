from pydantic import BaseModel

class AIChatRequestSchema(BaseModel):
    message: str

class AIChatResponseSchema(BaseModel):
    reply: str
