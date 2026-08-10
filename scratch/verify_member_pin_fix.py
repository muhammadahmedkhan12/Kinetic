import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_member_creation():
    # Login as admin
    login_res = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin@kineticgym.com", "password": "Admin@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create fresh member with clean phone
    create_res = requests.post(
        f"{BASE_URL}/admin/members",
        headers=headers,
        json={"name": "Numeric PIN User", "email": "numericpin@kinetic.com", "phone": "+971507777777"}
    )
    print("Create Member Response Status:", create_res.status_code)
    print("Create Member Data:", create_res.json())
    user_id = create_res.json()["user_id"]

    # 2. Fetch Member details and check password format
    detail_res = requests.get(f"{BASE_URL}/admin/members/{user_id}", headers=headers)
    detail_data = detail_res.json()
    print("Member Detail Password Field:", detail_data.get("password"))
    print("Is 6-Digit Numeric PIN?:", detail_data.get("password").isdigit() and len(detail_data.get("password")) == 6)

    # 3. Test duplicate email attempt
    dup_res = requests.post(
        f"{BASE_URL}/admin/members",
        headers=headers,
        json={"name": "Duplicate User", "email": "numericpin@kinetic.com", "phone": "+971506666666"}
    )
    print("Duplicate Email Attempt Status:", dup_res.status_code)
    print("Duplicate Email Error Message:", dup_res.json())

    # 4. Cleanup
    requests.delete(f"{BASE_URL}/admin/members/{user_id}", headers=headers)
    print("Cleanup Complete!")

if __name__ == "__main__":
    test_member_creation()
