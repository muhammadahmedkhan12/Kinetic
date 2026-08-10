import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    results = {}
    print("==================================================")
    print("  KINETIC GYM ADMIN DASHBOARD COMPREHENSIVE QA")
    print("==================================================")

    # 1. Test Auth & Access Control
    print("\n--- STEP 4: Auth & Access Control Tests ---")
    
    # 1a. Unauthenticated Request
    res = requests.get(f"{BASE_URL}/admin/dashboard-summary")
    results['unauth_admin_access'] = res.status_code == 401
    print(f"[*] Unauthenticated request to /admin/dashboard-summary: Status {res.status_code} (Expected 401) -> {'PASS' if res.status_code == 401 else 'FAIL'}")

    # 1b. Login as Admin
    admin_login_res = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin@kineticgym.com", "password": "Admin@123"})
    if admin_login_res.status_code != 200:
        print(f"[!] Admin login failed: {admin_login_res.text}")
        return
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[*] Admin login successful! (admin@kineticgym.com / Admin@123)")

    # 1c. Login as Member
    member_login_res = requests.post(f"{BASE_URL}/auth/token", data={"username": "24ahmedkhan24@gmail.com", "password": "password123"})
    if member_login_res.status_code == 200:
        member_token = member_login_res.json()["access_token"]
        member_headers = {"Authorization": f"Bearer {member_token}"}
        res_mem = requests.get(f"{BASE_URL}/admin/dashboard-summary", headers=member_headers)
        results['member_admin_access'] = res_mem.status_code in [401, 403]
        print(f"[*] Member role request to /admin/dashboard-summary: Status {res_mem.status_code} (Expected 403) -> {'PASS' if res_mem.status_code in [401, 403] else 'FAIL'}")

    # 2. Test Overview & Dashboard Summary
    print("\n--- STEP 2: Dashboard Summary & Overview Tab ---")
    summary_res = requests.get(f"{BASE_URL}/admin/dashboard-summary", headers=admin_headers)
    results['summary_200'] = summary_res.status_code == 200
    summary_data = summary_res.json()
    
    stats = summary_data.get("stats", {})
    members = summary_data.get("members", [])
    pending_payments = summary_data.get("pending_payments", [])
    trainers = summary_data.get("trainers", [])
    classes = summary_data.get("classes", [])
    assets = summary_data.get("assets", [])
    
    print(f"[*] Live KPI Stats: Total Members={stats.get('total_members')}, Trainers={stats.get('total_trainers')}, Revenue=${stats.get('monthly_revenue')}, Assets={stats.get('total_assets')}")
    print(f"[*] Members Count: {len(members)}")
    print(f"[*] Pending Payments Count: {len(pending_payments)}")
    print(f"[*] Trainers Count: {len(trainers)}")
    print(f"[*] Classes Count: {len(classes)}")
    print(f"[*] Assets Count: {len(assets)}")

    # 3. Test Admin Member Creation
    print("\n--- STEP 2: Members Directory Tab ---")
    create_mem_res = requests.post(
        f"{BASE_URL}/admin/members",
        headers=admin_headers,
        json={"name": "QA Test Member", "email": "qatestmember@kinetic.com", "phone": "+971509999999"}
    )
    if create_mem_res.status_code == 200:
        created_data = create_mem_res.json()
        temp_pin = created_data.get("temp_password")
        new_user_id = created_data.get("user_id")
        print(f"[*] Admin Member Creation: PASS (User #{new_user_id}, Temp PIN: {temp_pin})")
        results['admin_create_member'] = True
        
        # Test Member Details fetch
        detail_res = requests.get(f"{BASE_URL}/admin/members/{new_user_id}", headers=admin_headers)
        results['member_detail_fetch'] = detail_res.status_code == 200 and detail_res.json().get("email") == "qatestmember@kinetic.com"
        print(f"[*] Member Detail Fetch for User #{new_user_id}: Status {detail_res.status_code} -> {'PASS' if results['member_detail_fetch'] else 'FAIL'}")

        # Test Member Deletion
        del_res = requests.delete(f"{BASE_URL}/admin/members/{new_user_id}", headers=admin_headers)
        results['member_deletion'] = del_res.status_code == 200
        print(f"[*] Member Deletion for User #{new_user_id}: Status {del_res.status_code} -> {'PASS' if del_res.status_code == 200 else 'FAIL'}")
    else:
        print(f"[!] Admin Member Creation returned status {create_mem_res.status_code}: {create_mem_res.text}")

    # 4. Test Record Cash Payment (Checking for old timedelta bug)
    print("\n--- STEP 2: Payments & Revenue Cash Recording ---")
    if len(members) > 0:
        target_user_id = members[0]["user_id"]
        cash_res = requests.post(
            f"{BASE_URL}/payments/cash",
            headers=admin_headers,
            json={"user_id": target_user_id, "plan_id": 2}
        )
        results['record_cash_payment'] = cash_res.status_code == 200
        print(f"[*] Record Cash Payment for User #{target_user_id}: Status {cash_res.status_code} -> {'PASS' if cash_res.status_code == 200 else 'FAIL'}")
        if cash_res.status_code != 200:
            print(f"[!] Cash Payment Error: {cash_res.text}")

    # 5. Test Class Schedule & Enforced DB Persistence
    print("\n--- STEP 2: Classes Schedule Tab ---")
    class_create_res = requests.post(
        f"{BASE_URL}/classes",
        headers=admin_headers,
        json={"name": "QA Heavy Lifting", "day": "Tuesday, Thursday", "time": "08:00 AM - 09:00 AM", "capacity": 15}
    )
    if class_create_res.status_code == 200:
        created_class = class_create_res.json()
        c_id = created_class["id"]
        print(f"[*] Class Creation: PASS (Class #{c_id})")
        
        # Cleanup class
        del_c_res = requests.delete(f"{BASE_URL}/classes/{c_id}", headers=admin_headers)
        print(f"[*] Class Deletion: Status {del_c_res.status_code} -> {'PASS' if del_c_res.status_code == 200 else 'FAIL'}")
    else:
        print(f"[!] Class Creation returned status {class_create_res.status_code}: {class_create_res.text}")

    # 6. Test Trainer Registration
    print("\n--- STEP 2: Trainers Tab ---")
    trainer_res = requests.post(
        f"{BASE_URL}/trainers/admin/trainers",
        headers=admin_headers,
        json={"name": "Coach QA Test", "specialization": "CrossFit", "experience_years": 4}
    )
    if trainer_res.status_code == 200:
        created_trainer = trainer_res.json()
        t_id = created_trainer["id"]
        print(f"[*] Trainer Creation: PASS (Trainer #{t_id})")
        del_t_res = requests.delete(f"{BASE_URL}/trainers/admin/trainers/{t_id}", headers=admin_headers)
        print(f"[*] Trainer Deletion: Status {del_t_res.status_code} -> {'PASS' if del_t_res.status_code == 200 else 'FAIL'}")

    # 7. Test Equipment Asset Registration
    print("\n--- STEP 2: Equipment Assets Tab ---")
    asset_res = requests.post(
        f"{BASE_URL}/assets",
        headers=admin_headers,
        json={"name": "QA Dumbbell Rack", "category": "Strength", "quantity": 2, "location": "Main Gym Floor"}
    )
    if asset_res.status_code == 200:
        created_asset = asset_res.json()
        a_id = created_asset["id"]
        print(f"[*] Asset Creation: PASS (Asset #{a_id})")
        service_res = requests.post(f"{BASE_URL}/assets/{a_id}/service", headers=admin_headers)
        print(f"[*] Asset Service Update: Status {service_res.status_code} -> {'PASS' if service_res.status_code == 200 else 'FAIL'}")
        del_a_res = requests.delete(f"{BASE_URL}/assets/{a_id}", headers=admin_headers)
        print(f"[*] Asset Deletion: Status {del_a_res.status_code} -> {'PASS' if del_a_res.status_code == 200 else 'FAIL'}")

    # 8. Test Error Handling & Edge Cases
    print("\n--- STEP 5: Error Handling & Edge Cases ---")
    # Invalid Email on Member Creation
    invalid_email_res = requests.post(
        f"{BASE_URL}/admin/members",
        headers=admin_headers,
        json={"name": "Invalid Member", "email": "not-an-email", "phone": "123"}
    )
    print(f"[*] Invalid Email Member Creation: Status {invalid_email_res.status_code} (Expected 422) -> {'PASS' if invalid_email_res.status_code == 422 else 'FAIL'}")

    # Save summary QA results
    with open("scratch/admin_qa_results.json", "w") as f:
        json.dump({
            "results": results,
            "kpis": stats,
            "counts": {
                "members": len(members),
                "trainers": len(trainers),
                "classes": len(classes),
                "assets": len(assets),
                "pending_payments": len(pending_payments)
            }
        }, f, indent=2)

    print("\n==================================================")
    print("  QA RUN COMPLETE — ALL TESTS EXECUTED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
