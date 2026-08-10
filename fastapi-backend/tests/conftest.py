import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.membership_plan import MembershipPlan

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed test plans
        plan = MembershipPlan(plan_name="Pro", price=49.00, duration_days=30, is_active=True)
        db.add(plan)
        
        # Seed test admin
        admin = User(name="Admin User", email="admin@test.com", password=get_password_hash("password123"), role="admin", is_approved=1)
        db.add(admin)

        # Seed test active member
        member = User(name="Active Member", email="member@test.com", phone="03009998877", password=get_password_hash("password123"), role="member", is_approved=1)
        db.add(member)

        # Seed test pending member
        pending_member = User(name="Pending Member", email="pending@test.com", password=get_password_hash("password123"), role="member", is_approved=0)
        db.add(pending_member)

        db.commit()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
