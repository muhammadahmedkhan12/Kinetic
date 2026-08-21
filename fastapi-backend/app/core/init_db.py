import json
from datetime import date, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash

# Ensure all models are loaded for Base.metadata.create_all
from app.models.user import User
from app.models.membership_plan import MembershipPlan
from app.models.trainer import Trainer
from app.models.gym_class import GymClass
from app.models.equipment_asset import EquipmentAsset
from app.models.membership import Membership
from app.models.payment import Payment
from app.models.attendance import Attendance
from app.models.weight_log import WeightLog
from app.models.class_booking import ClassBooking

def migrate_missing_columns():
    db: Session = SessionLocal()
    try:
        is_sqlite = engine.name == "sqlite"
        
        # 1. Migrate Users table columns
        user_cols = {
            "must_change_password": "INT DEFAULT 0",
            "plain_password": "VARCHAR(50)" if not is_sqlite else "TEXT",
            "goals_json": "NVARCHAR(MAX)" if not is_sqlite else "TEXT",
            "activity_level": "VARCHAR(50)" if not is_sqlite else "TEXT",
            "injuries": "VARCHAR(255)" if not is_sqlite else "TEXT",
            "experience_level": "VARCHAR(50)" if not is_sqlite else "TEXT",
            "preferred_days_json": "NVARCHAR(MAX)" if not is_sqlite else "TEXT",
            "height": "FLOAT NULL" if not is_sqlite else "REAL NULL",
            "is_onboarded": "INT DEFAULT 0",
            "created_at": "DATETIME NULL" if not is_sqlite else "TEXT NULL"
        }
        
        for col_name, col_type in user_cols.items():
            try:
                db.execute(text(f"ALTER TABLE Users ADD {col_name} {col_type}"))
                db.commit()
                print(f"Added column {col_name} to Users table.")
            except Exception:
                db.rollback()

        # 2. Migrate Memberships table columns
        try:
            db.execute(text("ALTER TABLE Memberships ADD plan_id INT NULL"))
            db.commit()
            print("Added column plan_id to Memberships table.")
        except Exception:
            db.rollback()

        # 3. Migrate Payments table columns
        try:
            db.execute(text("ALTER TABLE Payments ADD plan_id INT NULL"))
            db.commit()
            print("Added column plan_id to Payments table.")
        except Exception:
            db.rollback()

    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    migrate_missing_columns()
    
    db: Session = SessionLocal()
    try:
        # 1. Seed Membership Plans
        if db.query(MembershipPlan).count() == 0:
            plans = [
                MembershipPlan(
                    plan_name="Starter",
                    price=29.00,
                    duration_days=30,
                    description="Basic gym access & standard cardio equipment.",
                    features_json=json.dumps(["Cardio & Weight Floor", "Locker Room Access", "1 Fitness Assessment"]),
                    is_active=True
                ),
                MembershipPlan(
                    plan_name="Pro",
                    price=49.00,
                    duration_days=30,
                    description="Full gym access, group classes & PULSE AI Coach.",
                    features_json=json.dumps(["All Starter Features", "Unlimited Group Classes", "PULSE AI Personal Coach", "Sauna Access"]),
                    is_active=True
                ),
                MembershipPlan(
                    plan_name="Elite VIP",
                    price=99.00,
                    duration_days=30,
                    description="All-inclusive VIP experience with 1-on-1 personal trainer.",
                    features_json=json.dumps(["All Pro Features", "Dedicated Personal Trainer", "Custom Nutrition Plan", "24/7 VIP Gym Access"]),
                    is_active=True
                ),
            ]
            db.add_all(plans)
            db.commit()
            print("Seeded default MembershipPlans.")

        # 2. Seed Admin User
        admin_email = "admin@kineticgym.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin_user = User(
                name="Head Admin",
                email=admin_email,
                password=get_password_hash("Admin@123"),
                plain_password="Admin@123",
                age=35,
                phone="03001234567",
                gender="Male",
                role="admin",
                is_approved=1,
                must_change_password=0
            )
            db.add(admin_user)
            db.commit()
            print(f"Seeded default Admin User: {admin_email} / Admin@123")

        # 3. Seed Default Member User
        member_email = "ahmed1248khan@gmail.com"
        member = db.query(User).filter(User.email == member_email).first()
        if not member:
            demo_member = User(
                name="Ahmed Khan",
                email=member_email,
                password=get_password_hash("510226"),
                plain_password="510226",
                age=26,
                phone="03362253299",
                gender="Male",
                role="member",
                is_approved=1,
                must_change_password=0,
                is_onboarded=1,
                height=178.0,
                goals_json=json.dumps(["Muscle Building", "Strength Training"]),
                activity_level="Intermediate",
                experience_level="Intermediate",
                preferred_days_json=json.dumps(["Monday", "Wednesday", "Friday"])
            )
            db.add(demo_member)
            db.commit()
            print(f"Seeded default Member User: {member_email} / 510226")

        # 4. Seed Trainers
        if db.query(Trainer).count() == 0:
            trainers = [
                Trainer(name="Alex Rivera", specialization="Strength & Conditioning", experience_years=7),
                Trainer(name="Sarah Connor", specialization="HIIT & Cardio Endurance", experience_years=5),
                Trainer(name="Marcus Vance", specialization="Powerlifting & Bodybuilding", experience_years=10),
                Trainer(name="Elena Rostova", specialization="Yoga & Mobility", experience_years=6),
            ]
            db.add_all(trainers)
            db.commit()
            print("Seeded default Trainers.")

        # 5. Seed Gym Classes
        if db.query(GymClass).count() == 0:
            alex = db.query(Trainer).filter(Trainer.name == "Alex Rivera").first()
            sarah = db.query(Trainer).filter(Trainer.name == "Sarah Connor").first()
            marcus = db.query(Trainer).filter(Trainer.name == "Marcus Vance").first()
            elena = db.query(Trainer).filter(Trainer.name == "Elena Rostova").first()

            classes = [
                GymClass(name="Morning Iron Surge", day="Monday, Wednesday, Friday", time="07:00 AM - 08:00 AM", capacity=15, trainer_id=alex.id if alex else None),
                GymClass(name="HIIT Inferno", day="Tuesday, Thursday", time="06:00 PM - 07:00 PM", capacity=20, trainer_id=sarah.id if sarah else None),
                GymClass(name="Powerlifting Workshop", day="Saturday", time="10:00 AM - 11:30 AM", capacity=12, trainer_id=marcus.id if marcus else None),
                GymClass(name="Sunset Yoga & Flow", day="Everyday", time="05:30 PM - 06:30 PM", capacity=25, trainer_id=elena.id if elena else None),
            ]
            db.add_all(classes)
            db.commit()
            print("Seeded default GymClasses.")

        # 6. Seed Equipment Assets
        if db.query(EquipmentAsset).count() == 0:
            today_str = date.today().isoformat()
            next_str = (date.today() + timedelta(days=90)).isoformat()
            assets = [
                EquipmentAsset(name="Olympic Bench Press", category="Strength", quantity=4, location="Zone A - Free Weights", status="Operational", last_serviced=today_str, next_service=next_str),
                EquipmentAsset(name="Matrix T7xe Treadmill", category="Cardio", quantity=8, location="Zone B - Cardio Deck", status="Operational", last_serviced=today_str, next_service=next_str),
                EquipmentAsset(name="Rogue Power Rack", category="Strength", quantity=3, location="Zone A - Free Weights", status="Operational", last_serviced=today_str, next_service=next_str),
                EquipmentAsset(name="Concept2 Ergometer Rower", category="Cardio", quantity=5, location="Zone B - Cardio Deck", status="Needs Service", last_serviced=today_str, next_service=next_str),
            ]
            db.add_all(assets)
            db.commit()
            print("Seeded default EquipmentAssets.")

    finally:
        db.close()

if __name__ == "__main__":
    init_db()

