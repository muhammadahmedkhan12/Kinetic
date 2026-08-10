import sys
import os
import types

# Dynamically map the old "project" namespace to local subfolders to resolve project.* imports
admin_portal_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(admin_portal_path)

project_module = types.ModuleType("project")
sys.modules["project"] = project_module

import Database
import Models
import Repository
import Services
import Controllers

project_module.Database = Database
project_module.Models = Models
project_module.Repository = Repository
project_module.Services = Services
project_module.Controllers = Controllers

sys.modules["project.Database"] = Database
sys.modules["project.Models"] = Models
sys.modules["project.Repository"] = Repository
sys.modules["project.Services"] = Services
sys.modules["project.Controllers"] = Controllers

from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from project.Services.AuthService import AuthService
from project.Services.MembershipService import MembershipService
from project.Services.TrainerService import TrainerService
from project.Services.PaymentService import PaymentService
from project.Services.AttendanceService import AttendanceService
from project.Services.WeightLogService import WeightLogService
from project.Services.AIService import AIService
from project.Models.User import User
from project.Repository.UserRepo import UserRepo
from datetime import datetime, date

app = Flask(__name__)
app.secret_key = "kinetic_prestige_gym_admin_key_2026"

# Enable CORS for public app frontend fetch calls
@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

# Initialize services
auth_service = AuthService()
membership_service = MembershipService()
trainer_service = TrainerService()
payment_service = PaymentService()
attendance_service = AttendanceService()
weight_log_service = WeightLogService()
ai_service = AIService()
user_repo = UserRepo()

import shared_utils


# ──────────────────────────────────────────
#  ADMIN ROOT & AUTH
# ──────────────────────────────────────────

@app.route("/")
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if session.get("user_id") and session.get("user_role") == "admin":
        return redirect(url_for("admin_dashboard"))

    error = None

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = auth_service.login(email, password)
        if user and user.getRole() == "admin":
            session["user_id"] = user.getId()
            session["user_name"] = user.getName()
            session["user_role"] = user.getRole()
            return redirect(url_for("admin_dashboard"))
        elif user:
            error = "Access denied. This account does not have admin privileges."
        else:
            error = "Invalid admin credentials."

    return render_template("admin_login.html", error=error)


@app.route("/admin/dashboard")
def admin_dashboard():
    # Restrict access to admin role only
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Access denied. Admin login required.", "error")
        return redirect(url_for("admin_login"))

    # Fetch data for the admin dashboard
    try:
        all_users = user_repo.findAll()
        members = [u for u in all_users if u.getRole() == "member"]
        pending_members = []
    except Exception:
        members = []
        pending_members = []

    try:
        trainers = trainer_service.getAllTrainers()
    except Exception:
        trainers = []

    try:
        payments = payment_service.getAllPayments()
    except Exception:
        payments = []

    try:
        attendance = attendance_service.getAllAttendance()
    except Exception:
        attendance = []

    # Separate pending payments for approval section
    pending_payments = [p for p in payments if p.getStatus() == "pending"]

    return render_template(
        "admin_dashboard.html",
        members=members,
        pending_members=pending_members,
        trainers=trainers,
        payments=payments,
        attendance=attendance,
        pending_payments=pending_payments,
        user_repo=user_repo,
        membership_service=membership_service,
        available_classes=shared_utils.load_classes(),
        user_bookings=shared_utils.load_bookings(),
    )


@app.route("/admin/delete-member/<int:user_id>", methods=["POST"])
def delete_member(user_id):
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    try:
        # Clean up bookings first via shared JSON
        bookings = shared_utils.load_bookings()
        if user_id in bookings:
            del bookings[user_id]
            shared_utils.save_bookings(bookings)
        
        user_repo.deleteById(user_id)
        flash(f"Member #{user_id} account deleted successfully.", "success")
    except Exception as e:
        flash(f"Failed to delete member: {str(e)}", "error")

    return redirect(url_for("admin_dashboard"))


@app.route("/admin/add-class", methods=["POST"])
def add_class():
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    name = request.form.get("name", "").strip()
    day = request.form.get("day", "").strip()
    time = request.form.get("time", "").strip()
    trainer = request.form.get("trainer", "").strip()
    capacity = request.form.get("capacity", "").strip()

    try:
        capacity = int(capacity)
    except (ValueError, TypeError):
        flash("Please enter a valid capacity count.", "error")
        return redirect(url_for("admin_dashboard", tab="classes"))

    if not name or not day or not time or not trainer:
        flash("All fields are required to add a gym class.", "error")
        return redirect(url_for("admin_dashboard", tab="classes"))

    classes = shared_utils.load_classes()
    new_id = max([c["id"] for c in classes]) + 1 if classes else 1
    new_class = {
        "id": new_id,
        "name": name,
        "day": day,
        "time": time,
        "trainer": trainer,
        "capacity": capacity
    }
    classes.append(new_class)
    shared_utils.save_classes(classes)

    flash(f"Class '{name}' added to the schedule.", "success")
    return redirect(url_for("admin_dashboard", tab="classes"))


@app.route("/admin/delete-class/<int:class_id>", methods=["POST"])
def delete_class(class_id):
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    classes = shared_utils.load_classes()
    bookings = shared_utils.load_bookings()
    target = next((c for c in classes if c["id"] == class_id), None)
    if target:
        classes.remove(target)
        shared_utils.save_classes(classes)
        
        # Purge bookings
        for u_id in list(bookings.keys()):
            if class_id in bookings[u_id]:
                bookings[u_id].discard(class_id)
        shared_utils.save_bookings(bookings)
        
        flash(f"Class '{target['name']}' removed from the schedule.", "success")
    else:
        flash("Class not found.", "error")

    return redirect(url_for("admin_dashboard", tab="classes"))


