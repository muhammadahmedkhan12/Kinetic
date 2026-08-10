from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.init_db import init_db
from app.routers import (
    auth, members, memberships, payments, classes,
    attendance, weight, trainers, assets, admin, ai_coach
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Policy (Restricted Frontend Origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount Static Payment Proofs Directory
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
app.mount("/uploads/payment_proofs", StaticFiles(directory=settings.UPLOADS_DIR), name="payment_proofs")

# Include Routers under /api/v1
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(members.router, prefix=api_v1)
app.include_router(memberships.router, prefix=api_v1)
app.include_router(payments.router, prefix=api_v1)
app.include_router(classes.router, prefix=api_v1)
app.include_router(attendance.router, prefix=api_v1)
app.include_router(weight.router, prefix=api_v1)
app.include_router(trainers.router, prefix=api_v1)
app.include_router(assets.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)
app.include_router(ai_coach.router, prefix=api_v1)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "version": settings.VERSION
    }
