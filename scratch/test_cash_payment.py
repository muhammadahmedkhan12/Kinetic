import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    admin_login_res = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin@kineticgym.com", "password": "Admin@123"})
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create temporary unsubscribed member
    create_res = requests.post(
        f"{BASE_URL}/admin/members",
        headers=admin_headers,
        json={"name": "Cash Test User", "email": "cashtest@kinetic.com", "phone": "+971508888888"}
    )
    user_id = create_res.json()["user_id"]
    print(f"Created temporary user #{user_id} for cash payment test.")

    # Record Cash Payment
    cash_res = requests.post(
        f"{BASE_URL}/payments/cash",
        headers=admin_headers,
        json={"user_id": user_id, "plan_id": 2}
    )
    print(f"Cash Payment Status: {cash_res.status_code}")
    print(f"Cash Payment Response: {cash_res.json()}")

    # Cleanup
    requests.delete(f"{BASE_URL}/admin/members/{user_id}", headers=admin_headers)
    print(f"Cleaned up temporary user #{user_id}.")

if __name__ == "__main__":
    run_tests()