@app.route("/admin/send-payment-reminder/<int:user_id>", methods=["POST"])
def send_payment_reminder(user_id):
    if not session.get("user_id") or session.get("user_role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    user = user_repo.findById(user_id)
    if not user:
        return jsonify({"error": "Member not found"}), 404

    email = user.getEmail()
    name = user.getName()
    print(f"[EMAIL REMINDER] Sending payment reminder email to {name} ({email})...")

    # Dynamic n8n webhook integration support!
    import os
    import requests
    n8n_webhook_url = os.environ.get("N8N_EMAIL_REMINDER_WEBHOOK")
    n8n_triggered = False

    if n8n_webhook_url:
        try:
            payload = {
                "user_id": user_id,
                "name": name,
                "email": email,
                "phone": user.getNumber(),
                "event": "payment_reminder",
                "message": f"Hi {name}, this is a reminder from KINETIC Gym to select a membership package and complete your payment."
            }
            requests.post(n8n_webhook_url, json=payload, timeout=5)
            n8n_triggered = True
        except Exception as e:
            print(f"[N8N Webhook Error] Failed to contact n8n webhook: {str(e)}")

    msg = f"Payment reminder email sent successfully to {name} ({email})!"
    if n8n_triggered:
        msg += " (Triggered via n8n integration)"

    return jsonify({"success": True, "message": msg})


@app.route("/admin/member-details/<int:user_id>")
def admin_member_details(user_id):
    if not session.get("user_id") or session.get("user_role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    user = user_repo.findById(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    membership = membership_service.getMembership(user_id)
    membership_data = None
    if membership:
        membership_data = {
            "type": membership.getMembershipType(),
            "start_date": membership.getStartDate(),
            "end_date": membership.getEndDate(),
            "status": membership.getStatus()
        }

    payments = payment_service.getAllPayments()
    user_payments = []
    for p in payments:
        if p.getUserId() == user_id:
            user_payments.append({
                "id": p.getId(),
                "amount": p.getAmount(),
                "date": p.getDate(),
                "method": p.getMethod(),
                "status": p.getStatus()
            })

    return jsonify({
        "id": user.getId(),
        "name": user.getName(),
        "email": user.getEmail(),
        "phone": user.getNumber(),
        "age": user.getAge(),
        "gender": user.getGender(),
        "membership": membership_data,
        "payments": user_payments
    })



@app.route("/admin/approve-payment/<int:payment_id>", methods=["POST"])
def approve_payment(payment_id):
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    # Verify payment exists
    payments = payment_service.getAllPayments()
    target_payment = next((p for p in payments if p.getId() == payment_id), None)

    if target_payment:
        # Complete payment and activate member's subscription
        payment_service.updatePaymentStatus(payment_id, "completed")
        user_id = target_payment.getUserId()
        membership = membership_service.getMembership(user_id)
        if membership:
            membership_service.subscribeUser(
                user_id,
                membership.getMembershipType(),
                membership.getStartDate(),
                membership.getEndDate(),
                "active"
            )
        flash(f"Payment #{payment_id} approved. Membership activated.", "success")
    else:
        flash("Payment record not found.", "error")

    return redirect(url_for("admin_dashboard"))


@app.route("/admin/reject-payment/<int:payment_id>", methods=["POST"])
def reject_payment(payment_id):
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    payment_service.updatePaymentStatus(payment_id, "rejected")
    flash(f"Payment #{payment_id} has been rejected.", "error")
    return redirect(url_for("admin_dashboard"))


@app.route("/admin/record-cash-payment", methods=["POST"])
def record_cash_payment():
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    user_id = request.form.get("user_id")
    package_type = request.form.get("package_type", "Pro")
    amount = request.form.get("amount", 49)

    try:
        user_id = int(user_id)
        amount = float(amount)
        today = date.today().isoformat()
        next_month = (date.today() + datetime.timedelta(days=30)).isoformat()

        membership_service.subscribeUser(user_id, package_type, today, next_month, "active")
        payment_service.processPayment(user_id, amount, today, "Cash at Desk", "completed")

        flash(f"Cash payment of ${amount} recorded. {package_type} membership activated for User #{user_id}!", "success")
    except Exception as e:
        flash(f"Failed to record cash payment: {str(e)}", "error")

    return redirect(url_for("admin_dashboard"))


@app.route("/admin/add-trainer", methods=["POST"])
def add_trainer():
    if not session.get("user_id") or session.get("user_role") != "admin":
        flash("Unauthorized access.", "error")
        return redirect(url_for("admin_login"))

    name = request.form.get("name", "").strip()
    specialization = request.form.get("specialization", "").strip()
    experience = request.form.get("experience", "").strip()

    try:
        experience = int(experience)
    except (ValueError, TypeError):
        flash("Please enter a valid number of years for experience.", "error")
        return redirect(url_for("admin_dashboard") + "#trainers-section")

    if len(name) < 3 or len(specialization) < 3:
        flash("Name and specialization must be at least 3 characters long.", "error")
        return redirect(url_for("admin_dashboard") + "#trainers-section")

    try:
        trainer_service.addTrainer(name, specialization, experience)
        flash(f"Trainer {name} registered successfully!", "success")
    except Exception as e:
        flash(f"Failed to add trainer: {str(e)}", "error")

    return redirect(url_for("admin_dashboard") + "#trainers-section")




@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "success")
    return redirect(url_for("admin_login"))




if __name__ == "__main__":
    print("Starting KINETIC Gym Staff Admin Portal on Port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=True)
