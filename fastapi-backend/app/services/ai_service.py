import os
import json
from datetime import date
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from app.models.user import User
from app.models.membership import Membership
from app.models.weight_log import WeightLog
from app.models.attendance import Attendance
from app.models.trainer import Trainer
from app.models.gym_class import GymClass
from app.models.class_booking import ClassBooking
from app.models.equipment_asset import EquipmentAsset
from app.services.class_service import book_gym_class, cancel_gym_class_booking
from app.services.weight_service import upsert_weight_log

def _generate_rule_based_fallback(user: User, user_message: str, goals_str: str, latest_weight_str: str, bmi_str: str, gym_classes, trainers, assets) -> str:
    msg = user_message.lower().strip()
    name = user.name

    # 1. Greetings
    if any(msg.startswith(w) for w in ["hi", "hello", "hey", "good morning", "good evening", "assalam", "salam"]):
        return f"Hey {name}! 👋 I'm your PULSE AI Coach. I'm here to help with personalized workouts, recovery routines, nutrition guidance, or booking your next class. What's on your agenda today?"

    # 2. Chest & Shoulder Workout / Sore Shoulders Recovery
    if "sore" in msg or "recovery" in msg or "stretch" in msg:
        return (
            f"**Recommended Recovery Routine for {name}:**\n\n"
            f"1. **Light Dynamic Mobility (5 mins):**\n"
            f"- Doorway Pec Stretch: 3 sets of 30s per side.\n"
            f"- Cross-body Shoulder Stretch: 3 sets of 30s.\n"
            f"- Banded Face Pulls or Shoulder Dislocates with light resistance.\n\n"
            f"2. **Active Recovery & Hydration:**\n"
            f"- Drink 500ml water with electrolytes.\n"
            f"- Contrast hot/cold shower on upper body.\n"
            f"- Aim for 7-8 hours of sleep for optimal muscle protein synthesis."
        )

    # 3. Leg Workout
    if "leg" in msg or "squat" in msg or "lower body" in msg:
        return (
            f"**High-Performance Leg Workout for {name}:**\n\n"
            f"- **Barbell Back Squats:** 4 sets × 8–10 reps (RPE 8)\n"
            f"- **Romanian Deadlifts (RDLs):** 3 sets × 10–12 reps (Hamstring emphasis)\n"
            f"- **Leg Press:** 3 sets × 12–15 reps\n"
            f"- **Walking Dumbbell Lunges:** 3 sets × 12 steps per leg\n"
            f"- **Standing Calf Raises:** 4 sets × 15 reps\n\n"
            f"💡 *Rest 90-120 seconds between heavy compound lifts. Focus on controlled eccentric tempo.*"
        )

    # 4. Chest / Shoulder / Push Workout
    if "chest" in msg or "shoulder" in msg or "push" in msg or "bench" in msg or "upper" in msg:
        return (
            f"**Upper Body Push Protocol for {name}:**\n\n"
            f"- **Incline Dumbbell Bench Press:** 4 sets × 8–10 reps\n"
            f"- **Flat Barbell Bench Press:** 3 sets × 8–10 reps\n"
            f"- **Seated Dumbbell Overhead Shoulder Press:** 3 sets × 10–12 reps\n"
            f"- **Cable Lateral Raises:** 4 sets × 15 reps (Strict form)\n"
            f"- **Incline Cable Chest Flyes:** 3 sets × 12–15 reps\n"
            f"- **Dips or Tricep Rope Pushdowns:** 3 sets × 12 reps\n\n"
            f"🔥 *Warm up rotator cuffs with external rotations before loading heavy.*"
        )

    # 5. Diet / Nutrition / Calorie guidance
    if "diet" in msg or "nutrition" in msg or "protein" in msg or "calorie" in msg or "food" in msg or "meal" in msg:
        return (
            f"**Personalized Nutrition Plan for {name} ({goals_str}):**\n\n"
            f"- **Daily Protein Target:** Aim for 1.8g – 2.2g of protein per kg of body weight (~{latest_weight_str}).\n"
            f"- **Pre-Workout Fuel (60-90m prior):** Complex carbs + lean protein (e.g. Oatmeal with whey and banana).\n"
            f"- **Post-Workout (within 45m):** 30-40g fast-digesting protein + high GI carb to restore glycogen.\n"
            f"- **Hydration Goal:** 3 to 4 Liters of water daily.\n\n"
            f"🥗 *Focus on whole foods: chicken breast, eggs, fish, oats, brown rice, and leafy greens.*"
        )

    # 6. Classes & Schedule inquiries
    if "class" in msg or "schedule" in msg or "book" in msg:
        class_list = "\n".join([f"- **{c.name}**: {c.day} at {c.time} (Trainer: {c.trainer.name if c.trainer else 'Staff'})" for c in gym_classes[:4]])
        return (
            f"**Upcoming KINETIC Classes Available:**\n\n"
            f"{class_list}\n\n"
            f"You can reserve your spot directly from the **Classes tab** or let me know which class you'd like to book!"
        )

    # 7. Trainer inquiries
    if "trainer" in msg or "coach" in msg:
        t_list = "\n".join([f"- **{t.name}** — {t.specialization} ({t.experience_years} yrs exp)" for t in trainers[:3]])
        return (
            f"**KINETIC Certified Personal Trainers:**\n\n"
            f"{t_list}\n\n"
            f"Speak to the front desk or view profiles in the club to book 1-on-1 private sessions."
        )

    # 8. Weight & BMI inquiries
    if "weight" in msg or "bmi" in msg or "progress" in msg:
        return (
            f"**Your Body Composition Stats:**\n\n"
            f"- **Current Logged Weight:** {latest_weight_str}\n"
            f"- **Calculated BMI:** {bmi_str}\n"
            f"- **Primary Focus:** {goals_str}\n\n"
            f"Remember that consistency beats intensity. Log your weekly weigh-ins in the **Weight tab** to keep your trend line accurate!"
        )

    # 9. General fitness advice
    return (
        f"**PULSE AI Recommendation for {name}:**\n\n"
        f"Based on your target focus (**{goals_str}**), ensure you're maintaining progressive overload across your main compound movements while prioritizing 7-8 hours of quality sleep.\n\n"
        f"Feel free to ask for specific workout splits (Push/Pull/Legs, Upper/Lower), macro meal guides, or class recommendations!"
    )

