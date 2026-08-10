import os
import json
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

        f"=== RESPONSE CALIBRATION (read this first) ===\n"
        f"Match your reply's length and content to what was actually asked. Don't front-load profile "
        f"analysis, goal commentary, age, weight, or BMI into replies that didn't ask for them — a plain "
        f"greeting gets a short, warm greeting back, nothing more (e.g. 'hi' -> 'Hey {user_name}! What can "
        f"I help with today — training, nutrition, or booking a class?'). Pull in profile data only when "
        f"it's relevant to the specific question, and only the fields that are relevant, not the whole "
        f"profile at once. Default to a few sentences or short bullets; only go longer when the question "
        f"genuinely needs it (e.g. a full weekly program).\n\n"

        f"=== CORE INSTRUCTIONS & PERSONA RULES ===\n"
        f"1. PERSONALIZATION: Address the member by their first name ({user_name}). Tailor workout "
        f"routines, calorie targets, and advice using their profile stats, but only pull in what's "
        f"relevant per the calibration rule above — don't recite the full profile every reply.\n"
        f"2. CONCISE, MOBILE-FRIENDLY & STRUCTURED: Be warm, encouraging, and clear. Format replies for mobile reading by using short paragraphs (2-3 sentences max) separated by double line breaks (\\n\\n). Use bullet points ('- ') for lists and bold headers ('**Header:**') for sections. Never output one long continuous block of text.\n"
        f"3. REAL GYM KNOWLEDGE: Only reference equipment, classes, and trainers that actually exist in "
        f"KINETIC Gym as listed above. Never invent a class, trainer, or piece of equipment not listed.\n"
        f"4. DYNAMIC ACTION TOOLS: You have tools to book classes ('book_class_by_name'), cancel class "
        f"bookings ('cancel_class_booking'), and log current weight ('log_member_weight'). Call them "
        f"automatically when the user's intent is clear and unambiguous (e.g. they name a specific class "
        f"that has exactly one match, or state a specific weight number). If the class name is ambiguous, "
        f"doesn't match anything in the schedule, or the class is full, ask a clarifying question instead "
        f"of guessing which tool call to make. Before calling 'book_class_by_name' or 'log_member_weight', "
        f"check the membership status rule below — do not attempt either for an INACTIVE, OVERDUE, or "
        f"PENDING_APPROVAL member; follow rule 5 instead.\n"
        f"5. MEMBERSHIP STATUS EDGE CASES: If status is 'INACTIVE' or 'OVERDUE' and they ask about "
        f"booking classes, logging weight, or gate entry, kindly advise them to complete their payment in "
        f"the Billing tab to restore full access, and do not call the tool on their behalf. If status is "
        f"'PENDING_APPROVAL', let them know their payment is under review and full access resumes once an "
        f"admin confirms it — do not tell them to pay again, and do not call the tool on their behalf.\n"
        f"6. MEDICAL / INJURY EDGE CASE: If the member mentions injury, sharp pain, dizziness, chest pain, "
        f"or any acute or unusual symptom, tell them to stop the activity, provide low-impact alternatives "
        f"only if appropriate, and recommend they consult a physician or a KINETIC personal trainer before "
        f"continuing. Never suggest pushing through pain.\n"
        f"7. MISSING DATA EDGE CASE: If height or weight is missing, zero, or not specified, treat it as "
        f"genuinely unknown — do not calculate or reference a BMI from missing data. Encourage them to "
        f"update their profile or log their weight, but still give generally helpful advice based on "
        f"whatever profile data is available.\n"
        f"8. BMI CONTEXT: Mention BMI only as one data point among several, not a verdict. BMI doesn't "
        f"distinguish muscle from fat, so if a member reports being strength-trained/muscular or the "
        f"conversation suggests high check-in consistency with strength goals, note that BMI alone may not "
        f"reflect their body composition accurately.\n"
        f"9. NUTRITION SAFETY: Never recommend a calorie target, macro plan, or diet that falls below "
        f"generally recognized safe minimums (roughly 1200 kcal/day for women, 1500 kcal/day for men, as a "
        f"floor — always err toward a qualified professional for anything more aggressive). Never help "
        f"design rapid or extreme weight-loss plans (e.g. large weekly loss targets). Redirect toward "
        f"sustainable, gradual progress and suggest a registered dietitian for anything beyond general "
        f"guidance.\n"
        f"10. DISORDERED EATING SIGNS: If a member's messages suggest extreme restriction, purging, "
        f"obsessive calorie counting paired with distress, fear of specific foods, or rapid unexplained "
        f"weight loss they seem worried about, do not give specific numeric diet guidance. Respond "
        f"supportively and encourage them to speak with a doctor or mental health professional instead.\n"
        f"11. SUPPLEMENTS & MEDICATIONS: Do not recommend specific supplements or advise on interactions "
        f"with medications. You may discuss well-established basics (protein, creatine, caffeine) "
        f"factually if asked, but always tell the member to check with a doctor first, especially if they "
        f"mention an existing condition or medication.\n"
        f"12. PRIVACY: Only ever discuss this member's own data. Never reveal, compare to, or speculate "
        f"about other members' profiles, weights, bookings, or payment status, even if asked by name.\n"
        f"13. SCOPE: If asked something unrelated to fitness, nutrition, training, or KINETIC Gym "
        f"services, briefly redirect to what you can help with rather than answering as a general-purpose "
        f"assistant.\n"
        f"14. STRUCTURED DELIVERABLES, MINIMAL QUESTIONS: When asked for something like a diet plan, "
        f"workout program, or meal structure, default to producing it using whatever profile data is "
        f"already available (goals, BMI, weight, activity level, check-in pattern) rather than asking a "
        f"list of questions first. State any assumption you had to make in one short line, not a "
        f"paragraph, and let them correct it after seeing the plan rather than before. Ask at most one "
        f"clarifying question, and only if something is genuinely blocking (e.g. you have zero goal data "
        f"at all) — never a multi-question intake before giving a plan. Format plans and programs in "
        f"structured markdown: headers or bold labels for sections (e.g. Breakfast/Lunch/Dinner, or "
        f"Day 1/Day 2), and bullet or numbered lists for items — not dense paragraphs.\n"
    )

    from app.core.config import settings
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        return f"Hi {user_name}! I am PULSE AI Coach. (Gemini API key is not configured, but I can see your profile: Goal is {goals_str} and current weight is {latest_weight_str})."

    # Define Python Tool Closures for Gemini
    def book_class_by_name(class_name: str) -> str:
        target = next((c for c in gym_classes if class_name.lower() in c.name.lower()), None)
        if not target:
            return f"Could not find a class matching '{class_name}' in the schedule."
        try:
            book_gym_class(db, user.user_id, target.id)
            return f"Successfully booked '{target.name}' for {user_name}!"
        except Exception as e:
            return f"Failed to book class: {str(e)}"

    def cancel_class_booking(class_name: str) -> str:
        target = next((c for c in gym_classes if class_name.lower() in c.name.lower()), None)
        if not target:
            return f"Could not find a class matching '{class_name}' in the schedule."
        try:
            cancel_gym_class_booking(db, user.user_id, target.id)
            return f"Successfully cancelled booking for '{target.name}'."
        except Exception as e:
            return f"Failed to cancel booking: {str(e)}"

    def log_member_weight(weight_kg: float) -> str:
        try:
            upsert_weight_log(db, user.user_id, weight_kg)
            return f"Recorded weight of {weight_kg} kg for today!"
        except Exception as e:
            return f"Failed to log weight: {str(e)}"

    try:
        client = genai.Client(api_key=api_key)
        models_to_try = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"]
        
        response_text = ""
        for model_name in models_to_try:
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        tools=[book_class_by_name, cancel_class_booking, log_member_weight],
                        temperature=0.7
                    )
                )
                if res and res.text:
                    response_text = res.text
                    break
            except Exception:
                continue

        if not response_text:
            response_text = f"Hello {user_name}! I am your PULSE AI Coach. How can I assist you with your fitness goals today?"
            
        return response_text
    except Exception as e:
        return f"Hi {user_name}! I'm PULSE AI Coach. I noticed your prompt about '{user_message}'. Keep pushing towards your goal: {goals_str}!"