def generate_ai_coach_response(db: Session, user: User, user_message: str) -> str:
    # 1. Fetch user context stats & records
    membership = db.query(Membership).filter(Membership.user_id == user.user_id).order_by(Membership.id.desc()).first()
    weight_logs = db.query(WeightLog).filter(WeightLog.user_id == user.user_id).order_by(WeightLog.id.desc()).all()
    checkins_count = db.query(Attendance).filter(Attendance.user_id == user.user_id).count()
    trainers = db.query(Trainer).all()
    gym_classes = db.query(GymClass).all()
    assets = db.query(EquipmentAsset).all()
    user_bookings = db.query(ClassBooking).filter(ClassBooking.user_id == user.user_id).all()
    booked_class_ids = [b.class_id for b in user_bookings]

    # Calculate Profile Stats
    user_name = user.name
    user_age = user.age
    user_gender = user.gender
    height = user.height if user.height else "Not specified"
    latest_weight_str = f"{weight_logs[0].weight_kg} kg" if weight_logs else "Not specified"

    bmi_str = "Not calculated"
    if user.height and weight_logs:
        h_m = user.height / 100.0
        latest_w = weight_logs[0].weight_kg
        if h_m > 0 and latest_w > 0:
            bmi = latest_w / (h_m * h_m)
            bmi_str = f"{bmi:.1f}"

    goals_list = json.loads(user.goals_json) if user.goals_json else ["General Fitness"]
    goals_str = ", ".join(goals_list)
    total_checkins = checkins_count

    if len(weight_logs) >= 2:
        first_w = weight_logs[-1].weight_kg
        latest_w = weight_logs[0].weight_kg
        diff = latest_w - first_w
        sign = "+" if diff > 0 else ""
        weight_trend_str = f"{first_w} kg -> {latest_w} kg ({sign}{diff:.1f} kg overall)"
    elif weight_logs:
        weight_trend_str = f"Logged 1 entry: {weight_logs[0].weight_kg} kg"
    else:
        weight_trend_str = "No weight logs recorded yet"

    membership_status = membership.status if membership else "inactive"
    expiry_date = membership.end_date if membership and membership.end_date else "N/A"

    user_booked_classes = [c for c in gym_classes if c.id in booked_class_ids]
    if user_booked_classes:
        classes_str = "\n".join([f"- '{c.name}' on {c.day} at {c.time}" for c in user_booked_classes])
    else:
        classes_str = "No active class bookings"

    available_classes_str = "\n".join([
        f"- ID {c.id}: '{c.name}' on {c.day} at {c.time} (Instructor: {c.trainer.name if c.trainer else 'Staff Instructor'}, Capacity: {c.capacity})"
        for c in gym_classes
    ]) or "No classes currently scheduled"

    equipment_assets_str = "\n".join([
        f"- {a.name} (Qty: {a.quantity}, Location: {a.location}, Status: {a.status})"
        for a in assets
    ]) or "No equipment assets registered"

    trainers_str = "\n".join([
        f"- {t.name} (Specialization: {t.specialization}, Experience: {t.experience_years} years)"
        for t in trainers
    ]) or "No personal trainers registered"

    system_instruction = (
        f"You are 'PULSE AI', personal AI fitness coach at KINETIC Gym. You give personalized "
        f"workout plans, nutrition guidance, class recommendations, and gym assistance.\n\n"

        f"=== MEMBER PROFILE DATA ===\n"
        f"- Member Name: {user_name}\n"
        f"- Age: {user_age if user_age else 'Not specified'}\n"
        f"- Gender: {user_gender if user_gender else 'Not specified'}\n"
        f"- Height: {height} cm\n"
        f"- Latest Weight: {latest_weight_str}\n"
        f"- BMI Score: {bmi_str}\n"
        f"- Fitness Goals & Diet Preferences: {goals_str}\n"
        f"- Total Gym Check-ins: {total_checkins} visits\n"
        f"- Weight Progress Trend: {weight_trend_str}\n\n"

        f"=== MEMBERSHIP & ACCOUNT STATUS ===\n"
        f"- Status: {str(membership_status).upper()} (Expires: {expiry_date})\n\n"

        f"=== MEMBER'S CURRENT CLASS BOOKINGS ===\n"
        f"{classes_str}\n\n"

        f"=== KINETIC GYM CLASS SCHEDULE ===\n"
        f"{available_classes_str}\n\n"

        f"=== KINETIC GYM EQUIPMENT & MACHINERY REGISTRY ===\n"
        f"{equipment_assets_str}\n\n"

        f"=== KINETIC GYM PERSONAL TRAINERS DIRECTORY ===\n"
        f"{trainers_str}\n\n"

        f"=== FORMATTING & PERSONA RULES ===\n"
        f"1. Address the member by their first name ({user_name}).\n"
        f"2. Keep replies formatted cleanly for mobile reading: use short paragraphs, bold headers, and bullet points.\n"
        f"3. Give actionable, accurate fitness, workout, and nutrition advice tailored to their goal ({goals_str}).\n"
    )

    from app.core.config import settings
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")

    # If valid Gemini API key is provided, attempt Google GenAI API
    if api_key and api_key.startswith("AIzaSy"):
        try:
            client = genai.Client(api_key=api_key)
            models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            
            for model_name in models_to_try:
                try:
                    res = client.models.generate_content(
                        model=model_name,
                        contents=user_message,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=0.7
                        )
                    )
                    if res and res.text:
                        return res.text
                except Exception:
                    continue
        except Exception:
            pass

    # Intelligent contextual fallback engine
    return _generate_rule_based_fallback(user, user_message, goals_str, latest_weight_str, bmi_str, gym_classes, trainers, assets)
